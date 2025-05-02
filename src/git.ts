import dayjs from "dayjs"
import { doddle } from "doddle"
import prettyMs from "pretty-ms"
import { SimpleGit, simpleGit } from "simple-git"
import { FilesDiff } from "./historian/diff/files-diff.js"
import { LinesDiff } from "./historian/diff/lines-diff.js"
import { DiffSummary } from "./historian/diff/summary.js"
import { Roarr } from "./logging/setup.js"
const logger = Roarr.child({
    part: "git"
})
export class Git {
    private _git: SimpleGit
    constructor(
        readonly executable: string,
        readonly cwd: string,
        readonly dryRun = false
    ) {
        this._git = simpleGit({
            baseDir: cwd,
            binary: executable
        })
    }

    async currentDiff() {
        const linesInfo = LinesDiff.fromDiffResult(await this._git.diffSummary(["--staged"]))
        const statusInfo = FilesDiff.fromStatusResult(await this._git.status())
        const totalDiff = new DiffSummary(statusInfo, linesInfo)
        return totalDiff
    }

    private _state = doddle(async () => {
        if (!(await this._git.checkIsRepo())) {
            return "not-repo"
        }
        if (!(await this.#firstCommit.pull())) {
            return "empty-repo"
        }
        return "okay"
    })

    async init() {
        const state = await this._state.pull()
        if (state === "not-repo") {
            logger.debug("Initializing git repository...")
            !this.dryRun && (await this._git.init())
        }
        if (state !== "okay") {
            logger.debug("No commits found, creating initial commit...")
            !this.dryRun && (await this.commitAll("Initial commit"))
        }
    }

    async _stageAll() {
        Roarr.debug("STAGING all changes...")
        !this.dryRun && (await this._git.add("."))
        return true
    }

    async commitAll(...descriptive: string[]) {
        const staged = await this._stageAll()
        if (!staged) {
            return
        }
        const message = [...descriptive].join(" ┃ ")
        Roarr.info(`COMMITTING « ${message} »`)

        !this.dryRun && (await this._git.commit(message))
    }

    async commitAllTimed(...descriptive: string[]) {
        const state = await this._state.pull()
        if (state === "not-repo") {
            Roarr.error("Not a git repository. Run `autogit init` first.")
            return false
        }
        if (state === "empty-repo") {
            Roarr.error("No initial commit found. Run `autogit init` first.")
            return false
        }

        const staged = await this._stageAll()
        if (!staged) {
            return
        }
        const dtString = prettyMs(dayjs().diff(await this.#initialDate.pull()), {
            secondsDecimalDigits: 0
        })

        const totalDiff = await this.currentDiff()
        if (totalDiff.isEmpty) {
            Roarr.warn("NO CHANGES to commit")
            return
        }
        const message = [...descriptive, dtString, ...totalDiff.toParts()].join(" ┃ ")
        Roarr.info(`COMMITTING « ${message} »`)

        !this.dryRun && (await this._git.commit(message))
        Roarr.info("All changes commited!")
    }
    #firstCommit = doddle(async () => {
        return this._git.log({
            "--reverse": null,
            "--max-count": 1
        })
    })
        .map(x => x?.all[0])
        .catch(e => {
            if (e.message.includes("does not have any commits")) {
                return undefined
            }
            throw e
        })

    #initialDate = doddle(async () => {
        const initialCommit = await this.#firstCommit.pull()
        if (!initialCommit) {
            return undefined
        }
        return dayjs(initialCommit.date)
    })
}
