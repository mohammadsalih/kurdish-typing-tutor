import puppeteer from 'puppeteer-core';
import path from 'path';

async function testGlyphDesigns() {
  const browser = await puppeteer.launch({
    executablePath: 'C:\\Program Files (x86)\\Microsoft\\Edge\\Application\\msedge.exe',
    headless: true,
    args: ['--no-sandbox']
  });
  const page = await browser.newPage();
  await page.setViewport({ width: 1200, height: 1000 });

  // We test multiple geometric SVG glyph constructions for Initial Heh:
  // Distinct features required:
  // 1. Curved top tail extending upwards/rightwards
  // 2. Internal voids (the classical two-eye / outer envelope + inner loop void structure)
  // 3. Flat baseline connecting stroke to the left
  // 4. Stroke thickness and weight matching Vazirmatn font-black 900
  // 5. Uses fill="currentColor" so it works identically in white, slate, and glowing active states

  const html = `
    <!DOCTYPE html>
    <html dir="rtl">
    <head>
      <meta charset="utf-8">
      <link href="https://fonts.googleapis.com/css2?family=Vazirmatn:wght@700;800;900&display=swap" rel="stylesheet">
      <style>
        body { font-family: 'Vazirmatn', sans-serif; background: #0f172a; color: white; padding: 30px; }
        .grid { display: flex; flex-direction: column; gap: 24px; }
        .row { display: flex; align-items: center; gap: 16px; background: #1e293b; padding: 16px 20px; border-radius: 16px; }
        .label { width: 300px; font-size: 15px; font-weight: 700; color: #94a3b8; }
        .keys { display: flex; gap: 12px; align-items: center; }
        
        .keycap {
          width: 46px;
          height: 46px;
          border-radius: 12px;
          display: flex;
          align-items: center;
          justify-content: center;
          font-weight: 900;
          font-size: 18px;
          background: #ffffff;
          box-shadow: 0 4px 0 #cbd5e1, 0 6px 12px rgba(0,0,0,0.15);
          color: #1e293b;
          border: 1px solid #e2e8f0;
        }
        .keycap-active {
          background: linear-gradient(180deg, #10b981 0%, #059669 100%) !important;
          color: #ffffff !important;
          box-shadow: 0 4px 0 #047857, 0 0 20px rgba(16, 185, 129, 0.7) !important;
          border-color: #34d399 !important;
        }
      </style>
    </head>
    <body>
      <div class="grid">
        <!-- Baseline reference: Real surrounding keys from Keyboard row 3 -->
        <div class="row">
          <div class="label">Surrounding row keys (د, گ, [H], ژ, ک) & 'E' key (ە)</div>
          <div class="keys">
            <div class="keycap">ە</div>
            <div class="keycap">د</div>
            <div class="keycap">گ</div>
            <div class="keycap keycap-active">گ</div>
            <div class="keycap">ژ</div>
            <div class="keycap">ک</div>
          </div>
        </div>

        <!-- Variation 1: Native Vazirmatn هـ (U+0647 + Tatweel) -->
        <div class="row">
          <div class="label">1. Native Vazirmatn هـ</div>
          <div class="keys">
            <div class="keycap">هـ</div>
            <div class="keycap keycap-active">هـ</div>
          </div>
        </div>

        <!-- Variation 2: Native Vazirmatn ھ (U+06BE) -->
        <div class="row">
          <div class="label">2. Native Vazirmatn ھ (Do-chashmee)</div>
          <div class="keys">
            <div class="keycap">ھ</div>
            <div class="keycap keycap-active">ھ</div>
          </div>
        </div>

        <!-- Variation 3: Native Vazirmatn ھـ (U+06BE + Tatweel) -->
        <div class="row">
          <div class="label">3. Native Vazirmatn ھـ</div>
          <div class="keys">
            <div class="keycap">ھـ</div>
            <div class="keycap keycap-active">ھـ</div>
          </div>
        </div>

        <!-- Variation 4: Precision Geometric SVG 1 (Classical initial heh with top curved tail, dual internal voids, and connecting baseline) -->
        <div class="row">
          <div class="label">4. Geometric SVG A (Curved top tail + dual internal voids + baseline)</div>
          <div class="keys">
            <div class="keycap">
              <svg viewBox="0 0 32 32" width="26" height="26" fill="currentColor">
                <!-- Smooth continuous path matching Vazirmatn stroke weight:
                     Top tail curving up-right, outer loop going down to baseline, 
                     inner loops creating dual voids, connecting baseline to the left -->
                <path d="M 28 20 C 28 17 25.5 13 22.5 10 C 21 8.5 19.5 7.5 18 7 C 18.8 8.8 19 10.5 19 12 C 19 13 18.6 14 18 15 C 19.8 15.5 21.2 17 21.2 19 C 21.2 21.5 19 23 16 23 C 13.5 23 11.5 21.5 11.5 19 C 11.5 17 13 15.5 15 15 C 13.8 14 13.2 12.8 13.2 11.5 C 13.2 9 15 7 18 7 C 14 7 11 9.5 9 13 C 7.5 15.5 7 18 7 21 L 4 21 L 4 24 L 28 24 L 28 20 Z" />
              </svg>
            </div>
            <div class="keycap keycap-active">
              <svg viewBox="0 0 32 32" width="26" height="26" fill="currentColor">
                <path d="M 28 20 C 28 17 25.5 13 22.5 10 C 21 8.5 19.5 7.5 18 7 C 18.8 8.8 19 10.5 19 12 C 19 13 18.6 14 18 15 C 19.8 15.5 21.2 17 21.2 19 C 21.2 21.5 19 23 16 23 C 13.5 23 11.5 21.5 11.5 19 C 11.5 17 13 15.5 15 15 C 13.8 14 13.2 12.8 13.2 11.5 C 13.2 9 15 7 18 7 C 14 7 11 9.5 9 13 C 7.5 15.5 7 18 7 21 L 4 21 L 4 24 L 28 24 L 28 20 Z" />
              </svg>
            </div>
          </div>
        </div>

        <!-- Variation 5: Precision Geometric SVG B (Exact structural initial heh with curved top tail, outer teardrop, inner loop, baseline) -->
        <div class="row">
          <div class="label">5. Geometric SVG B (Vazirmatn-tuned Initial Heh)</div>
          <div class="keys">
            <div class="keycap">
              <svg viewBox="0 0 32 32" width="24" height="24" fill="currentColor" style="transform: scaleX(-1);">
                <!-- In RTL or LTR coordinate:
                     Tail curves top-left, descends around right, baseline extends left -->
                <path fill-rule="evenodd" clip-rule="evenodd" d="M 4 22 L 4 19 C 7 19 8.5 17.5 9.5 15 C 8.5 13.8 8 12.2 8 10.5 C 8 7 11 4.5 15 4.5 C 16.2 4.5 17.5 5 18.8 6 C 17.8 7.5 17.2 9.2 17.2 11 C 17.2 12.5 17.8 13.8 18.8 14.8 C 20.2 15.5 21.5 17 21.5 19 L 28 19 L 28 22 L 4 22 Z M 13.8 11 C 13.8 13 15.2 14.5 17 14.5 C 18.8 14.5 20.2 13 20.2 11 C 20.2 9 18.8 7.5 17 7.5 C 15.2 7.5 13.8 9 13.8 11 Z" />
              </svg>
            </div>
            <div class="keycap keycap-active">
              <svg viewBox="0 0 32 32" width="24" height="24" fill="currentColor" style="transform: scaleX(-1);">
                <path fill-rule="evenodd" clip-rule="evenodd" d="M 4 22 L 4 19 C 7 19 8.5 17.5 9.5 15 C 8.5 13.8 8 12.2 8 10.5 C 8 7 11 4.5 15 4.5 C 16.2 4.5 17.5 5 18.8 6 C 17.8 7.5 17.2 9.2 17.2 11 C 17.2 12.5 17.8 13.8 18.8 14.8 C 20.2 15.5 21.5 17 21.5 19 L 28 19 L 28 22 L 4 22 Z M 13.8 11 C 13.8 13 15.2 14.5 17 14.5 C 18.8 14.5 20.2 13 20.2 11 C 20.2 9 18.8 7.5 17 7.5 C 15.2 7.5 13.8 9 13.8 11 Z" />
              </svg>
            </div>
          </div>
        </div>

        <!-- Variation 6: Vazirmatn Native Initial Heh styled with font-weight and letter spacing -->
        <div class="row">
          <div class="label">6. Vazirmatn Initial Heh (هـ) with optical baseline tuning</div>
          <div class="keys">
            <div class="keycap" style="font-size: 21px; line-height: 1;">هـ</div>
            <div class="keycap keycap-active" style="font-size: 21px; line-height: 1;">هـ</div>
          </div>
        </div>

      </div>
    </body>
    </html>
  `;

  await page.setContent(html);
  await new Promise(r => setTimeout(r, 1500));
  await page.screenshot({ path: path.resolve('public', 'glyph_designs.png') });
  await browser.close();
  console.log('Saved public/glyph_designs.png');
}

testGlyphDesigns().catch(console.error);
