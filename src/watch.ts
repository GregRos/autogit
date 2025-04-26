import prettyMilliseconds from "pretty-ms"
import { Roarr } from "./setup.js"
import { VaultChecker } from "./vault-checker.js"
const vaultCheckInterval = 1000 * 60 * 5
const vaultDir = "gregros.dev.vault"
Roarr.debug("Watching %s", "gregros.dev.vault")
Roarr.debug("Starting vault watcher...")
const vaultChecker = new VaultChecker(vaultDir)

Roarr.info("Comitting first time...")

await vaultChecker.backupHistory({
    type: "explicit"
})
Roarr.debug("FINISHED initial execution!")
Roarr.debug(`Setting up timer for ${prettyMilliseconds(vaultCheckInterval)}`)
setInterval(async () => {
    try {
        await vaultChecker.backupHistory({
            type: "interval",
            interval: vaultCheckInterval
        })
    } catch (e) {
        Roarr.error("Error during vault check: %s", e as any)
    }
}, vaultCheckInterval)
