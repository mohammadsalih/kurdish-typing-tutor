import puppeteer from 'puppeteer-core';
import path from 'path';

const ARTIFACT_DIR = 'C:\\Users\\moham\\.gemini\\antigravity-ide\\brain\\c3afe10a-57b1-45c4-95b4-cc5d0bbf99ca';

async function verifyLevel6Milestone() {
  console.log('Testing Level 6 Top Row Milestone...');
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

    console.log('Clicking Level 6 node...');
    await page.waitForSelector('#level-node-6', { timeout: 5000 });
    await page.click('#level-node-6');
    await new Promise(r => setTimeout(r, 800));

    await page.waitForSelector('#milestone-popup-overlay', { timeout: 3000 });
    const level6Info = await page.evaluate(() => {
      const title = document.querySelector('#milestone-title')?.textContent?.trim();
      const message = document.querySelector('#milestone-message-box')?.textContent?.trim();
      const isPlaceholder = Boolean(document.querySelector('#target-text-hidden-placeholder'));
      return { title, message, isPlaceholder };
    });
    console.log('Level 6 Milestone info:', level6Info);

    if (!level6Info.title.includes('Top Row')) {
      throw new Error(`Expected Level 6 to be Top Row milestone, got: ${level6Info.title}`);
    }
    if (!level6Info.isPlaceholder) {
      throw new Error('Target text should be hidden during Level 6 milestone!');
    }

    const step5Path = path.join(ARTIFACT_DIR, 'step5_level6_milestone_top_row.png');
    await page.screenshot({ path: step5Path });
    console.log(`Captured ${step5Path}`);

    // Click Got it
    await page.click('#milestone-got-it-btn');
    await new Promise(r => setTimeout(r, 500));

    const resumedState = await page.evaluate(() => {
      const isGone = !document.querySelector('#milestone-popup-overlay');
      const targetChar = document.querySelector('#target-char-display')?.textContent?.trim();
      return { isGone, targetChar };
    });
    console.log('Level 6 Resumed state:', resumedState);

    if (!resumedState.isGone || resumedState.targetChar !== 'ت') {
      throw new Error(`Level 6 resume failed, targetChar is '${resumedState.targetChar}'`);
    }

    console.log('=== LEVEL 6 MILESTONE VERIFIED! ===');
  } finally {
    await browser.close();
  }
}

verifyLevel6Milestone().catch(err => {
  console.error('Level 6 milestone test failed:', err);
  process.exit(1);
});
