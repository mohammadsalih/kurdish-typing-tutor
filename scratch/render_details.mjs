import puppeteer from 'puppeteer-core';
import path from 'path';

async function main() {
  const browser = await puppeteer.launch({
    executablePath: 'C:\\Program Files (x86)\\Microsoft\\Edge\\Application\\msedge.exe',
    headless: true,
    args: ['--no-sandbox']
  });
  const page = await browser.newPage();
  await page.setViewport({ width: 1100, height: 900 });
  await page.setContent(`
    <!DOCTYPE html>
    <html dir="rtl">
    <head>
      <meta charset="utf-8">
      <link href="https://fonts.googleapis.com/css2?family=Vazirmatn:wght@400;700;900&amp;display=swap" rel="stylesheet">
      <style>
        body { font-family: 'Vazirmatn', sans-serif; background: #0f172a; color: white; padding: 40px; }
        .grid { display: grid; grid-template-columns: 1fr 1fr 1fr; gap: 20px; }
        .card { background: #1e293b; border-radius: 16px; padding: 20px; text-align: center; border: 1px solid #334155; }
        .glyph { font-size: 80px; font-weight: 900; color: #10b981; line-height: 1.2; }
        .title { font-size: 16px; font-weight: 700; color: #94a3b8; margin-top: 10px; }
        .desc { font-size: 13px; color: #64748b; }
      </style>
    </head>
    <body>
      <div class="grid">
        <div class="card"><div class="glyph">ە</div><div class="title">1. Kurdish Ae (E key)</div><div class="desc">U+06D5 (Single droplet loop)</div></div>
        <div class="card"><div class="glyph">ه</div><div class="title">2. Arabic Isolated Heh</div><div class="desc">U+0647 (Single droplet loop)</div></div>
        <div class="card"><div class="glyph">هـ</div><div class="title">3. Heh + Tatweel</div><div class="desc">U+0647 + U+0640 (Initial form)</div></div>
        <div class="card"><div class="glyph">ھ</div><div class="title">4. Do-chashmee Heh</div><div class="desc">U+06BE (Kurdish Heh, 2 loops)</div></div>
        <div class="card"><div class="glyph">ھـ</div><div class="title">5. Do-chashmee + Tatweel</div><div class="desc">U+06BE + U+0640</div></div>
        <div class="card"><div class="glyph">ـهـ</div><div class="title">6. Medial Heh</div><div class="desc">U+0640 + U+0647 + U+0640</div></div>
      </div>
    </body>
    </html>
  `);
  await new Promise(r => setTimeout(r, 2000));
  await page.screenshot({ path: path.resolve('public', 'glyph_details.png') });
  await browser.close();
  console.log('Saved public/glyph_details.png');
}

main().catch(console.error);
