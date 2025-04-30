/* prettier-ignore */
import { override } from "./logging.js"
async function getRoarr() {
    process.env.ROARR_LOG = "true"
    const { Roarr, ROARR } = await import("roarr")
    override(ROARR)
    return Roarr
}
export const Roarr = await getRoarr()
