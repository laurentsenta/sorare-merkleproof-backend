# Merkle Proof: Backend

## Sorare Team

Team,
this is a project I built a few weeks ago to build my portfolio,

- Test-suite for the exercise in [`src/merkle/sorare.test.ts`](src/merkle/sorare.test.ts),
- Implementation: [`src/merkle/tree.ts`](src/merkle/tree.ts)

- Live version with a webapp: [blockchain-proof.singulargarden.com](https://blockchain-proof.singulargarden.com/)
- Related article on my site: [Using MerkleTree for Blockchainized Document Certification](https://laurentsenta.com/articles/blockchain-merkle-tree-algorithm/)

Run the tests: `yarn test sorare`

### Additional Questions:

> 1. Using the illustration above, let’s imagine I know the whole Merkle tree. Someone
> gives me the L2 data block but I don’t trust them. How can I check if L2 data is valid?

Knowing the whole tree, you can hash L2, then search for this hash in the list of leaves of your tree.

> 2. I know only the L3 data block and the Merkle root. What minimum information do I
> need to check that the L3 data block and the Merkle root belong to the same Merkle
> tree?

You need the list of all siblings hashes for the path from the root to L3,
it's called a merkle proof.

In blue in this image:

![image](https://laurentsenta.com/medias/merkletree/merkletree-3.png)

Note that you also need a deterministic way to order two hashes to compute their parent's node.

> 3. What are some Merkle tree use cases?

git and cryptocurrencies (ethereum, and bitcoin) use merkle trees. IPFS and other fancy decentralized storage system too.

Generally, this structure is relevant when you need to: 

- Validate large datasets efficiently,
- Keep the ability to access (verify and mutate) a small part of your dataset efficiently.

---

## Instructions

`yarn test` to run the tests.

`make compile` to compile solidity & generate typescripts interfaces.

`make node` to start a localhost node.

Consult the `Makefile` for the whole demo: it generates data, timestamp, then lets you verify it.

## Context

This is a demonstration of a document certification system that relies on merkle proofs.

Test the frontend here: [blockchain-proof.singulargarden.com](https://blockchain-proof.singulargarden.com).

- The fundamental of the code (merkle algorithms & contracts) are heavily tested.
- The "wrapping" code that deals with reading files, etc. is not tested.

This is a side-project, so correctness, speed and simplicity to change are the core goals. We don't test the wrapping code, because we go through on every demo. It is tested manually as we show and adapt the demo.

## Know issues:

If you try to import: `import "tsconfig-paths/register";` in hardhat,
the hardhat command will fail with:

```
An unexpected error occurred:
TypeError: typechain_1.glob is not a function
```

All imports are relative for now.

## Todo

- [ ] figure out a solution to use typescript path aliases.
- [ ] the call to `faker.seed` is wrong but the library hasn't complained so far, fix when needed.