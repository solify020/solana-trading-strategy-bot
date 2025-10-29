import { PublicKey, sendAndConfirmTransaction } from "@solana/web3.js";
import connection from "../config/connection";
import cpAmm from "../config/cpAmm"
import BN from "bn.js";
import { TOKEN_PROGRAM_ID } from "../config/env";
import wallet from "../config/wallet";

const swap = async (poolAddress: PublicKey, swapAmount: number, isBuy: boolean) => {
    try {
    const poolState = await cpAmm.fetchPoolState(poolAddress);
    // console.log("pool state ===>", poolState);
    const currentSlot = await connection.getSlot();
    const blockTime = await connection.getBlockTime(currentSlot);
    console.log("currentSlot ===>", currentSlot);
    console.log("blocktime ===>", blockTime);

    // Get quote first
    const quote = await cpAmm.getQuote({
        inAmount: new BN(swapAmount),
        inputTokenMint: isBuy ? poolState.tokenBMint : poolState.tokenAMint,
        slippage: 100,
        poolState,
        currentTime: blockTime,
        currentSlot,
    });
    // console.log("quote ===>", quote);

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
    swapTx.feePayer = wallet.publicKey;
    swapTx.recentBlockhash = (await connection.getLatestBlockhash()).blockhash;
    swapTx.lastValidBlockHeight = (await connection.getLatestBlockhash()).lastValidBlockHeight;
    swapTx.sign(wallet);

    const txResult = await sendAndConfirmTransaction(connection, swapTx, [wallet]);

    console.log(isBuy == true ? "buy tx ===>" : "sell tx ===>", txResult);
    } catch(err) {
        console.log("swap error ===>", err);
    }
}

export default swap;