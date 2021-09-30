/**
 * Note: thorouh this file we require ethers as a parameter.
 * 
 * This is because hardhat provide us with a custom ethers and
 * we want to use this for now.
 */
import { BigNumber } from "@ethersproject/bignumber";
import { Timestamper } from '@merkle-typechain';

type HardhatEthers = any // TODO: precise or get rid of it.

export const hasTimestamp = async (contract: Timestamper, value: BigNumber): Promise<boolean> => {
    // TODO: double check the blockFrom this might get lost.
    const f = contract.filters.Timestamp(value)
    const qf = await contract.queryFilter(f)
    return qf.length > 0
}

export const verifyTimestamp = async (hash: string, ethers: HardhatEthers): Promise<boolean> => {
    const contract = <Timestamper>await ethers.getContract('Timestamper')
    const value = ethers.BigNumber.from(hash)
    return await hasTimestamp(contract, value)
}

export const doTimestamp = async (hash: string | Uint8Array, ethers: HardhatEthers): Promise<void> => {
    const contract = <Timestamper>await ethers.getContract('Timestamper')
    const value = ethers.BigNumber.from(hash)
    await contract.timestamp(value)
}