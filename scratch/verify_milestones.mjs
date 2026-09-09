import puppeteer from 'puppeteer-core';
import path from 'path';

const ARTIFACT_DIR = 'C:\\Users\\moham\\.gemini\\antigravity-ide\\brain\\c3afe10a-57b1-45c4-95b4-cc5d0bbf99ca';

async function verifyMilestones() {
  console.log('Launching browser for Milestone Popup & Curriculum verification...');
  const browser = await puppeteer.launch({
    executablePath: 'C:\\Program Files (x86)\\Microsoft\\Edge\\Application\\msedge.exe',
    headless: true,
    args: ['--no-sandbox', '--window-size=1280,950']
  });

  try {
    const page = await browser.newPage();
    await page.setViewport({ width: 1280, height: 950 });

    // Bypass onboarding & ensure Level 1 is available
    await page.setCookie(
      { name: 'has_onboarded', value: 'true', domain: 'localhost', path: '/' },
      { name: 'guest_unlocked_level', value: '5', domain: 'localhost', path: '/' }
    );

    console.log('Navigating to http://localhost:3000...');
    await page.goto('http://localhost:3000', { waitUntil: 'networkidle2' });
    await new Promise(r => setTimeout(r, 1200));

    // Click Level 1 Node
    console.log('Clicking #level-node-1 to start Level 1...');
    await page.waitForSelector('#level-node-1', { timeout: 5000 });
    await page.click('#level-node-1');
    await new Promise(r => setTimeout(r, 800));

    // Verify Arena is mounted
    await page.waitForSelector('#typing-arena-wrapper', { timeout: 5000 });
    console.log('Typing arena mounted for Level 1!');

    // 1. Verify Milestone Popup is open as a full-screen overlay
    await page.waitForSelector('#milestone-popup-overlay', { timeout: 3000 });
    await page.waitForSelector('#milestone-card', { timeout: 3000 });
    console.log('Milestone popup overlay and card are visible!');

    const layoutCheck = await page.evaluate(() => {
      const overlay = document.querySelector('#milestone-popup-overlay');
      const card = document.querySelector('#milestone-card');
      const overlayStyles = overlay ? window.getComputedStyle(overlay) : null;
      const cardStyles = card ? window.getComputedStyle(card) : null;

      return {
        position: overlayStyles?.position,
        zIndex: overlayStyles?.zIndex,
        top: overlayStyles?.top,
        left: overlayStyles?.left,
        right: overlayStyles?.right,
        bottom: overlayStyles?.bottom,
        backdropFilter: overlayStyles?.backdropFilter || overlayStyles?.webkitBackdropFilter,
        cardBorderRadius: cardStyles?.borderRadius,
        cardMaxWidth: cardStyles?.maxWidth,
        parentTag: overlay?.parentElement?.tagName,
        coversHeaderLogo: document.elementFromPoint(100, 30)?.id === 'milestone-popup-overlay',
        coversHeaderLogin: document.elementFromPoint(1150, 30)?.id === 'milestone-popup-overlay',
      };
    });
    console.log('Full-Screen Milestone CSS verification:', layoutCheck);

    if (layoutCheck.position !== 'fixed') {
      throw new Error(`Expected overlay position to be 'fixed', got '${layoutCheck.position}'`);
    }
    if (layoutCheck.zIndex !== '9999') {
      throw new Error(`Expected overlay z-index to be '9999', got '${layoutCheck.zIndex}'`);
    }
    if (layoutCheck.top !== '0px' || layoutCheck.left !== '0px') {
      throw new Error(`Expected overlay inset: 0, got top=${layoutCheck.top}, left=${layoutCheck.left}`);
    }
    if (layoutCheck.parentTag !== 'BODY') {
      throw new Error(`Expected overlay parent to be BODY (via portal), got '${layoutCheck.parentTag}'`);
    }
    if (!layoutCheck.coversHeaderLogo || !layoutCheck.coversHeaderLogin) {
      throw new Error(`Overlay does not cover header: coversHeaderLogo=${layoutCheck.coversHeaderLogo}, coversHeaderLogin=${layoutCheck.coversHeaderLogin}`);
    }

    // 0. Verify HTML Document Attributes
    const htmlAttrs = await page.evaluate(() => ({
      lang: document.documentElement.getAttribute('lang'),
      dir: document.documentElement.getAttribute('dir'),
      title: document.title,
    }));
    console.log('HTML Document Attributes:', htmlAttrs);
    if (htmlAttrs.lang !== 'ku') throw new Error(`Expected lang="ku", got "${htmlAttrs.lang}"`);
    if (htmlAttrs.dir !== 'rtl') throw new Error(`Expected dir="rtl", got "${htmlAttrs.dir}"`);

    const milestoneInfo = await page.evaluate(() => {
      const title = document.querySelector('#milestone-title h2')?.textContent?.trim();
      const badge = document.querySelector('#milestone-title .bg-emerald-500\\/15')?.textContent?.trim();
      const message = document.querySelector('#milestone-message-box')?.textContent?.trim();
      const buttonText = document.querySelector('#milestone-got-it-btn')?.textContent?.trim();
      const isPlaceholderVisible = Boolean(document.querySelector('#target-text-hidden-placeholder'));
      const targetCharDisplay = document.querySelector('#target-char-display')?.textContent?.trim();
      return { title, badge, message, buttonText, isPlaceholderVisible, targetCharDisplay };
    });
    console.log('Milestone info on Level 1:', milestoneInfo);

    if (milestoneInfo.title !== 'خاڵی بنەڕەتی دەستەکان') {
      throw new Error(`Milestone title does not match Kurdish title: ${milestoneInfo.title}`);
    }
    if (milestoneInfo.badge !== 'پەیامی فێربوون') {
      throw new Error(`Milestone badge does not match Kurdish badge: ${milestoneInfo.badge}`);
    }
    if (milestoneInfo.buttonText !== 'تێگەیشتم، با بنووسین!') {
      throw new Error(`Milestone button does not match Kurdish text: ${milestoneInfo.buttonText}`);
    }
    if (/[A-Za-z]{3,}/.test(milestoneInfo.message)) {
      throw new Error(`English text detected in milestone message: ${milestoneInfo.message}`);
    }
    if (!milestoneInfo.isPlaceholderVisible) {
      throw new Error('Target text is not hidden while milestone popup is active!');
    }

    // 2. Verify keyboard input is blocked while milestone is open
    console.log('Testing keyboard input blocking during milestone...');
    await page.keyboard.press('KeyS');
    await page.keyboard.press('KeyD');
    await new Promise(r => setTimeout(r, 200));

    const blockedCheck = await page.evaluate(() => {
      const isPlaceholderStillThere = Boolean(document.querySelector('#target-text-hidden-placeholder'));
      return { isPlaceholderStillThere };
    });
    if (!blockedCheck.isPlaceholderStillThere) {
      throw new Error('Keyboard input was processed while milestone popup was active!');
    }
    console.log('Keyboard input successfully blocked during milestone popup!');

    // Capture screenshot of full-screen milestone overlay
    const step1Path = path.join(ARTIFACT_DIR, 'step1_fullscreen_milestone_overlay.png');
    await page.screenshot({ path: step1Path });
    console.log(`Captured ${step1Path}`);

    // 3. Click "تێگەیشتم، با بنووسین!" button to resume gameplay
    console.log('Clicking #milestone-got-it-btn...');
    await page.click('#milestone-got-it-btn');
    await new Promise(r => setTimeout(r, 600));

    // Verify milestone popup is dismissed and target text is revealed
    const resumedInfo = await page.evaluate(() => {
      const isOverlayGone = !document.querySelector('#milestone-popup-overlay');
      const isPlaceholderGone = !document.querySelector('#target-text-hidden-placeholder');
      const targetChar = document.querySelector('#target-char-display')?.textContent?.trim();
      const firstChar = document.querySelector('#text-char-0')?.textContent?.trim();
      const backBtn = document.querySelector('#typing-arena-wrapper button')?.textContent?.trim();
      return { isOverlayGone, isPlaceholderGone, targetChar, firstChar, backBtn };
    });
    console.log('Resumed game state:', resumedInfo);

    if (!resumedInfo.isOverlayGone) {
      throw new Error('Milestone popup overlay was not removed after clicking Got It!');
    }
    if (!resumedInfo.isPlaceholderGone) {
      throw new Error('Target text was not revealed after dismissing milestone!');
    }
    if (resumedInfo.targetChar !== 'س') {
      throw new Error(`Expected first target char to be 'س', got '${resumedInfo.targetChar}'`);
    }
    if (!resumedInfo.backBtn.includes('ئاستەکان')) {
      throw new Error(`Back button does not use ئاست: ${resumedInfo.backBtn}`);
    }

    // 4. Test typing in the resumed arena
    console.log('Typing first characters (s, space, d)...');
    await page.keyboard.press('KeyS');
    await new Promise(r => setTimeout(r, 100));
    await page.keyboard.press('Space');
    await new Promise(r => setTimeout(r, 100));
    await page.keyboard.press('KeyD');
    await new Promise(r => setTimeout(r, 100));

    const typingProgress = await page.evaluate(() => {
      const char0Class = document.querySelector('#text-char-0')?.className;
      const char1Class = document.querySelector('#text-char-1')?.className;
      const targetChar = document.querySelector('#target-char-display')?.textContent?.trim();
      return { char0Class, char1Class, targetChar };
    });
    console.log('Typing progress after 3 keys:', typingProgress);

    const step2Path = path.join(ARTIFACT_DIR, 'step2_level1_gameplay_resumed.png');
    await page.screenshot({ path: step2Path });
    console.log(`Captured ${step2Path}`);

    // 5. Complete Level 1 exercise: "س د س د س س د د س د س د د س د س"
    // We already typed indices 0, 1, 2 ("س د")
    const targetText = "س د س د س س د د س د س د د س د س";
    console.log('Finishing remaining Level 1 keystrokes from index 3 to 30...');
    for (let i = 3; i < targetText.length; i++) {
      const ch = targetText[i];
      if (ch === ' ') {
        await page.keyboard.press('Space');
      } else if (ch === 'س') {
        await page.keyboard.press('KeyS');
      } else if (ch === 'د') {
        await page.keyboard.press('KeyD');
      }
      await new Promise(r => setTimeout(r, 100));
    }
    await new Promise(r => setTimeout(r, 1500));

    // Check completion state in DOM
    const arenaStatus = await page.evaluate(() => {
      const modal = Boolean(document.querySelector('#level-complete-modal'));
      const targetChar = document.querySelector('#target-char-display')?.textContent?.trim();
      const arenaText = document.querySelector('#target-text-container')?.innerText;
      return { modal, targetChar, arenaText };
    });
    console.log('Arena status after typing all keys:', arenaStatus);

    // Verify Victory Modal
    await page.waitForSelector('#level-complete-modal', { timeout: 6000 });
    console.log('Level 1 completed! Victory modal is open!');

    const victoryInfo = await page.evaluate(() => {
      const modal = document.querySelector('#level-complete-modal');
      const title = modal.querySelector('h2')?.textContent?.trim();
      const nextBtn = document.querySelector('#next-level-btn')?.textContent?.trim();
      const rawMetrics = Array.from(modal.querySelectorAll('.grid span')).map(s => s.textContent?.trim());
      const allText = modal.textContent || '';
      return { title, nextBtn, rawMetrics, allText };
    });
    console.log('Victory modal info:', victoryInfo);

    if (victoryInfo.title !== 'ئاستەکە تەواو بوو!') {
      throw new Error(`Expected victory title to be 'ئاستەکە تەواو بوو!', got '${victoryInfo.title}'`);
    }
    if (victoryInfo.nextBtn !== 'ئاستی دواتر') {
      throw new Error(`Expected next button to be 'ئاستی دواتر', got '${victoryInfo.nextBtn}'`);
    }
    if (!victoryInfo.rawMetrics.some(m => m && m.includes('وشە لە خولەکێکدا'))) {
      throw new Error(`Expected WPM metric to be in Kurdish: ${victoryInfo.rawMetrics}`);
    }
    if (!victoryInfo.rawMetrics.some(m => m && m.includes('وردی'))) {
      throw new Error(`Expected accuracy metric to be in Kurdish: ${victoryInfo.rawMetrics}`);
    }
    if (/[A-Za-z]{3,}/.test(victoryInfo.allText)) {
      throw new Error(`English text detected in victory modal: ${victoryInfo.allText}`);
    }

    const step3Path = path.join(ARTIFACT_DIR, 'step3_level1_victory.png');
    await page.screenshot({ path: step3Path });
    console.log(`Captured ${step3Path}`);

    // 6. Click "ئاستی دواتر" to test transitioning to Level 2
    console.log('Clicking #next-level-btn...');
    await page.click('#next-level-btn');
    await new Promise(r => setTimeout(r, 1000));

    const level2State = await page.evaluate(() => {
      const heading = document.querySelector('#typing-arena-wrapper')?.textContent;
      const isLevel2 = heading?.includes('کلیلی ا و ف') || heading?.includes('ا • ف');
      const hasMilestone = Boolean(document.querySelector('#milestone-popup-overlay'));
      const targetChar = document.querySelector('#target-char-display')?.textContent?.trim();
      return { isLevel2, hasMilestone, targetChar };
    });
    console.log('Level 2 transition state:', level2State);

    if (!level2State.isLevel2) {
      throw new Error('Did not advance to Level 2 (کلیلی ا و ف)!');
    }
    if (level2State.hasMilestone) {
      throw new Error('Level 2 should not have milestone popup!');
    }
    if (level2State.targetChar !== 'ا') {
      throw new Error(`Expected Level 2 first target char to be 'ا', got '${level2State.targetChar}'`);
    }

    const step4Path = path.join(ARTIFACT_DIR, 'step4_level2_transition_direct.png');
    await page.screenshot({ path: step4Path });
    console.log(`Captured ${step4Path}`);

    console.log('\n=== ALL MILESTONE TESTS PASSED SUCCESSFULLY! ===');
  } finally {
    await browser.close();
  }
}

verifyMilestones().catch(err => {
  console.error('Verification failed:', err);
  process.exit(1);
});
