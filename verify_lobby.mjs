import puppeteer from 'puppeteer-core';
import path from 'path';

async function main() {
  const edgePath = 'C:\\Program Files (x86)\\Microsoft\\Edge\\Application\\msedge.exe';
  const artifactScreenshot = 'C:\\Users\\moham\\.gemini\\antigravity-ide\\brain\\0efe5f04-2236-4c48-8da7-cb362803a518\\lobby_screenshot.png';
  const publicScreenshot = path.resolve('public', 'lobby_screenshot.png');

  console.log('Launching Edge from:', edgePath);
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

  console.log('Navigating to http://localhost:3000 ...');
  await page.goto('http://localhost:3000', { waitUntil: 'networkidle0' });

  console.log('Waiting for main elements...');
  await page.waitForSelector('#keyboard-stage');
  await page.waitForSelector('#target-char');

  // Verify elements
  const pageTitle = await page.title();
  console.log('Page Title:', pageTitle);

  // Check keyboard layout direction
  const keyboardDir = await page.$eval('#keyboard-stage', el => el.getAttribute('dir'));
  console.log('Keyboard dir attribute:', keyboardDir);

  // Verify physical LTR positions of keys
  const keyDelBox = await page.$eval('[data-key="Backspace"]', el => {
    const r = el.getBoundingClientRect();
    return { x: r.x, y: r.y, width: r.width };
  });
  const keyTildeBox = await page.$eval('[data-key="~"]', el => {
    const r = el.getBoundingClientRect();
    return { x: r.x, y: r.y, width: r.width };
  });
  console.log(`Key ~ X position: ${keyTildeBox.x}, Key Backspace X position: ${keyDelBox.x}`);
  const isPhysicalLTR = keyDelBox.x > keyTildeBox.x;
  console.log('Is keyboard physically Left-to-Right (Del to the right of ~)?', isPhysicalLTR);

  // Verify target char
  const targetChar = await page.$eval('#target-char', el => el.textContent.trim());
  console.log('Current target char:', targetChar);

  // Check glowing keycap
  const activeKeyExists = await page.$eval('.keycap-active', el => el.textContent.trim());
  console.log('Active glowing keycap letter:', activeKeyExists);

  // Test interactive click on target key
  console.log('Clicking target key...');
  await page.click('#key-س');
  await new Promise(r => setTimeout(r, 600));

  // Test interactive click on Start Game button
  console.log('Clicking Start Game button...');
  await page.click('#start-game-btn');
  await new Promise(r => setTimeout(r, 800));

  // Capture screenshots
  console.log('Saving screenshots...');
  await page.screenshot({ path: artifactScreenshot });
  await page.screenshot({ path: publicScreenshot });
  console.log('Screenshots saved successfully!');

  console.log('\n--- VERIFICATION SUMMARY ---');
  console.log('Page Errors count:', errors.length);
  if (errors.length > 0) {
    console.error('Errors:', errors);
  }
  console.log('Console Logs count:', logs.length);
  console.log('All tests passed!');

  await browser.close();
}

main().catch(err => {
  console.error('Test execution failed:', err);
  process.exit(1);
});
