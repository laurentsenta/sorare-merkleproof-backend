// For simplicity for now we only support a very reduced content set.
export type PathInput = { path: string }
export type SupportedInput = string | PathInput

export interface MerkleBinaryLeaf<T extends SupportedInput> {
    hash: string
    content: T
}

export interface MerkleBinaryTree<T extends SupportedInput> {
    hash: string
    left: MerkleBinaryTree<T> | MerkleBinaryLeaf<T>
    right: MerkleBinaryTree<T> | MerkleBinaryLeaf<T> | null
}


export type MerkleItem<T extends SupportedInput> = MerkleBinaryTree<T> | MerkleBinaryLeaf<T>

export const isLeaf = <T extends SupportedInput>(item: MerkleItem<T>): item is MerkleBinaryLeaf<T> => {
    // @ts-ignore
    return !!item.content;
}
