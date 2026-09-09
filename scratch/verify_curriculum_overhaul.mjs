import puppeteer from 'puppeteer-core';
import path from 'path';
import fs from 'fs';

async function verifyCurriculum() {
  console.log('=== Step 1: Programmatic Validation of levels.ts Data ===');

  // Read src/data/levels.ts directly
  const levelsFileContent = fs.readFileSync('src/data/levels.ts', 'utf-8');
  
  // Extract all level blocks
  const levels = [];
  const levelBlocks = levelsFileContent.split(/{\s*id:\s*\d+/).slice(1);
  for (let i = 0; i < levelBlocks.length; i++) {
    const block = '{ id: ' + (i + 1) + levelBlocks[i].split(/\n\s*},\n/)[0];
    const id = i + 1;
    const targetTextMatch = block.match(/targetText:\s*"([^"]+)"/);
    const subtitleMatch = block.match(/subtitle:\s*"([^"]+)"/);
    const titleMatch = block.match(/title:\s*"([^"]+)"/);
    const milestoneTitle = block.match(/milestone:\s*{[\s\S]*?title:\s*"([^"]+)"/);
    const milestoneMsg = block.match(/milestone:\s*{[\s\S]*?message:\s*"([^"]+)"/);

    levels.push({
      id,
      targetText: targetTextMatch ? targetTextMatch[1] : '',
      subtitle: subtitleMatch ? subtitleMatch[1] : '',
      title: titleMatch ? titleMatch[1] : '',
      milestone: milestoneTitle ? { title: milestoneTitle[1], message: milestoneMsg ? milestoneMsg[1] : '' } : undefined
    });
  }
  if (levels.length < 40) {
    throw new Error(`Expected curriculum to have >= 40 micro-levels, got ${levels.length}`);
  }

  // Check Level 1 through 5 restriction
  const anchorKeysAndSpace = new Set(['ف', 'ژ', ' ']);
  const anchorKeysOnly = new Set(['ف', 'ژ']);

  for (let i = 1; i <= 5; i++) {
    const lvl = levels.find(l => l.id === i);
    if (!lvl) throw new Error(`Level ${i} not found!`);

    const chars = Array.from(lvl.targetText);
    for (const c of chars) {
      if (!anchorKeysAndSpace.has(c)) {
        throw new Error(`Level ${i} contains illegal character: "${c}" (Code: ${c.charCodeAt(0)}). Expected ONLY ف, ژ, or space!`);
      }
    }

    if (i === 1 || i === 2) {
      // Must be exclusively the anchor keys (NO spacebar)
      for (const c of chars) {
        if (!anchorKeysOnly.has(c)) {
          throw new Error(`Level ${i} must contain exclusively anchor keys (NO spacebar), but found: "${c}"`);
        }
      }
      console.log(`✓ Level ${i} contains exclusively anchor keys: "${lvl.targetText}"`);
    } else {
      console.log(`✓ Level ${i} target text restricted solely to anchor keys and space: "${lvl.targetText}"`);
    }
  }

  // Check Level 3 adds spacebar
  const lvl3 = levels.find(l => l.id === 3);
  if (!lvl3.targetText.includes(' ')) {
    throw new Error('Level 3 must introduce spacebar!');
  }
  console.log('✓ Level 3 correctly introduces spacebar.');

  // Check Delayed Complexity: No shift keys in Levels 1 to 38
  const shiftChars = new Set(['ڵ', 'ش', 'ڕ', 'ێ', 'چ']);
  for (let i = 1; i <= 38; i++) {
    const lvl = levels.find(l => l.id === i);
    if (!lvl) continue;
    for (const c of Array.from(lvl.targetText)) {
      if (shiftChars.has(c)) {
        throw new Error(`Level ${i} contains delayed shift character "${c}" prematurely!`);
      }
    }
  }
  console.log('✓ Levels 1 through 38 strictly contain zero shifted characters.');

  // Check milestone finger placement guidance in Level 1
  const lvl1 = levels.find(l => l.id === 1);
  if (!lvl1.milestone || !lvl1.milestone.message.includes('F') || !lvl1.milestone.message.includes('J')) {
    throw new Error('Level 1 milestone must focus on F and J finger placement!');
  }
  console.log(`✓ Level 1 milestone message: "${lvl1.milestone.title}" - "${lvl1.milestone.message}"`);

  // Check milestone in Level 3
  if (!lvl3.milestone || !lvl3.milestone.message.includes('Spacebar')) {
    throw new Error('Level 3 milestone must explain Spacebar finger placement!');
  }
  console.log(`✓ Level 3 milestone message: "${lvl3.milestone.title}" - "${lvl3.milestone.message}"`);

  // Check Word Practice levels
  const wordPracticeLevels = [8, 11, 14, 17, 20, 23, 26, 29, 32, 35, 38, 41, 44];
  for (const lvlId of wordPracticeLevels) {
    const lvl = levels.find(l => l.id === lvlId);
    if (!lvl) throw new Error(`Word practice level ${lvlId} not found!`);
    console.log(`✓ Level ${lvlId} (${lvl.subtitle}): "${lvl.targetText}"`);
  }

  console.log('\n=== Step 2: Browser Smoke Test in Microsoft Edge ===');
  const edgePath = 'C:\\Program Files (x86)\\Microsoft\\Edge\\Application\\msedge.exe';
  const artifactDir = 'C:\\Users\\moham\\.gemini\\antigravity-ide\\brain\\ec64e042-2622-495c-9943-0a67d2f37dd5';

  const browser = await puppeteer.launch({
    executablePath: edgePath,
    headless: true,
    args: ['--no-sandbox', '--disable-setuid-sandbox', '--disable-gpu'],
  });

  const page = await browser.newPage();
  await page.setViewport({ width: 1440, height: 960 });

  await page.goto('http://localhost:3000', { waitUntil: 'networkidle0' });
  await page.waitForFunction(() => !document.getElementById('database-loading-guard'), { timeout: 15000 });

  const skipBtn = await page.$('#skip-onboarding-btn');
  if (skipBtn) {
    await skipBtn.click();
    await page.waitForSelector('#nav-map-btn', { timeout: 5000 });
  }

  // Check Level Map displays Unit 1 with new levels
  console.log('Verifying Level Map rendering...');
  await page.waitForSelector('#level-node-1', { timeout: 5000 });
  await page.screenshot({ path: path.join(artifactDir, 'curriculum_map_overhaul.png') });
  console.log('Saved screenshot: curriculum_map_overhaul.png');

  // Click Level 1 to enter Arena
  console.log('Entering Level 1 Arena...');
  await page.click('#level-node-1');
  await page.waitForSelector('#typing-arena-wrapper', { timeout: 5000 });

  // Milestone popup should appear for Level 1
  console.log('Checking Level 1 Milestone Popup...');
  await page.waitForSelector('#milestone-popup-overlay', { timeout: 5000 });
  const milestoneTitle = await page.$eval('#milestone-card h2', el => el.textContent.trim());
  console.log('Level 1 Milestone title displayed:', milestoneTitle);

  await page.screenshot({ path: path.join(artifactDir, 'curriculum_level1_milestone.png') });
  console.log('Saved screenshot: curriculum_level1_milestone.png');

  // Dismiss milestone
  const dismissBtn = await page.waitForSelector('#milestone-got-it-btn', { timeout: 5000 });
  await dismissBtn.click();
  await page.waitForFunction(() => !document.getElementById('milestone-popup-overlay'), { timeout: 5000 });
  await new Promise(r => setTimeout(r, 400));

  // Verify target char is anchor key
  const targetChar = await page.$eval('#target-char-display', el => el.textContent.trim());
  console.log('Level 1 current target char:', targetChar);
  if (targetChar !== 'ف' && targetChar !== 'ژ') {
    throw new Error(`Expected target char to be ف or ژ, got: "${targetChar}"`);
  }

  await page.screenshot({ path: path.join(artifactDir, 'curriculum_level1_arena.png') });
  console.log('Saved screenshot: curriculum_level1_arena.png');

  await browser.close();
  console.log('\n=== All Curriculum Overhaul verification checks PASSED successfully! ===');
}

verifyCurriculum().catch(err => {
  console.error('Verification failed:', err);
  process.exit(1);
});
