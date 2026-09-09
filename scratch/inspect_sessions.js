const fs = require("fs");
const path = require("path");

const sessionsDir = path.join(process.env.LOCALAPPDATA, "Microsoft", "Edge", "User Data", "Default", "Sessions");
const files = fs.readdirSync(sessionsDir);

for (const file of files) {
  const filePath = path.join(sessionsDir, file);
  try {
    const buf = fs.readFileSync(filePath);
    const str = buf.toString("latin1");
    console.log(`\n=== File: ${file} (${buf.length} bytes) ===`);
    
    // Check for firebase URLs
    const urls = str.match(/https?:\/\/[a-zA-Z0-9_\-\.\:\/%\?=&#]+/g) || [];
    const firebaseUrls = urls.filter(u => u.includes("firebase") || u.includes("google.com") || u.includes("localhost"));
    const unique = [...new Set(firebaseUrls)];
    console.log("Found URLs:", unique.slice(0, 15));

    // Check for kurdish-keyboard
    let idx = 0;
    while ((idx = str.indexOf("kurdish-keyboard", idx)) !== -1) {
      const start = Math.max(0, idx - 100);
      const end = Math.min(str.length, idx + 200);
      console.log("Context around kurdish-keyboard:\n", str.slice(start, end).replace(/[^\x20-\x7E\r\n]/g, " "));
      idx += 16;
    }
  } catch (err) {
    console.error(err.message);
  }
}
