import React, { useState, useEffect } from "react";
import { contractABI, contractAddress } from '../lib/constants'
import { ethers } from 'ethers'
import { client } from '../lib/sanityClient'

export const TransactionContext = React.createContext()

let eth

if (typeof window !== 'undefined') {
    eth = window.ethereum
}

const getEtheriumContract = () => {
    const provider = new ethers.providers.Web3Provider(eth)
    const signer = provider.getSigner()
    const transactionContract = new ethers.Contract(
        contractAddress,
        contractABI,
        signer
    )

    return transactionContract;
};


export const TransactionProvider = ({ children }) => {
    const [currentAccount, setCurrentAccount] = useState(null);
    const [isLoading, setIsLoading] = useState(false);
    const [formData, setFormData] = useState({
        addressTo: '',
        amount: ''
    });


    useEffect(() => {
        checkIfWallterIsConnected()
    }, [])

    // create new user profile in db
    useEffect(() => {
        if (!currentAccount) return
            ; (async () => {
                const userDoc = {
                    _type: 'users',
                    _id: currentAccount,
                    userName: 'Unnamed',
                    address: currentAccount,
                }

                await client.createIfNotExists(userDoc)
            })()
    }, [currentAccount])

    const connectWallet = async (metamask = eth) => {
        try {
            if (!metamask) return alert('Please install metamask ')

            const accounts = await metamask.request({ method: 'eth_requestAccounts' })

            setCurrentAccount(accounts[0])
        } catch (error) {
            console.error(error)
            throw new Error('No ethereum object.')
        }
    }

    const checkIfWallterIsConnected = async (metamask = eth) => {
        try {
            if (!metamask) return alert('Please install metamask ')
            const accounts = await metamask.request({ method: `eth_accounts` })

            if (accounts.length) {
                setCurrentAccount(accounts[0])
                console.log('Wallet is already connected')
            }
        }
        catch (error) {
            console.error(error)
            throw new Error('No ethereum object.')
        }
    }

    const sendTransaction = async (
        metamask = eth,
        connectedAccount = currentAccount
    ) => {
        try {
            if (!metamask) return alert('Please install metamask ')
            const { addressTo, amount } = formData;

            const transactionContract = getEtheriumContract();

            const parsedAmount = ethers.utils.parseEther(amount);

            await metamask.request({
                method: 'eth_sendTransaction',
                params: [{
                    from: connectedAccount,
                    to: addressTo,
                    gas: '0x7EF40',
                    value: parsedAmount._hex,
                }
                ]
            });

            const transactionHash = await transactionContract.publishTransaction(
                addressTo,
                parsedAmount,
                `Transaction ETH ${parsedAmount} to ${addressTo}`,
                `TRANSFER`
            )

            setIsLoading(true);

            setFormData({
                addressTo: '',
                amount: ''
            })

            await transactionHash.wait()

            // db
            await saveTransaction(
                transactionHash.hash,
                amount,
                connectedAccount,
                addressTo
            )

            setIsLoading(false);
        }
        catch (error) {
            console.error(error)
        }

    };

    const handleChange = (e, name) => {
        setFormData((prevState) => ({
            ...prevState, [name]: e.target.value
        }))
    };

    const saveTransaction = async (
        txHash,
        amount,
        fromAddress = currentAccount,
        toAddress,
    ) => {
        const txDoc = {
            _type: 'transactions',
            _id: txHash,
            fromAddress: fromAddress,
            toAddress: toAddress,
            timestamp: new Date(Date.now()).toISOString(),
            txHash: txHash,
            amount: parseFloat(amount),
        }

        await client.createIfNotExists(txDoc)

        await client
            .patch(currentAccount)
            .setIfMissing({ transactions: [] })
            .insert('after', 'transactions[-1]', [
                {
                    _key: txHash,
                    _ref: txHash,
                    _type: 'reference',
                },
            ])
            .commit()



        return
    };


    return (
        <TransactionContext.Provider
            value={{
                currentAccount,
                connectWallet,
                sendTransaction,
                handleChange,
                formData,
                isLoading
            }
            }>
            {children}
        </TransactionContext.Provider >
    )
}

