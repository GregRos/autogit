const { buildCommandLine } = require("./build-options.js");
const { exec } = require("shelljs")
exec(`esbuild ${buildCommandLine.join(" ")}`, {
    shell: true
})
