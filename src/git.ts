import dayjs from "dayjs"
import { doddle } from "doddle"
import prettyMs from "pretty-ms"
import { SimpleGit, simpleGit } from "simple-git"
import { FilesDiff } from "./diff/files-diff.js"
import { LinesDiff } from "./diff/lines-diff.js"
import { DiffSummary } from "./diff/summary.js"
import { Roarr } from "./logging/setup.js"
const logger = Roarr.child({
    part: "git"
})

export interface CommitInfo {
    globs: string[] | string
    descriptive: string[]
}
export class Git {
    private _git: SimpleGit
    constructor(
        readonly executable: string,
        readonly cwd: string,
        readonly dryRun = false
    ) {
        this._git = simpleGit({
            baseDir: cwd,
            binary: executable,
            unsafe: {
                allowUnsafeCustomBinary: true
            }
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
            !this.dryRun && (await this._initialCommit())
            logger.debug("Initial commit created")
        }
    }

    async _initialCommit() {
        await this._git.commit("Initial commit", {
            "--allow-empty": null
        })
    }

    async _stageAll(globs: string[] | string) {
        Roarr.debug(
            {
                globs: globs
            },
            "STAGING changes..."
        )
        try {
            !this.dryRun && (await this._git.add(globs))
        } catch (e: any) {
            if (e.message.includes("did not match any files")) {
                return true
            }
            throw e
        }
        return true
    }

    async commitAll(info: CommitInfo) {
        const staged = await this._stageAll(info.globs)
        if (!staged) {
            return
        }
        const message = [...info.descriptive].join(" ┃ ")
        Roarr.info(`COMMITTING « ${message} »`)

        !this.dryRun && (await this._git.commit(message))
    }

    async commitAllTimed(info: CommitInfo) {
        const state = await this._state.pull()
        if (state === "not-repo") {
            Roarr.error("Not a git repository. Run `autogit init` first.")
            return false
        }
        if (state === "empty-repo") {
            Roarr.error("No initial commit found. Run `autogit init` first.")
            return false
        }

        const staged = await this._stageAll(info.globs)
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
        const message = [...info.descriptive, dtString, ...totalDiff.toParts()].join(" ┃ ")
        Roarr.info(`COMMITTING « ${message} »`)

        !this.dryRun && (await this._git.commit(message))
        Roarr.info("All changes commited!")
    }
    #firstCommit = doddle(async () => {
        return this._git.log({
            "--reverse": null
        })
    })
        .map(x => {
            return x?.all[0]
        })
        .catch(e => {
            if (e.message.includes("does not have any commits")) {
                return undefined
            }
            throw e
        })

    #initialDate = doddle(async () => {
        const initialCommit = await this.#firstCommit.pull()
        logger.info(
            {
                hash: initialCommit?.hash,
                date: initialCommit?.date
            },
            "Initial commit found"
        )
        if (!initialCommit) {
            return undefined
        }
        return dayjs(initialCommit.date)
    })
}
