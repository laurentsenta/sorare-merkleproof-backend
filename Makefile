TEST_FILE=./generated-test-data/0048-wendy-blanda.json
NETWORK:="localhost"

api:
	yarn build &&
		docker-compose -f docker-compose.yml -f docker-compose.local.yml build api &&
		docker-compose -f docker-compose.yml -f docker-compose.local.yml up api

mongo:
	docker-compose -f docker-compose.yml -f docker-compose.local.yml up mongo mongo-express

compile:
	npx hardhat compile # --force

test:
	npx hardhat test --network ${NETWORK}

export-all:
	npx hardhat deploy --export-all ./deploy.export.json 

demo-node:
	npx hardhat node

demo-timestamp:
	npx hardhat timestamp --network ${NETWORK} --hash 42

demo-verify:
	npx hardhat timestamp --network ${NETWORK} --hash 42 --verify true

demo-generate:
	npx hardhat generate --network ${NETWORK} --folder ./generated-test-data --count 100

demo-merklehash:
	npx hardhat merklehash --network ${NETWORK} --folder ./generated-test-data --output-file generated-test-data.tree.json --on-chain true

demo-merkleproof:
	npx hardhat merkleproof --network ${NETWORK} --merkle-file ./generated-test-data.tree.json --file-name ${TEST_FILE} --output-file ./generated-test-data.proof.json

demo-verifyproof:
	cp ${TEST_FILE} /tmp/tested-file
	npx hardhat verifyproof --network ${NETWORK} --file-path /tmp/tested-file --proof-file ./generated-test-data.proof.json

demo-tampered-verifyproof:
	cp ${TEST_FILE} /tmp/tested-file
	echo tampered >> /tmp/tested-file
	npx hardhat verifyproof --network ${NETWORK} --file-path /tmp/tested-file --proof-file ./generated-test-data.proof.json
