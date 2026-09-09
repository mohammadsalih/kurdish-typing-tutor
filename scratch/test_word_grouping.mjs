import puppeteer from 'puppeteer-core';
import path from 'path';

async function testWordGrouping() {
  const browser = await puppeteer.launch({
    executablePath: 'C:\\Program Files (x86)\\Microsoft\\Edge\\Application\\msedge.exe',
    headless: true,
    args: ['--no-sandbox']
  });
  const page = await browser.newPage();
  await page.setViewport({ width: 1100, height: 900 });

  // Test word-level grouping vs character-level styling
  const html = `
    <!DOCTYPE html>
    <html dir="rtl">
    <head>
      <meta charset="utf-8">
      <link href="https://fonts.googleapis.com/css2?family=Vazirmatn:wght@700;800;900&display=swap" rel="stylesheet">
      <style>
        body { font-family: 'Vazirmatn', sans-serif; background: #f8fafc; color: #1e293b; padding: 40px; }
        .arena-box {
          background: white;
          border-radius: 24px;
          padding: 30px;
          border: 2px solid #e2e8f0;
          box-shadow: 0 10px 25px rgba(0,0,0,0.05);
          max-width: 800px;
          margin: 0 auto 30px;
        }
        .text-display {
          display: flex;
          flex-wrap: wrap;
          align-items: center;
          justify-content: center;
          gap: 16px 12px;
          font-size: 32px;
          font-weight: 900;
          line-height: 1.6;
        }
        .word {
          display: inline-flex;
          align-items: center;
        }
        .char {
          display: inline;
          transition: color 0.1s;
        }
        .char.typed { color: #059669; }
        .char.current {
          color: #0f172a;
          border-bottom: 4px solid #10b981;
        }
        .char.remaining { color: #94a3b8; }
        .space-char {
          display: inline-block;
          margin: 0 4px;
          font-size: 20px;
          color: #cbd5e1;
        }
        .space-char.current {
          color: #10b981;
          font-weight: 900;
        }
      </style>
    </head>
    <body>
      <div class="arena-box">
        <div class="text-display">
          <!-- Word 1: گ (typed) -->
          <span class="word"><span class="char typed">گ</span></span>
          <span class="space-char">␣</span>

          <!-- Word 2: هـ (typed) -->
          <span class="word"><span class="char typed">هـ</span></span>
          <span class="space-char">␣</span>

          <!-- Word 3: هیوا (Current word, 'ه' is current letter) -->
          <span class="word" style="background: rgba(16, 185, 129, 0.08); padding: 0 6px; border-radius: 8px;">
            <span class="char current">ه</span><span class="char remaining">ی</span><span class="char remaining">و</span><span class="char remaining">ا</span>
          </span>
          <span class="space-char">␣</span>

          <!-- Word 4: هەنگاو (Remaining word) -->
          <span class="word">
            <span class="char remaining">ه</span><span class="char remaining">ە</span><span class="char remaining">ن</span><span class="char remaining">گ</span><span class="char remaining">ا</span><span class="char remaining">و</span>
          </span>
          <span class="space-char">␣</span>

          <!-- Word 5: گە -->
          <span class="word">
            <span class="char remaining">گ</span><span class="char remaining">ە</span>
          </span>
        </div>
      </div>
    </body>
    </html>
  `;

  await page.setContent(html);
  await new Promise(r => setTimeout(r, 1500));
  await page.screenshot({ path: path.resolve('public', 'word_grouping_test.png') });
  await browser.close();
  console.log('Saved word_grouping_test.png');
}

testWordGrouping().catch(console.error);
