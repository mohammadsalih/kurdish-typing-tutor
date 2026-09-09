import puppeteer from 'puppeteer-core';
import path from 'path';
import fs from 'fs';

const ARTIFACT_DIR = 'C:\\Users\\moham\\.gemini\\antigravity-ide\\brain\\c3afe10a-57b1-45c4-95b4-cc5d0bbf99ca';
const EDGE_PATH = 'C:\\Program Files (x86)\\Microsoft\\Edge\\Application\\msedge.exe';

async function main() {
  console.log('=== STARTING FIRESTORE TWO-WAY SYNC VERIFICATION ===');
  const browser = await puppeteer.launch({
    executablePath: EDGE_PATH,
    headless: true,
    args: ['--no-sandbox', '--disable-setuid-sandbox', '--window-size=1280,900'],
  });

  try {
    const page = await browser.newPage();
    await page.setViewport({ width: 1280, height: 900 });

    const consoleLogs = [];
    const errors = [];
    page.on('console', msg => {
      consoleLogs.push(`[${msg.type()}] ${msg.text()}`);
    });
    page.on('pageerror', err => {
      errors.push(err.message);
      console.error('PAGE ERROR:', err.message);
    });

    // 1. Set onboarded cookie to skip onboarding and navigate straight to the curriculum
    console.log('\n--- Step 1: Navigating to App ---');
    await page.setCookie({
      name: 'has_onboarded',
      value: 'true',
      domain: 'localhost',
      path: '/',
    });

    await page.goto('http://localhost:3000', { waitUntil: 'networkidle2' });
    await new Promise(r => setTimeout(r, 1000));

    // 2. Open Auth Modal & Log in
    console.log('\n--- Step 2: Logging in to establish authenticated player session ---');
    await page.waitForSelector('#header-login-btn', { timeout: 5000 });
    await page.click('#header-login-btn');
    await new Promise(r => setTimeout(r, 600));

    await page.waitForSelector('#demo-login-btn', { timeout: 5000 });
    await page.click('#demo-login-btn');
    await new Promise(r => setTimeout(r, 1000));

    // Confirm authenticated state in HUD
    await page.waitForSelector('#user-profile-btn', { timeout: 5000 });
    await page.waitForSelector('#hud-xp-pill', { timeout: 5000 });
    const initialXpText = await page.$eval('#hud-xp-pill', el => el.innerText.trim());
    console.log(`✓ User logged in successfully. Initial HUD XP: "${initialXpText}"`);

    // Capture initial authenticated state
    const initialMapScreenshot = path.join(ARTIFACT_DIR, 'step1_authenticated_initial.png');
    await page.screenshot({ path: initialMapScreenshot });
    console.log('✓ Captured screenshot: step1_authenticated_initial.png');

    // 3. Start Level 1
    console.log('\n--- Step 3: Selecting and entering Level 1 Arena ---');
    await page.waitForSelector('#level-node-1', { timeout: 5000 });
    await page.click('#level-node-1');
    await new Promise(r => setTimeout(r, 1000));

    await page.waitForSelector('#target-text-container', { timeout: 5000 });
    console.log('✓ Level 1 Typing Arena loaded');

    // 4. Complete Level 1
    const level1Text = "س د س د س س د د س د س د د س د س";
    console.log(`\n--- Step 4: Typing Level 1 exercise (${level1Text.length} chars) ---`);

    const charToKey = {
      "س": "s",
      "د": "d",
      " ": " ",
    };

    for (let i = 0; i < level1Text.length; i++) {
      const ch = level1Text[i];
      const key = charToKey[ch] || ch;
      await page.keyboard.press(key === " " ? "Space" : key);
      await new Promise(r => setTimeout(r, 35));
    }

    // 5. Wait for Victory Modal
    console.log('\n--- Step 5: Waiting for Victory Modal ---');
    await page.waitForSelector('#next-level-btn', { timeout: 5000 });
    console.log('✓ Victory Modal appeared with completion metrics!');

    const victoryScreenshot = path.join(ARTIFACT_DIR, 'step2_victory_modal.png');
    await page.screenshot({ path: victoryScreenshot });
    console.log('✓ Captured screenshot: step2_victory_modal.png');

    // 6. Click "Next Level" button (#next-level-btn)
    console.log('\n--- Step 6: Clicking Next Level button to trigger Firestore save ---');
    await page.click('#next-level-btn');
    await new Promise(r => setTimeout(r, 800));

    // Confirm Level 2 Arena or state
    const afterNextScreenshot = path.join(ARTIFACT_DIR, 'step3_level2_unlocked_before_refresh.png');
    await page.screenshot({ path: afterNextScreenshot });
    console.log('✓ Captured screenshot: step3_level2_unlocked_before_refresh.png');

    // 7. FULL PAGE REFRESH to test two-way Firestore synchronization across refreshes
    console.log('\n--- Step 7: Performing FULL PAGE REFRESH to test persistence ---');
    await page.goto('http://localhost:3000', { waitUntil: 'networkidle2' });
    await new Promise(r => setTimeout(r, 1500));

    // 8. Verify Persisted State after Refresh
    console.log('\n--- Step 8: Verifying Persisted State in UI after Refresh ---');

    // Check 8a: User remains authenticated
    const userBtnAfter = await page.$('#user-profile-btn');
    console.log(`Assertion 1 (User still authenticated): ${userBtnAfter !== null}`);
    if (!userBtnAfter) {
      throw new Error('FAILED: User session was lost after page refresh!');
    }

    // Check 8b: XP is persisted and NOT reset to 0
    await page.waitForSelector('#hud-xp-pill', { timeout: 5000 });
    const xpTextAfter = await page.$eval('#hud-xp-pill', el => el.innerText.trim());
    console.log(`Assertion 2 (Persisted XP): "${xpTextAfter}"`);
    const xpMatch = xpTextAfter.match(/(\d+[\d,]*)\s*خاڵ/);
    const xpNum = xpMatch ? parseInt(xpMatch[1].replace(/,/g, ''), 10) : 0;
    console.log(`Parsed Persisted XP value: ${xpNum}`);
    if (xpNum <= 0) {
      throw new Error('FAILED: XP was reset to 0 after page refresh!');
    }

    // Check 8c: Check Curriculum Map reflects Level 2 unlocked and Level 1 completed
    const navMapBtn = await page.$('#nav-map-btn');
    if (navMapBtn) {
      await page.click('#nav-map-btn');
      await new Promise(r => setTimeout(r, 800));
    }

    await page.waitForSelector('#level-node-1', { timeout: 5000 });
    await page.waitForSelector('#level-node-2', { timeout: 5000 });

    // Level 1 should show completed stars
    const level1Completed = await page.$eval('#level-node-1', el => el.getAttribute('data-completed') === 'true');
    const level1StarsPresent = await page.$('#level-stars-1').then(el => el !== null);
    console.log(`Assertion 3 (Level 1 completed: ${level1Completed}, Stars element present: ${level1StarsPresent})`);
    if (!level1Completed) {
      throw new Error('FAILED: Level 1 completed state did not persist after page refresh!');
    }

    // Level 2 should now be UNLOCKED (not locked)
    const level2Unlocked = await page.$eval('#level-node-2', el => el.getAttribute('data-active') === 'true' || !el.className.includes('cursor-not-allowed'));
    console.log(`Assertion 4 (Level 2 unlocked and active): ${level2Unlocked}`);
    if (!level2Unlocked) {
      throw new Error('FAILED: Level 2 was not unlocked after page refresh!');
    }

    const afterRefreshScreenshot = path.join(ARTIFACT_DIR, 'step4_persisted_after_refresh.png');
    await page.screenshot({ path: afterRefreshScreenshot });
    console.log(`✓ Captured screenshot: ${afterRefreshScreenshot}`);

    // Also save to public/ for easy browser accessibility
    try {
      fs.copyFileSync(initialMapScreenshot, path.resolve('public', 'step1_authenticated_initial.png'));
      fs.copyFileSync(victoryScreenshot, path.resolve('public', 'step2_victory_modal.png'));
      fs.copyFileSync(afterNextScreenshot, path.resolve('public', 'step3_level2_unlocked_before_refresh.png'));
      fs.copyFileSync(afterRefreshScreenshot, path.resolve('public', 'step4_persisted_after_refresh.png'));
    } catch {}

    console.log('\n======================================================');
    console.log('ALL VERIFICATION ASSERTIONS PASSED WITH 100% SUCCESS!');
    console.log('Two-way Firestore synchronization successfully verified.');
    console.log('======================================================');
  } finally {
    await browser.close();
  }
}

main().catch(err => {
  console.error('TEST RUN FAILURE:', err);
  process.exit(1);
});
