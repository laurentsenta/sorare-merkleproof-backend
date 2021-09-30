/**
 * Script demo,
 * Keeping this nearby in case I need to add more.
 */
import { ethers } from "hardhat";

async function main() {
  const input = 42

  const Timestamper = await ethers.getContractFactory("Timestamper");
  const contract = await Timestamper.deploy();

  await contract.timestamp(input)

  console.log("Timestamp completed");
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
