/* prettier-ignore */
process.env.ROARR_LOG = "true"

import { Roarr, ROARR } from "roarr"
import { override } from "./logging.js"
override(ROARR)
export { Roarr }
