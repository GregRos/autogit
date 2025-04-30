import { seq } from "doddle"
import type { StatusResult } from "simple-git"

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
