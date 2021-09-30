import crypto from 'crypto';

// source:
// https://github.com/multiformats/js-multiformats/blob/master/src/hashes/sha2.js
// I'd rather use the library but it tries to use the browser version when I import it.

export const sha256 = (input: Uint8Array) =>
    crypto.createHash('sha256').update(input).digest()

// source:
// https://github.com/multiformats/js-multiformats/blob/master/src/bytes.js
export const fromString = (str: string) => (new TextEncoder()).encode(str)

export const toString = (b: Uint8Array) => (new TextDecoder()).decode(b)

// source:
// https://stackoverflow.com/a/55311625/843194
export const toBase64String = (b: Uint8Array) => Buffer.from(b).toString('base64');