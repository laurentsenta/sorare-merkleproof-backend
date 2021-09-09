import { promises } from 'fs'
import { chunk, isEqual, reverse } from 'lodash'
import { sha256, fromString, toBase64String } from './encoding'

// For simplicity for now we only support a very reduced content set.
export type PahtInput = { path: string }
export type SupportedInput = string | PahtInput

export interface MerkleBinaryLeaf<T extends SupportedInput> {
    hash: string
    content: T
}

export interface MerkleBinaryTree<T extends SupportedInput> {
    hash: string
    left: MerkleBinaryTree<T> | MerkleBinaryLeaf<T>
    right: MerkleBinaryTree<T> | MerkleBinaryLeaf<T> | null
}


type MerkleItem<T extends SupportedInput> = MerkleBinaryTree<T> | MerkleBinaryLeaf<T>

const isLeaf = <T extends SupportedInput>(item: MerkleItem<T>): item is MerkleBinaryLeaf<T> => {
    // @ts-ignore
    return !!item.content;
}

// TODO: redesign this part to extract it away from the merkle algorithm concern.
const loadContent = async <T extends SupportedInput>(content: T): Promise<string> => {
    if (typeof content === 'string') {
        return content
    }

    return promises.readFile(content.path, { encoding: 'utf8' })
}

export const computeContentHash = async <T extends SupportedInput>(content: T): Promise<string> => {
    const d = await sha256(fromString(await loadContent(content)))
    return toBase64String(d)
}

const computeHash = async <T extends SupportedInput>(left: MerkleItem<T>, right: MerkleItem<T> | null): Promise<string> => {
    return computeNodeHash(left.hash, right?.hash)
}

const computeNodeHash = async (a: string, b: string | undefined): Promise<string> => {
    let [left, right] = [a, b]
    if (b && a > b) {
        [left, right] = [b, a]
    }

    const hashed = left + ':' + (right || '')
    const d = await sha256(fromString(hashed))
    return toBase64String(d)

}

export const makeMerkleBinaryTree = async <T extends SupportedInput>(items: T[]): Promise<MerkleBinaryTree<T> | null> => {
    if (items.length === 0) {
        return null
    }

    const leaves: MerkleBinaryLeaf<T>[] = await Promise.all(
        items.map(async item => ({
            hash: await computeContentHash(item),
            content: item
        }))
    )

    let currentLevel: MerkleItem<T>[] = leaves

    do {
        // group current level into pairs
        const chunks = chunk(currentLevel, 2)

        // Turn each pair into a new node with left and right
        currentLevel = await Promise.all(
            chunks.map(async ([left, maybeRight]) => {
                const right = maybeRight || null
                return { hash: await computeHash(left, right), left, right }
            })
        )
    }
    while (currentLevel.length > 1)

    return currentLevel[0] as MerkleBinaryTree<T>
}

export const findPath = <T extends SupportedInput>(tree: MerkleBinaryTree<T>, searched: T): (MerkleItem<T>[] | null) => {
    const recFind = <T extends SupportedInput>(item: MerkleItem<T>): (MerkleItem<T>[] | null) => {
        if (isLeaf(item)) {
            if (isEqual(item.content, searched)) {
                return [item]
            }
            return null
        } else {
            if (item.left) {
                const r = recFind(item.left)
                if (!!r) {
                    return [item, ...r]
                }
            }
            if (item.right) {
                const r = recFind(item.right)
                if (!!r) {
                    return [item, ...r]
                }
            }
        }
        return null
    }

    return recFind(tree)
}

/**
 * Similar to a search but returns the list of all nodes used in the proof (from root to leaf).
 * 
 * @param tree 
 * @param searched 
 * @returns 
 */
export const makeProof = <T extends SupportedInput>(tree: MerkleBinaryTree<T>, searched: T): (string[] | null) => {
    const recFind = <T extends SupportedInput>(item: MerkleItem<T>): (string[] | null) => {
        if (isLeaf(item)) {
            if (isEqual(item.content, searched)) {
                return []
            }
            return null
        } else {
            if (item.left) {
                const r = recFind(item.left)
                if (!!r) {
                    return [item.right?.hash || '', ...r]
                }
            }
            if (item.right) {
                const r = recFind(item.right)
                if (!!r) {
                    return [item.left.hash, ...r]
                }
            }
        }
        return null
    }

    return recFind(tree)
}

export const verifyProof = async (rootHash: string, proof: string[], itemHash: string): Promise<boolean> => {
    return (await traverseProof(proof, itemHash)) === rootHash
}

/**
 * The proof is the list of "unknown hashes" to go from the root to the item / leaf.
 * 
 * We start from the bottom, hash the "known" item with the item from the proof,
 * and go up, level by level until we reached the root.
 * 
 * TODO: deal with the risk of validating fake proofs with the wrong depth.
 * 
 * @param tree 
 * @param proof 
 * @param itemHash 
 * @returns whether the proof is valid or not.
 */
export const traverseProof = async (proof: string[], itemHash: string): Promise<string> => {
    let items = reverse(proof)
    let currentHash = itemHash

    while (items.length > 0) {
        const [first, ...rest] = items
        currentHash = await computeNodeHash(first, currentHash)
        items = rest
    }

    return currentHash
}