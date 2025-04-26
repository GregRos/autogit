import { seq } from "doddle"
import type { DiffResult, StatusResult } from "simple-git"

export class FilesDiff {
    constructor(
        readonly added: number,
        readonly removed: number
    ) {}

    toString() {
        const { added, removed } = this
        if (this.isEmpty) {
            return "🗃️ ±0F"
        }
        return [`🗃️ ±${added + removed}F`, `+${added}F -${removed}F`].join(" : ")
    }

    static fromStatusResult(status: StatusResult) {
        const files = seq(status.files)
        const modified = files
            .filter(x => x.index === "M")
            .count()
            .pull()
        const added = files
            .filter(x => x.index === "A")
            .count()
            .pull()
        const removed = files
            .filter(x => x.index === "D")
            .count()
            .pull()
        return new FilesDiff(added, removed)
    }

    get isEmpty() {
        return this.added === 0 && this.removed === 0
    }
}

export class LinesDiff {
    constructor(
        readonly added: number,
        readonly removed: number
    ) {}

    toString() {
        const { added, removed } = this
        if (this.isEmpty) {
            return "📝 ±0L"
        }
        return [`📝 ±${added + removed}L`, `+${added}L   -${removed}L`].join(" : ")
    }

    get isEmpty() {
        return this.added === 0 && this.removed === 0
    }

    static fromDiffResult(summary: DiffResult) {
        const files = seq(summary.files).filter(x => x.binary === false)
        const insertions = files.sumBy(x => x.insertions).pull()
        const deletions = files.sumBy(x => x.deletions).pull()
        return new LinesDiff(insertions, deletions)
    }
}

export class DiffSummary {
    constructor(
        readonly files: FilesDiff,
        readonly lines: LinesDiff
    ) {}

    toParts() {
        return [this.lines.toString(), this.files.toString()]
    }

    get isEmpty() {
        return this.files.isEmpty && this.lines.isEmpty
    }
}
