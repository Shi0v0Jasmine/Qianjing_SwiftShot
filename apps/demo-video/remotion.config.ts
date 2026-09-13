import { Config } from "@remotion/cli/config";
import { existsSync } from "node:fs";
import path from "node:path";
const browser = [
  process.env.SHOTSWIFT_BROWSER,
  process.env.ProgramFiles &&
    path.join(process.env.ProgramFiles, "Google/Chrome/Application/chrome.exe"),
  process.env["ProgramFiles(x86)"] &&
    path.join(
      process.env["ProgramFiles(x86)"],
      "Microsoft/Edge/Application/msedge.exe",
    ),
].find((p) => p && existsSync(p));
if (browser) Config.setBrowserExecutable(browser);
Config.setPublicDir("../web/public");
Config.setVideoImageFormat("jpeg");
Config.setJpegQuality(90);
Config.setOverwriteOutput(true);
