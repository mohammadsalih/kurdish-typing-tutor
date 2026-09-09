import puppeteer from 'puppeteer-core';
import path from 'path';

async function testSpans() {
  const browser = await puppeteer.launch({
    executablePath: 'C:\\Program Files (x86)\\Microsoft\\Edge\\Application\\msedge.exe',
    headless: true,
    args: ['--no-sandbox']
  });
  const page = await browser.newPage();
  await page.setViewport({ width: 1000, height: 800 });
  await page.setContent(`
    <!DOCTYPE html>
    <html dir="rtl">
    <head>
      <meta charset="utf-8">
      <link href="https://fonts.googleapis.com/css2?family=Vazirmatn:wght@700;900&display=swap" rel="stylesheet">
      <style>
        body { font-family: 'Vazirmatn', sans-serif; background: #0f172a; color: white; padding: 40px; font-size: 36px; }
        .test-row { margin-bottom: 30px; }
        .title { font-size: 16px; color: #94a3b8; margin-bottom: 8px; }
        /* Test 1: current implementation */
        .t1 span { display: inline-block; margin: 0 2px; }
        /* Test 2: inline with color */
        .t2 span { display: inline; }
        /* Test 3: word as unit or inline */
      </style>
    </head>
    <body>
      <div class="test-row">
        <div class="title">1. Raw Text: هیوا</div>
        <div>هیوا</div>
      </div>
      <div class="test-row">
        <div class="title">2. Current App: inline-block per char</div>
        <div class="t1">
          <span style="color:#10b981">ه</span><span style="color:#38bdf8">ی</span><span>و</span><span>ا</span>
        </div>
      </div>
      <div class="test-row">
        <div class="title">3. Display inline per char</div>
        <div class="t2">
          <span style="color:#10b981">ه</span><span style="color:#38bdf8">ی</span><span>و</span><span>ا</span>
        </div>
      </div>
      <div class="test-row">
        <div class="title">4. Isolated 'ه' with Tatweel (هـ) in prompt</div>
        <div>هـ</div>
      </div>
    </body>
    </html>
  `);
  await new Promise(r => setTimeout(r, 1500));
  await page.screenshot({ path: path.resolve('public', 'span_test.png') });
  await browser.close();
  console.log('Saved span_test.png');
}

testSpans().catch(console.error);
