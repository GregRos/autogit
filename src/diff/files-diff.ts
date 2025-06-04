import { seq } from "doddle"
import { truncate } from "lodash-es"
import path from "path"
import type { FileStatusResult, StatusResult } from "simple-git"

export class FilesDiff {
    constructor(
        readonly addedFiles: FileStatusResult[],
        readonly removedFiles: FileStatusResult[],
        readonly modifiedFiles: FileStatusResult[]
    ) {}

    get added() {
        return this.addedFiles.length
    }

    get removed() {
        return this.removedFiles.length
    }

    get modified() {
        return this.modifiedFiles.length
    }

    get shortNamesSummary() {
        function getShortFileName(file: FileStatusResult, char: string) {
            if (!file?.path) {
                return undefined
            }
            return `${char}${truncate(path.basename(file.path), {
                length: 20,
                omission: "…"
            })}`
        }
        const oneAddedFile = getShortFileName(this.addedFiles[0], "+")
        const oneRemovedFile = getShortFileName(this.removedFiles[0], "-")
        const oneModifiedFile = getShortFileName(this.modifiedFiles[0], "~")
        const all = [oneAddedFile, oneRemovedFile, oneModifiedFile].filter(Boolean).join(" ")
        return all
    }

    toString() {
        const { added, removed, modified } = this
        if (this.isEmpty) {
            return "🗃️ ±0F"
        }
        const summary = this.shortNamesSummary
        const items = [`🗃️ +${added}F -${removed}F Δ${modified}F`, summary]
            .filter(x => x)
            .join(" ┃ ")
        return items
    }

    static fromStatusResult(status: StatusResult) {
        const files = seq(status.files)

        const addedFiles = files
            .filter(x => x.index === "A")
            .toArray()
            .pull()
        const removedFiles = files
            .filter(x => x.index === "D")
            .toArray()
            .pull()

        const modifiedFiles = files
            .filter(x => x.index === "M")
            .toArray()
            .pull()
        return new FilesDiff(addedFiles, removedFiles, modifiedFiles)
    }

    get isEmpty() {
        return this.added === 0 && this.removed === 0
    }
}
