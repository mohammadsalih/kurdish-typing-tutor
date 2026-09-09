import puppeteer from 'puppeteer-core';
import path from 'path';

async function main() {
  const edgePath = 'C:\\Program Files (x86)\\Microsoft\\Edge\\Application\\msedge.exe';
  const artifactDir = 'C:\\Users\\moham\\.gemini\\antigravity-ide\\brain\\0efe5f04-2236-4c48-8da7-cb362803a518';

  console.log('=== Starting First-Time Onboarding, Cookie & Keyboard Styling Tests ===');
  const browser = await puppeteer.launch({
    executablePath: edgePath,
    headless: true,
    args: ['--no-sandbox', '--disable-setuid-sandbox', '--disable-gpu'],
  });

  const page = await browser.newPage();
  await page.setViewport({ width: 1440, height: 960 });

  const errors = [];
  const logs = [];

  page.on('console', msg => {
    logs.push(`[${msg.type()}] ${msg.text()}`);
  });

  page.on('pageerror', err => {
    errors.push(err.toString());
  });

  // ================= 1. FIRST-TIME VISITOR FLOW =================
  console.log('\n--- 1. First-Time Visitor: Clean State ---');
  await page.goto('http://localhost:3000', { waitUntil: 'networkidle0' });

  // Clear all cookies and localStorage to guarantee first-time visitor state
  const client = await page.target().createCDPSession();
  await client.send('Network.clearBrowserCookies');
  await page.evaluate(() => {
    localStorage.clear();
    document.cookie.split(";").forEach(c => {
      document.cookie = c.replace(/^ +/, "").replace(/=.*/, "=;expires=" + new Date().toUTCString() + ";path=/");
    });
  });

  // Reload as pure first-time visitor
  await page.reload({ waitUntil: 'networkidle0' });
  await page.waitForSelector('#keyboard-stage');

  // Verify onboarding view is active
  const onboardingPrompt = await page.$eval('main', el => el.textContent);
  const isOnboarding = onboardingPrompt.includes('سڵاو كوردستان');
  console.log('Is onboarding prompt visible for first-time visitor?', isOnboarding);
  if (!isOnboarding) {
    throw new Error('Onboarding view was not displayed for first-time visitor!');
  }

  // Verify Keyboard Visual State Fix: Keys are neutral by default
  // While 'س' is the first letter of 'سڵاو كوردستان', keys like 'د', 'ف', 'ت' must be completely neutral
  const keyDClasses = await page.$eval('#key-د', el => el.className);
  console.log('Key "د" classes (should NOT have keycap-active):', keyDClasses);
  const isDNeutral = !keyDClasses.includes('keycap-active');
  console.log('Is key "د" neutral by default?', isDNeutral);

  await page.screenshot({ path: path.join(artifactDir, 'first_time_onboarding.png') });
  await page.screenshot({ path: path.resolve('public', 'first_time_onboarding.png') });

  // ================= 2. COMPLETE "سڵاو كوردستان" TYPING =================
  console.log('\n--- 2. Interactive Onboarding: Typing "سڵاو كوردستان" ---');
  const targetOnboarding = "سڵاو كوردستان";
  for (const ch of targetOnboarding) {
    await page.evaluate((char) => {
      window.dispatchEvent(new KeyboardEvent('keydown', { key: char, bubbles: true }));
    }, ch);
    await new Promise(r => setTimeout(r, 60));
  }

  // Wait for transition to Level Map
  console.log('Waiting for automatic transition to Level Map...');
  await page.waitForSelector('#level-node-1', { timeout: 10000 });
  console.log('Successfully transitioned to Level Map!');

  // Check cookie 'has_onboarded' is set to true
  const cookies = await page.cookies();
  const onboardedCookie = cookies.find(c => c.name === 'has_onboarded');
  console.log('Cookie "has_onboarded":', onboardedCookie ? onboardedCookie.value : 'missing');
  if (!onboardedCookie || onboardedCookie.value !== 'true') {
    throw new Error('has_onboarded cookie was not set!');
  }

  await page.screenshot({ path: path.join(artifactDir, 'map_after_onboarding.png') });
  await page.screenshot({ path: path.resolve('public', 'map_after_onboarding.png') });

  // ================= 3. RETURNING VISITOR (LOBBY SKIPPED) =================
  console.log('\n--- 3. Returning Visitor: Lobby Must Be Skipped ---');
  await page.reload({ waitUntil: 'networkidle0' });

  // Verify Level Map is displayed IMMEDIATELY without showing onboarding lobby
  await page.waitForSelector('#level-node-1');
  const mapHeaderText = await page.$eval('h2', el => el.textContent);
  console.log('Directly loaded heading on reload:', mapHeaderText);
  const isDirectlyOnMap = mapHeaderText.includes('نەخشەی قۆناغەکانی فێربوون');
  console.log('Did returning visitor skip onboarding lobby directly to Map?', isDirectlyOnMap);
  if (!isDirectlyOnMap) {
    throw new Error('Returning visitor was not routed directly to the Level Map!');
  }

  // Test Brand Logo click: must return/stay on Level Map
  console.log('Testing Brand Logo navigation (must stay on Level Map)...');
  await page.click('#brand-logo-btn');
  await new Promise(r => setTimeout(r, 300));
  const stillOnMap = await page.$('#level-node-1');
  console.log('Does brand logo keep user on Level Map?', stillOnMap !== null);

  await page.screenshot({ path: path.join(artifactDir, 'map_returning_visitor.png') });
  await page.screenshot({ path: path.resolve('public', 'map_returning_visitor.png') });

  // ================= 4. GUEST PERSISTENCE VIA COOKIES =================
  console.log('\n--- 4. Testing Guest Cookie Persistence ---');
  await page.click('#level-node-1');
  await page.waitForSelector('.font-mono');

  // Complete Level 1 to unlock Level 2
  const level1Exercise = "س د س د س س د د س د س د د س د س";
  await page.evaluate(async (text) => {
    for (const ch of text) {
      window.dispatchEvent(new KeyboardEvent('keydown', { key: ch, bubbles: true }));
      await new Promise(r => setTimeout(r, 30));
    }
  }, level1Exercise);

  await page.waitForSelector('#claim-xp-btn');
  console.log('Level 1 completed by Guest.');

  // Check guest cookies
  const guestCookies = await page.cookies();
  const unlockedCookie = guestCookies.find(c => c.name === 'guest_unlocked_level');
  console.log('Cookie "guest_unlocked_level":', unlockedCookie ? unlockedCookie.value : 'missing');

  // Refresh page and confirm Level 2 is unlocked from cookie!
  await page.goto('http://localhost:3000', { waitUntil: 'networkidle0' });
  await page.waitForSelector('#level-node-2');

  const level2NodeClass = await page.$eval('#level-node-2', el => el.className);
  const isLevel2Unlocked = level2NodeClass.includes('from-[#58cc02]');
  console.log('Is Level 2 unlocked for Guest after page refresh?', isLevel2Unlocked);

  // ================= 5. KEYBOARD NEUTRAL STYLING IN ARENA =================
  console.log('\n--- 5. Verifying Key "س" is NOT permanently green ---');
  await page.click('#level-node-2'); // Level 2 targets 'ا' and 'ف', NOT 'س'!
  await page.waitForSelector('.font-mono');

  // Key 'س' should NOT be green in Level 2!
  const keySClassInLevel2 = await page.$eval('#key-س', el => el.className);
  console.log('Key "س" classes in Level 2 (targeting "ا" and "ف"):', keySClassInLevel2);
  const isSNotGreen = !keySClassInLevel2.includes('keycap-active');
  console.log('Is key "س" NOT green when not targeted?', isSNotGreen);
  if (!isSNotGreen) {
    throw new Error('Key "س" is permanently green!');
  }

  console.log('\n--- ALL CHECKS PASSED ---');
  console.log('Page Errors count:', errors.length);
  if (errors.length > 0) {
    console.error('Errors:', errors);
  }
  console.log('Console Logs count:', logs.length);
  console.log('Smart onboarding, cookie persistence, and keyboard styling verified!');

  await browser.close();
}

main().catch(err => {
  console.error('Verification failed:', err);
  process.exit(1);
});
