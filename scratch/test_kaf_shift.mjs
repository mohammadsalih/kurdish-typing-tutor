import puppeteer from 'puppeteer-core';

async function main() {
  const edgePath = 'C:\\Program Files (x86)\\Microsoft\\Edge\\Application\\msedge.exe';
  const browser = await puppeteer.launch({
    executablePath: edgePath,
    headless: true,
    args: ['--no-sandbox', '--disable-setuid-sandbox'],
  });

  const page = await browser.newPage();
  await page.setViewport({ width: 1440, height: 960 });

  await page.goto('http://localhost:3000', { waitUntil: 'networkidle0' });

  // Reset to onboarding view
  await page.evaluate(() => {
    localStorage.clear();
    document.cookie.split(";").forEach(c => {
      document.cookie = c.replace(/^ +/, "").replace(/=.*/, "=;expires=" + new Date().toUTCString() + ";path=/");
    });
  });
  await page.reload({ waitUntil: 'networkidle0' });

  await page.waitForSelector('#onboarding-prompt-box');

  // Type "سڵاو " so that the next character is 'ك'
  console.log('Typing "سڵاو " ...');
  // 'س'
  await page.keyboard.press('KeyS');
  await new Promise(r => setTimeout(r, 60));
  // 'ڵ' (Shift + L)
  await page.keyboard.down('Shift');
  await page.keyboard.press('KeyL');
  await page.keyboard.up('Shift');
  await new Promise(r => setTimeout(r, 60));
  // 'ا'
  await page.keyboard.press('KeyA');
  await new Promise(r => setTimeout(r, 60));
  // 'و'
  await page.keyboard.press('KeyW');
  await new Promise(r => setTimeout(r, 60));
  // ' ' (Space)
  await page.keyboard.press('Space');
  await new Promise(r => setTimeout(r, 100));

  // Now the target character should be 'ك'
  const targetInfo = await page.evaluate(() => {
    const targetCharEl = document.querySelector('#target-char-display') || document.querySelector('b');
    const shiftBadge = Array.from(document.querySelectorAll('span')).find(el => el.textContent.includes('Shift + پیتەکە'));

    // Find Kaf keycap
    const allKeycaps = Array.from(document.querySelectorAll('.keycap-3d'));
    const kafKey = allKeycaps.find(el => el.textContent.trim().startsWith('ك') || el.textContent.trim().startsWith('ک'));
    const isKafActive = kafKey ? kafKey.className.includes('keycap-active') : false;

    // Check if Shift keycap is active/pulsing
    const shiftKeys = allKeycaps.filter(el => el.textContent.includes('SHIFT'));
    const isShiftActive = shiftKeys.some(el => el.className.includes('keycap-active') || el.className.includes('animate-pulse'));

    return {
      targetChar: targetCharEl ? targetCharEl.textContent.trim() : null,
      hasShiftBadge: Boolean(shiftBadge),
      isKafActive,
      isShiftActive,
    };
  });

  console.log('Kaf Target State Info:', JSON.stringify(targetInfo, null, 2));

  if (targetInfo.hasShiftBadge) {
    throw new Error("FAILED: Shift prompt ('Shift + پیتەکە') is still shown for 'ك'!");
  }
  if (targetInfo.isShiftActive) {
    throw new Error("FAILED: Shift keycap is still glowing/active for 'ك'!");
  }
  if (!targetInfo.isKafActive) {
    throw new Error("FAILED: Kaf keycap is not glowing green as the active target key!");
  }

  // Take screenshot of Kaf target keycap state (showing unshifted Kaf active and NO Shift prompt)
  await page.screenshot({ path: 'public/kaf_target_state.png' });
  console.log('Saved public/kaf_target_state.png');

  // Now press unshifted lowercase 'k' without Shift
  console.log("Pressing standard unshifted 'k' (KeyK without Shift)...");
  await page.keyboard.press('KeyK');
  await new Promise(r => setTimeout(r, 150));

  // Verify it advanced to 'و' (no error thrown)
  const afterPressInfo = await page.evaluate(() => {
    const errorEl = document.querySelector('.text-rose-600');
    // Check which char in TypingDisplay is now current
    const activeChar = document.querySelector('[id^="text-char-"].text-slate-950');
    return {
      hasError: Boolean(errorEl),
      currentActiveChar: activeChar ? activeChar.textContent : null,
    };
  });

  console.log('After unshifted "k" press:', JSON.stringify(afterPressInfo, null, 2));

  if (afterPressInfo.hasError) {
    throw new Error("FAILED: Pressing unshifted 'k' caused an error!");
  }
  if (afterPressInfo.currentActiveChar !== 'و') {
    throw new Error(`FAILED: Expected next active char to be 'و', got '${afterPressInfo.currentActiveChar}'`);
  }

  console.log("SUCCESS: Unshifted 'k' matched target 'ك' flawlessly without requiring Shift!");

  await browser.close();
}

main().catch(err => {
  console.error('Test execution error:', err);
  process.exit(1);
});
