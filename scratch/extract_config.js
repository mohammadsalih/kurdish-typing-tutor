const fs = require("fs");
const path = require("path");

const tempPath = path.join(process.env.TEMP, "EdgeHistoryCopy.db");
const buf = fs.readFileSync(tempPath);
const str = buf.toString("latin1");

const target = "kurdish-keyboard-42230";
let idx = 0;
while ((idx = str.indexOf(target, idx)) !== -1) {
  const start = Math.max(0, idx - 200);
  const end = Math.min(str.length, idx + 400);
  console.log("--- FOUND CONTEXT ---");
  console.log(str.slice(start, end).replace(/[^\x20-\x7E\r\n]/g, " "));
  idx += target.length;
}

const keyTarget = "AIzaSyDhjcmUX87_gjbJZTCbka3yxmG7_265wtU";
let keyIdx = 0;
while ((keyIdx = str.indexOf(keyTarget, keyIdx)) !== -1) {
  const start = Math.max(0, keyIdx - 200);
  const end = Math.min(str.length, keyIdx + 400);
  console.log("--- FOUND KEY CONTEXT ---");
  console.log(str.slice(start, end).replace(/[^\x20-\x7E\r\n]/g, " "));
  keyIdx += keyTarget.length;
}
