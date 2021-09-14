import { BigNumber } from "@ethersproject/bignumber";
import "@nomiclabs/hardhat-ethers";
import "@nomiclabs/hardhat-waffle";
import '@typechain/hardhat';
import faker from 'faker';
import { existsSync, mkdirSync, readdirSync, statSync, writeFileSync } from "fs";
import 'hardhat-deploy';
import { HardhatUserConfig, task, types } from "hardhat/config";
import slugify from 'slugify';
import { lpad } from "./src/gazebo/utils";
import { makeMerkleBinaryTree, makeProof, MerkleBinaryTree, PahtInput, computeContentHash, traverseProof } from "./src/merkle";
import { Timestamper } from './typechain';
import { config as dotenvConfig } from "dotenv";

dotenvConfig();

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

    faker.seed(folder + count)

    if (existsSync(folder)) {
      console.error(`folder ${folder} exists, leaving`)
      process.exit(1)
    }

    mkdirSync(folder, { recursive: true })

    for (let i = 0; i < count; i++) {
      const id = lpad(i, ('' + count).length + 1)
      const name = faker.name.findName()
      const slug = slugify(name, { lower: true, strict: true })
      const content = faker.lorem.paragraphs(1000)
      const item = {
        i, id, name, slug,
        content
      }
      writeFileSync(`${folder}/${id}-${slug}.json`, JSON.stringify(item, undefined, 2))
    }
  });

task("generate-ids", "Generate a bunch of random identities")
  .addParam("folder", "The destination folder")
  .addParam("count", "The number of files", 10, types.int)
  .setAction(async (taskArgs, { ethers, deployments }) => {
    const { folder, count } = taskArgs

    faker.seed(folder + count)

    if (existsSync(folder)) {
      console.error(`folder ${folder} exists, leaving`)
      process.exit(1)
    }

    mkdirSync(folder, { recursive: true })

    for (let i = 0; i < count; i++) {
      const id = lpad(i, ('' + count).length + 1)
      const name = faker.name.findName()
      const slug = slugify(name, { lower: true, strict: true })
      const org = faker.company.companyName()
      const hired = faker.date.recent()
      const title = faker.name.jobTitle()
      const item = {
        i, id, name, slug,
        org, hired, title
      }
      writeFileSync(`${folder}/${id}-${slug}.json`, JSON.stringify(item, undefined, 2))
    }
  });

const hasTimestamp = async (contract: Timestamper, value: BigNumber): Promise<boolean> => {
  // TODO: double check the blockFrom this might get lost.
  const f = contract.filters.Timestamp(value)
  const qf = await contract.queryFilter(f)
  return qf.length > 0
}

task("timestamp", "Record a timestamp")
  .addParam("hash", "The hash")
  .addOptionalParam("verify", "Verify if the hash exists", false, types.boolean)
  .setAction(async (taskArgs, { ethers, deployments }) => {
    const { hash, verify } = taskArgs
    // await deployments.fixture(['Timestamper'])
    const contract = <Timestamper>await ethers.getContract('Timestamper')
    const value = ethers.BigNumber.from(hash)

    if (verify) {
      const has = await hasTimestamp(contract, value)

      if (has) {
        console.log('timestamp found')
        process.exit(0)
      } else {
        console.error('timestamp not found')
        process.exit(1)
      }


    } else {
      await contract.timestamp(value)
    }
  });

task("merklehash", "generate the merkletree for a folder")
  .addParam("folder", "The input folder")
  .addOptionalParam("outputFile", "The output file")
  .addOptionalParam("onChain", "Timestamp the root on chain", false, types.boolean)
  .setAction(async (taskArgs, { ethers, deployments }) => {
    const { folder, outputFile, onChain } = taskArgs

    if (!existsSync(folder)) {
      console.error(`folder ${folder} does not exists, leaving`)
      process.exit(1)
    }

    const files = readdirSync(folder)
      .map(fileName => `${folder}/${fileName}`)
      .filter(path => statSync(path).isFile())
    files.sort()

    const items = files.map(path => ({ path }))
    const tree = await makeMerkleBinaryTree(items)

    if (!tree) {
      console.error('empty folder')
      process.exit(1)
    }

    const data = JSON.stringify(tree, undefined, 2)

    if (outputFile) {
      writeFileSync(outputFile, data)
    } else {
      console.log(data)
    }

    if (onChain) {
      const contract = <Timestamper>await ethers.getContract('Timestamper')
      const hash = ethers.utils.base64.decode(tree?.hash)
      const value = ethers.BigNumber.from(hash)
      await contract.timestamp(value)
    }
  });

task("merkleproof", "generate the merkleproof for a file")
  .addParam("merkleFile", "The merkle tree file")
  .addParam("fileName", "The fileName")
  .addOptionalParam("outputFile", "The output file")
  .setAction(async (taskArgs, { ethers, deployments }) => {
    const { merkleFile, fileName, outputFile } = taskArgs

    if (!existsSync(merkleFile)) {
      console.error(`file ${merkleFile} does not exists, leaving`)
      process.exit(1)
    }

    const tree: MerkleBinaryTree<PahtInput> = require(merkleFile)
    const searched = {
      path: fileName
    }

    const proof = makeProof(tree, searched)

    if (!proof) {
      console.error('searched item not found')
      process.exit(1)
    }

    const data = JSON.stringify(proof, undefined, 2)

    if (outputFile) {
      writeFileSync(outputFile, data)
    } else {
      console.log(data)
    }
  });

task("verifyproof", "verify the merkleproof for a file on chain")
  .addParam("filePath", "The verified file")
  .addParam("proofFile", "The merkle proof file")
  .setAction(async (taskArgs, { ethers, deployments }) => {
    const { filePath, proofFile } = taskArgs

    if (!existsSync(filePath)) {
      console.error(`file ${filePath} does not exists, leaving`)
      process.exit(1)
    }

    if (!existsSync(proofFile)) {
      console.error(`file ${proofFile} does not exists, leaving`)
      process.exit(1)
    }

    const proof = require(proofFile)
    const fileHash = await computeContentHash({ path: filePath })
    const resultingHash = await traverseProof(proof, fileHash)
    const hash = ethers.utils.base64.decode(resultingHash)
    const value = ethers.BigNumber.from(hash)
    const contract = <Timestamper>await ethers.getContract('Timestamper')

    const has = await hasTimestamp(contract, value)

    if (has) {
      console.log('proof is valid, congrat')
      process.exit(0)
    } else {
      console.log('proof is not valid')
      process.exit(1)
    }
  });


// TODO: rethink using https://github.com/paulrberg/solidity-template/blob/main/hardhat.config.ts

const ROPSTEN_API_URL = process.env.ROPSTEN_API_URL
const ROPSTEN_MAIN_ACCOUNT = process.env.ROPSTEN_MAIN_ACCOUNT

const chainIds = {
  goerli: 5,
  hardhat: 31337,
  kovan: 42,
  mainnet: 1,
  rinkeby: 4,
  ropsten: 3,
};

// Go to https://hardhat.org/config/ to learn more
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
      accounts: [ROPSTEN_MAIN_ACCOUNT!]
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
