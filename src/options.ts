import { cosmiconfigSync } from "cosmiconfig"
import { defaults } from "lodash-es"
import { yamprint } from "yamprint"
import { z } from "zod"
import { Roarr } from "./logging/setup.js"
import { LabeledTime } from "./utils/labeled-time.js"
const logger = Roarr.child({
    part: "options"
})
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
    Roarr.debug("Attempting to load cosmiconfig")
    const optionsFile = cosmiconfigSync("autogit").search()
    console.log(yamprint(optionsFile))
    const cfg = defaults(overrides, optionsFile?.config ?? {})
    console.log(yamprint(cfg))
    return AutogitOptions.parse(cfg, {
        path: ["AutogitOptions", optionsFile?.filepath ?? ""]
    })
}

export function tryLoadConfig(overrides: Partial<AutogitOptions> = {}): AutogitOptions | undefined {
    return loadConfig(overrides)
}

export const defaultOptions: z.input<typeof AutogitOptions> = {
    cwd: ".",
    every: "5m",
    immediately: true
}

AutogitOptions.parse(defaultOptions) // Make sure the default options are valid
