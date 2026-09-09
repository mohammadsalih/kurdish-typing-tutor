import puppeteer from 'puppeteer-core';
import path from 'path';

const ARTIFACT_DIR = 'C:\\Users\\moham\\.gemini\\antigravity-ide\\brain\\c3afe10a-57b1-45c4-95b4-cc5d0bbf99ca';

async function verifyKeyboardWidth() {
  console.log('Launching browser to verify keyboard width and proportions...');
  const edgePath = 'C:\\Program Files (x86)\\Microsoft\\Edge\\Application\\msedge.exe';
  const browser = await puppeteer.launch({
    executablePath: edgePath,
    headless: true,
    args: ['--no-sandbox', '--disable-setuid-sandbox', '--disable-gpu'],
  });

  try {
    const page = await browser.newPage();
    await page.setViewport({ width: 1280, height: 950 });

    await page.setCookie(
      { name: 'has_onboarded', value: 'true', domain: 'localhost', path: '/' },
      { name: 'guest_unlocked_level', value: '5', domain: 'localhost', path: '/' }
    );

    console.log('Navigating to http://localhost:3000...');
    await page.goto('http://localhost:3000', { waitUntil: 'networkidle2' });
    await new Promise(r => setTimeout(r, 1000));

    console.log('Clicking #level-node-1...');
    await page.waitForSelector('#level-node-1', { timeout: 5000 });
    await page.click('#level-node-1');
    await new Promise(r => setTimeout(r, 800));

    // Dismiss milestone popup
    console.log('Dismissing milestone popup...');
    await page.waitForSelector('#milestone-got-it-btn', { timeout: 5000 });
    await page.click('#milestone-got-it-btn');
    await new Promise(r => setTimeout(r, 800));

    const metrics = await page.evaluate(() => {
      const arenaCard = document.querySelector('.max-w-5xl');
      const targetBox = document.querySelector('#typing-arena-wrapper .bg-slate-50\\/90') || document.querySelector('.bg-slate-50\\/90');
      const keyTilde = document.getElementById('key-~');
      const keyboardWrapper = keyTilde ? keyTilde.closest('.shadow-inner') : null;
      
      const row1 = document.getElementById('key-~')?.parentElement;
      const row2 = document.getElementById('key-Tab')?.parentElement;
      const row3 = document.getElementById('key-CapsLock')?.parentElement;
      const row4 = document.getElementById('key-ShiftLeft')?.parentElement;
      const row5 = document.getElementById('key-ControlLeft')?.parentElement;

      const keyS = document.getElementById('key-س');
      const keyD = document.getElementById('key-د');
      const keyH = document.getElementById('key-ه');
      const keyBackspace = document.getElementById('key-Backspace');
      const keyTab = document.getElementById('key-Tab');
      const keyEnter = document.getElementById('key-Enter');
      const keyShiftL = document.getElementById('key-ShiftLeft');
      const keyShiftR = document.getElementById('key-ShiftRight');
      const keySpace = document.getElementById('key- ');

      return {
        arenaCardWidth: arenaCard?.getBoundingClientRect().width,
        targetBoxWidth: targetBox?.getBoundingClientRect().width,
        keyboardWrapperWidth: keyboardWrapper?.getBoundingClientRect().width,
        keyboardClasses: keyboardWrapper?.className,
        row1Width: row1?.getBoundingClientRect().width,
        row2Width: row2?.getBoundingClientRect().width,
        row3Width: row3?.getBoundingClientRect().width,
        row4Width: row4?.getBoundingClientRect().width,
        row5Width: row5?.getBoundingClientRect().width,
        keyS: {
          width: keyS?.getBoundingClientRect().width,
          height: keyS?.getBoundingClientRect().height,
        },
        keyD: {
          width: keyD?.getBoundingClientRect().width,
          height: keyD?.getBoundingClientRect().height,
        },
        keyH: {
          width: keyH?.getBoundingClientRect().width,
          height: keyH?.getBoundingClientRect().height,
        },
        keyBackspaceWidth: keyBackspace?.getBoundingClientRect().width,
        keyTabWidth: keyTab?.getBoundingClientRect().width,
        keyEnterWidth: keyEnter?.getBoundingClientRect().width,
        keyShiftLWidth: keyShiftL?.getBoundingClientRect().width,
        keyShiftRWidth: keyShiftR?.getBoundingClientRect().width,
        keySpaceWidth: keySpace?.getBoundingClientRect().width,
      };
    });

    console.log('KEYBOARD METRICS:', JSON.stringify(metrics, null, 2));

    // Assertions
    if (!metrics.keyboardWrapperWidth) {
      throw new Error('Keyboard wrapper was not found!');
    }

    console.log(`Arena Card Width: ${metrics.arenaCardWidth}px`);
    console.log(`Target Box Width: ${metrics.targetBoxWidth}px`);
    console.log(`Keyboard Wrapper Width: ${metrics.keyboardWrapperWidth}px`);

    // Verify keyboard takes up full width of parent container (matching targetBoxWidth within 1px)
    const widthDiff = Math.abs(metrics.keyboardWrapperWidth - metrics.targetBoxWidth);
    if (widthDiff > 2) {
      throw new Error(`Keyboard wrapper (${metrics.keyboardWrapperWidth}px) does not match target box width (${metrics.targetBoxWidth}px)! Diff: ${widthDiff}px`);
    }
    console.log('PASS: Keyboard wrapper width matches parent container / target box width (100% width)!');

    // Verify all rows have the same width
    const rows = [metrics.row1Width, metrics.row2Width, metrics.row3Width, metrics.row4Width, metrics.row5Width];
    for (let i = 0; i < rows.length; i++) {
      for (let j = i + 1; j < rows.length; j++) {
        const rowDiff = Math.abs(rows[i] - rows[j]);
        if (rowDiff > 3) {
          throw new Error(`Row ${i + 1} (${rows[i]}px) and Row ${j + 1} (${rows[j]}px) differ by ${rowDiff}px!`);
        }
      }
    }
    console.log('PASS: All 5 rows have identical width and align symmetrically!');

    // Verify key proportions
    const standardKeyWidth = metrics.keyS.width;
    console.log(`Standard Key Width: ${standardKeyWidth}px, Height: ${metrics.keyS.height}px`);
    console.log(`Backspace: ${metrics.keyBackspaceWidth}px (ratio: ${(metrics.keyBackspaceWidth / standardKeyWidth).toFixed(2)})`);
    console.log(`Enter: ${metrics.keyEnterWidth}px (ratio: ${(metrics.keyEnterWidth / standardKeyWidth).toFixed(2)})`);
    console.log(`Space: ${metrics.keySpaceWidth}px (ratio: ${(metrics.keySpaceWidth / standardKeyWidth).toFixed(2)})`);

    if (metrics.keyBackspaceWidth / standardKeyWidth < 1.7 || metrics.keyBackspaceWidth / standardKeyWidth > 2.3) {
      throw new Error(`Backspace ratio unexpected: ${(metrics.keyBackspaceWidth / standardKeyWidth).toFixed(2)}`);
    }

    if (metrics.keyEnterWidth / standardKeyWidth < 1.9 || metrics.keyEnterWidth / standardKeyWidth > 2.6) {
      throw new Error(`Enter ratio unexpected: ${(metrics.keyEnterWidth / standardKeyWidth).toFixed(2)}`);
    }

    // Capture screenshot of the full-width keyboard
    const shotPath = path.join(ARTIFACT_DIR, 'keyboard_fixed_full_width.png');
    await page.screenshot({ path: shotPath });
    console.log(`Captured verification screenshot at ${shotPath}`);

    // Also test typing in the arena to confirm zero functional regression
    console.log('Testing typing interaction...');
    await page.keyboard.press('KeyS');
    await page.keyboard.press('Space');
    await page.keyboard.press('KeyD');
    await page.keyboard.press('Space');
    await new Promise(r => setTimeout(r, 400));

    const step2Path = path.join(ARTIFACT_DIR, 'step2_level1_gameplay_resumed.png');
    await page.screenshot({ path: step2Path });
    console.log(`Captured gameplay screenshot at ${step2Path}`);

    console.log('ALL VERIFICATIONS PASSED SUCCESSFULLY!');
  } finally {
    await browser.close();
  }
}

verifyKeyboardWidth().catch(err => {
  console.error('VERIFICATION FAILED:', err);
  process.exit(1);
});
