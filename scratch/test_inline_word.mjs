import puppeteer from 'puppeteer-core';
import path from 'path';

async function testInlineWord() {
  const browser = await puppeteer.launch({
    executablePath: 'C:\\Program Files (x86)\\Microsoft\\Edge\\Application\\msedge.exe',
    headless: true,
    args: ['--no-sandbox']
  });
  const page = await browser.newPage();
  await page.setViewport({ width: 900, height: 600 });

  const html = `
    <!DOCTYPE html>
    <html dir="rtl">
    <head>
      <meta charset="utf-8">
      <link href="https://fonts.googleapis.com/css2?family=Vazirmatn:wght@700;800;900&display=swap" rel="stylesheet">
      <style>
        body { font-family: 'Vazirmatn', sans-serif; background: #ffffff; padding: 40px; font-size: 36px; font-weight: 900; }
        .word-inline { display: inline-block; margin: 0 8px; }
        .word-inline span { display: inline; }
        .typed { color: #059669; }
        .current { color: #0284c7; text-decoration: underline; text-decoration-color: #0284c7; text-underline-offset: 8px; }
        .remaining { color: #94a3b8; }
      </style>
    </head>
    <body>
      <div class="word-inline">
        <span class="current">ه</span><span class="remaining">ی</span><span class="remaining">و</span><span class="remaining">ا</span>
      </div>
      <div class="word-inline">
        <span class="typed">ه</span><span class="current">ی</span><span class="remaining">و</span><span class="remaining">ا</span>
      </div>
      <div class="word-inline">
        <span class="typed">ه</span><span class="typed">ی</span><span class="current">و</span><span class="remaining">ا</span>
      </div>
      <div class="word-inline">
        <span class="typed">ه</span><span class="typed">ی</span><span class="typed">و</span><span class="current">ا</span>
      </div>
      <div class="word-inline">
        <span class="typed">ه</span><span class="typed">ی</span><span class="typed">و</span><span class="typed">ا</span>
      </div>
    </body>
    </html>
  `;

  await page.setContent(html);
  await new Promise(r => setTimeout(r, 1500));
  await page.screenshot({ path: path.resolve('public', 'inline_word_test.png') });
  await browser.close();
  console.log('Saved inline_word_test.png');
}

testInlineWord().catch(console.error);
