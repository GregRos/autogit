import dayjs, { type Dayjs } from "dayjs"
import { default as prettyMs } from "pretty-ms"
import { SimpleGit, simpleGit } from "simple-git"
import { Roarr } from "../logging/setup.js"
import { FilesDiff } from "./diff/files-diff.js"
import { LinesDiff } from "./diff/lines-diff.js"
import { DiffSummary } from "./diff/summary.js"

export interface HistorianOptions {
    executable: string
    cwd: string
}
const logger = Roarr.child({
    part: "historian"
})

export class Historian {
    private git: SimpleGit

    constructor(private _options: HistorianOptions) {
        logger.debug(
            {
                executable: _options.executable,
                cwd: _options.cwd,
                timeZero: _options.timeZero.toISOString()
            },
            "Created Historian instance with options"
        )
        this.git = simpleGit({
            baseDir: _options.cwd,
            binary: _options.executable
        })
    }

    private _getDateTimeString(timestamp: Dayjs) {
        return prettyMs(timestamp.diff(this._options.timeZero), {
            secondsDecimalDigits: 0
        })
    }

    async commit(descriptive: string[]) {
        Roarr.debug("STAGING all changes...")
        await this.git.add(".")
        const linesInfo = LinesDiff.fromDiffResult(await this.git.diffSummary(["--staged"]))
        const statusInfo = FilesDiff.fromStatusResult(await this.git.status())
        const totalDiff = new DiffSummary(statusInfo, linesInfo)
        if (totalDiff.isEmpty) {
            Roarr.warn("NO CHANGES to commit")
            return
        }
        const message = [
            descriptive,
            this._getDateTimeString(dayjs()),
            ...totalDiff.toParts()
        ].join(" ┃ ")
        Roarr.info(`COMMITTING « ${message} »`)

        await this.git.commit(message)
        Roarr.info("All changes commited!")
    }
}
;``
