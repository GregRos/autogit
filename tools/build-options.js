/**
 * @type {import("esbuild").BuildOptions}
 */

exports.buildCommandLine = [
    "--bundle",
    "--platform=node",
    "--target=node20",
    "--format=cjs",
    "--outfile=./publish/autogit.js",
    "--sourcemap",
    "--minify=false",
    "--banner:js=\"#!/usr/bin/env node\"", // for CLI tools
    "./src/main.ts",

]
