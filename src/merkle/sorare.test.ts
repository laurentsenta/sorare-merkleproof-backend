// @ts-nocheck
import { height, level, createMerkleTree } from '.'
import { toBase64String, sha256, fromString } from './encoding'

const HASH_ITEM_1 = toBase64String(sha256(fromString('item1')))
const HASH_ITEM_2 = toBase64String(sha256(fromString('item2')))

describe('I can get the height of a binary tree', () => {
    it('for an empty tree', async () => {
        const leaves: string[] = []
        const tree = await createMerkleTree(leaves)

        expect(height(tree)).toEqual(0)
    })

    it('for a tree with one item', async () => {
        const leaves = ['item1']

        const tree = await createMerkleTree(leaves)

        expect(height(tree)).toEqual(2)
    })

    it('for a tree with two items', async () => {
        const leaves = ['item1', 'item2']

        const tree = await createMerkleTree(leaves)

        expect(height(tree)).toEqual(2)
    })

    it('for a tree with tree items', async () => {
        const leaves = ['item1', 'item2', 'item3']

        const tree = await createMerkleTree(leaves)

        expect(height(tree)).toEqual(3)
    })
})


describe('I can get the level of a binary tree', () => {
    it('for an empty tree', async () => {
        const leaves: string[] = []
        const tree = await createMerkleTree(leaves)

        expect(() => level(tree, 0)).toThrow()
    })

    it('for a tree with one item', async () => {
        const leaves = ['item1']

        const tree = await createMerkleTree(leaves)

        expect(level(tree, 0)).toHaveLength(1)
        expect(level(tree, 1)).toHaveLength(1)
        expect(() => level(tree, 2)).toThrow()
        expect(() => level(tree, 200)).toThrow()
    })

    it('for a tree with two items', async () => {
        const leaves = ['item1', 'item2']

        const tree = await createMerkleTree(leaves)

        expect(level(tree, 0)).toHaveLength(1)
        expect(level(tree, 1)).toHaveLength(2)
        expect(level(tree, 1)).toEqual([HASH_ITEM_1, HASH_ITEM_2])

        expect(() => level(tree, 2)).toThrow()
    })

    it('for a tree with tree items', async () => {
        const leaves = ['item1', 'item2', 'item3']

        const tree = await createMerkleTree(leaves)

        expect(level(tree, 0)).toHaveLength(1)
        expect(level(tree, 1)).toHaveLength(2)
        expect(level(tree, 2)).toHaveLength(3)
        expect(() => level(tree, 3)).toThrow()
    })
})