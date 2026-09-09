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

  // Clear storage so we are in onboarding mode
  await page.evaluate(() => {
    localStorage.clear();
  });
  await page.reload({ waitUntil: 'networkidle0' });

  // Test combinations dynamically in the page
  const configs = [
    { name: 'original', classes: 'floating-glow text-4xl md:text-5xl lg:text-6xl font-black text-transparent bg-clip-text bg-gradient-to-r from-emerald-600 via-teal-600 to-emerald-700 text-center tracking-tight mb-2 drop-shadow-sm' },
    { name: 'relaxed_py2', classes: 'floating-glow will-change-transform text-4xl md:text-5xl lg:text-6xl font-black text-transparent bg-clip-text bg-gradient-to-r from-emerald-600 via-teal-600 to-emerald-700 text-center py-2 leading-relaxed mb-2 drop-shadow-sm' },
    { name: 'relaxed_py4', classes: 'floating-glow will-change-transform text-4xl md:text-5xl lg:text-6xl font-black text-transparent bg-clip-text bg-gradient-to-r from-emerald-600 via-teal-600 to-emerald-700 text-center py-4 leading-relaxed mb-2 drop-shadow-sm' },
    { name: 'loose_py4', classes: 'floating-glow will-change-transform text-4xl md:text-5xl lg:text-6xl font-black text-transparent bg-clip-text bg-gradient-to-r from-emerald-600 via-teal-600 to-emerald-700 text-center py-4 leading-loose mb-2 drop-shadow-sm' },
  ];

  for (const cfg of configs) {
    await page.evaluate((cls) => {
      const h1 = document.querySelector('h1');
      if (h1) {
        h1.className = cls;
        // Also remove framer motion animation if needed
        h1.style.transform = '';
      }
    }, cfg.classes);

    await new Promise(r => setTimeout(r, 200));

    const h1Element = await page.$('h1');
    if (h1Element) {
      await h1Element.screenshot({ path: `public/headline_${cfg.name}.png` });
      console.log(`Saved screenshot for ${cfg.name}`);
    }
  }

  await browser.close();
}

main().catch(err => {
  console.error('Error:', err);
  process.exit(1);
});
