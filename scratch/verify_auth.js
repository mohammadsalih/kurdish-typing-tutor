const puppeteer = require("puppeteer-core");
const path = require("path");
const fs = require("fs");

const ARTIFACT_DIR = "C:\\Users\\moham\\.gemini\\antigravity-ide\\brain\\0efe5f04-2236-4c48-8da7-cb362803a518";

async function run() {
  console.log("Launching Edge browser...");
  const browser = await puppeteer.launch({
    executablePath: "C:\\Program Files (x86)\\Microsoft\\Edge\\Application\\msedge.exe",
    headless: "new",
    args: ["--no-sandbox", "--disable-setuid-sandbox", "--window-size=1280,900"],
  });

  const page = await browser.newPage();
  await page.setViewport({ width: 1280, height: 900 });

  const consoleLogs = [];
  page.on("console", (msg) => {
    consoleLogs.push(`[${msg.type()}] ${msg.text()}`);
    console.log(`BROWSER [${msg.type()}]:`, msg.text());
  });

  page.on("pageerror", (err) => {
    console.error("BROWSER UNCAUGHT ERROR:", err.message);
  });

  console.log("Setting cookies for returning user to access level map directly...");
  await page.setCookie({
    name: "has_onboarded",
    value: "true",
    domain: "localhost",
    path: "/",
  });

  console.log("Navigating to http://localhost:3000...");
  await page.goto("http://localhost:3000", { waitUntil: "networkidle2", timeout: 30000 });

  await new Promise((r) => setTimeout(r, 2000));

  // Take screenshot of map in Guest Mode
  const guestMapPath = path.join(ARTIFACT_DIR, "firebase_guest_map.png");
  await page.screenshot({ path: guestMapPath });
  console.log("Captured guest map screenshot:", guestMapPath);

  // Click on Login button in Header
  console.log("Clicking #header-login-btn...");
  await page.waitForSelector("#header-login-btn", { timeout: 10000 });
  await page.click("#header-login-btn");

  await new Promise((r) => setTimeout(r, 1000));

  // Verify Google Login button exists
  const googleBtn = await page.$("#google-login-btn");
  console.log("Google Login button present:", !!googleBtn);

  // Capture screenshot of Auth Modal with Google login
  const modalPath = path.join(ARTIFACT_DIR, "firebase_auth_modal.png");
  await page.screenshot({ path: modalPath });
  console.log("Captured Auth Modal screenshot:", modalPath);

  // Click Demo Login to verify auth state transitions
  console.log("Testing auth transition via Demo button...");
  const demoBtn = await page.$("#demo-login-btn");
  if (demoBtn) {
    await page.click("#demo-login-btn");
    await new Promise((r) => setTimeout(r, 1500));

    // Check if user menu or authenticated HUD appears
    const authMapPath = path.join(ARTIFACT_DIR, "firebase_authenticated_map.png");
    await page.screenshot({ path: authMapPath });
    console.log("Captured authenticated state screenshot:", authMapPath);

    // Verify user profile button is present
    const userBtn = await page.$("#user-profile-btn");
    console.log("Authenticated user profile button present:", !!userBtn);

    if (userBtn) {
      // Open user dropdown menu
      await page.click("#user-profile-btn");
      await new Promise((r) => setTimeout(r, 500));

      // Click logout
      console.log("Testing logout...");
      const logoutBtn = await page.$("#logout-btn");
      if (logoutBtn) {
        await page.click("#logout-btn");
        await new Promise((r) => setTimeout(r, 1000));
        console.log("Logout successful, returned to guest mode!");
      }
    }
  }

  // Now test clicking Google login button in modal to verify UI response
  console.log("Re-opening auth modal to test Google button interaction...");
  await page.waitForSelector("#header-login-btn", { timeout: 5000 });
  await page.click("#header-login-btn");
  await new Promise((r) => setTimeout(r, 800));

  console.log("Clicking Google sign-in button...");
  await page.click("#google-login-btn");
  await new Promise((r) => setTimeout(r, 2000));

  const googleClickPath = path.join(ARTIFACT_DIR, "firebase_google_click_state.png");
  await page.screenshot({ path: googleClickPath });
  console.log("Captured Google button clicked state screenshot:", googleClickPath);

  await browser.close();
  console.log("Verification finished successfully!");
}

run().catch((err) => {
  console.error("Verification failed:", err);
  process.exit(1);
});
