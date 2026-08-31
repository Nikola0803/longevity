/**
 * Zips wp-plugin/command-center-connector into
 * public/downloads/command-center-connector.zip, so the Webhooks page can
 * just link straight to a static file instead of needing an API route to
 * stream it. Runs automatically before `next build` (see package.json).
 */
import { execSync } from "child_process";
import { existsSync, mkdirSync } from "fs";
import path from "path";

const root = path.resolve(__dirname, "..");
const pluginDir = path.join(root, "wp-plugin");
const outDir = path.join(root, "public", "downloads");
const outFile = path.join(outDir, "command-center-connector.zip");

if (!existsSync(outDir)) {
  mkdirSync(outDir, { recursive: true });
}

// Non-fatal: some build environments (Vercel's build container included, in
// some cases) don't have the `zip` binary. Losing the WordPress plugin
// download is not worth failing the whole deploy over — the Webhooks page
// just won't offer that download until this runs successfully somewhere
// that has `zip`.
try {
  if (!existsSync(pluginDir)) {
    console.log("wp-plugin/ not found, skipping plugin zip.");
  } else {
    execSync(`cd "${pluginDir}" && zip -r -q -X "${outFile}" command-center-connector -x '**/.DS_Store'`, {
      stdio: "inherit",
    });
    console.log(`Plugin zipped to ${path.relative(root, outFile)}`);
  }
} catch (err) {
  console.warn("Skipping plugin zip (zip command unavailable or failed):", err instanceof Error ? err.message : err);
}
