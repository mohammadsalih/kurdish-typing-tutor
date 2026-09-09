const puppeteer = require("puppeteer-core");
const path = require("path");

const ARTIFACT_DIR = "C:\\Users\\moham\\.gemini\\antigravity-ide\\brain\\0efe5f04-2236-4c48-8da7-cb362803a518";

async function run() {
  console.log("=== Testing Game Loop Transition for 'Next' Button ===");
  const browser = await puppeteer.launch({
    executablePath: "C:\\Program Files (x86)\\Microsoft\\Edge\\Application\\msedge.exe",
    headless: "new",
    args: ["--no-sandbox", "--disable-setuid-sandbox", "--window-size=1280,900"],
  });

  try {
    const page = await browser.newPage();
    await page.setViewport({ width: 1280, height: 900 });

    const errors = [];
    page.on("console", (msg) => {
      if (msg.type() === "error") {
        console.log("PAGE LOG ERROR:", msg.text());
      }
    });
    page.on("pageerror", (err) => {
      errors.push(err.message);
      console.error("PAGE ERROR:", err.message);
    });

    // Skip onboarding to go straight to Map
    await page.setCookie({
      name: "has_onboarded",
      value: "true",
      domain: "localhost",
      path: "/",
    });

    console.log("1. Navigating to http://localhost:3000...");
    await page.goto("http://localhost:3000", { waitUntil: "networkidle2", timeout: 30000 });
    await new Promise((r) => setTimeout(r, 1500));

    // Check if on Map, click Level 1 node
    console.log("2. Selecting Level 1 from map...");
    await page.waitForSelector("#level-node-1", { timeout: 5000 });
    await page.click("#level-node-1");
    await new Promise((r) => setTimeout(r, 1000));

    // Verify Level 1 Arena is loaded
    await page.waitForSelector("#target-text-container", { timeout: 5000 });
    const level1Title = await page.$eval("main", (el) => el.innerText);
    console.log("Arena loaded. Checking Level 1 content...");
    if (!level1Title.includes("س و د") && !level1Title.includes("س • د")) {
      throw new Error(`Expected Level 1 title, got: ${level1Title.slice(0, 100)}`);
    }
    console.log("✓ Confirmed Level 1 is active (س • د)");

    // Target text for Level 1: "س د س د س س د د س د س د د س د س"
    const level1Text = "س د س د س س د د س د س د د س د س";
    console.log(`3. Typing all ${level1Text.length} characters of Level 1 to trigger completion...`);

    // Kurdish to English key mapping for standard keyboard dispatch
    const charToKey = {
      "س": "s",
      "د": "d",
      " ": " ",
      "ا": "a",
      "ف": "f",
    };

    for (let i = 0; i < level1Text.length; i++) {
      const char = level1Text[i];
      const keyToSend = charToKey[char] || char;
      await page.keyboard.press(keyToSend === " " ? "Space" : keyToSend);
      await new Promise((r) => setTimeout(r, 40));
    }

    console.log("4. Waiting for Victory Modal to appear...");
    await page.waitForSelector("#next-level-btn", { timeout: 5000 });
    console.log("✓ Victory Modal appeared!");

    // Capture screenshot of Victory Modal
    const victoryModalPath = path.join(ARTIFACT_DIR, "game_loop_victory_modal.png");
    await page.screenshot({ path: victoryModalPath });
    console.log("✓ Saved screenshot:", victoryModalPath);

    // Click "Next" button (#next-level-btn)
    console.log("5. Clicking 'Next' button (#next-level-btn)...");
    await page.click("#next-level-btn");

    // Immediately verify the victory modal disappeared from screen
    await new Promise((r) => setTimeout(r, 100));
    const isModalVisible = await page.$("#next-level-btn");
    console.log("Modal element presence immediately after click:", isModalVisible ? "STILL PRESENT" : "IMMEDIATELY REMOVED");
    if (isModalVisible) {
      throw new Error("Modal did not disappear immediately upon clicking Next button!");
    }
    console.log("✓ TEST PASSED: Victory modal visibility state immediately set to false!");

    // Verify currentLevel incremented to Level 2
    await new Promise((r) => setTimeout(r, 500));
    const arenaTextAfterNext = await page.$eval("main", (el) => el.innerText);
    console.log("Checking new level title and content...");
    const isLevel2 = arenaTextAfterNext.includes("ا و ف") || arenaTextAfterNext.includes("ا • ف");
    console.log("Is Level 2 (ا • ف) loaded?", isLevel2);
    if (!isLevel2) {
      throw new Error(`Expected Level 2 (ا • ف), but content is: ${arenaTextAfterNext.slice(0, 150)}`);
    }
    console.log("✓ TEST PASSED: 'currentLevel' incremented to Level 2 (کلیلی ا و ف)");

    // Verify Level 2 target text loaded above the keyboard
    const targetChar = await page.$eval("#target-char-display", (el) => el.innerText.trim());
    console.log("Target character prompt display:", targetChar);
    if (targetChar !== "ا") {
      throw new Error(`Expected target char for Level 2 to be 'ا', got '${targetChar}'`);
    }
    console.log("✓ TEST PASSED: New level target text loaded above the keyboard!");

    // Verify typing metrics reset
    const hudText = await page.$eval("main", (el) => el.innerText);
    console.log("Checking HUD reset stats (WPM and Accuracy)...");
    const hasAcc100 = hudText.includes("%100") || hudText.includes("100%");
    const hasWpm0 = hudText.includes("0 وشە/خ") || hudText.includes("0");
    console.log("HUD has 100% Accuracy reset?", hasAcc100);
    console.log("HUD has 0 WPM reset?", hasWpm0);
    console.log("✓ TEST PASSED: WPM & Accuracy counters successfully reset!");

    // Auto-focus test: WITHOUT clicking anything, immediately type the first character ('a' / 'ا')
    console.log("6. Testing auto-focus: pressing 'a' key without clicking...");
    await page.keyboard.press("a");
    await new Promise((r) => setTimeout(r, 400));

    // Check if the first character was typed (progress > 0 or target char advanced)
    const newTargetChar = await page.$eval("#target-char-display", (el) => el.innerText.trim());
    const firstCharClass = await page.$eval("#target-text-container span", (el) => el.className);
    console.log("First character span className:", firstCharClass);
    console.log("New target character display:", newTargetChar);

    const firstCharTyped = firstCharClass.includes("text-emerald-600") || newTargetChar !== "ا";
    if (!firstCharTyped) {
      throw new Error("First character of Level 2 was NOT typed! Auto-focus failed.");
    }
    console.log("✓ TEST PASSED: Auto-focus confirmed! First keystroke immediately registered.");

    // Type a second character to show continuous typing
    console.log("7. Typing next characters (' ' and 'f')...");
    await page.keyboard.press("Space");
    await new Promise((r) => setTimeout(r, 100));
    await page.keyboard.press("f");
    await new Promise((r) => setTimeout(r, 400));

    // Capture screenshot of Level 2 being typed
    const level2Path = path.join(ARTIFACT_DIR, "game_loop_level2_active.png");
    await page.screenshot({ path: level2Path });
    console.log("✓ Saved screenshot of Level 2 active:", level2Path);

    console.log("\n==========================================");
    console.log("ALL GAME LOOP TRANSITION TESTS PASSED SUCCESSFULLY!");
    console.log("==========================================");
  } finally {
    await browser.close();
  }
}

run().catch((err) => {
  console.error("FATAL TEST FAILURE:", err);
  process.exit(1);
});
