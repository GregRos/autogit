import { cosmiconfigSync } from "cosmiconfig"
import { defaults } from "lodash-es"
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
    logger.debug("Attempting to load cosmiconfig")
    const optionsFile = cosmiconfigSync("autogit").search()
    if (!optionsFile) {
        logger.debug("No config file found")
    } else {
        logger.debug(
            {
                filepath: optionsFile.filepath,
                config: optionsFile.config
            },
            "Config file found"
        )
    }
    const cfg = defaults(overrides, optionsFile?.config ?? {})
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
