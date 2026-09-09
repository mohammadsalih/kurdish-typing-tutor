import puppeteer from 'puppeteer-core';
import path from 'path';

const ARTIFACT_DIR = 'C:\\Users\\moham\\.gemini\\antigravity-ide\\brain\\c3afe10a-57b1-45c4-95b4-cc5d0bbf99ca';

async function inspect() {
  const edgePath = 'C:\\Program Files (x86)\\Microsoft\\Edge\\Application\\msedge.exe';
  const browser = await puppeteer.launch({
    executablePath: edgePath,
    headless: true,
    args: ['--no-sandbox', '--disable-setuid-sandbox', '--disable-gpu'],
  });

  const page = await browser.newPage();
  await page.setViewport({ width: 1280, height: 950 });

  await page.setCookie(
    { name: 'has_onboarded', value: 'true', domain: 'localhost', path: '/' },
    { name: 'guest_unlocked_level', value: '5', domain: 'localhost', path: '/' }
  );

  await page.goto('http://localhost:3000', { waitUntil: 'networkidle2' });
  await new Promise(r => setTimeout(r, 1000));

  await page.waitForSelector('#level-node-1', { timeout: 5000 });
  await page.click('#level-node-1');
  await new Promise(r => setTimeout(r, 800));

  await page.waitForSelector('#milestone-got-it-btn', { timeout: 5000 });
  await page.click('#milestone-got-it-btn');
  await new Promise(r => setTimeout(r, 600));

  await page.screenshot({ path: path.join(ARTIFACT_DIR, 'current_keyboard_before_fix.png') });

  const measurements = await page.evaluate(() => {
    const arena = document.querySelector('.max-w-5xl') || document.querySelector('#typing-arena-wrapper');
    const targetBox = document.querySelector('#typing-arena-wrapper .bg-slate-900') || document.querySelector('.bg-slate-900');
    const keyboard = document.querySelector('#typing-arena-wrapper .shadow-inner');
    const firstRow = keyboard?.querySelector('.flex-col > div:first-child');
    const firstKey = firstRow?.querySelector('div:first-child');
    const spaceKey = document.getElementById('key- ');

    const arenaRect = arena ? arena.getBoundingClientRect() : null;
    const targetRect = targetBox ? targetBox.getBoundingClientRect() : null;
    const kbRect = keyboard ? keyboard.getBoundingClientRect() : null;
    const rowRect = firstRow ? firstRow.getBoundingClientRect() : null;
    const keyRect = firstKey ? firstKey.getBoundingClientRect() : null;
    const spaceRect = spaceKey ? spaceKey.getBoundingClientRect() : null;

    return {
      arenaWidth: arenaRect?.width,
      targetBoxWidth: targetRect?.width,
      keyboardWidth: kbRect?.width,
      keyboardClasses: keyboard?.className,
      firstRowWidth: rowRect?.width,
      firstKeyWidth: keyRect?.width,
      spaceWidth: spaceRect?.width,
      arenaPadding: arena ? window.getComputedStyle(arena).padding : null,
      kbPadding: keyboard ? window.getComputedStyle(keyboard).padding : null,
    };
  });

  console.log('MEASUREMENTS:', JSON.stringify(measurements, null, 2));

  await browser.close();
}

inspect().catch(console.error);
