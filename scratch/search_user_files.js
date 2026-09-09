const fs = require("fs");
const path = require("path");

const userDir = process.env.USERPROFILE;
console.log("Searching in:", userDir);

function searchDir(dir, depth = 0) {
  if (depth > 5) return;
  try {
    const entries = fs.readdirSync(dir, { withFileTypes: true });
    for (const ent of entries) {
      if (ent.isDirectory()) {
        const name = ent.name.toLowerCase();
        if (
          name === "node_modules" ||
          name === ".git" ||
          name === "cache" ||
          name === "cachedir" ||
          name === "temp"
        )
          continue;
        searchDir(path.join(dir, ent.name), depth + 1);
      } else {
        const name = ent.name.toLowerCase();
        if (
          name.endsWith(".json") ||
          name.endsWith(".txt") ||
          name.endsWith(".env") ||
          name.endsWith(".js") ||
          name.endsWith(".ts") ||
          name.endsWith(".xml") ||
          name.endsWith(".html") ||
          name.includes("firebase") ||
          name.includes("google")
        ) {
          const filePath = path.join(dir, ent.name);
          try {
            const stat = fs.statSync(filePath);
            if (stat.size > 0 && stat.size < 5 * 1024 * 1024) {
              const content = fs.readFileSync(filePath, "latin1");
              if (content.includes("kurdish-keyboard-42230")) {
                console.log("\nFOUND MATCH IN:", filePath);
                let idx = 0;
                while ((idx = content.indexOf("kurdish-keyboard-42230", idx)) !== -1) {
                  const s = Math.max(0, idx - 150);
                  const e = Math.min(content.length, idx + 300);
                  console.log(content.slice(s, e).replace(/[^\x20-\x7E\r\n]/g, " "));
                  idx += 22;
                }
              }
            }
          } catch {}
        }
      }
    }
  } catch {}
}

searchDir(path.join(userDir, "Desktop"));
searchDir(path.join(userDir, "Downloads"));
searchDir(path.join(userDir, "Documents"));
console.log("Done checking Desktop, Downloads, Documents.");
