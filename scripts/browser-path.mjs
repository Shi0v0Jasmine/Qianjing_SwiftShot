import { existsSync } from "node:fs";
import path from "node:path";
export const browserExecutable = [
  process.env.SHOTSWIFT_BROWSER,
  process.env.ProgramFiles &&
    path.join(process.env.ProgramFiles, "Google/Chrome/Application/chrome.exe"),
  process.env["ProgramFiles(x86)"] &&
    path.join(
      process.env["ProgramFiles(x86)"],
      "Microsoft/Edge/Application/msedge.exe",
    ),
].find((p) => p && existsSync(p));
