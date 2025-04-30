import { FilesDiff } from "./files-diff.js"
import { LinesDiff } from "./lines-diff.js"

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
