import { Historian } from "./historian/historian.js"
import { Roarr } from "./logging/setup.js"
Roarr.debug("STARTING autogit-historian...")
Roarr.debug("Rading configuration file...")

const vaultChecker = new Historian({})
