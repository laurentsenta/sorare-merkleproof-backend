// @ts-nocheck
import { computeContentHash, findPath, createMerkleTree, makeProof, verifyProof } from '.'

describe('I can create a binary tree', () => {
    it('creates an empty tree', async () => {
        const leaves: string[] = []

        const tree = await createMerkleTree(leaves)

        expect(tree).toBeNull()
    })

    it('creates a tree with one item', async () => {
        const leaves = ['item1']

        const tree = await createMerkleTree(leaves)

        expect(tree.hash).toBeTruthy()
        expect(tree.left.hash).toBeTruthy()
        expect(tree.left.content).toEqual('item1')
        expect(tree.right).toBeNull()
    })

    it('the item value we picked preserve hash order to simplify testing', async () => {
        const leaves = ['item1', 'item2-a', 'item3-a']

        const hashed = await Promise.all(leaves.map(computeContentHash))
        const sortedHashed = [...hashed]
        sortedHashed.sort()

        // console.log(leaves)
        // console.log(hashed)
        // console.log(sortedHashed)

        expect(hashed).toEqual(sortedHashed)
    })

    it('creates a tree with two items (1 level)', async () => {
        const leaves = ['item1', 'item2-a']

        const tree = await createMerkleTree(leaves)

        expect(tree.hash).toBeTruthy()
        expect(tree.left.hash).toBeTruthy()
        expect(tree.left.content).toEqual('item1')
        expect(tree.right.hash).toBeTruthy()
        expect(tree.right.content).toEqual('item2-a')
    })

    it('creates a tree with three items (2 levels)', async () => {
        const leaves = ['item1', 'item2-a', 'item3-a']

        const tree = await createMerkleTree(leaves)

        expect(tree.hash).toBeTruthy()
        expect(tree.left.hash).toBeTruthy()

        expect(tree.left.left.content).toEqual('item1')
        expect(tree.left.right.content).toEqual('item2-a')

        expect(tree.right.left.content).toEqual('item3-a')
        expect(tree.right.right).toBeNull()
    })
})

describe('I can search a binary tree', () => {
    it('returns null on missing items', async () => {
        const leaves = ['item1', 'item2-a', 'item3-a']

        const tree = await createMerkleTree(leaves)

        const p = findPath(tree, 'item0')
        expect(p).toBeNull()
    })

    it('returns something on existing items', async () => {
        const leaves = ['item1', 'item2-a', 'item3-a']

        const tree = await createMerkleTree(leaves)

        const p = findPath(tree, 'item2-a')
        expect(p).toBeTruthy()
    })

    it('returns the path on existing items', async () => {
        const leaves = ['item1', 'item2-a', 'item3-a']

        const tree = await createMerkleTree(leaves)


        const p = findPath(tree, 'item2-a')

        expect(p.length).toEqual(3)
        expect(p[0]).toEqual(tree)
        expect(p[1]).toEqual(tree.left)
        expect(p[2]).toEqual(tree?.left.right)
    })
})

describe('I can produce a proof and verify it', () => {
    it('returns null on missing items', async () => {
        const leaves = ['item1', 'item2-a', 'item3-a']

        const tree = await createMerkleTree(leaves)

        const p = makeProof(tree, 'item0')
        expect(p).toBeNull()
    })

    it('returns something on existing items', async () => {
        const leaves = ['item1', 'item2-a', 'item3-a']

        const tree = await createMerkleTree(leaves)

        const p = makeProof(tree, 'item2-a')
        expect(p).toBeTruthy()
    })

    it('returns the path on existing items', async () => {
        const leaves = ['item1', 'item2-a', 'item3-a']

        const tree = await createMerkleTree(leaves)

        const p = makeProof(tree, 'item2-a')

        expect(p.length).toEqual(2)
        expect(p[0]).toEqual(tree?.right.hash)
        expect(p[1]).toEqual(tree?.left.left.hash)
    })

    it('validates a proof', async () => {
        const leaves = ['item1', 'item2-a', 'item3-a']

        const tree = await createMerkleTree(leaves)
        const p = makeProof(tree, 'item2-a')
        const itemHash = await computeContentHash('item2-a')

        const valid = await verifyProof(tree.hash, p, itemHash)
        expect(valid).toBeTruthy()
    })

    it('invalidates a wrong proof', async () => {
        const leaves = ['item1', 'item2-a', 'item3-a']

        const tree = await createMerkleTree(leaves)
        const p = makeProof(tree, 'item2-a')
        const itemHash = await computeContentHash('item2-tampered')

        const valid = await verifyProof(tree.hash, p, itemHash)
        expect(valid).toBeFalsy()
    })
})