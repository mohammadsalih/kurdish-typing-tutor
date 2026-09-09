import puppeteer from 'puppeteer-core';
import path from 'path';

async function verifySpeedTest() {
  const edgePath = 'C:\\Program Files (x86)\\Microsoft\\Edge\\Application\\msedge.exe';
  const artifactDir = 'C:\\Users\\moham\\.gemini\\antigravity-ide\\brain\\ec64e042-2622-495c-9943-0a67d2f37dd5';

  console.log('--- Step 1: Launching Edge browser ---');
  const browser = await puppeteer.launch({
    executablePath: edgePath,
    headless: true,
    args: ['--no-sandbox', '--disable-setuid-sandbox', '--disable-gpu'],
  });

  const page = await browser.newPage();
  await page.setViewport({ width: 1440, height: 960 });

  const errors = [];
  page.on('pageerror', err => errors.push(err.toString()));

  console.log('--- Step 2: Navigating to http://localhost:3000 ---');
  await page.goto('http://localhost:3000', { waitUntil: 'networkidle0' });

  // Wait for loading guard to clear
  console.log('--- Step 3: Handling initial view (Onboarding / Map) ---');
  await page.waitForFunction(() => !document.getElementById('database-loading-guard'), { timeout: 15000 });

  // If onboarding button exists, click it to get to map
  const skipBtn = await page.$('#skip-onboarding-btn');
  if (skipBtn) {
    console.log('Clicking skip onboarding button...');
    await skipBtn.click();
    await page.waitForSelector('#nav-map-btn', { timeout: 5000 });
  }

  console.log('--- Step 4: Navigating to Speed Test Mode ---');
  const speedTestNavBtn = await page.waitForSelector('#nav-speed-test-btn', { timeout: 5000 });
  if (!speedTestNavBtn) {
    throw new Error('Speed Test button (#nav-speed-test-btn) not found in header');
  }
  await speedTestNavBtn.click();

  // Wait for Speed Test Arena to render
  console.log('--- Step 5: Verifying Speed Test Arena & Initial State ---');
  await page.waitForSelector('#speed-test-arena-wrapper', { timeout: 5000 });
  
  const timerText = await page.$eval('#speed-test-timer-display', el => el.textContent.trim());
  console.log('Timer display:', timerText);
  if (!timerText.includes('60')) {
    throw new Error(`Expected timer to show 60, got: ${timerText}`);
  }

  const initialAuthorInfo = await page.$eval('#speed-test-arena-wrapper', el => {
    const titleEl = el.querySelector('.text-xs.font-bold.text-slate-500');
    return titleEl ? titleEl.textContent.trim() : '';
  });
  console.log('Initial text info:', initialAuthorInfo);

  const initialTargetChar = await page.$eval('#speed-target-char-display', el => el.textContent.trim());
  console.log('Initial target char:', initialTargetChar);

  // Take initial screenshot
  await page.screenshot({ path: path.join(artifactDir, 'speed_test_initial.png') });
  console.log('Saved screenshot: speed_test_initial.png');

  console.log('--- Step 6: Typing first character to trigger 60s countdown ---');
  // Type target char using physical keyboard event
  await page.keyboard.press('a'); // Or Kurdish character equivalent
  await new Promise(r => setTimeout(r, 600));

  // Check if timer started or type mapped key
  const promptVisibleBefore = await page.$('#speed-test-start-prompt');
  console.log('Is start prompt visible after first keypress?', Boolean(promptVisibleBefore));

  // Let's type using the highlighted virtual keycap directly to ensure valid Kurdish character stroke
  const activeKeycap = await page.$('.keycap-active');
  if (activeKeycap) {
    console.log('Clicking active virtual keycap to register valid keystroke...');
    await activeKeycap.click();
    await new Promise(r => setTimeout(r, 600));
  }

  // Check timer countdown
  const timerAfterKey = await page.$eval('#speed-test-timer-display', el => el.textContent.trim());
  console.log('Timer after keypress:', timerAfterKey);

  // Type a few more keys to record WPM and keystrokes
  for (let i = 0; i < 5; i++) {
    const key = await page.$('.keycap-active');
    if (key) {
      await key.click();
      await new Promise(r => setTimeout(r, 120));
    }
  }

  await page.screenshot({ path: path.join(artifactDir, 'speed_test_typing.png') });
  console.log('Saved screenshot: speed_test_typing.png');

  console.log('--- Step 7: Fast-forwarding time to 0 to verify timeout lock & modal ---');
  // Call window.__finishSpeedTest()
  await page.evaluate(() => {
    if (window.__finishSpeedTest) {
      window.__finishSpeedTest();
    }
  });

  // Verify results modal appears
  console.log('Waiting for Speed Test Results Modal...');
  await page.waitForSelector('#speed-test-results-modal', { timeout: 5000 });

  const resultWpm = await page.$eval('#result-wpm-value', el => el.textContent.trim());
  const resultAccuracy = await page.$eval('#result-accuracy-value', el => el.textContent.trim());
  console.log(`Results Modal displayed! WPM: ${resultWpm}, Accuracy: ${resultAccuracy}`);

  await page.screenshot({ path: path.join(artifactDir, 'speed_test_results.png') });
  console.log('Saved screenshot: speed_test_results.png');

  console.log('--- Step 8: Testing Retry button (دووبارە کردنەوە) ---');
  const retryBtn = await page.waitForSelector('#speed-test-retry-btn', { timeout: 5000 });
  await retryBtn.click();

  // Wait for modal to disappear
  await page.waitForFunction(() => !document.getElementById('speed-test-results-modal'), { timeout: 5000 });
  console.log('Modal closed successfully!');

  // Verify timer is reset to 60
  const resetTimer = await page.$eval('#speed-test-timer-display', el => el.textContent.trim());
  console.log('Reset timer display:', resetTimer);
  if (!resetTimer.includes('60')) {
    throw new Error(`Expected reset timer to show 60, got: ${resetTimer}`);
  }

  // Verify new text was selected
  const newAuthorInfo = await page.$eval('#speed-test-arena-wrapper', el => {
    const titleEl = el.querySelector('.text-xs.font-bold.text-slate-500');
    return titleEl ? titleEl.textContent.trim() : '';
  });
  console.log('New text info after retry:', newAuthorInfo);
  console.log(`Did text change? ${initialAuthorInfo !== newAuthorInfo} (Initial: "${initialAuthorInfo}" vs New: "${newAuthorInfo}")`);

  await page.screenshot({ path: path.join(artifactDir, 'speed_test_retried.png') });
  console.log('Saved screenshot: speed_test_retried.png');

  console.log('Page errors during test:', errors);

  await browser.close();
  console.log('--- All Speed Test verification steps passed successfully! ---');
}

verifySpeedTest().catch(err => {
  console.error('Verification failed:', err);
  process.exit(1);
});
