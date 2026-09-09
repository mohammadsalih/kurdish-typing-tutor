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

  // Clear storage so we are in onboarding mode
  await page.evaluate(() => {
    localStorage.clear();
  });
  await page.reload({ waitUntil: 'networkidle0' });

  // Wait for h1 to be rendered
  await page.waitForSelector('h1');

  // Inspect the element
  const info = await page.evaluate(() => {
    const h1 = document.querySelector('h1');
    const parent = h1 ? h1.parentElement : null;
    const style = window.getComputedStyle(h1);
    const parentStyle = parent ? window.getComputedStyle(parent) : null;
    const rect = h1.getBoundingClientRect();

    return {
      text: h1.textContent.trim(),
      classes: h1.className,
      lineHeight: style.lineHeight,
      fontSize: style.fontSize,
      paddingTop: style.paddingTop,
      paddingBottom: style.paddingBottom,
      willChange: style.willChange,
      animation: style.animation,
      transform: style.transform,
      rect: { width: rect.width, height: rect.height, top: rect.top, bottom: rect.bottom },
      parentClasses: parent ? parent.className : null,
      parentPadding: parentStyle ? `${parentStyle.paddingTop} ${parentStyle.paddingBottom}` : null,
      parentOverflow: parentStyle ? parentStyle.overflow : null,
    };
  });

  console.log('Final Headline Inspection:', JSON.stringify(info, null, 2));

  // Take screenshot of headline and full hero
  const h1Element = await page.$('h1');
  if (h1Element) {
    await h1Element.screenshot({ path: 'public/headline_fixed.png' });
    console.log('Saved public/headline_fixed.png');
  }

  // Also take screenshot of the parent card
  const heroCard = await page.$('.backdrop-blur-2xl');
  if (heroCard) {
    await heroCard.screenshot({ path: 'public/hero_fixed.png' });
    console.log('Saved public/hero_fixed.png');
  }

  console.log('Errors encountered:', errors.length);
  await browser.close();
}

main().catch(err => {
  console.error('Error:', err);
  process.exit(1);
});
