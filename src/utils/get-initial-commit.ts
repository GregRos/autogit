import dayjs from "dayjs"
import { simpleGit } from "simple-git"

async function getInitialCommitDate(repoPath = ".") {
    const git = simpleGit(repoPath)

    const log = await git.log({
        "--reverse": null,
        "--max-parents": "0"
    })

    if (log.total === 0) {
        throw new Error("No commits found in the repository.")
    }

    return dayjs(log.all[0].date)
}
