import puppeteer from 'puppeteer-core';
import path from 'path';

async function test() {
  const browser = await puppeteer.launch({
    executablePath: 'C:\\Program Files (x86)\\Microsoft\\Edge\\Application\\msedge.exe',
    headless: true,
    args: ['--no-sandbox'],
  });
  const page = await browser.newPage();
  const html = `
    <!DOCTYPE html>
    <html dir="rtl">
    <head>
      <meta charset="utf-8">
      <link href="https://fonts.googleapis.com/css2?family=Vazirmatn:wght@500;600;700;800;900&display=swap" rel="stylesheet">
      <style>
        body { font-family: 'Vazirmatn', sans-serif; background: #f8fafc; padding: 30px; }
        .row { display: flex; flex-direction: column; gap: 15px; font-size: 28px; font-weight: 800; }
        .box { padding: 12px 20px; background: white; border-radius: 12px; box-shadow: 0 4px 6px rgba(0,0,0,0.08); width: fit-content; }
        .char { font-size: 38px; color: #059669; margin: 0 10px; }
      </style>
    </head>
    <body>
      <div class="row">
        <div class="box">1. Isolated U+0647 (Standard Arabic Heh): <span class="char">ه</span></div>
        <div class="box">2. Kurdish Ae U+06D5 ('E' key): <span class="char">ە</span></div>
        <div class="box">3. Heh + Tatweel U+0647+0640: <span class="char">هـ</span></div>
        <div class="box">4. Initial Presentation Form U+FEEB: <span class="char">ﻫ</span></div>
        <div class="box">5. Doachashmee U+06BE: <span class="char">ھ</span></div>
        <div class="box">6. Doachashmee + Tatweel U+06BE+0640: <span class="char">ھـ</span></div>
        <div class="box">7. Word with 0647: <span class="char">هیوا</span></div>
        <div class="box">8. Word with 06BE: <span class="char">ھیوا</span></div>
      </div>
    </body>
    </html>
  `;
  await page.setContent(html);
  await new Promise(r => setTimeout(r, 2000));
  await page.screenshot({ path: path.resolve('public', 'font_test.png') });
  await browser.close();
  console.log('Saved font_test.png');
}

test().catch(console.error);
