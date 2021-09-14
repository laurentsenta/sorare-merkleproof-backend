

const proof = require('./generated-test-ids.proof.json')
const payload = require('./generated-test-ids/0309210-andrew-oreilly.json')

const data = { proof, payload }
console.log(data)

const buff = Buffer.from(JSON.stringify(data))
const d = buff.toString('base64');
console.log(d)
console.log(d.length)

data.payload.title = 'CEO'

const buff2 = Buffer.from(JSON.stringify(data))
const d2 = buff2.toString('base64');
console.log(d2)
console.log(d2.length)