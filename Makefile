
api:
	yarn build && \
	  docker-compose -f docker-compose.yml -f docker-compose.local.yml build api && \
	  docker-compose -f docker-compose.yml -f docker-compose.local.yml up api

mongo:
	docker-compose -f docker-compose.yml -f docker-compose.local.yml up mongo mongo-express


compile:
	npx hardhat compile # --force

test:
	npx hardhat test --network localhost