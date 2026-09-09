import puppeteer from 'puppeteer-core';
import path from 'path';
import fs from 'fs';

const ARTIFACT_DIR = 'C:\\Users\\moham\\.gemini\\antigravity-ide\\brain\\257af5bb-313d-4da9-8614-13a16a2ab301';
const EDGE_PATH = 'C:\\Program Files (x86)\\Microsoft\\Edge\\Application\\msedge.exe';

async function main() {
  console.log('=== STARTING BACKEND DAILY STREAK VERIFICATION ===');
  
  const browser = await puppeteer.launch({
    executablePath: EDGE_PATH,
    headless: true,
    args: ['--no-sandbox', '--disable-setuid-sandbox', '--window-size=1280,950'],
  });

  try {
    const page = await browser.newPage();
    await page.setViewport({ width: 1280, height: 950 });

    const networkRequests = [];
    const networkResponses = [];

    // Monitor Network Traffic
    page.on('request', req => {
      const url = req.url();
      if (url.includes('/api/')) {
        networkRequests.push({
          url,
          method: req.method(),
          postData: req.postData(),
        });
        console.log(`[NETWORK REQ] ${req.method()} ${url}`);
      }
    });

    page.on('response', async res => {
      const url = res.url();
      if (url.includes('/api/level-completed') || url.includes('/api/streak')) {
        let body = null;
        try {
          body = await res.json();
        } catch {}
        networkResponses.push({
          url,
          status: res.status(),
          body,
        });
        console.log(`[NETWORK RES] ${res.status()} ${url} ->`, JSON.stringify(body));
      }
    });

    // 1. Clear any cookies and storage first
    console.log('\n--- Step 1: Navigating to App & Checking Initial Storage ---');
    await page.goto('http://localhost:3000', { waitUntil: 'networkidle2' });
    await page.evaluate(() => {
      localStorage.clear();
      sessionStorage.clear();
      document.cookie = "has_onboarded=true;path=/;SameSite=Lax";
    });

    // Reload page with clear storage and has_onboarded=true
    await page.goto('http://localhost:3000', { waitUntil: 'networkidle2' });
    await new Promise(r => setTimeout(r, 1000));

    // Verify initial cookies have NO streak
    const initialCookies = await page.cookies();
    console.log('Initial cookies:', initialCookies.map(c => c.name));
    for (const c of initialCookies) {
      if (c.name.toLowerCase().includes('streak') || c.value.toLowerCase().includes('streak')) {
        throw new Error(`FAIL: Streak found in initial cookie: ${c.name}=${c.value}`);
      }
    }
    console.log('✓ PASS: Zero streak data found in initial cookies.');

    // 2. Log in with test user
    console.log('\n--- Step 2: Logging in as authenticated user ---');
    const testUid = 'user_streak_test_' + Date.now();
    await page.evaluate(async (uid) => {
      await window.__pitikAuth.login(uid + '@pitik.krd', 'تاقیکاری ستریك');
    }, testUid);
    await new Promise(r => setTimeout(r, 1500));

    // Verify HUD elements
    await page.waitForSelector('#user-profile-btn', { timeout: 5000 });
    await page.waitForSelector('#hud-streak-pill', { timeout: 5000 });
    const initialStreakText = await page.$eval('#hud-streak-pill', el => el.innerText.trim());
    console.log(`✓ User logged in. Initial HUD Streak Pill: "${initialStreakText}"`);

    // 3. Enter Level 1 Arena
    console.log('\n--- Step 3: Entering Level 1 Arena ---');
    await page.waitForSelector('#level-node-1', { timeout: 5000 });
    await page.click('#level-node-1');
    await new Promise(r => setTimeout(r, 1000));

    // Check if Milestone modal is visible and dismiss it
    const milestoneBtn = await page.$('#milestone-got-it-btn');
    if (milestoneBtn) {
      console.log('Dismissing milestone modal with #milestone-got-it-btn...');
      await milestoneBtn.click();
      await new Promise(r => setTimeout(r, 600));
    }

    await page.waitForSelector('#target-text-container', { timeout: 5000 });
    console.log('✓ Level 1 Typing Arena loaded');

    // Get target text from page or level definition
    const targetText = await page.evaluate(() => {
      const chars = Array.from(document.querySelectorAll('[id^="text-char-"]')).map(el => el.textContent || '');
      if (chars.length > 0) return chars.join('');
      return "فژفژففژژفژژففژفژففژژ";
    });

    console.log(`Target text: "${targetText}" (${targetText.length} characters)`);

    const charToKey = {
      "ف": "f",
      "ژ": "j",
      "س": "s",
      "د": "d",
      " ": " ",
    };

    console.log('Typing Level 1 exercise...');
    for (let i = 0; i < targetText.length; i++) {
      const ch = targetText[i];
      const key = charToKey[ch] || ch;
      await page.keyboard.press(key === " " ? "Space" : key);
      await new Promise(r => setTimeout(r, 40));
    }

    // 4. Wait for Victory Modal
    console.log('\n--- Step 4: Waiting for Victory Modal & Level Complete Signal ---');
    await page.waitForSelector('#next-level-btn', { timeout: 6000 });
    console.log('✓ Victory Modal displayed');

    const victoryScreenshot = path.join(ARTIFACT_DIR, 'streak_step1_victory_modal.png');
    await page.screenshot({ path: victoryScreenshot });
    console.log('✓ Captured screenshot: streak_step1_victory_modal.png');

    // Click Next Level to advance
    console.log('Clicking #next-level-btn...');
    await page.click('#next-level-btn');
    await new Promise(r => setTimeout(r, 1500));

    // 5. Verify Network Traffic for /api/level-completed
    console.log('\n--- Step 5: Verifying Network Traffic & Backend Handler ---');
    const levelCompletedReq = networkRequests.find(r => r.url.includes('/api/level-completed'));
    const levelCompletedRes = networkResponses.find(r => r.url.includes('/api/level-completed'));

    if (!levelCompletedReq) {
      throw new Error('FAIL: No POST /api/level-completed request was dispatched to backend!');
    }
    console.log('✓ PASS: Request to /api/level-completed detected:', {
      method: levelCompletedReq.method,
      payload: levelCompletedReq.postData,
    });

    if (!levelCompletedRes || levelCompletedRes.status !== 200) {
      throw new Error(`FAIL: /api/level-completed response failed or not 200: status=${levelCompletedRes?.status}`);
    }
    console.log('✓ PASS: Backend response received with status 200:', levelCompletedRes.body);

    const receivedStreak = levelCompletedRes.body?.updatedStats?.streak;
    if (receivedStreak !== 1) {
      throw new Error(`FAIL: Expected backend calculated streak to be 1, got ${receivedStreak}`);
    }
    console.log(`✓ PASS: Backend calculated streak = ${receivedStreak}`);

    // 6. Verify Application Tab / Storage
    console.log('\n--- Step 6: Inspecting Application Tab (Cookies, LocalStorage, SessionStorage) ---');
    
    // 6a: Cookies
    const postCookies = await page.cookies();
    console.log('Cookies after completion:', postCookies.map(c => `${c.name}=${c.value}`));
    for (const c of postCookies) {
      if (c.name.toLowerCase().includes('streak') || c.value.toLowerCase().includes('streak')) {
        throw new Error(`FAIL: Streak data found in cookie: ${c.name}=${c.value}`);
      }
    }
    console.log('✓ PASS: Application Tab Cookies verified: NO streak data stored in cookies!');

    // 6b: LocalStorage & SessionStorage
    const storageAudit = await page.evaluate(() => {
      const localKeys = Object.keys(localStorage);
      const sessionKeys = Object.keys(sessionStorage);
      const localValues = localKeys.map(k => ({ key: k, value: localStorage.getItem(k) }));
      const sessionValues = sessionKeys.map(k => ({ key: k, value: sessionStorage.getItem(k) }));
      
      // Check if any key contains streak
      const streakInKeys = localKeys.some(k => k.toLowerCase().includes('streak')) ||
                           sessionKeys.some(k => k.toLowerCase().includes('streak'));
      
      // Check if any value has streak key
      const streakInValues = localValues.some(item => {
        try {
          const parsed = JSON.parse(item.value);
          return 'streak' in parsed;
        } catch {
          return item.value.toLowerCase().includes('"streak":');
        }
      });

      return {
        localKeys,
        sessionKeys,
        streakInKeys,
        streakInValues,
      };
    });

    console.log('Storage Audit Results:', storageAudit);
    if (storageAudit.streakInKeys || storageAudit.streakInValues) {
      throw new Error('FAIL: Streak data detected in localStorage or sessionStorage!');
    }
    console.log('✓ PASS: Application Tab LocalStorage & SessionStorage verified: ZERO streak data stored!');

    // 7. Verify UI HUD Streak Counter
    console.log('\n--- Step 7: Verifying HUD Streak Counter in UI ---');
    const updatedStreakText = await page.$eval('#hud-streak-pill', el => el.innerText.trim());
    console.log(`HUD Streak pill text: "${updatedStreakText}"`);
    if (!updatedStreakText.includes('1') && !updatedStreakText.includes('١')) {
      throw new Error(`FAIL: Expected HUD streak to display 1, got "${updatedStreakText}"`);
    }
    console.log('✓ PASS: HUD streak pill displays backend streak (1 ڕۆژ پارێزراو)!');

    // 8. Capture Full Verification Screenshot
    const finalScreenshot = path.join(ARTIFACT_DIR, 'streak_step2_hud_streak_verified.png');
    await page.screenshot({ path: finalScreenshot });
    console.log('✓ Captured screenshot: streak_step2_hud_streak_verified.png');

    // Copy to public/ for accessibility
    try {
      fs.copyFileSync(victoryScreenshot, path.resolve('public', 'streak_step1_victory_modal.png'));
      fs.copyFileSync(finalScreenshot, path.resolve('public', 'streak_step2_hud_streak_verified.png'));
    } catch {}

    console.log('\n=============================================================');
    console.log('ALL VERIFICATION CHECKS PASSED WITH 100% SUCCESS!');
    console.log('- Backend API handles all streak calculations securely');
    console.log('- No streak stored in cookies, localStorage, or sessionStorage');
    console.log('- Network tab shows verified POST /api/level-completed');
    console.log('=============================================================');
  } finally {
    await browser.close();
  }
}

main().catch(err => {
  console.error('VERIFICATION ERROR:', err);
  process.exit(1);
});
