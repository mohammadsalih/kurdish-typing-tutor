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

  const errors = [];
  page.on('pageerror', err => errors.push(err.toString()));

  await page.goto('http://localhost:3000', { waitUntil: 'networkidle0' });

  // Clear storage so we are in fresh onboarding mode
  await page.evaluate(() => {
    localStorage.clear();
    document.cookie.split(";").forEach(c => {
      document.cookie = c.replace(/^ +/, "").replace(/=.*/, "=;expires=" + new Date().toUTCString() + ";path=/");
    });
  });
  await page.reload({ waitUntil: 'networkidle0' });

  // 1. Verify text-char elements from TypingDisplay exist
  await page.waitForSelector('#text-char-0');
  console.log('TypingDisplay character 0 found!');

  // Inspect font and dir
  const displayInfo = await page.evaluate(() => {
    const char0 = document.querySelector('#text-char-0');
    const word0 = char0 ? char0.closest('div') : null;
    const container = char0 ? char0.closest('[dir="rtl"]') : null;
    const computedFont = window.getComputedStyle(char0).fontFamily;
    const computedDir = container ? container.getAttribute('dir') : null;

    // Check all characters in the display
    const allChars = Array.from(document.querySelectorAll('[id^="text-char-"]')).map(el => el.textContent);
    const spaceChars = Array.from(document.querySelectorAll('[id^="space-char-"]')).map(el => el.textContent);

    return {
      char0: char0.textContent,
      fontFamily: computedFont,
      dir: computedDir,
      totalChars: allChars.length,
      allCharsText: allChars.join(''),
      spaceCount: spaceChars.length,
    };
  });

  console.log('Display Info:', JSON.stringify(displayInfo, null, 2));

  // Take screenshot of initial state
  const promptBox = await page.$('#onboarding-prompt-box');
  if (promptBox) {
    await promptBox.screenshot({ path: 'public/onboard_typing_initial.png' });
    console.log('Saved public/onboard_typing_initial.png');
  }

  // 2. Test Error State Hookup: type a wrong key ('x' or 'z')
  console.log('Testing incorrect key input...');
  await page.keyboard.press('KeyX');
  await new Promise(r => setTimeout(r, 150));

  const errorClass = await page.$eval('#text-char-0', el => el.className);
  console.log('Char 0 class after wrong key press:', errorClass);
  const isErrorHighlighted = errorClass.includes('text-rose-600');
  console.log('Is wrong keystroke accurately highlighted red?', isErrorHighlighted);

  if (promptBox) {
    await promptBox.screenshot({ path: 'public/onboard_typing_error.png' });
    console.log('Saved public/onboard_typing_error.png');
  }

  // 3. Test Correct Keystrokes step by step: "سڵاو كوردستان!"
  console.log('Typing "سڵاو كوردستان!" ...');
  const keysToType = ['s', 'l', 'a', 'w', 'Space', 'k', 'w', 'r', 'd', 's', 't', 'a', 'n', '!'];

  for (let i = 0; i < keysToType.length; i++) {
    const k = keysToType[i];
    if (k === 'Space') {
      await page.keyboard.press('Space');
    } else if (k === '!') {
      await page.keyboard.type('!');
    } else {
      await page.keyboard.press(`Key${k.toUpperCase()}`);
    }
    await new Promise(r => setTimeout(r, 80));

    if (i === 3) {
      // After typing "سڵاو"
      if (promptBox) {
        await promptBox.screenshot({ path: 'public/onboard_typing_mid.png' });
        console.log('Saved public/onboard_typing_mid.png');
      }
    }
  }

  // Wait for success and transition
  console.log('Waiting for completion...');
  await new Promise(r => setTimeout(r, 1500));

  const currentViewText = await page.$eval('main', el => el.textContent);
  const reachedMap = currentViewText.includes('نەخشەی ئاستەکان') || currentViewText.includes('ئاستی');
  console.log('Successfully completed onboarding and transitioned to map?', reachedMap);

  await page.screenshot({ path: 'public/onboard_completed_map.png' });
  console.log('Saved public/onboard_completed_map.png');

  console.log('Errors count:', errors.length);
  if (errors.length > 0) {
    console.error('Errors encountered:', errors);
  }

  await browser.close();
}

main().catch(err => {
  console.error('Test failed:', err);
  process.exit(1);
});
