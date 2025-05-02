/**
 * @type {import("esbuild").BuildOptions}
 */

exports.buildCommandLine = [
    "--bundle",
    "--platform=node",
    "--target=node20",
    "--format=esm",
    "--outfile=./publish/autogit.js",
    "--inject:./tools/setup.mjs",
    "--define:require=require",
    "--sourcemap",
    "--minify=false",
    "--banner:js=\"#!/usr/bin/env node\"", // for CLI tools
    "./src/main.ts",

]
