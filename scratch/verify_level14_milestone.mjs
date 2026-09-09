import puppeteer from 'puppeteer-core';
import path from 'path';

const ARTIFACT_DIR = 'C:\\Users\\moham\\.gemini\\antigravity-ide\\brain\\c3afe10a-57b1-45c4-95b4-cc5d0bbf99ca';

async function verifyLevel14Milestone() {
  console.log('Testing Level 14 Shift Key Milestone...');
  const browser = await puppeteer.launch({
    executablePath: 'C:\\Program Files (x86)\\Microsoft\\Edge\\Application\\msedge.exe',
    headless: true,
    args: ['--no-sandbox', '--window-size=1280,950']
  });

  try {
    const page = await browser.newPage();
    await page.setViewport({ width: 1280, height: 950 });

    await page.setCookie(
      { name: 'has_onboarded', value: 'true', domain: 'localhost', path: '/' },
      { name: 'guest_unlocked_level', value: '20', domain: 'localhost', path: '/' }
    );

    await page.goto('http://localhost:3000', { waitUntil: 'networkidle2' });
    await new Promise(r => setTimeout(r, 1000));

    console.log('Clicking Level 14 node...');
    await page.waitForSelector('#level-node-14', { timeout: 5000 });
    await page.click('#level-node-14');
    await new Promise(r => setTimeout(r, 800));

    await page.waitForSelector('#milestone-popup-overlay', { timeout: 3000 });
    const level14Info = await page.evaluate(() => {
      const title = document.querySelector('#milestone-title')?.textContent?.trim();
      const message = document.querySelector('#milestone-message-box')?.textContent?.trim();
      const isPlaceholder = Boolean(document.querySelector('#target-text-hidden-placeholder'));
      return { title, message, isPlaceholder };
    });
    console.log('Level 14 Milestone info:', level14Info);

    if (!level14Info.title.includes('Shift')) {
      throw new Error(`Expected Level 14 to be Shift milestone, got: ${level14Info.title}`);
    }
    if (!level14Info.isPlaceholder) {
      throw new Error('Target text should be hidden during Level 14 milestone!');
    }

    const step6Path = path.join(ARTIFACT_DIR, 'step6_level14_milestone_shift_key.png');
    await page.screenshot({ path: step6Path });
    console.log(`Captured ${step6Path}`);

    // Click Got it
    await page.click('#milestone-got-it-btn');
    await new Promise(r => setTimeout(r, 500));

    const resumedState = await page.evaluate(() => {
      const isGone = !document.querySelector('#milestone-popup-overlay');
      const targetChar = document.querySelector('#target-char-display')?.textContent?.trim();
      return { isGone, targetChar };
    });
    console.log('Level 14 Resumed state:', resumedState);

    if (!resumedState.isGone || resumedState.targetChar !== 'ش') {
      throw new Error(`Level 14 resume failed, targetChar is '${resumedState.targetChar}'`);
    }

    console.log('=== LEVEL 14 MILESTONE VERIFIED! ===');
  } finally {
    await browser.close();
  }
}

verifyLevel14Milestone().catch(err => {
  console.error('Level 14 milestone test failed:', err);
  process.exit(1);
});
