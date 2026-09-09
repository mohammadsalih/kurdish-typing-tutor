const fs = require("fs");
const path = require("path");

const userDir = process.env.USERPROFILE;

function searchDir(dir, depth = 0) {
  if (depth > 6) return;
  try {
    const entries = fs.readdirSync(dir, { withFileTypes: true });
    for (const ent of entries) {
      if (ent.isDirectory()) {
        const name = ent.name.toLowerCase();
        if (
          name === "node_modules" ||
          name === ".git" ||
          name === "cache" ||
          name === "temp" ||
          name === "crashpad"
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
          name.endsWith(".log")
        ) {
          const filePath = path.join(dir, ent.name);
          try {
            const stat = fs.statSync(filePath);
            if (stat.size > 0 && stat.size < 5 * 1024 * 1024) {
              const content = fs.readFileSync(filePath, "latin1");
              if (content.includes("kurdish-keyboard-42230")) {
                if (!filePath.includes("kurdish keyboard project")) {
                  console.log("\nFOUND MATCH IN APPDATA:", filePath);
                }
              }
            }
          } catch {}
        }
      }
    }
  } catch {}
}

console.log("Searching in AppData/Roaming and AppData/Local...");
searchDir(path.join(userDir, "AppData", "Roaming"));
searchDir(path.join(userDir, "AppData", "Local", "Google"));
searchDir(path.join(userDir, "AppData", "Local", "Programs"));
console.log("Finished searching AppData.");
