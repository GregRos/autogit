import { map, timer } from "rxjs"
import { Roarr } from "./logging/setup.js"
import { LabeledTime } from "./utils/labeled-time.js"
export interface TimingOptions {
    interval: LabeledTime
    firstDelay: LabeledTime | false
}

const logger = Roarr.child({
    part: "autogit"
})

function _getIntervalString(index: number, interval: LabeledTime) {
    const nick = index === 0 ? "(! 1 !)" : `(${index})`
    return [`🤖⏰ ${nick}`, interval.text].join(" ")
}
export function createTimer(options: TimingOptions) {
    const { interval, firstDelay } = options
    logger.debug("Starting AutoGit interval timer with interval=%d, firstDelay=%d")
    return timer(firstDelay === false ? interval.ms : firstDelay.ms, interval.ms).pipe(
        map(n => {
            return _getIntervalString(n, interval)
        })
    )
}
