import "@nomiclabs/hardhat-ethers";
import "@nomiclabs/hardhat-waffle";
import '@typechain/hardhat';
import 'hardhat-deploy';
import { HardhatUserConfig, task, types } from "hardhat/config";
import { Timestamper } from './typechain'

task("accounts", "Prints the list of accounts", async (taskArgs, hre) => {
  const accounts = await hre.ethers.getSigners();

  for (const account of accounts) {
    console.log(account.address);
  }
});

task("timestamp", "Record a timestamp")
  .addParam("hash", "The hash")
  .addOptionalParam("verify", "Verify if the hash exists", false, types.boolean)
  .setAction(async (taskArgs, { ethers, deployments }) => {
    const { hash, verify } = taskArgs
    // await deployments.fixture(['Timestamper'])
    const contract = <Timestamper>await ethers.getContract('Timestamper')
    const value = ethers.BigNumber.from(hash)

    if (verify) {
      const f = contract.filters.Timestamp(value)
      const qf = await contract.queryFilter(f)

      // TODO: double check the blockFrom this might get lost.
      if (qf.length > 0) {
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

// You need to export an object to set up your config
// Go to https://hardhat.org/config/ to learn more

/**
 * @type import('hardhat/config').HardhatUserConfig
 */
const config: HardhatUserConfig = {
  solidity: "0.8.4",
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
    // rinkeby: {
    //   // url: "https://eth-mainnet.alchemyapi.io/v2/123abc123abc123abc123abc123abcde",
    //   // accounts: [privateKey1, privateKey2, ...]
    // }
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
