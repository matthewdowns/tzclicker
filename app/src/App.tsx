import {
    AccountInfo,
    Network,
    NetworkType,
    TezosOperationType
} from '@airgap/beacon-sdk';
import {
    TezosToolkit,
    ContractAbstraction,
    ContractProvider,
    Wallet,
    MichelsonMap
} from '@taquito/taquito';
import { BeaconWallet } from '@taquito/beacon-wallet';
import { BigNumber } from 'bignumber.js';
import React, { useEffect, useState } from 'react';

const tezos = new TezosToolkit('https://testnet-tezos.giganode.io');
const network: Network = { type: NetworkType.DELPHINET };

function App() {
    const [contract, setContract] = useState<ContractAbstraction<ContractProvider>>();
    const [beacon, setBeacon] = useState<BeaconWallet>();
    const [activeAccount, setActiveAccount] = useState<AccountInfo>();
    const [totalClicks, setTotalClicks] = useState<BigNumber>();
    const [clickMap, setClickMap] = useState<MichelsonMap<any, any>>();

    useEffect(() => {
        if (!contract) {
            tezos.contract.at('KT1TYaVwRUfzMTtQneNN2XCaWG77BuX4dGxG')
                .then(value => {
                    setContract(value);
                    setInterval(() => {
                        value.storage<{ total_clicks: BigNumber, click: MichelsonMap<string, number> }>()
                            .then(value => {
                                setTotalClicks(value.total_clicks);
                                setClickMap(value.click);
                            });
                    }, 1000);
                });
        }
    });

    return (
        <div>
            <div>
                {beacon ? (
                    <button
                        onClick={async () => {
                            await beacon.disconnect();
                            setBeacon(undefined);
                            setActiveAccount(undefined);
                        }}
                    >
                        Disconnect wallet
                    </button>
                ) : (
                    <button
                        onClick={async () => {
                            try {
                                const beaconWallet = new BeaconWallet({ name: 'TzClicker' });
                                await beaconWallet.client.requestPermissions({ network });
                                setBeacon(beaconWallet);
                                beaconWallet.client.getActiveAccount().then(value => setActiveAccount(value));
                            } catch { }
                        }}
                    >
                        Connect wallet
                    </button>
                )}
            </div>
            <div>
                <pre>
                    {JSON.stringify(activeAccount, null, 4)}
                </pre>
            </div>
            <hr />
            {contract && (
                <div>
                    <h1>TzClicker</h1>
                    <h4>Total clicks: {totalClicks ? totalClicks.toNumber() : 'Loading...'}</h4>
                    <button
                        disabled={beacon === undefined || activeAccount === undefined}
                        onClick={async () => {
                            if (beacon && activeAccount) {
                                const methodTransferParams = contract.methods.default(1).toTransferParams();
                                const operation = await beacon.client.requestOperation({
                                    operationDetails: [
                                        {
                                            kind: TezosOperationType.TRANSACTION,
                                            amount: '10000',
                                            destination: methodTransferParams.to,
                                            parameters: methodTransferParams.parameter as any
                                        }
                                    ]
                                });
                            }
                        }}
                    >
                        Click
                    </button>
                    {clickMap && (
                        <div>
                            <h4>History</h4>
                            <table>
                                <thead>
                                    <tr>
                                        <th>Address</th>
                                        <th>Value</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {Array.from(clickMap.keys()).map(key => {
                                        const value: BigNumber = clickMap.get(key);

                                        return (
                                            <tr>
                                                <td>{key}</td>
                                                <td>{value.toNumber()}</td>
                                            </tr>
                                        )
                                    })}
                                </tbody>
                            </table>
                        </div>
                    )}
                </div>
            )}
        </div>
    )
}

export default App;