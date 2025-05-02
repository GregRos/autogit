import { seq } from "doddle"
import type { DiffResult } from "simple-git"

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
        const files = seq(summary.files).filter(x => !x.binary)
        const insertions = files.sumBy(x => x.insertions).pull()
        const deletions = files.sumBy(x => x.deletions).pull()
        return new LinesDiff(insertions, deletions)
    }
}
