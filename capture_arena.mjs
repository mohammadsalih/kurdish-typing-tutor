import puppeteer from 'puppeteer-core';
import path from 'path';

async function main() {
  const edgePath = 'C:\\Program Files (x86)\\Microsoft\\Edge\\Application\\msedge.exe';
  const artifactDir = 'C:\\Users\\moham\\.gemini\\antigravity-ide\\brain\\0efe5f04-2236-4c48-8da7-cb362803a518';

  const browser = await puppeteer.launch({
    executablePath: edgePath,
    headless: true,
    args: ['--no-sandbox', '--disable-setuid-sandbox', '--disable-gpu'],
  });

  const page = await browser.newPage();
  await page.setViewport({ width: 1440, height: 960 });

  await page.goto('http://localhost:3000', { waitUntil: 'networkidle0' });
  await page.click('#open-map-btn');
  await page.waitForSelector('#level-node-1');
  await page.click('#level-node-1');
  await page.waitForSelector('.font-mono');

  // Type a few keys to demonstrate in-progress state with green highlights
  await page.keyboard.sendCharacter('س');
  await page.keyboard.press('Space');
  await page.keyboard.sendCharacter('د');
  await page.keyboard.press('Space');
  await new Promise(r => setTimeout(r, 400));

  await page.screenshot({ path: path.join(artifactDir, 'typing_arena.png') });
  await page.screenshot({ path: path.resolve('public', 'typing_arena.png') });
  console.log('Typing Arena screenshot captured successfully!');

  await browser.close();
}

main().catch(err => {
  console.error(err);
  process.exit(1);
});
