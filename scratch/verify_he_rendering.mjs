import puppeteer from 'puppeteer-core';
import path from 'path';

const ARTIFACT_DIR = 'C:\\Users\\moham\\.gemini\\antigravity-ide\\brain\\c3afe10a-57b1-45c4-95b4-cc5d0bbf99ca';

async function verify() {
  console.log('Launching browser for Kurdish Heh glyph verification...');
  const browser = await puppeteer.launch({
    executablePath: 'C:\\Program Files (x86)\\Microsoft\\Edge\\Application\\msedge.exe',
    headless: true,
    args: ['--no-sandbox', '--window-size=1280,950']
  });

  const page = await browser.newPage();
  await page.setViewport({ width: 1280, height: 950 });

  // 1. Set cookies so onboarding is bypassed and Level 4 is unlocked
  await page.setCookie(
    { name: 'has_onboarded', value: 'true', domain: 'localhost', path: '/' },
    { name: 'guest_unlocked_level', value: '5', domain: 'localhost', path: '/' }
  );

  console.log('Navigating to http://localhost:3000...');
  await page.goto('http://localhost:3000', { waitUntil: 'networkidle2' });
  await new Promise(r => setTimeout(r, 1500));

  // Save screenshot of curriculum map with Level 4 unlocked
  await page.screenshot({ path: path.join(ARTIFACT_DIR, 'step1_curriculum_map.png') });
  console.log('Captured step1_curriculum_map.png');

  // Click Level 4 node button directly
  console.log('Clicking #level-node-4...');
  await page.waitForSelector('#level-node-4', { timeout: 5000 });
  await page.click('#level-node-4');
  await new Promise(r => setTimeout(r, 1500));

  // Wait for typing arena container
  await page.waitForSelector('#typing-arena-wrapper', { timeout: 5000 });
  console.log('Typing arena mounted!');

  // Verify Typing Arena loaded
  const arenaInfo = await page.evaluate(() => {
    const targetDisplay = document.querySelector('#target-char-display')?.textContent?.trim();
    const hKeyLabel = document.querySelector('#key-ه')?.textContent?.trim();
    const eKeyLabel = document.querySelector('#key-ە')?.textContent?.trim();
    const targetTextContainer = document.querySelector('#target-text-container')?.innerText;
    return { targetDisplay, hKeyLabel, eKeyLabel, targetTextContainer };
  });
  console.log('Arena initial state:', arenaInfo);

  // Keycap verification
  console.log(`Verifying keycaps:`);
  console.log(`- 'H' keycap label: "${arenaInfo.hKeyLabel}" (Expected: "هـ")`);
  console.log(`- 'E' keycap label: "${arenaInfo.eKeyLabel}" (Expected: "ە")`);
  if (arenaInfo.hKeyLabel !== 'هـ') {
    throw new Error(`Expected 'H' keycap to be 'هـ' but found '${arenaInfo.hKeyLabel}'`);
  }
  if (arenaInfo.eKeyLabel !== 'ە') {
    throw new Error(`Expected 'E' keycap to be 'ە' but found '${arenaInfo.eKeyLabel}'`);
  }

  // Save screenshot of initial Level 4 arena
  await page.screenshot({ path: path.join(ARTIFACT_DIR, 'step2_level4_arena_start.png') });
  console.log('Captured step2_level4_arena_start.png');

  // Type first character "گ" and space " " so the target becomes "ه"
  console.log('Typing "g" and Space to reach "ه"...');
  await page.keyboard.press('g');
  await new Promise(r => setTimeout(r, 200));
  await page.keyboard.press('Space');
  await new Promise(r => setTimeout(r, 400));

  // Now the target key is 'ه'
  const activeState = await page.evaluate(() => {
    const targetCharDisplay = document.querySelector('#target-char-display')?.textContent?.trim();
    const hudTargetChar = document.querySelector('#target-char')?.textContent?.trim();
    const hKey = document.querySelector('#key-ه');
    const isHKeyActive = hKey?.classList.contains('keycap-active');
    const eKey = document.querySelector('#key-ە');
    const isEKeyActive = eKey?.classList.contains('keycap-active');
    return { targetCharDisplay, hudTargetChar, isHKeyActive, isEKeyActive };
  });
  console.log('Target "ه" state:', activeState);

  if (activeState.targetCharDisplay !== 'هـ') {
    throw new Error(`Expected #target-char-display to be 'هـ' but got '${activeState.targetCharDisplay}'`);
  }
  if (activeState.hudTargetChar !== 'هـ') {
    throw new Error(`Expected HUD #target-char to be 'هـ' but got '${activeState.hudTargetChar}'`);
  }
  if (!activeState.isHKeyActive) {
    throw new Error(`Expected 'H' keycap to have class 'keycap-active'`);
  }
  if (activeState.isEKeyActive) {
    throw new Error(`'E' keycap should NOT be active when target is 'ه'`);
  }

  // Capture screenshot of 'H' keycap actively glowing green with 'هـ' and target prompt
  await page.screenshot({ path: path.join(ARTIFACT_DIR, 'step3_h_keycap_active_glow.png') });
  console.log('Captured step3_h_keycap_active_glow.png');

  // Type "h", space, "g", space, "h", space to advance right to "هیوا"
  console.log('Typing to advance to word "هیوا"...');
  await page.keyboard.press('h'); // completes first 'ه'
  await new Promise(r => setTimeout(r, 150));
  await page.keyboard.press('Space');
  await new Promise(r => setTimeout(r, 150));
  await page.keyboard.press('g');
  await new Promise(r => setTimeout(r, 150));
  await page.keyboard.press('Space');
  await new Promise(r => setTimeout(r, 150));
  await page.keyboard.press('h'); // completes second 'ه'
  await new Promise(r => setTimeout(r, 150));
  await page.keyboard.press('Space');
  await new Promise(r => setTimeout(r, 400));

  // Now the target is the first letter of "هیوا" ('ه')!
  const hiwaState = await page.evaluate(() => {
    const targetCharDisplay = document.querySelector('#target-char-display')?.textContent?.trim();
    const hKey = document.querySelector('#key-ه');
    const isHKeyActive = hKey?.classList.contains('keycap-active');
    const containerText = document.querySelector('#target-text-container')?.innerText;
    return { targetCharDisplay, isHKeyActive, containerText };
  });
  console.log('State at start of word "هیوا":', hiwaState);

  // Capture screenshot showing word "هیوا" in connected cursive with initial 'ه' highlighted
  await page.screenshot({ path: path.join(ARTIFACT_DIR, 'step4_word_hiwa_cursive.png') });
  console.log('Captured step4_word_hiwa_cursive.png');

  // Type the word "هیوا" letter by letter: 'h', 'y', 'w', 'a'
  console.log('Typing word "هیوا" (h, y, w, a)...');
  await page.keyboard.press('h');
  await new Promise(r => setTimeout(r, 200));
  await page.keyboard.press('y');
  await new Promise(r => setTimeout(r, 200));
  await page.keyboard.press('w');
  await new Promise(r => setTimeout(r, 200));
  await page.keyboard.press('a');
  await new Promise(r => setTimeout(r, 400));

  const afterHiwaState = await page.evaluate(() => {
    const targetCharDisplay = document.querySelector('#target-char-display')?.textContent?.trim();
    return { targetCharDisplay };
  });
  console.log('State after typing "هیوا":', afterHiwaState);

  // Capture screenshot after typing "هیوا" successfully
  await page.screenshot({ path: path.join(ARTIFACT_DIR, 'step5_word_hiwa_typed.png') });
  console.log('Captured step5_word_hiwa_typed.png');

  await browser.close();
  console.log('ALL VERIFICATIONS PASSED FLIELESSLY!');
}

verify().catch(err => {
  console.error('Verification failed:', err);
  process.exit(1);
});
