// Import prefix: setup important modules first
import { config as dotenvConfig } from "dotenv";
dotenvConfig();
// Regular imports
import { HardhatUserConfig, task, types } from "hardhat/config";
import "@nomiclabs/hardhat-ethers";
import "@nomiclabs/hardhat-waffle";
import '@typechain/hardhat';
import 'hardhat-deploy';
import { writeFileSync } from "fs";
import { doTimestamp, generateMerkleProofForFile, generateMerkleTreeFromFolder, generateRandomFiles, generateRandomIDs, traverseProofFile, verifyTimestamp } from "./src/demo";

// Tasks
// =====

task("accounts", "Prints the list of accounts", async (taskArgs, hre) => {
  const accounts = await hre.ethers.getSigners();

  for (const account of accounts) {
    console.log(account.address);
  }
});

task("generate", "Generate a bunch of random files")
  .addParam("folder", "The destination folder")
  .addParam("count", "The number of files", 10, types.int)
  .setAction(async (taskArgs, { ethers, deployments }) => {
    const { folder, count } = taskArgs

    try {
      return generateRandomFiles(folder, count)
    } catch (e) {
      console.error(e)
      process.exit(1)
    }
  });

task("generate-ids", "Generate a bunch of random identities")
  .addParam("folder", "The destination folder")
  .addParam("count", "The number of files", 10, types.int)
  .setAction(async (taskArgs, { ethers, deployments }) => {
    const { folder, count } = taskArgs

    try {
      generateRandomIDs(folder, count)
    } catch (e) {
      console.error(e)
      process.exit(1)
    }
  });

task("timestamp", "Record a timestamp")
  .addParam("hash", "The hash")
  .addOptionalParam("verify", "Verify if the hash exists", false, types.boolean)
  .setAction(async (taskArgs, { ethers, deployments }) => {
    const { hash, verify } = taskArgs

    if (verify) {
      const has = await verifyTimestamp(hash, ethers)

      if (has) {
        console.log('timestamp found')
        process.exit(0)
      } else {
        console.error('timestamp not found')
        process.exit(1)
      }
    }
    else {
      await doTimestamp(hash, ethers)
    }
  });

task("merklehash", "generate the merkletree for a folder of files (no subfolders)")
  .addParam("folder", "The input folder")
  .addOptionalParam("outputFile", "The output file")
  .addOptionalParam("onChain", "Timestamp the root on chain", false, types.boolean)
  .setAction(async (taskArgs, { ethers, deployments }) => {
    const { folder, outputFile, onChain } = taskArgs

    try {
      const tree = await generateMerkleTreeFromFolder(folder)

      if (!tree) {
        throw new Error('empty folder')
      }

      // Dump the tree if requested
      const data = JSON.stringify(tree, undefined, 2)
      if (outputFile) {
        writeFileSync(outputFile, data)
      } else {
        console.log(data)
      }

      // Verify if requested
      if (onChain) {
        const hash = ethers.utils.base64.decode(tree.hash)
        await doTimestamp(hash, ethers)
      }
    } catch (e) {
      console.error(e)
      process.exit(1)
    }
  });

task("merkleproof", "generate the merkleproof for a file")
  .addParam("merkleFile", "The merkle tree file")
  .addParam("fileName", "The fileName")
  .addOptionalParam("outputFile", "The output file")
  .setAction(async (taskArgs, { ethers, deployments }) => {
    const { merkleFile, fileName, outputFile } = taskArgs

    try {
      const proof = generateMerkleProofForFile(merkleFile, fileName)

      // Dump the proof if requested
      if (outputFile) {
        writeFileSync(outputFile, JSON.stringify(proof))
      } else {
        console.log(proof)
      }
    } catch (e) {
      console.error(e)
      process.exit(1)
    }
  });

task("verifyproof", "verify the merkleproof for a file on chain")
  .addParam("filePath", "The verified file")
  .addParam("proofFile", "The merkle proof file")
  .setAction(async (taskArgs, { ethers, deployments }) => {
    const { filePath, proofFile } = taskArgs

    try {
      const resultingHash = await traverseProofFile(proofFile, filePath)
      const hash = ethers.utils.base64.decode(resultingHash)
      const has = await verifyTimestamp(hash, ethers)

      if (has) {
        console.log('proof is valid, congrat')
        process.exit(0)
      } else {
        console.log('proof is not valid')
        process.exit(1)
      }
    } catch (e) {
      console.error(e)
      process.exit(1)
    }
  });


// Configuration
// =============

// TODO: rethink using https://github.com/paulrberg/solidity-template/blob/main/hardhat.config.ts
const ROPSTEN_API_URL = process.env.ROPSTEN_API_URL
const ROPSTEN_MAIN_ACCOUNT = process.env.ROPSTEN_MAIN_ACCOUNT

const ropsten_accounts = !!ROPSTEN_MAIN_ACCOUNT ? { accounts: [ROPSTEN_MAIN_ACCOUNT] } : {}

// Details at https://hardhat.org/config/ 
const config: HardhatUserConfig = {
  solidity: {
    version: "0.8.4",
    settings: {
      // Disable the optimizer when debugging
      // https://hardhat.org/hardhat-network/#solidity-optimizer-support
      optimizer: {
        enabled: true,
        runs: 800,
      },
    }
  },
  defaultNetwork: "hardhat",
  networks: {
    hardhat: {
      live: false,
      saveDeployments: true,
      tags: ["local", "test"]
    },
    localhost: {
      live: false,
      saveDeployments: true,
      tags: ["local"]
    },
    ropsten: {
      url: ROPSTEN_API_URL,
      ...ropsten_accounts
    }
  },
  paths: {
    sources: "./contracts",
    tests: "./tests",
    cache: "./cache",
    artifacts: "./artifacts"
  },
  namedAccounts: {
    deployer: {
      default: 0,
    },
    someUser: {
      default: 9
    }
  }
};

export default config;
