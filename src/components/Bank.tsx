// TODO: SignMessage
import { verify } from '@noble/ed25519';
import { useConnection, useWallet } from '@solana/wallet-adapter-react';
import bs58 from 'bs58';
import { FC, useCallback, useState } from 'react';
import { notify } from "../utils/notifications";
import { Program, AnchorProvider, web3, utils, BN } from "@project-serum/anchor";
import idl from "./solanapdas.json";
import { PublicKey } from '@solana/web3.js';

const idl_string = JSON.stringify(idl);
const idl_objt = JSON.parse(idl_string);
const programID = new PublicKey(idl_objt.metadata.address);

export const Bank: FC = () => {
    const ourWallet = useWallet();
    const { connection } = useConnection();

    console.log("Wallet: " + ourWallet.publicKey?.toBase58());

    const [banks, setBanks] = useState([]);

    const getProvider = () => {
        const provider = new AnchorProvider(
            connection,
            ourWallet,
            AnchorProvider.defaultOptions()
        );
        return provider;
    }

    const createBank = async () => {
        try {
            const anchProvider = getProvider();
            const program = new Program(idl_objt, programID, anchProvider);

            const [bank] = PublicKey.findProgramAddressSync([
                utils.bytes.utf8.encode("bankaccount"),
                anchProvider.wallet.publicKey.toBuffer(),
            ], program.programId);

            await program.rpc.create("WsoS Bank", {
                accounts: {
                    bank,
                    user: anchProvider.wallet.publicKey,
                    systemProgram: web3.SystemProgram.programId,
                }
            })

            console.log("Bank created: " + bank.toString());
        }
        catch (error) {
            console.log("Error while creating bank account: " + error);
        }
    }

    const getBanks = async () => {
        try {
            const anchProvider = getProvider();
            const program = new Program(idl_objt, programID, anchProvider);

            Promise.all(
                (await connection.getProgramAccounts(programID)).map(async bank => ({
                    ...(await program.account.bank.fetch(bank.pubkey)),
                    pubkey: bank.pubkey,
                }))).then(banks => {
                    console.log("Banks: " + banks);
                    setBanks(banks);
                });
        }
        catch (error) {
            console.log("Error while getting bank accounts: " + error);
        }
    }

    const depositBank = async (publicKey) => {
        try {
            const anchProvider = getProvider();
            const program = new Program(idl_objt, programID, anchProvider);

            await program.rpc.deposit(new BN(0.1 * web3.LAMPORTS_PER_SOL), {
                accounts: {
                    bank: publicKey,
                    user: anchProvider.wallet.publicKey,
                    systemProgram: web3.SystemProgram.programId,
                }
            })

            console.log("Bank deposited: " + publicKey.toString());
        }
        catch (error) {
            console.log("Error while depositing: " + error);
        }
    }

    const withdrawBank = async (publicKey) => {
        try {
            const anchProvider = getProvider();
            const program = new Program(idl_objt, programID, anchProvider);

            await program.rpc.withdraw(new BN(0.1 * web3.LAMPORTS_PER_SOL), {
                accounts: {
                    bank: publicKey,
                    user: anchProvider.wallet.publicKey,
                }
            })

            console.log("Bank withdrawn: " + publicKey.toString());
        }
        catch (error) {
            console.log("Error while withdrawing: " + error);
        }
    }

            return (
                <>
                    {banks.map((bank) => {
                        return (
                            <div className="flex flex-row justify-center">
                                <>
                                    <div><h1>{bank.name.toString()}</h1>
                                        <p>{(bank.balance / web3.LAMPORTS_PER_SOL).toString() + " SOL"}</p>
                                    </div>
                                </>
                                <>
                                    <div className="flex flex-row justify-center">
                                        <div className="relative group items-center">
                                            <div className="m-1 absolute -inset-0.5 bg-gradient-to-r from-indigo-500 to-fuchsia-500 
                    rounded-lg blur opacity-20 group-hover:opacity-100 transition duration-1000 group-hover:duration-200 animate-tilt">

                                            </div>
                                            <button
                                                className="group w-60 m-2 btn animate-pulse bg-gradient-to-br from-indigo-500 to-fuchsia-500 hover:from-white hover:to-purple-300 text-black"
                                                onClick={() => depositBank(bank.pubkey)} disabled={!ourWallet.publicKey}
                                            >
                                                <div className="hidden group-disabled:block">
                                                    Wallet not connected
                                                </div>
                                                <span className="block group-disabled:hidden" >
                                                    Deposit 0.1 SOL
                                                </span>
                                            </button>
                                        </div>
                                    </div>

                                </>
                                <>
                                    <div className="flex flex-row justify-center">
                                        <div className="relative group items-center">
                                            <div className="m-1 absolute -inset-0.5 bg-gradient-to-r from-indigo-500 to-fuchsia-500 
                    rounded-lg blur opacity-20 group-hover:opacity-100 transition duration-1000 group-hover:duration-200 animate-tilt">

                                            </div>
                                            <button
                                                className="group w-60 m-2 btn animate-pulse bg-gradient-to-br from-indigo-500 to-fuchsia-500 hover:from-white hover:to-purple-300 text-black"
                                                onClick={() => withdrawBank(bank.pubkey)} disabled={!ourWallet.publicKey}
                                            >
                                                <div className="hidden group-disabled:block">
                                                    Wallet not connected
                                                </div>
                                                <span className="block group-disabled:hidden" >
                                                    Withdraw 0.1 SOL
                                                </span>
                                            </button>
                                        </div>
                                    </div>

                                </>
                            </div>
                        )
                    })}
                    <div className="flex flex-row justify-center">
                        <>
                            <div className="flex flex-row justify-center">
                                <div className="relative group items-center">
                                    <div className="m-1 absolute -inset-0.5 bg-gradient-to-r from-indigo-500 to-fuchsia-500 
                rounded-lg blur opacity-20 group-hover:opacity-100 transition duration-1000 group-hover:duration-200 animate-tilt"></div>
                                    <button
                                        className="group w-60 m-2 btn animate-pulse bg-gradient-to-br from-indigo-500 to-fuchsia-500 hover:from-white hover:to-purple-300 text-black"
                                        onClick={createBank} disabled={!ourWallet.publicKey}
                                    >
                                        <div className="hidden group-disabled:block">
                                            Wallet not connected
                                        </div>
                                        <span className="block group-disabled:hidden" >
                                            Create Bank
                                        </span>
                                    </button>
                                </div>
                            </div>
                        </>
                    </div>
                    <br></br>
                    <div className="flex flex-row justify-center">
                        <div className="relative group items-center">
                            <div className="m-1 absolute -inset-0.5 bg-gradient-to-r from-indigo-500 to-fuchsia-500 
                rounded-lg blur opacity-20 group-hover:opacity-100 transition duration-1000 group-hover:duration-200 animate-tilt"></div>
                            <button
                                className="group w-60 m-2 btn animate-pulse bg-gradient-to-br from-indigo-500 to-fuchsia-500 hover:from-white hover:to-purple-300 text-black"
                                onClick={getBanks} disabled={!ourWallet.publicKey}
                            >
                                <div className="hidden group-disabled:block">
                                    Wallet not connected
                                </div>
                                <span className="block group-disabled:hidden" >
                                    Fetch Banks
                                </span>
                            </button>
                        </div>
                    </div>
                </>
            );
        };