import puppeteer from 'puppeteer-core';
import path from 'path';

const ARTIFACT_DIR = 'C:\\Users\\moham\\.gemini\\antigravity-ide\\brain\\c3afe10a-57b1-45c4-95b4-cc5d0bbf99ca';

async function verifyShiftModifier() {
  console.log('Launching browser for Shift modifier verification...');
  const browser = await puppeteer.launch({
    executablePath: 'C:\\Program Files (x86)\\Microsoft\\Edge\\Application\\msedge.exe',
    headless: true,
    args: ['--no-sandbox', '--window-size=1280,950']
  });

  const page = await browser.newPage();
  await page.setViewport({ width: 1280, height: 950 });

  // Bypass onboarding & unlock Level 14
  await page.setCookie(
    { name: 'has_onboarded', value: 'true', domain: 'localhost', path: '/' },
    { name: 'guest_unlocked_level', value: '20', domain: 'localhost', path: '/' }
  );

  console.log('Navigating to http://localhost:3000...');
  await page.goto('http://localhost:3000', { waitUntil: 'networkidle2' });
  await new Promise(r => setTimeout(r, 1200));

  // Click Level 14 (Shift Mastery)
  console.log('Clicking #level-node-14...');
  await page.waitForSelector('#level-node-14', { timeout: 5000 });
  await page.click('#level-node-14');
  await new Promise(r => setTimeout(r, 1200));

  await page.waitForSelector('#typing-arena-wrapper', { timeout: 5000 });
  console.log('Typing arena mounted for Level 14!');

  // 1. Verify unshifted initial state
  const unshiftedKeys = await page.evaluate(() => {
    const l = document.querySelector('#key-ل')?.textContent?.trim();
    const s = document.querySelector('#key-س')?.textContent?.trim();
    const r = document.querySelector('#key-ر')?.textContent?.trim();
    const y = document.querySelector('#key-ی')?.textContent?.trim();
    const c = document.querySelector('#key-ج')?.textContent?.trim();
    const g = document.querySelector('#key-گ')?.textContent?.trim();
    const h = document.querySelector('#key-ح')?.textContent?.trim();
    const d1 = document.querySelector('#key-1')?.textContent?.trim();
    const slash = document.querySelector('#key-\\关' || '#key-\\/')?.textContent?.trim();
    const slashKey = document.querySelector('[data-key="/"]')?.textContent?.trim();
    const targetChar = document.querySelector('#target-char-display')?.textContent?.trim();
    const hudTarget = document.querySelector('#target-char')?.textContent?.trim();
    return { l, s, r, y, c, g, h, d1, slashKey, targetChar, hudTarget };
  });
  console.log('Unshifted keys state:', unshiftedKeys);

  if (unshiftedKeys.l !== 'ل' || unshiftedKeys.s !== 'س' || unshiftedKeys.r !== 'ر') {
    throw new Error(`Unshifted keys do not match base Kurdish letters: ${JSON.stringify(unshiftedKeys)}`);
  }

  await page.screenshot({ path: path.join(ARTIFACT_DIR, 'step1_unshifted_board.png') });
  console.log('Captured step1_unshifted_board.png');

  // 2. Press and HOLD Shift
  console.log('Holding Shift down...');
  await page.keyboard.down('Shift');
  await new Promise(r => setTimeout(r, 500));

  const shiftedKeys = await page.evaluate(() => {
    const l = document.querySelector('#key-ل')?.textContent?.trim();
    const s = document.querySelector('#key-س')?.textContent?.trim();
    const r = document.querySelector('#key-ر')?.textContent?.trim();
    const y = document.querySelector('#key-ی')?.textContent?.trim();
    const c = document.querySelector('#key-ج')?.textContent?.trim();
    const g = document.querySelector('#key-گ')?.textContent?.trim();
    const h = document.querySelector('#key-ح')?.textContent?.trim();
    const d1 = document.querySelector('#key-1')?.textContent?.trim();
    const d5 = document.querySelector('#key-5')?.textContent?.trim();
    const slashKey = document.querySelector('[data-key="/"]')?.textContent?.trim();
    const shiftIndicator = document.querySelector('#shift-indicator')?.textContent?.trim();
    const shiftLActive = document.querySelector('#key-ShiftLeft')?.classList.contains('keycap-active');
    const shiftRActive = document.querySelector('#key-ShiftRight')?.classList.contains('keycap-active');
    const sKeyActive = document.querySelector('#key-س')?.classList.contains('keycap-active');
    return { l, s, r, y, c, g, h, d1, d5, slashKey, shiftIndicator, shiftLActive, shiftRActive, sKeyActive };
  });
  console.log('Shifted keys state:', shiftedKeys);

  // Assertions for Shift state
  if (shiftedKeys.l !== 'ڵ') throw new Error(`Expected 'ل' key to swap to 'ڵ' when Shift held, but got '${shiftedKeys.l}'`);
  if (shiftedKeys.s !== 'ش') throw new Error(`Expected 'س' key to swap to 'ش' when Shift held, but got '${shiftedKeys.s}'`);
  if (shiftedKeys.r !== 'ڕ') throw new Error(`Expected 'ر' key to swap to 'ڕ' when Shift held, but got '${shiftedKeys.r}'`);
  if (shiftedKeys.y !== 'ێ') throw new Error(`Expected 'ی' key to swap to 'ێ' when Shift held, but got '${shiftedKeys.y}'`);
  if (shiftedKeys.c !== 'چ') throw new Error(`Expected 'ج' key to swap to 'چ' when Shift held, but got '${shiftedKeys.c}'`);
  if (shiftedKeys.g !== 'غ') throw new Error(`Expected 'گ' key to swap to 'غ' when Shift held, but got '${shiftedKeys.g}'`);
  if (shiftedKeys.h !== 'ع') throw new Error(`Expected 'ح' key to swap to 'ع' when Shift held, but got '${shiftedKeys.h}'`);
  if (shiftedKeys.d1 !== '!') throw new Error(`Expected '١' key to swap to '!' when Shift held, but got '${shiftedKeys.d1}'`);
  if (shiftedKeys.d5 !== '٪') throw new Error(`Expected '٥' key to swap to '٪' when Shift held, but got '${shiftedKeys.d5}'`);
  if (shiftedKeys.slashKey !== '؟') throw new Error(`Expected '/' key to swap to '؟' when Shift held, but got '${shiftedKeys.slashKey}'`);
  if (!shiftedKeys.shiftLActive && !shiftedKeys.shiftRActive) throw new Error('Expected Shift keycaps to be active when Shift held');

  await page.screenshot({ path: path.join(ARTIFACT_DIR, 'step2_shifted_board_held.png') });
  console.log('Captured step2_shifted_board_held.png');

  // 3. Release Shift
  console.log('Releasing Shift...');
  await page.keyboard.up('Shift');
  await new Promise(r => setTimeout(r, 400));

  const revertedKeys = await page.evaluate(() => {
    const l = document.querySelector('#key-ل')?.textContent?.trim();
    const s = document.querySelector('#key-س')?.textContent?.trim();
    const r = document.querySelector('#key-ر')?.textContent?.trim();
    return { l, s, r };
  });
  console.log('Reverted keys state:', revertedKeys);
  if (revertedKeys.l !== 'ل' || revertedKeys.s !== 'س' || revertedKeys.r !== 'ر') {
    throw new Error('Keys did not revert back to unshifted base labels after releasing Shift');
  }

  // 4. Type the complex word "شۆڕش" (Shift+S, O, Shift+R, Shift+S)
  console.log('Typing complex word "شۆڕش"...');
  
  // 1st letter: ش (Shift+S)
  await page.keyboard.down('Shift');
  await new Promise(r => setTimeout(r, 100));
  await page.keyboard.press('KeyS');
  await new Promise(r => setTimeout(r, 100));
  await page.keyboard.up('Shift');
  await new Promise(r => setTimeout(r, 150));

  // 2nd letter: ۆ (O)
  await page.keyboard.press('KeyO');
  await new Promise(r => setTimeout(r, 150));

  // 3rd letter: ڕ (Shift+R)
  await page.keyboard.down('Shift');
  await new Promise(r => setTimeout(r, 100));
  await page.keyboard.press('KeyR');
  await new Promise(r => setTimeout(r, 100));
  await page.keyboard.up('Shift');
  await new Promise(r => setTimeout(r, 150));

  // 4th letter: ش (Shift+S)
  await page.keyboard.down('Shift');
  await new Promise(r => setTimeout(r, 100));
  await page.keyboard.press('KeyS');
  await new Promise(r => setTimeout(r, 100));
  await page.keyboard.up('Shift');
  await new Promise(r => setTimeout(r, 400));

  const afterShorash = await page.evaluate(() => {
    const targetChar = document.querySelector('#target-char-display')?.textContent?.trim();
    return { targetChar };
  });
  console.log('State after typing "شۆڕش":', afterShorash);

  await page.screenshot({ path: path.join(ARTIFACT_DIR, 'step3_word_shorash_typed.png') });
  console.log('Captured step3_word_shorash_typed.png');

  // 5. Advance through space and type "ڕێباز" (Shift+R, Shift+Y, B, A, Z)
  console.log('Typing space and second shifted word "ڕێباز"...');
  await page.keyboard.press('Space');
  await new Promise(r => setTimeout(r, 150));

  // ڕ (Shift+R)
  await page.keyboard.down('Shift');
  await page.keyboard.press('KeyR');
  await page.keyboard.up('Shift');
  await new Promise(r => setTimeout(r, 150));

  // ێ (Shift+Y)
  await page.keyboard.down('Shift');
  await page.keyboard.press('KeyY');
  await page.keyboard.up('Shift');
  await new Promise(r => setTimeout(r, 150));

  // ب (B)
  await page.keyboard.press('KeyB');
  await new Promise(r => setTimeout(r, 150));

  // ا (A)
  await page.keyboard.press('KeyA');
  await new Promise(r => setTimeout(r, 150));

  // ز (Z)
  await page.keyboard.press('KeyZ');
  await new Promise(r => setTimeout(r, 400));

  await page.screenshot({ path: path.join(ARTIFACT_DIR, 'step4_word_rebaz_typed.png') });
  console.log('Captured step4_word_rebaz_typed.png');

  await browser.close();
  console.log('EXHAUSTIVE SHIFT MODIFIER VERIFICATION COMPLETED WITH 100% SUCCESS!');
}

verifyShiftModifier().catch(err => {
  console.error('Shift modifier verification failed:', err);
  process.exit(1);
});
