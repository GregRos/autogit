import { VaultChecker } from "./vault-checker.js"

const vc = new VaultChecker("gregros.dev.vault")
await vc.backupHistory({ type: "explicit" })
