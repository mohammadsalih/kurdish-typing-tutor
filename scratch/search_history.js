const fs = require("fs");
const path = require("path");

const historyPath = path.join(process.env.LOCALAPPDATA, "Microsoft", "Edge", "User Data", "Default", "History");
const tempPath = path.join(process.env.TEMP, "EdgeHistoryCopy.db");

try {
  fs.copyFileSync(historyPath, tempPath);
  const buf = fs.readFileSync(tempPath);
  const str = buf.toString("latin1"); // fast decode

  const matches = str.match(/console\.firebase\.google\.com\/project\/[a-zA-Z0-9_\-]+/g) || [];
  const uniqueMatches = [...new Set(matches)];
  console.log("Firebase console project matches:", uniqueMatches);

  const kurdishMatches = str.match(/kurdish[a-zA-Z0-9_\-]*/gi) || [];
  console.log("Kurdish matches:", [...new Set(kurdishMatches)].slice(0, 20));

  const apiKeyMatches = str.match(/AIza[a-zA-Z0-9_\-]{35}/g) || [];
  console.log("API Key matches:", [...new Set(apiKeyMatches)]);
} catch (e) {
  console.error("Error reading history:", e.message);
}
