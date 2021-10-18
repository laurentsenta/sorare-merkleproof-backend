import { chunk } from 'lodash'
import { computeContentHash, computeHash } from './content'
import { isLeaf, MerkleBinaryLeaf, MerkleBinaryTree, MerkleItem, SupportedInput } from './types'

/**
 * Compute a merkle binary tree.
 * 
 * @param items list of strings or path to files, assumes the order provided is relevant.
 * @returns The root of the Merkle Binary Tree produced.
 */
export const createMerkleTree = async <T extends SupportedInput>(items: T[]): Promise<MerkleBinaryTree<T> | null> => {
    if (items.length === 0) {
        return null
    }

    // ## "correct" implementation:
    // This version will break with lots of files because we load everything in parallel.
    // We would need to add streaming, batching, etc. to make this efficient and scalabe.
    // const leaves: MerkleBinaryLeaf<T>[] = await Promise.all(
    //     items.map(async item => ({
    //         hash: await computeContentHash(item),
    //         content: item
    //     }))
    // )

    // ## "incorrect" implementation,
    // this version will scale to hundred of thousands of items,
    // it's unefficient but you know what they say about "early optimization".
    const leaves: MerkleBinaryLeaf<T>[] = []
    for (let i = 0; i < items.length; i++) {
        const item = items[i]
        leaves.push({
            hash: await computeContentHash(item),
            content: item
        })
    }

    // Now that we have the leaves compute every level until we reach the root.
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

export const root = <T extends SupportedInput>(tree: MerkleBinaryTree<T> | null): string => {
    if (!tree) {
        throw new Error('the tree is empty.')
    }

    return tree.hash
}

export const height = (tree: MerkleBinaryTree<any> | null): number => {
    if (!tree) {
        return 0
    }

    let t: MerkleItem<any> = tree
    let height = 0

    while (!!t && !isLeaf(t)) {
        height += 1;
        t = t.left
    }

    return height + 1
}


export const level = <T extends SupportedInput>(tree: MerkleBinaryTree<T> | null, index: number): string[] => {
    if (!tree) {
        throw new Error('the tree is empty.')
    }

    let currentIndex = index;
    let currentLevel: MerkleItem<T>[] = [tree]

    while (currentIndex > 0) {
        const nextLevel = currentLevel
            .flatMap(x => {
                if (isLeaf(x)) {
                    throw new Error('the tree is not deep enough')
                }

                return [x.left, x.right]
            })
            .filter(isNotNull)

        currentLevel = nextLevel
        currentIndex -= 1
    }

    return currentLevel.map(x => x.hash)
}


const isNotNull = <T>(t: T | null): t is T => {
    return t !== null
}