import { map, timer } from "rxjs"
import { Roarr } from "./logging/setup.js"
import { LabeledTime } from "./utils/labeled-time.js"
export interface TimingOptions {
    interval: LabeledTime
    immediately: boolean
}

const logger = Roarr.child({
    part: "autogit"
})

function _getIntervalString(index: number, interval: LabeledTime) {
    const nick = index === 0 ? "(! 1 !)" : `(${index})`
    return [`🤖⏰ ${nick}`, interval.text].join(" ")
}
export function createTimer(options: TimingOptions) {
    const { interval, immediately } = options
    logger.debug(
        {
            interval: interval.text,
            immediately
        },
        "Starting AutoGit interval timer with..."
    )
    return timer(immediately ? new LabeledTime("5s").ms : interval.ms, interval.ms).pipe(
        map(n => {
            return _getIntervalString(n, interval)
        })
    )
}
