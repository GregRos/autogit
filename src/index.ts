import { resolve } from "path"
import { Historian } from "./historian/historian.js"
import { getOptions } from "./options.js"
import cli from "./cli.js"
import yargs from "yargs"
import { hideBin } from "yargs/helpers"

const cliOptions = cli.parseSync()
if (cliOptions.com)
const options = getOptions()

const historian = new Historian({
    cwd: resolve(options.cwd),
    executable: options.git,
    timeZero: options.
})

yargs(hideBin(process.argv))
    .scriptName("autogit")
    .version()
    .usage("$0 <command> [options]")
    .option("dry-run", {
        alias: "d",
        type: "boolean",
        description: "Run in dry-run mode, no changes will be made"
    })
    .command("init", "Initialize autogit in the current directory", yargs => {}, args => {
        
    })
    .command("watch", "Watch the current directory for changes", yargs => {
        return yargs.option("config", {
            alias: "c",
            type: "string",
            description: "Path to the autogit config file",
            default: undefined
        })
    })
    .demandCommand(1, "Please specify a command.")
    .strict()
    .help()
    .alias("help", "h")
