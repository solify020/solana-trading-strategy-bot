import { PublicKey, sendAndConfirmTransaction } from "@solana/web3.js";
import connection from "../config/connection";
import cpAmm from "../config/cpAmm"
import BN from "bn.js";
import { TOKEN_PROGRAM_ID } from "../config/env";
import wallet from "../config/wallet";

const swap = async (poolAddress: PublicKey, swapAmount: number, isBuy: boolean) => {

    const poolState = await cpAmm.fetchPoolState(poolAddress);
    const currentSlot = await connection.getSlot();
    const blockTime = await connection.getBlockTime(currentSlot);
    
    // Get quote first
    const quote = await cpAmm.getQuote({
        inAmount: new BN(swapAmount),
        inputTokenMint: isBuy ? poolState.tokenBMint : poolState.tokenAMint,
        slippage: 0.5,
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
        tokenAVault: isBuy ? poolState.tokenBVault : poolState.tokenAMint,
        tokenBVault: isBuy ? poolState.tokenAVault : poolState.tokenBMint,
        tokenAMint: isBuy ? poolState.tokenBMint : poolState.tokenAMint,
        tokenBMint: isBuy ? poolState.tokenAMint : poolState.tokenBMint,
        referralTokenAccount: null,
        tokenAProgram: new PublicKey(TOKEN_PROGRAM_ID),
        tokenBProgram: new PublicKey(TOKEN_PROGRAM_ID),
    });

    console.log(swapTx);
    

    const txResult = await sendAndConfirmTransaction(connection, swapTx, [wallet]);

    console.log(txResult);
}

export default swap;