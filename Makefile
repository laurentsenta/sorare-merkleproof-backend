TEST_FILE=./generated-test-data/0048-wendy-blanda.json

api:
	yarn build &&
		docker-compose -f docker-compose.yml -f docker-compose.local.yml build api &&
		docker-compose -f docker-compose.yml -f docker-compose.local.yml up api

mongo:
	docker-compose -f docker-compose.yml -f docker-compose.local.yml up mongo mongo-express

compile:
	npx hardhat compile # --force

test:
	npx hardhat test --network localhost

demo-timestamp:
	npx hardhat timestamp --network localhost --hash 42

demo-verify:
	npx hardhat timestamp --network localhost --hash 42 --verify true

demo-generate:
	npx hardhat generate --network localhost --folder ./generated-test-data --count 100

demo-merklehash:
	npx hardhat merklehash --network localhost --folder ./generated-test-data --output-file generated-test-data.tree.json --on-chain true

demo-merkleproof:
	npx hardhat merkleproof --network localhost --merkle-file ./generated-test-data.tree.json --file-name ${TEST_FILE} --output-file ./generated-test-data.proof.json

demo-verifyproof:
	cp ${TEST_FILE} /tmp/tested-file
	npx hardhat verifyproof --network localhost --file-path /tmp/tested-file --proof-file ./generated-test-data.proof.json

demo-tampered-verifyproof:
	cp ${TEST_FILE} /tmp/tested-file
	echo tampered >> /tmp/tested-file
	npx hardhat verifyproof --network localhost --file-path /tmp/tested-file --proof-file ./generated-test-data.proof.json
