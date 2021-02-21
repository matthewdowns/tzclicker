const { TezosToolkit } = require('@taquito/taquito');
const { importKey } = require('@taquito/signer');

const provider = 'https://testnet-tezos.giganode.io';
const alicePk = '';

const contractAddress = '';

async function addClick() {
    const tezos = new TezosToolkit(provider);
    await importKey(tezos, alicePk);

    const contract = await tezos.contract.at(contractAddress);
    //console.log(contract);
    
    const operation = await contract.methods.default().send();
    console.log(operation);
}

addClick();