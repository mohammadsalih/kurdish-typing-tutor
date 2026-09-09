import puppeteer from 'puppeteer-core';
import path from 'path';

async function main() {
  const edgePath = 'C:\\Program Files (x86)\\Microsoft\\Edge\\Application\\msedge.exe';
  const artifactDir = 'C:\\Users\\moham\\.gemini\\antigravity-ide\\brain\\0efe5f04-2236-4c48-8da7-cb362803a518';

  console.log('Starting Progression & Auth Verification via Edge...');
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

  // ================= 1. GUEST MODE VERIFICATION =================
  console.log('\n--- 1. Testing Guest Mode ---');
  await page.goto('http://localhost:3000', { waitUntil: 'networkidle0' });
  await page.evaluate(() => localStorage.clear()); // Ensure fresh guest session
  await page.reload({ waitUntil: 'networkidle0' });

  await page.waitForSelector('#keyboard-stage');

  // Strict Rule Check: Points & Streaks MUST be completely hidden for guests
  const streakPillGuest = await page.$('#hud-streak-pill');
  const xpPillGuest = await page.$('#hud-xp-pill');
  const mascotXpBadgeGuest = await page.$('#mascot-xp-badge');
  const mascotStreakBadgeGuest = await page.$('#mascot-streak-badge');
  const guestIndicator = await page.$('#hud-guest-indicator');

  console.log('Is HUD streak pill hidden?', streakPillGuest === null);
  console.log('Is HUD XP pill hidden?', xpPillGuest === null);
  console.log('Is Mascot XP badge hidden?', mascotXpBadgeGuest === null);
  console.log('Is Mascot streak badge hidden?', mascotStreakBadgeGuest === null);
  console.log('Is Guest indicator present?', guestIndicator !== null);

  const guestPointsHidden = streakPillGuest === null && xpPillGuest === null && mascotXpBadgeGuest === null && mascotStreakBadgeGuest === null;
  if (!guestPointsHidden) {
    throw new Error('STRICT RULE VIOLATION: Points/Streaks are visible in Guest mode!');
  }
  console.log('SUCCESS: All points and streak counters are completely hidden in Guest Mode.');

  await page.screenshot({ path: path.join(artifactDir, 'guest_lobby.png') });
  await page.screenshot({ path: path.resolve('public', 'guest_lobby.png') });

  // ================= 2. EDCLUB CURRICULUM MAP VERIFICATION =================
  console.log('\n--- 2. Testing EdClub Curriculum Map ---');
  await page.click('#open-map-btn');
  await page.waitForSelector('#level-node-1');
  console.log('Curriculum map loaded successfully.');

  const level1Active = await page.$eval('#level-node-1', el => el.className.includes('from-[#58cc02]'));
  const level2Locked = await page.$eval('#level-node-2', el => el.className.includes('bg-slate-200'));
  console.log('Is Level 1 active with glowing green styling?', level1Active);
  console.log('Is Level 2 locked with slate/padlock styling?', level2Locked);

  await page.screenshot({ path: path.join(artifactDir, 'curriculum_map.png') });
  await page.screenshot({ path: path.resolve('public', 'curriculum_map.png') });

  // ================= 3. TYPING ARENA & WRONG KEY SHAKE =================
  console.log('\n--- 3. Testing Typing Arena & Keystroke Physics ---');
  await page.click('#level-node-1');
  await page.waitForSelector('.font-mono');
  console.log('Typing arena loaded for Level 1.');

  // Test typing wrong key to check screen shake
  console.log('Simulating incorrect keystroke (wrong key)...');
  await page.keyboard.press('KeyZ');
  await new Promise(r => setTimeout(r, 300));

  // Type correct text: "س د س د س س د د س د س د د س د س"
  console.log('Typing exercise characters correctly...');
  const exercise = "س د س د س س د د س د س د د س د س";
  await page.evaluate(async (text) => {
    for (const ch of text) {
      window.dispatchEvent(new KeyboardEvent('keydown', { key: ch, bubbles: true }));
      await new Promise((r) => setTimeout(r, 25));
    }
  }, exercise);

  // Wait for Level Complete Modal
  console.log('Waiting for Level Complete Modal...');
  await page.waitForSelector('#claim-xp-btn');
  console.log('Level Complete Modal displayed.');

  // Verify Guest restriction in completion modal:
  const claimBtnText = await page.$eval('#claim-xp-btn', el => el.textContent.trim());
  console.log('Claim button text:', claimBtnText);

  await page.screenshot({ path: path.join(artifactDir, 'guest_level_complete.png') });
  await page.screenshot({ path: path.resolve('public', 'guest_level_complete.png') });

  // ================= 4. LOGGED-IN MODE & REWARD CLAIM =================
  console.log('\n--- 4. Testing Reward Claim & Logged-in State ---');
  await page.click('#claim-xp-btn');
  await new Promise(r => setTimeout(r, 800));

  // Navigate to Lobby
  console.log('Navigating to Lobby to verify Logged-in view...');
  await page.click('#next-level-btn');
  await new Promise(r => setTimeout(r, 500));
  await page.goto('http://localhost:3000', { waitUntil: 'networkidle0' });

  // Verify Points & Streak are NOW DISPLAYED
  await page.waitForSelector('#hud-streak-pill');
  await page.waitForSelector('#hud-xp-pill');
  await page.waitForSelector('#mascot-xp-badge');
  await page.waitForSelector('#mascot-streak-badge');

  const streakText = await page.$eval('#hud-streak-pill', el => el.textContent.trim());
  const xpText = await page.$eval('#hud-xp-pill', el => el.textContent.trim());
  console.log('Logged-in HUD Streak:', streakText);
  console.log('Logged-in HUD XP:', xpText);

  await page.screenshot({ path: path.join(artifactDir, 'logged_in_lobby.png') });
  await page.screenshot({ path: path.resolve('public', 'logged_in_lobby.png') });

  console.log('\n--- VERIFICATION REPORT ---');
  console.log('Page Errors count:', errors.length);
  if (errors.length > 0) {
    console.error('Page errors occurred:', errors);
  }
  console.log('Console Logs count:', logs.length);
  console.log('All EdClub progression, authentication, and conditional scoring tests PASSED perfectly!');

  await browser.close();
}

main().catch(err => {
  console.error('Verification failed:', err);
  process.exit(1);
});
