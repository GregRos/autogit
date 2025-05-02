import { parseDuration } from "./parse-duration.js"
export class LabeledTime {
    readonly ms: number
    constructor(private readonly _input: string | number) {
        this.ms = parseDuration(typeof _input === "number" ? `${_input}m` : _input)
    }

    get text() {
        return this._input
    }
}
