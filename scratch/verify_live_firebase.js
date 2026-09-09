const puppeteer = require("puppeteer-core");
const path = require("path");

const ARTIFACT_DIR = "C:\\Users\\moham\\.gemini\\antigravity-ide\\brain\\0efe5f04-2236-4c48-8da7-cb362803a518";

async function run() {
  console.log("=== Testing Real Live Firebase Config (kurdish-keyboard-42230) ===");
  const browser = await puppeteer.launch({
    executablePath: "C:\\Program Files (x86)\\Microsoft\\Edge\\Application\\msedge.exe",
    headless: "new",
    args: ["--no-sandbox", "--disable-setuid-sandbox", "--window-size=1280,900"],
  });

  const page = await browser.newPage();
  await page.setViewport({ width: 1280, height: 900 });

  page.on("console", (msg) => {
    console.log(`PAGE [${msg.type()}]:`, msg.text());
  });

  page.on("pageerror", (err) => {
    console.error("PAGE ERROR:", err.message);
  });

  await page.setCookie({
    name: "has_onboarded",
    value: "true",
    domain: "localhost",
    path: "/",
  });

  console.log("Navigating to http://localhost:3000...");
  await page.goto("http://localhost:3000", { waitUntil: "networkidle2", timeout: 30000 });
  await new Promise((r) => setTimeout(r, 2000));

  // Open Auth Modal
  console.log("Opening Auth Modal...");
  await page.waitForSelector("#header-login-btn", { timeout: 5000 });
  await page.click("#header-login-btn");
  await new Promise((r) => setTimeout(r, 1000));

  // Verify Google button exists
  const googleBtn = await page.$("#google-login-btn");
  console.log("Google Login button present:", !!googleBtn);

  // Click Google button to trigger popup flow with real credentials
  console.log("Clicking Google sign-in button with real project keys...");
  await page.click("#google-login-btn");
  await new Promise((r) => setTimeout(r, 3000));

  const liveConfigScreenshot = path.join(ARTIFACT_DIR, "live_firebase_login_flow.png");
  await page.screenshot({ path: liveConfigScreenshot });
  console.log("Captured live config test screenshot:", liveConfigScreenshot);

  await browser.close();
  console.log("Live config verification complete!");
}

run().catch((err) => {
  console.error("Test failed:", err);
  process.exit(1);
});
