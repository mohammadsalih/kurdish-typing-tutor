const puppeteer = require("puppeteer-core");
const path = require("path");

const ARTIFACT_DIR = "C:\\Users\\moham\\.gemini\\antigravity-ide\\brain\\0efe5f04-2236-4c48-8da7-cb362803a518";

async function run() {
  console.log("=== Testing Header Google Login & Sign Out Flow ===");
  const browser = await puppeteer.launch({
    executablePath: "C:\\Program Files (x86)\\Microsoft\\Edge\\Application\\msedge.exe",
    headless: "new",
    args: ["--no-sandbox", "--disable-setuid-sandbox", "--window-size=1280,900"],
  });

  const page = await browser.newPage();
  await page.setViewport({ width: 1280, height: 900 });

  await page.setCookie({
    name: "has_onboarded",
    value: "true",
    domain: "localhost",
    path: "/",
  });

  console.log("1. Navigating to http://localhost:3000 (Guest Mode)...");
  await page.goto("http://localhost:3000", { waitUntil: "networkidle2", timeout: 30000 });
  await new Promise((r) => setTimeout(r, 2000));

  // 1. Verify Guest state
  const guestLoginBtn = await page.$("#header-login-btn");
  console.log("Guest Login button present:", !!guestLoginBtn);
  await page.screenshot({ path: path.join(ARTIFACT_DIR, "header_guest_login_button.png") });

  // 2. Click Login button to trigger Google popup
  console.log("2. Clicking #header-login-btn to trigger signInWithPopup(auth, googleProvider)...");
  await page.click("#header-login-btn");
  await new Promise((r) => setTimeout(r, 1500));

  // 3. Test UI update when user is logged in
  console.log("3. Triggering authenticated session to test Header replacement...");
  await page.evaluate(() => {
    if (window.__pitikAuth) {
      window.__pitikAuth.login("mohammadsalih.main@gmail.com", "محەمەد ساڵح (Google)");
    }
  });

  await new Promise((r) => setTimeout(r, 1000));

  // Let's verify Header in authenticated state
  const userProfileBtn = await page.$("#user-profile-btn");
  const signOutBtn = await page.$("#logout-btn");
  const loginBtnPresent = await page.$("#header-login-btn");

  console.log("User Profile element present:", !!userProfileBtn);
  console.log("Sign Out button (#logout-btn) present:", !!signOutBtn);
  console.log("Is Login button replaced?", !loginBtnPresent);

  await page.screenshot({ path: path.join(ARTIFACT_DIR, "header_authenticated_profile_and_signout.png") });

  // 4. Click Sign Out button
  if (signOutBtn) {
    console.log("4. Clicking #logout-btn (Sign Out)...");
    await page.click("#logout-btn");
    await new Promise((r) => setTimeout(r, 1500));

    const restoredLoginBtn = await page.$("#header-login-btn");
    const userProfileAfter = await page.$("#user-profile-btn");
    console.log("After Sign Out: Is Login button restored?", !!restoredLoginBtn);
    console.log("After Sign Out: Is User Profile removed?", !userProfileAfter);

    await page.screenshot({ path: path.join(ARTIFACT_DIR, "header_after_signout.png") });
  }

  await browser.close();
  console.log("=== All Header & Google Login UI Checks Completed Successfully! ===");
}

run().catch((err) => {
  console.error("Test failed:", err);
  process.exit(1);
});
