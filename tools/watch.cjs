const { buildCommandLine } = require("./build-options.cjs");
const { exec } = require("shelljs")
exec(`esbuild --watch ${buildCommandLine.join(" ")}`, {
    shell: true
})
