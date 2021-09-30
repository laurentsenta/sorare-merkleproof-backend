# Merkle Proof: Backend

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