import { lpad } from "../gazebo/utils";
import faker from 'faker';
import { existsSync, mkdirSync, readdirSync, statSync, writeFileSync } from "fs";
import slugify from 'slugify';
import { computeContentHash, createMerkleTree, makeProof, MerkleBinaryTree, PathInput, traverseProof } from "../merkle";

export const generateRandomFiles = (folder: string, count: number) => {
    // @ts-ignore
    faker.seed(`${folder}:${count}`)

    if (existsSync(folder)) {
        throw new Error(`folder ${folder} exists, leaving`)
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
}

export const generateRandomIDs = (folder: string, count: number) => {
    // @ts-ignore
    faker.seed(`${folder}:${count}`)

    if (existsSync(folder)) {
        throw new Error(`folder ${folder} exists, leaving`)
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
}

export const generateMerkleTreeFromFolder = (folder: string) => {
    if (!existsSync(folder)) {
        throw new Error(`folder ${folder} does not exists, leaving`)
    }

    const files = readdirSync(folder)
        .map(fileName => `${folder}/${fileName}`)
        .filter(path => statSync(path).isFile())
    files.sort()

    const items = files.map(path => ({ path }))
    return createMerkleTree(items)
}

export const generateMerkleProofForFile = (merkleFile: string, fileName: string) => {
    if (!existsSync(merkleFile)) {
        throw new Error(`file ${merkleFile} does not exists, leaving`)
    }

    const tree: MerkleBinaryTree<PathInput> = require(`../../${merkleFile}`)

    const searched = {
        path: fileName
    }

    const proof = makeProof(tree, searched)

    if (!proof) {
        throw new Error('searched item not found')
    }

    return proof
}

export const traverseProofFile = async (proofFile: string, filePath: string): Promise<string> => {
    if (!existsSync(filePath)) {
        throw new Error(`file ${filePath} does not exists, leaving`)
    }

    if (!existsSync(proofFile)) {
        throw new Error(`file ${proofFile} does not exists, leaving`)
    }

    const proof = require(`../../${proofFile}`)
    const fileHash = await computeContentHash({ path: filePath })
    const resultingHash = await traverseProof(proof, fileHash)

    return resultingHash;
}