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

  // Clear storage so we are in fresh onboarding mode
  await page.evaluate(() => {
    localStorage.clear();
    document.cookie.split(";").forEach(c => {
      document.cookie = c.replace(/^ +/, "").replace(/=.*/, "=;expires=" + new Date().toUTCString() + ";path=/");
    });
  });
  await page.reload({ waitUntil: 'networkidle0' });

  await page.waitForSelector('#onboarding-prompt-box');

  // Type actual Kurdish characters of "سڵاو كوردستان!"
  const targetChars = Array.from("سڵاو كوردستان!");
  for (const ch of targetChars) {
    await page.evaluate((c) => {
      window.dispatchEvent(new KeyboardEvent('keydown', { key: c, bubbles: true }));
    }, ch);
    await new Promise(r => setTimeout(r, 60));
  }

  // Wait for celebration and transition
  console.log('Waiting for completion transition...');
  await new Promise(r => setTimeout(r, 1400));

  const content = await page.$eval('main', el => el.textContent);
  const isMapActive = content.includes('نەخشەی ئاستەکان') || content.includes('ئاستی');
  console.log('Is map active after typing complete Kurdish string?', isMapActive);

  await page.screenshot({ path: 'public/onboard_success_map.png' });
  console.log('Saved public/onboard_success_map.png');

  await browser.close();
}

main().catch(err => {
  console.error('Error:', err);
  process.exit(1);
});
