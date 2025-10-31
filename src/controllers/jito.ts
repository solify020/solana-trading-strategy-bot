import { LAMPORTS_PER_SOL, PublicKey, SystemProgram, Transaction, TransactionInstruction } from "@solana/web3.js";
import connection from "../config/connection";
import wallet from "../config/wallet";
import { JITO_TIP_ADDRESS, JITO_TIP_URL } from "../config/env";
import bs58 from "bs58";
import axios from "axios";

const convertBase64ToBase58 = (tx: any): string => {
    return bs58.encode(Buffer.from(tx, 'base64'));
};

const sendJitoBundle = async (transactions: Array<string>) => {
    const url = `${JITO_TIP_URL}/api/v1/bundles`;

    const data = {
        id: 1,
        jsonrpc: '2.0',
        method: 'sendBundle',
        params: [transactions]
    };

    axios.post(url, data, {
        headers: {
            'Content-Type': 'application/json'
        }
    })
        .then(response => {
            console.log('Response:', response.data);
            console.log(`https://explorer.jito.wtf/bundle/${response.data.result}`);
        })
        .catch(error => {
            console.error('Error:', error);
        });
};

const sendJitoTransaction = async (transaction: String) => {
    const url = `${JITO_TIP_URL}/api/v1/transactions`;

    const data = {
        id: 1,
        jsonrpc: '2.0',
        method: 'sendTransaction',
        params: [
            transaction,
            {
                "encoding": "base58"
            }
        ]
    };

    axios.post(url, data, {
        headers: {
            'Content-Type': 'application/json'
        }
    })
        .then(response => {
            console.log('Response:', response.data);
            console.log(`https://solscan.io/tx/${response.data.result}`);
        })
        .catch(error => {
            console.error('Error:', error);
        });
};

const jitoTipTx = async (tipAmount: number): Promise<String> => {
    const ix = SystemProgram.transfer({
        fromPubkey: wallet.publicKey,
        toPubkey: new PublicKey(JITO_TIP_ADDRESS),
        lamports: tipAmount * LAMPORTS_PER_SOL
    });
    const tx = new Transaction();
    tx.add(ix);
    tx.feePayer = wallet.publicKey;
    const { blockhash } = await connection.getLatestBlockhash();
    tx.recentBlockhash = blockhash;
    tx.sign(wallet);
    const resultTx = tx.serialize().toString('base64');

    return resultTx;
}

const jitoSendTipTx = (tipAmount: number): TransactionInstruction => {
    const ix = SystemProgram.transfer({
        fromPubkey: wallet.publicKey,
        toPubkey: new PublicKey(JITO_TIP_ADDRESS),
        lamports: tipAmount * LAMPORTS_PER_SOL
    });

    return ix;
}

export const jitoBundle = async (txArray: Array<any>, tipAmount: number) => {
    let txs = [];
    txs.push(convertBase64ToBase58(await jitoTipTx(tipAmount)));
    txArray.map((tx) => {
        tx.sign(wallet);
        txs.push(bs58.encode(tx.serialize()));
    })
    await sendJitoBundle(txs);
    return;
}

export const jitoSend = async (tx: Transaction, tipAmount: number) => {
    tx.add(jitoSendTipTx(tipAmount));
    tx.sign(wallet);
    const txBase58 = tx.serialize().toString('base64');
    const resultTx = convertBase64ToBase58(txBase58);
    await sendJitoTransaction(resultTx);
    return;
}