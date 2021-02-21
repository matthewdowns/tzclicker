const { TezosToolkit } = require('@taquito/taquito');
const { importKey } = require('@taquito/signer');
const { readFileSync } = require('fs');
const { join, resolve } = require('path');

const provider = 'https://testnet-tezos.giganode.io';

const privateKey = process.argv[2];
if (!privateKey) throw new Error('No private key provided.');

const basePath = resolve(__dirname, '../');
const buildPath = join(basePath, 'build');
const michelsonPath = join(buildPath, 'clicker.tz');
const michelsonStoragePath = join(buildPath, 'clicker.storage.tz');

const michelsonCode = readFileSync(michelsonPath).toString('utf-8');
const michelsonStorageCode = readFileSync(michelsonStoragePath).toString('utf-8');

async function deploy() {
    const tezos = new TezosToolkit(provider);
    await importKey(tezos, privateKey);

    console.log("Starting originate operation...");
    const operation = await tezos.contract.originate({
        code: michelsonCode,
        init: michelsonStorageCode
    });
    console.log(`Contract originated at ${operation.contractAddress}`);
    console.log(`Origination used up ${operation.consumedGas} gas`);
    console.log(`Total storage size: ${operation.storageSize}`);
    console.log(`Awaiting confirmation...`);
    const confirmed = await operation.confirmation();
    console.log("CONFIRMED");
}

deploy();