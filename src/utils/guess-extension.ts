export function tryExistingFile(path: string, extsInOrder: string[]) {
    if (extsInOrder.some(ext => path.endsWith(ext))) {
        return path
    }
    // Check if the file exists with any of the extensions in order
    for (const ext of extsInOrder) {
        const newPath = `${path}${ext}`
    }
}
