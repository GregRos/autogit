import dayjs, { type Dayjs } from "dayjs"
import { default as prettyMilliseconds, default as prettyMs } from "pretty-ms"
import { SimpleGit, simpleGit } from "simple-git"
import { DiffSummary, FilesDiff, LinesDiff } from "./commit-info.js"
import { Roarr } from "./setup.js"

export interface BackupHistoryIntervalRequest {
    type: "interval"
    interval: number
}

export interface BackupHistoryExplicitRequest {
    type: "explicit"
}

export type BackupHistoryRequest = BackupHistoryIntervalRequest | BackupHistoryExplicitRequest

function getRequestPrefix(request: BackupHistoryRequest) {
    switch (request.type) {
        case "interval":
            return ["🤖⏰", prettyMilliseconds(request.interval)].join("")
        case "explicit":
            return "⚡"
    }
}
const timeZero = dayjs(1728747066476)

export function getDateTimeString(timestamp: Dayjs) {
    return prettyMs(timestamp.diff(timeZero), {
        secondsDecimalDigits: 0
    })
}

export class VaultChecker {
    private git: SimpleGit

    constructor(dir: string) {
        this.git = simpleGit({
            baseDir: dir
        })
    }

    async backupHistory(request: BackupHistoryRequest) {
        Roarr.info(`RECEIVED %s backupHistory command.`, request.type)
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
            getRequestPrefix(request),
            getDateTimeString(dayjs()),
            ...totalDiff.toParts()
        ].join(" ┃ ")
        Roarr.info(`COMMITTING « ${message} »`)

        await this.git.commit(message)
        Roarr.info("All changes commited!")
    }
}
;``
