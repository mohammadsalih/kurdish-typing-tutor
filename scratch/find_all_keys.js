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
        } else if (stat.size < 20 * 1024 * 1024) {
          fileList.push(filePath);
        }
      } catch {}
    }
  } catch {}
  return fileList;
}

const allFiles = walkDir(edgeDataDir);
const foundKeys = new Set();

for (const f of allFiles) {
  try {
    const content = fs.readFileSync(f, "latin1");
    const matches = content.match(/AIzaSy[a-zA-Z0-9_\-]{33}/g);
    if (matches) {
      for (const m of matches) {
        if (!m.includes("DummyDevKey")) {
          foundKeys.add(m);
          console.log(`Key ${m} found in ${path.basename(f)}`);
        }
      }
    }
  } catch {}
}

console.log("All unique API keys found:", Array.from(foundKeys));
