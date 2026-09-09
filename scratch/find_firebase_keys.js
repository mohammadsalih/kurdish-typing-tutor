const fs = require("fs");
const path = require("path");

const edgeDataDir = path.join(process.env.LOCALAPPDATA, "Microsoft", "Edge", "User Data");

function walkDir(dir, fileList = []) {
  try {
    const files = fs.readdirSync(dir);
    for (const file of files) {
      const filePath = path.join(dir, file);
      try {
        const stat = fs.statSync(filePath);
        if (stat.isDirectory()) {
          if (!file.includes("Crashpad") && !file.includes("BrowserMetrics")) {
            walkDir(filePath, fileList);
          }
        } else if (stat.size < 50 * 1024 * 1024) { // < 50MB
          fileList.push(filePath);
        }
      } catch {}
    }
  } catch {}
  return fileList;
}

console.log("Gathering candidate files in Edge user data...");
const allFiles = walkDir(edgeDataDir);
console.log(`Found ${allFiles.length} files. Searching for 'kurdish-keyboard-42230'...`);

for (const f of allFiles) {
  try {
    const buf = fs.readFileSync(f);
    if (buf.includes("kurdish-keyboard-42230")) {
      console.log("\n>>> MATCH FOUND IN:", f);
      const str = buf.toString("latin1");
      let idx = 0;
      while ((idx = str.indexOf("kurdish-keyboard-42230", idx)) !== -1) {
        const start = Math.max(0, idx - 300);
        const end = Math.min(str.length, idx + 500);
        console.log("Snippet:");
        console.log(str.slice(start, end).replace(/[^\x20-\x7E\r\n]/g, " "));
        idx += 22;
      }
    }
  } catch {}
}
