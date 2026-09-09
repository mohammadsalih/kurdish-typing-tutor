import puppeteer from 'puppeteer-core';

async function testSpacePreventDefault() {
  const edgePath = 'C:\\Program Files (x86)\\Microsoft\\Edge\\Application\\msedge.exe';

  console.log('--- Launching Edge ---');
  const browser = await puppeteer.launch({
    executablePath: edgePath,
    headless: true,
    args: ['--no-sandbox', '--disable-setuid-sandbox', '--disable-gpu'],
  });

  const page = await browser.newPage();
  await page.setViewport({ width: 1440, height: 960 });

  console.log('--- Navigating to http://localhost:3000 ---');
  await page.goto('http://localhost:3000', { waitUntil: 'networkidle0' });

  // Wait for loading guard
  await page.waitForFunction(() => !document.getElementById('database-loading-guard'), { timeout: 15000 });

  // Handle onboarding if needed
  const skipBtn = await page.$('#skip-onboarding-btn');
  if (skipBtn) {
    console.log('Skipping onboarding...');
    await skipBtn.click();
    await page.waitForSelector('#nav-map-btn', { timeout: 5000 });
  }

  // --- Test 1: Speed Test Arena ---
  console.log('--- Test 1: Testing Space in Speed Test Mode ---');
  const speedBtn = await page.waitForSelector('#nav-speed-test-btn', { timeout: 5000 });
  await speedBtn.click();
  await page.waitForSelector('#speed-test-arena-wrapper', { timeout: 5000 });

  // Add scroll check and defaultPrevented listener
  await page.evaluate(() => {
    window.__spaceEvents = [];
    window.addEventListener('keydown', (e) => {
      if (e.key === ' ' || e.code === 'Space') {
        const ev = e;
        setTimeout(() => {
          window.__spaceEvents.push({
            key: ev.key,
            code: ev.code,
            defaultPrevented: ev.defaultPrevented,
            scrollY: window.scrollY
          });
        }, 10);
      }
    });
  });

  // Record initial scroll position
  const initialScrollY = await page.evaluate(() => window.scrollY);

  // Press spacebar on the window
  await page.keyboard.press('Space');
  await new Promise(r => setTimeout(r, 200));

  const scrollAfterSpace = await page.evaluate(() => window.scrollY);
  const spaceEvents = await page.evaluate(() => window.__spaceEvents);

  console.log('Initial scrollY:', initialScrollY, 'ScrollY after space:', scrollAfterSpace);
  console.log('Space event captured in Speed Test:', spaceEvents);

  if (spaceEvents.length === 0) {
    throw new Error('No space event was recorded');
  }

  const speedTestPrevented = spaceEvents[spaceEvents.length - 1].defaultPrevented;
  console.log('Was spacebar defaultPrevented true in Speed Test?', speedTestPrevented);
  if (!speedTestPrevented) {
    throw new Error('Expected spacebar event defaultPrevented to be true in Speed Test Arena!');
  }
  if (scrollAfterSpace !== initialScrollY) {
    throw new Error(`Browser scrolled from ${initialScrollY} to ${scrollAfterSpace}!`);
  }

  // --- Test 2: Verify Space Key Validation Works When Space Is Target ---
  console.log('--- Test 2: Verifying that target space correctly matches and advances in Speed Test ---');
  let typed = 0;
  while (typed < 40) {
    const targetChar = await page.$eval('#speed-target-char-display', el => el.textContent.trim());
    if (targetChar === 'بۆشایی' || targetChar === ' ' || targetChar === '') {
      console.log(`Reached space target! Target display: "${targetChar}"`);

      // Press spacebar
      console.log('Pressing spacebar on target space...');
      await page.keyboard.press('Space');
      await new Promise(r => setTimeout(r, 250));

      const nextTargetChar = await page.$eval('#speed-target-char-display', el => el.textContent.trim());
      console.log(`After spacebar, next target char: "${nextTargetChar}"`);
      if (nextTargetChar === targetChar) {
        throw new Error('Space did not advance typing target!');
      }
      console.log('Space successfully validated and advanced typing index!');
      break;
    } else {
      // Type target char via virtual key
      const activeKey = await page.$('.keycap-active');
      if (activeKey) {
        await activeKey.click();
        await new Promise(r => setTimeout(r, 120));
        typed++;
      } else {
        break;
      }
    }
  }

  // --- Test 3: Main Learning Mode (Arena) ---
  console.log('--- Test 3: Testing Space in Main Learning Arena ---');
  const backToMapBtn = await page.waitForSelector('#speed-arena-back-btn', { timeout: 5000 });
  await backToMapBtn.click();
  await page.waitForSelector('#nav-map-btn', { timeout: 5000 });

  // Click on a level to enter TypingArena (Level 1)
  const levelNode = await page.waitForSelector('#level-node-1', { timeout: 5000 });
  await levelNode.click();

  // Wait for Typing Arena
  await page.waitForSelector('#typing-arena-wrapper', { timeout: 5000 });

  // Reset tracked space events
  await page.evaluate(() => {
    window.__spaceEvents = [];
  });

  const arenaInitialScrollY = await page.evaluate(() => window.scrollY);
  await page.keyboard.press('Space');
  await new Promise(r => setTimeout(r, 200));

  const arenaScrollAfterSpace = await page.evaluate(() => window.scrollY);
  const arenaSpaceEvents = await page.evaluate(() => window.__spaceEvents);

  console.log('Arena initial scrollY:', arenaInitialScrollY, 'Arena scrollY after space:', arenaScrollAfterSpace);
  console.log('Space event captured in Main Arena:', arenaSpaceEvents);

  if (arenaSpaceEvents.length === 0) {
    throw new Error('No space event was recorded in Main Arena');
  }

  const arenaPrevented = arenaSpaceEvents[arenaSpaceEvents.length - 1].defaultPrevented;
  console.log('Was spacebar defaultPrevented true in Main Arena?', arenaPrevented);
  if (!arenaPrevented) {
    throw new Error('Expected spacebar event defaultPrevented to be true in Main Arena!');
  }
  if (arenaScrollAfterSpace !== arenaInitialScrollY) {
    throw new Error(`Browser scrolled from ${arenaInitialScrollY} to ${arenaScrollAfterSpace}!`);
  }

  console.log('--- All Spacebar preventDefault checks PASSED perfectly! ---');
  await browser.close();
}

testSpacePreventDefault().catch(err => {
  console.error('Test failed:', err);
  process.exit(1);
});
