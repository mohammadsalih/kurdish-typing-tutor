import puppeteer from 'puppeteer-core';
import path from 'path';

async function testArenaUI() {
  const browser = await puppeteer.launch({
    executablePath: 'C:\\Program Files (x86)\\Microsoft\\Edge\\Application\\msedge.exe',
    headless: true,
    args: ['--no-sandbox']
  });
  const page = await browser.newPage();
  await page.setViewport({ width: 1200, height: 900 });

  // Let's test the complete visual mockup of TypingArena with both isolated 'هـ' and connected 'هیوا'
  const html = `
    <!DOCTYPE html>
    <html dir="rtl">
    <head>
      <meta charset="utf-8">
      <link href="https://fonts.googleapis.com/css2?family=Vazirmatn:wght@500;600;700;800;900&display=swap" rel="stylesheet">
      <script src="https://cdn.tailwindcss.com"></script>
      <script>
        tailwind.config = {
          theme: {
            extend: {
              fontFamily: {
                sans: ['Vazirmatn', 'sans-serif'],
              }
            }
          }
        }
      </script>
      <style>
        body { font-family: 'Vazirmatn', sans-serif; }
        .keycap-3d {
          box-shadow: 0 4px 0 #cbd5e1, 0 6px 14px rgba(0, 0, 0, 0.08);
          border: 1px solid #e2e8f0;
        }
        .keycap-active {
          background: linear-gradient(180deg, #10b981 0%, #059669 100%) !important;
          color: #ffffff !important;
          box-shadow: 0 4px 0 #047857, 0 0 22px rgba(16, 185, 129, 0.75) !important;
          border-color: #34d399 !important;
        }
      </style>
    </head>
    <body class="bg-slate-100 p-8 flex flex-col items-center">
      <div class="w-full max-w-4xl bg-white/90 backdrop-blur-xl rounded-[32px] border-2 border-white shadow-xl p-8">
        
        <!-- Target text container -->
        <div id="target-text-container" class="w-full bg-slate-50/95 rounded-3xl p-8 border-2 border-slate-200/80 shadow-inner mb-6 text-center select-none" dir="rtl">
          
          <div class="flex flex-wrap items-center justify-center gap-x-4 gap-y-3 text-3xl font-black">
            <!-- Word 1: گ (typed) -->
            <div class="inline-block">
              <span class="text-emerald-600">گ</span>
            </div>
            <span class="text-slate-300 text-xl font-normal">␣</span>

            <!-- Word 2: هـ (isolated heh, typed) -->
            <div class="inline-block">
              <span class="text-emerald-600">هـ</span>
            </div>
            <span class="text-slate-300 text-xl font-normal">␣</span>

            <!-- Word 3: هیوا (Current word, 'ه' is current letter) -->
            <div class="inline-block bg-emerald-50 px-2 py-0.5 rounded-xl border border-emerald-200/60">
              <span class="text-slate-900 underline decoration-emerald-500 decoration-4 underline-offset-8">ه</span><span class="text-slate-400">ی</span><span class="text-slate-400">و</span><span class="text-slate-400">ا</span>
            </div>
            <span class="text-slate-300 text-xl font-normal">␣</span>

            <!-- Word 4: گە (remaining word with final 'e' ە) -->
            <div class="inline-block">
              <span class="text-slate-400">گ</span><span class="text-slate-400">ە</span>
            </div>
          </div>

          <!-- Typing Prompt Tooltip -->
          <div class="mt-6 text-xs font-bold text-slate-500 flex items-center justify-center gap-2">
            <span class="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse"></span>
            <span>
              پیتە داواکراوەکە دابگرە:{" "}
              <b id="target-char-display" class="text-emerald-700 text-base font-black px-3 py-1 bg-white rounded-lg border border-emerald-200 shadow-sm">
                هـ
              </b>
            </span>
          </div>
        </div>

        <!-- Row 2 & Row 3 Mockup for visual comparison -->
        <div class="flex flex-col gap-2 items-center bg-slate-100 p-4 rounded-2xl border border-slate-200">
          
          <!-- Row 2 with 'E' keycap (ە) -->
          <div class="flex gap-1.5 justify-center">
            <div class="w-10 h-10 rounded-xl keycap-3d bg-white flex items-center justify-center font-black text-slate-800 text-base">ق</div>
            <div class="w-10 h-10 rounded-xl keycap-3d bg-white flex items-center justify-center font-black text-slate-800 text-base">و</div>
            <div class="w-10 h-10 rounded-xl keycap-3d bg-white flex items-center justify-center font-black text-slate-800 text-base ring-2 ring-sky-300" title="'E' key (ە)">ە</div>
            <div class="w-10 h-10 rounded-xl keycap-3d bg-white flex items-center justify-center font-black text-slate-800 text-base">ر</div>
            <div class="w-10 h-10 rounded-xl keycap-3d bg-white flex items-center justify-center font-black text-slate-800 text-base">ت</div>
          </div>

          <!-- Row 3 with 'H' keycap (هـ) in Active Glowing State -->
          <div class="flex gap-1.5 justify-center">
            <div class="w-10 h-10 rounded-xl keycap-3d bg-white flex items-center justify-center font-black text-slate-800 text-base">د</div>
            <div class="w-10 h-10 rounded-xl keycap-3d bg-white flex items-center justify-center font-black text-emerald-800 text-base">ف</div>
            <div class="w-10 h-10 rounded-xl keycap-3d bg-white flex items-center justify-center font-black text-emerald-800 text-base">گ</div>
            
            <!-- 'H' Keycap (Target Active) -->
            <div class="w-10 h-10 rounded-xl keycap-3d keycap-active flex items-center justify-center font-black text-base" title="'H' key (هـ)">
              <span>هـ</span>
            </div>

            <div class="w-10 h-10 rounded-xl keycap-3d bg-white flex items-center justify-center font-black text-emerald-800 text-base">ژ</div>
            <div class="w-10 h-10 rounded-xl keycap-3d bg-white flex items-center justify-center font-black text-slate-800 text-base">ک</div>
          </div>
        </div>

      </div>
    </body>
    </html>
  `;

  await page.setContent(html);
  await new Promise(r => setTimeout(r, 1500));
  await page.screenshot({ path: path.resolve('public', 'arena_mockup_test.png') });
  await browser.close();
  console.log('Saved arena_mockup_test.png');
}

testArenaUI().catch(console.error);
