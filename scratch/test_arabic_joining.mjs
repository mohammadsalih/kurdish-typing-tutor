import puppeteer from 'puppeteer-core';
import path from 'path';

async function testArabicJoining() {
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
      <link href="https://fonts.googleapis.com/css2?family=Vazirmatn:wght@700;800;900&display=swap" rel="stylesheet">
      <style>
        body { font-family: 'Vazirmatn', sans-serif; background: #0f172a; color: white; padding: 40px; font-size: 32px; }
        .row { margin-bottom: 25px; background: #1e293b; padding: 20px; border-radius: 12px; }
        .label { font-size: 14px; color: #94a3b8; margin-bottom: 10px; }
        
        /* Style A: background color on span */
        .styleA .typed { color: #10b981; }
        .styleA .current { color: #38bdf8; background: rgba(56, 189, 248, 0.25); border-radius: 4px; }
        .styleA .remaining { color: #64748b; }
        
        /* Style B: underline on current */
        .styleB .typed { color: #10b981; }
        .styleB .current { color: #38bdf8; text-decoration: underline; text-decoration-thickness: 4px; text-underline-offset: 8px; }
        .styleB .remaining { color: #64748b; }

        /* Style C: words separated by spaces, letters inside word */
        .word-container { display: inline-flex; gap: 12px; flex-wrap: wrap; }
        .word { display: inline; }
      </style>
    </head>
    <body>
      <div class="row">
        <div class="label">Style A: Background on current char</div>
        <div class="styleA">
          <span class="typed">ه</span><span class="current">ی</span><span class="remaining">وا</span>
          <span> </span>
          <span class="remaining">کوردستان</span>
        </div>
      </div>

      <div class="row">
        <div class="label">Style B: Underline on current char</div>
        <div class="styleB">
          <span class="typed">ه</span><span class="current">ی</span><span class="remaining">وا</span>
          <span> </span>
          <span class="remaining">کوردستان</span>
        </div>
      </div>

      <div class="row">
        <div class="label">Initial char 'ه' as current char in "هیوا":</div>
        <div class="styleA">
          <span class="current">ه</span><span class="remaining">یوا</span>
        </div>
      </div>

      <div class="row">
        <div class="label">Isolated 'ه' practice in exercise (rendered as هـ):</div>
        <div>
          <span style="color: #10b981;">گ</span>
          <span> </span>
          <span style="color: #38bdf8; background: rgba(56, 189, 248, 0.25); padding: 0 4px; border-radius: 6px;">هـ</span>
          <span> </span>
          <span style="color: #64748b;">گ</span>
          <span> </span>
          <span style="color: #64748b;">هـ</span>
        </div>
      </div>
    </body>
    </html>
  `);
  await new Promise(r => setTimeout(r, 1500));
  await page.screenshot({ path: path.resolve('public', 'arabic_joining_test.png') });
  await browser.close();
  console.log('Saved arabic_joining_test.png');
}

testArabicJoining().catch(console.error);
