import { PublicKey, sendAndConfirmTransaction } from "@solana/web3.js";
import connection from "../config/connection";
import cpAmm from "../config/cpAmm"
import BN from "bn.js";
import { JITO_TIP_AMOUNT, TOKEN_PROGRAM_ID, USE_JITO } from "../config/env";
import wallet from "../config/wallet";
import {jitoBundle, jitoSend} from "./jito";

const swap = async (poolAddress: PublicKey, swapAmount: number, isBuy: boolean) => {

    const poolState = await cpAmm.fetchPoolState(poolAddress);
    const currentSlot = await connection.getSlot();
    const blockTime = await connection.getBlockTime(currentSlot);
    
    // Get quote first
    const quote = await cpAmm.getQuote({
        inAmount: new BN(swapAmount),
        inputTokenMint: isBuy ? poolState.tokenBMint : poolState.tokenAMint,
        slippage: 100,
        poolState,
        currentTime: blockTime,
        currentSlot,
    });

    // Execute swap
    const swapTx = await cpAmm.swap({
        payer: wallet.publicKey,
        pool: poolAddress,
        inputTokenMint: isBuy ? poolState.tokenBMint : poolState.tokenAMint,
        outputTokenMint: isBuy ? poolState.tokenAMint : poolState.tokenBMint,
        amountIn: new BN(swapAmount),
        minimumAmountOut: quote.minSwapOutAmount,
        tokenAVault: poolState.tokenAVault,
        tokenBVault: poolState.tokenBVault,
        tokenAMint: poolState.tokenAMint,
        tokenBMint: poolState.tokenBMint,
        referralTokenAccount: null,
        tokenAProgram: new PublicKey(TOKEN_PROGRAM_ID),
        tokenBProgram: new PublicKey(TOKEN_PROGRAM_ID),
    });

    const latest = await connection.getLatestBlockhash();
    swapTx.recentBlockhash = latest.blockhash;
    swapTx.lastValidBlockHeight = latest.lastValidBlockHeight;
    swapTx.feePayer = wallet.publicKey;

    swapTx.sign(wallet);

    if (USE_JITO) jitoSend(swapTx, parseFloat(JITO_TIP_AMOUNT));
    else await sendAndConfirmTransaction(connection, swapTx, [wallet]);
}

export default swap;