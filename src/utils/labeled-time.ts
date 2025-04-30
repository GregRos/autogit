import { parseDuration } from "./parse-duration.js"

export class LabeledTime {
    constructor(private readonly _input: string) {}

    get ms() {
        return parseDuration(this._input)
    }

    get text() {
        return this._input
    }
}
