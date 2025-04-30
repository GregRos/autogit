import parse from "parse-duration"
import { isNullish } from "what-are-you"

export function parseDuration(duration: string): number {
    const parsed = parse(duration)
    if (isNullish(parsed)) {
        throw new Error(`Invalid duration: ${duration}`)
    }
    return parsed
}
