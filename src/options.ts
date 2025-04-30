import { cosmiconfigSync } from "cosmiconfig"
import { assign } from "lodash"
import { z } from "zod"
import { LabeledTime } from "./utils/labeled-time.js"

export const Duration = z
    .string()
    .or(z.number())
    .transform(x => {
        return new LabeledTime(x)
    })

export type Duration = z.infer<typeof Duration>

export const AutogitOptions = z.object({
    cwd: z.string().optional().default("."),
    every: Duration,
    immediately: z.boolean().optional().default(true)
})

export type AutogitOptions = z.infer<typeof AutogitOptions>

export function loadConfig(overrides: Partial<AutogitOptions> = {}): AutogitOptions {
    const optionsFile = cosmiconfigSync("autogit").load(process.cwd())
    const cfg = assign(optionsFile?.config ?? {}, overrides)
    return AutogitOptions.parse(cfg)
}

export const defaultOptions: z.input<typeof AutogitOptions> = {
    cwd: ".",
    every: "5m",
    immediately: true
}

AutogitOptions.parse(defaultOptions) // Make sure the default options are valid
