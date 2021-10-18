import { promises } from 'fs'
import { fromString, sha256, toBase64String } from "./encoding"
import { MerkleItem, SupportedInput } from "./types"

// TODO: redesign this part to extract it away from the merkle algorithm concern.
export const loadContent = async <T extends SupportedInput>(content: T): Promise<string> => {
    if (typeof content === 'string') {
        return content
    }

    return promises.readFile(content.path, { encoding: 'utf8' })
}

export const computeContentHash = async <T extends SupportedInput>(content: T): Promise<string> => {
    const d = await sha256(fromString(await loadContent(content)))
    return toBase64String(d)
}

export const computeHash = async <T extends SupportedInput>(left: MerkleItem<T>, right: MerkleItem<T> | null): Promise<string> => {
    return computeNodeHash(left.hash, right?.hash)
}

export const computeNodeHash = async (a: string, b: string | undefined): Promise<string> => {
    let [left, right] = [a, b]

    // Note the ordering is important here:
    // It has to be the same at construction time AND at proof verification time.
    if (b && a > b) {
        [left, right] = [b, a]
    }

    const hashed = left + ':' + (right || '')
    const d = await sha256(fromString(hashed))
    return toBase64String(d)
}
