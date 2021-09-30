import { expect } from "chai";
import { deployments, ethers, getNamedAccounts } from "hardhat";
import { Timestamper } from '../typechain';

describe("Timestamper", function () {
  it("Should let me timestamp a hash (using hardhat deploy)", async function () {
    await deployments.fixture(['Timestamper'])
    const contract = <Timestamper>await ethers.getContract('Timestamper')

    const { deployer } = await getNamedAccounts();

    const now = Date.now()

    await expect(contract.timestamp(now, { from: deployer }))
      .to.emit(contract, 'Timestamp').withArgs(now)
  });

  it("Should not let anyone timestamp a hash (using hardhat deploy)", async function () {
    await deployments.fixture(['Timestamper'])
    const contract = <Timestamper>await ethers.getContract('Timestamper')

    const { someUser } = await ethers.getNamedSigners()

    const now = (new Date()).getTime()

    await expect(contract.connect(someUser).timestamp(now))
      .to.be.reverted;
  });

  it("Should let me timestamp a hash", async function () {
    const Timestamper = await ethers.getContractFactory("Timestamper");
    const contract = await Timestamper.deploy();
    await contract.deployed();

    const now = (new Date()).getTime()

    await expect(contract.timestamp(now))
      .to.emit(contract, 'Timestamp').withArgs(now)
  });

  it("Should let me timestamp a bunch of hashes", async function () {
    const Timestamper = await ethers.getContractFactory("Timestamper");
    const contract = await Timestamper.deploy();
    await contract.deployed();

    const a = Math.round((new Date()).getTime() / 2)
    const b = a + 1
    const c = b + 1

    await expect(contract.batchTimestamp([a, b, c]))
      .to.emit(contract, 'Timestamp').withArgs(a)
      .to.emit(contract, 'Timestamp').withArgs(b)
      .to.emit(contract, 'Timestamp').withArgs(c)
  });

  it.skip("Should self destruct if needed", async function () {
    const Timestamper = await ethers.getContractFactory("Timestamper");
    const contract = await Timestamper.deploy();
    await contract.deployed();

    // TODO
  });
});
