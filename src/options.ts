import { cosmiconfigSync } from "cosmiconfig"
import parseDuration from "parse-duration"
import { isNullish } from "what-are-you"
import { z } from "zod"

export const Duration = z
    .string()
    .or(z.number())
    .transform(x => {
        x = typeof x === "number" ? `${x}m` : x
        const parsed = parseDuration(x)
        if (isNullish(parsed)) {
            throw new Error(`Invalid duration: ${x}`)
        }
        return parsed
    })

export type Duration = z.infer<typeof Duration>

export const AutogitOptions = z.object({
    cwd: z.string().optional().default("."),
    git: z.string().optional().default("git"),
    interval: Duration,
    firstDelay: Duration.or(z.literal(false)).default("0m")
})

export type AutogitOptions = z.infer<typeof AutogitOptions>

export function getOptions() {
    const optionsFile = cosmiconfigSync("autogit")
    const x = optionsFile.load(process.cwd())
    return AutogitOptions.parse(x?.config)
}
