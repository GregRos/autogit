import dayjs from "dayjs"
import { SimpleGit, simpleGit } from "simple-git"
import { Roarr } from "../logging/setup.js"

const logger = Roarr.child({
    part: "git"
})
export class Git {
    private _simpleGit: SimpleGit
    constructor(
        readonly executable: string,
        readonly cwd: string
    ) {
        this._simpleGit = simpleGit({
            baseDir: cwd,
            binary: executable
        })
    }

    get isRepo() {
        return this._simpleGit.checkIsRepo()
    }

    async hasCommits() {
        const commits = await this._simpleGit.log()
        return commits.total > 0
    }

    async init() {
        if (!(await this.isRepo)) {
            logger.debug("Initializing git repository...")
            await this._simpleGit.init()
        }
        const commits = await this._getLog()
        if (commits.total === 0) {
            logger.debug("No commits found, creating initial commit...")
            await this._simpleGit.commit("Initial commit (autogit).")
        }
    }

    private _getLog() {
        return this._simpleGit.log({
            "--reverse": null,
            "--max-parents": "0"
        })
    }

    async getInitialDate() {
        log = await this._getLog()

        return dayjs(log.all[0].date)
    }
}
