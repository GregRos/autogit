const { buildCommandLine } = require("./build-options.cjs");
const { exec } = require("shelljs")
exec(`esbuild ${buildCommandLine.join(" ")}`, {
    shell: true
})

