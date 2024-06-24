import * as esbuild from "esbuild";
import fs from "fs";

(async () => {
  if (!fs.existsSync("../builds")) {
    fs.mkdirSync("../builds");
  }
  if (!fs.existsSync("../builds/server")) {
    fs.mkdirSync("../builds/server");
  }
  // copy env file
  fs.copyFileSync("./.env", "../builds/server/.env");

  await esbuild.build({
    entryPoints: ["./src/server.ts"],
    bundle: true,
    minify: false,
    sourcemap: true,
    platform: "node",
    outdir: "../builds/server",
    external: ["sqlite3"],
  });
  console.log("ESBuild Build complete");
})()

