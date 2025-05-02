/* prettier-ignore-start */
process.env.ROARR_LOG = "true"
import { dump } from "js-yaml"
import { writeFile } from "node:fs/promises"
import { yamprint } from "yamprint"
import yargs from "yargs"
import { hideBin } from "yargs/helpers"
import { Git } from "./git.js"
import { Roarr } from "./logging/setup.js"
import { defaultOptions, loadConfig } from "./options.js"
import { createTimer } from "./timing.js"
import { LabeledTime } from "./utils/labeled-time.js"

Roarr.debug("Sound check 1-2-1-2")
yargs(hideBin(process.argv))
    .scriptName("autogit")
    .version((globalThis as any).__VERSION__)
    .usage("$0 <command> [options]")
    .option("dry-run", {
        alias: "D",
        type: "boolean",
        description: "Run in dry-run mode, no changes will be made"
    })
    .option("git", {
        alias: "g",
        type: "string",
        description: "Path to the git executable",
        default: "git"
    })
    .option("dir", {
        alias: "d",
        type: "string",
        description: "Path to the directory to watch",
        default: "."
    })
    .command(
        "config",
        "Show the autogit config file",
        yargs => {},
        async args => {
            const config = loadConfig({
                cwd: args.dir
            })
            console.log(yamprint(config))
        }
    )
    .command(
        "init",
        "Initialize autogit in the current directory",
        yargs => {},
        async args => {
            const configName = "./.autogitrc.yml"
            const git = new Git(args.git, args.dir, args.dryRun)
            await git.init()
            Roarr.debug(`Creating autogit config file... ${configName}`)
            try {
                loadConfig({
                    cwd: args.dir
                })
            } catch (e) {
                Roarr.debug("Error locating config file, will create a new one %s", e as any)
                await writeFile(configName, dump(defaultOptions), "utf8")
                await git.commitAll("AUTOGIT CONFIG")
            }
        }
    )
    .command(
        "watch",
        "Watch the current directory for changes",
        yargs => {
            return yargs
                .option("config", {
                    alias: "c",
                    type: "string",
                    description: "Path to the autogit config file",
                    requiresArg: false
                })
                .option("every", {
                    alias: "e",
                    type: "string",
                    description: "Interval to run the autogit command",
                    requiresArg: false
                })
                .option("immediately", {
                    alias: "i",
                    type: "boolean",
                    description: "Immediately commit if there are changes",
                    requiresArg: false
                })
        },
        async args => {
            const config = loadConfig({
                cwd: args.dir,
                every: args.every ? new LabeledTime(args.every) : undefined,
                immediately: args.immediately
            })
            const git = new Git(args.git, config.cwd, args.dryRun)

            createTimer({
                interval: config.every,
                immediately: config.immediately
            }).subscribe(async n => {
                await git.commitAllTimed("Autogit commit")
            })
        }
    )
    .demandCommand(1, "Please specify a command.")
    .strictCommands()
    .strict()
    .help()
    .alias("help", "h")
    .parse()
