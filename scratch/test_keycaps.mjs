import puppeteer from 'puppeteer-core';
import path from 'path';

async function testKeycaps() {
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
      <link href="https://fonts.googleapis.com/css2?family=Vazirmatn:wght@700;800;900&display=swap" rel="stylesheet">
      <style>
        body { font-family: 'Vazirmatn', sans-serif; background: #f1f5f9; padding: 40px; display: flex; flex-direction: column; gap: 30px; }
        .row { display: flex; gap: 20px; align-items: center; }
        .label { font-size: 14px; font-weight: 700; color: #64748b; width: 220px; }
        .keycap {
          width: 48px;
          height: 48px;
          border-radius: 12px;
          display: flex;
          align-items: center;
          justify-content: center;
          font-weight: 900;
          font-size: 20px;
          background: linear-gradient(180deg, #ffffff 0%, #f1f5f9 100%);
          box-shadow: 0 4px 0 #cbd5e1, 0 6px 12px rgba(0, 0, 0, 0.06);
          color: #1e293b;
        }
        .keycap-active {
          background: linear-gradient(180deg, #58cc02 0%, #46a302 100%) !important;
          color: #ffffff !important;
          box-shadow: 0 4px 0 #327a00, 0 0 22px rgba(88, 204, 2, 0.7) !important;
        }
      </style>
    </head>
    <body>
      <div class="row">
        <div class="label">Reference: 'E' keycap (ە)</div>
        <div class="keycap">ە</div>
        <div class="keycap keycap-active">ە</div>
      </div>

      <div class="row">
        <div class="label">A: Standard ه (Old - identical to ە)</div>
        <div class="keycap">ه</div>
        <div class="keycap keycap-active">ه</div>
      </div>

      <div class="row">
        <div class="label">B: Vazirmatn هـ (U+0647 + Tatweel)</div>
        <div class="keycap">هـ</div>
        <div class="keycap keycap-active">هـ</div>
      </div>

      <div class="row">
        <div class="label">C: Vazirmatn ھ (Do-chashmee U+06BE)</div>
        <div class="keycap">ھ</div>
        <div class="keycap keycap-active">ھ</div>
      </div>

      <div class="row">
        <div class="label">D: Vazirmatn ھـ (Do-chashmee + Tatweel)</div>
        <div class="keycap">ھـ</div>
        <div class="keycap keycap-active">ھـ</div>
      </div>

      <div class="row">
        <div class="label">E: Custom SVG (Curved top tail + dual internal voids + baseline stroke)</div>
        <div class="keycap">
          <svg viewBox="0 0 24 24" width="22" height="22" fill="currentColor">
            <!-- Classical initial heh with top curved hook/tail, outer loop, internal teardrop loop, and connecting baseline -->
            <path d="M 19 16 C 19 16 16.5 16 14.5 16 C 12.2 16 10.8 14.8 10.8 13 C 10.8 11.2 12 10 13.8 10 C 15.8 10 17.2 11.4 17.2 13.2 C 17.2 14.5 16.4 15.4 15 15.8 C 16.2 15.8 17.5 15.9 19 16 Z M 5 16 L 19 16 C 19 16 19 15.5 19 14.5 C 19 11 16.5 7.5 12.8 7.5 C 11.2 7.5 9.8 8.2 9 9.2 C 8.8 8 9.2 6.5 10.2 5.2 C 10.8 4.5 11.6 4 12.5 3.8 C 11 3.5 9.2 4.2 8.2 5.5 C 7 7 6.8 9.2 7 11.5 C 7.1 13.2 7.5 16 5 16 Z" />
          </svg>
        </div>
        <div class="keycap keycap-active">
          <svg viewBox="0 0 24 24" width="22" height="22" fill="currentColor">
            <path d="M 19 16 C 19 16 16.5 16 14.5 16 C 12.2 16 10.8 14.8 10.8 13 C 10.8 11.2 12 10 13.8 10 C 15.8 10 17.2 11.4 17.2 13.2 C 17.2 14.5 16.4 15.4 15 15.8 C 16.2 15.8 17.5 15.9 19 16 Z M 5 16 L 19 16 C 19 16 19 15.5 19 14.5 C 19 11 16.5 7.5 12.8 7.5 C 11.2 7.5 9.8 8.2 9 9.2 C 8.8 8 9.2 6.5 10.2 5.2 C 10.8 4.5 11.6 4 12.5 3.8 C 11 3.5 9.2 4.2 8.2 5.5 C 7 7 6.8 9.2 7 11.5 C 7.1 13.2 7.5 16 5 16 Z" />
          </svg>
        </div>
      </div>
    </body>
    </html>
  `;
  await page.setContent(html);
  await new Promise(r => setTimeout(r, 1500));
  await page.screenshot({ path: path.resolve('public', 'keycap_comparison.png') });
  await browser.close();
  console.log('Saved keycap_comparison.png');
}

testKeycaps().catch(console.error);
