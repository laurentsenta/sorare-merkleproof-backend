import { isEqual, reverse } from 'lodash'
import { computeNodeHash } from './content'
import { isLeaf, MerkleBinaryTree, MerkleItem, SupportedInput } from './types'

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
 * TODO: investigate the risk of validating fake proofs with the wrong depth ("second preimage attack")
 * 
 * @param tree 
 * @param proof 
 * @param itemHash 
 * @returns whether the proof is valid or not.
 */
export const traverseProof = async (proof: string[], itemHash: string): Promise<string> => {
    let items = reverse(proof) // We start from the leaves
    let currentHash = itemHash

    while (items.length > 0) {
        const [first, ...rest] = items
        currentHash = await computeNodeHash(first, currentHash)
        items = rest
    }

    return currentHash
}
