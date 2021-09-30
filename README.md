# Merkle Proof: Backend

`make compile` to compile solidity & generate typescripts interfaces.

`make node` to start a localhost node.

Consult the `Makefile` for the whole demo: it generates data, timestamp, then lets you verify it.


## Know issues:

If you try to import: `import "tsconfig-paths/register";` in hardhat,
the hardhat command will fail with:

```
An unexpected error occurred:
TypeError: typechain_1.glob is not a function
```

All imports are relative for now.

- [ ] TODO: figure out a solution or raise the problem so we can use aliases.