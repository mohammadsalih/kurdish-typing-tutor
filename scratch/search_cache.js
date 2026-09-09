const fs = require("fs");
const path = require("path");

const cacheDir = path.join(process.env.LOCALAPPDATA, "Microsoft", "Edge", "User Data", "Default", "Cache", "Cache_Data");

try {
  const files = fs.readdirSync(cacheDir);
  console.log(`Searching in ${files.length} cache files...`);
  for (const f of files) {
    if (f.startsWith("f_")) {
      const full = path.join(cacheDir, f);
      try {
        const buf = fs.readFileSync(full);
        if (buf.includes("kurdish-keyboard-42230")) {
          console.log("\nFOUND IN CACHE FILE:", f);
          const str = buf.toString("latin1");
          let idx = 0;
          while ((idx = str.indexOf("kurdish-keyboard-42230", idx)) !== -1) {
            const start = Math.max(0, idx - 400);
            const end = Math.min(str.length, idx + 800);
            console.log("CACHE SNIPPET:\n", str.slice(start, end).replace(/[^\x20-\x7E\r\n]/g, " "));
            idx += 22;
          }
        }
      } catch {}
    }
  }
} catch (e) {
  console.error("Cache error:", e.message);
}
