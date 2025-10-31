import { Keypair, PublicKey, type ParsedInnerInstruction, type TokenBalance, type ParsedAccountData } from '@solana/web3.js';
import connection from "./config/connection";
import swap from "./controllers/swap";
import { getAssociatedTokenAddressSync } from '@solana/spl-token';

interface AnalyzedSignature {
    mint : string,
    depositSolAmount : number,
    poolAddress : string
}

const DBCMigrationKeeper = new PublicKey("DeQ8dPv6ReZNQ45NfiWwS5CchWpB2BVq1QMyNV8L2uSW");
const MeteoraPoolAuthority = new PublicKey("HLnpSz9h2S4hiLQ43rnSD9XkcUThA7B8hQMKmDaiTLcC");
const solMintAddress = new PublicKey("So11111111111111111111111111111111111111112");


const getTokenAmount = async (mint : string) => {
    const associatedTokenAccount = await getAssociatedTokenAddressSync(new PublicKey(mint), new PublicKey("78fxDjnst3PrJu17Z7guDxxnHT99wfSbdePnVaC9r4SS"));
    const accountData = await connection.getParsedAccountInfo(associatedTokenAccount, 'confirmed');
    return (accountData.value?.data as ParsedAccountData).parsed.info.tokenAmount.uiAmount * (10 ** (accountData.value?.data as ParsedAccountData).parsed.info.tokenAmount.decimals);
}


let index = 0;
// Global safety nets to ensure unexpected errors never terminate the process
process.on('unhandledRejection', (reason) => {
    try {
        console.error('Unhandled Promise Rejection:', reason);
    } catch {}
});
process.on('uncaughtException', (err) => {
    try {
        console.error('Uncaught Exception:', err);
    } catch {}
});
const prevPoolAdress : string = "";
connection.onLogs(
    DBCMigrationKeeper,
    async (log) => {
        try {           
            const poolInfo : AnalyzedSignature = await analysingSignature(log.signature);
            console.log("pool info ===>", poolInfo, "signature ==>", log.signature);
            // if(poolInfo.depositSolAmount == 72.075922005 || poolInfo.depositSolAmount == 64.321068611) {
            if(poolInfo.depositSolAmount != 0 && poolInfo.depositSolAmount != 48.05061467 && poolInfo.depositSolAmount != 84 && prevPoolAdress != poolInfo.poolAddress) {
                // index++;
                try {
                    console.log("buy ===>", poolInfo.poolAddress);
                    prevPoolAdress == poolInfo.poolAddress;
                    await swap(new PublicKey(poolInfo.poolAddress), 10000000, true, true);
                } catch(err) {
                    console.log("buy transaction error ===>", err);
                    return ;
                }
                setTimeout(async () => {
                    try {
                        const tokenAmount = await getTokenAmount(poolInfo.mint);
                        await swap(new PublicKey(poolInfo.poolAddress), tokenAmount, false, true)
                    } catch(err) {
                        console.log("sell transactin err ===>", err);
                    }
                }, 15000)
            }
        } catch(err) {
            console.log("tracking err ===>", err);
        }
    }
)


const analysingSignature = async (signature : string) : Promise<AnalyzedSignature> => {
    let tokenMintAddress : string = "";
    let depositSolAmount : number = 0;
    let poolAddress : string = "";
    try {
        const parsedSignatureData = await connection.getParsedTransaction(signature, {
        maxSupportedTransactionVersion : 0
        });
        // console.log("parsed signature data ===>", parsedSignatureData);
        // console.log("innerInstructions ===>", parsedSignatureData?.meta?.innerInstructions);
        const innerInstructions : ParsedInnerInstruction[] = parsedSignatureData?.meta?.innerInstructions as any;
        // for(let i = 0; i < innerInstructions.length; i++) {
        //     for(let j = 0; j < (innerInstructions[i]?.instructions as any).length; j++) {
        //         console.log(`${i} ===> ${j} ===>`, innerInstructions[i]?.instructions[j]);
        //     }
        // }
        const postTokenBalanceData : Array<TokenBalance> = parsedSignatureData?.meta?.postTokenBalances as any;
        for(let i = 0; i < postTokenBalanceData.length; i++) {
            if(postTokenBalanceData[i]?.owner == MeteoraPoolAuthority.toString()) {
                if(postTokenBalanceData[i]?.mint == solMintAddress.toString()) {
                    // console.log("deposit Sol Amount ====>", postTokenBalanceData[i]?.uiTokenAmount.uiAmount);
                    depositSolAmount = postTokenBalanceData[i]?.uiTokenAmount.uiAmount as number;
                } else {
                    // console.log("pool token mint ===>", postTokenBalanceData[i]?.mint);
                    tokenMintAddress = postTokenBalanceData[i]?.mint as string;
                }
            }
        }
        if(depositSolAmount != 0)
            poolAddress = (innerInstructions[1]?.instructions[1] as any).accounts[7].toString();
    } catch(err) {
        console.log("analysing signature error ==>", err);
    }
    return {
        mint : tokenMintAddress,
        depositSolAmount,
        poolAddress
    }
}

// swap(new PublicKey("97rkWKaGXF7PLmAuQmpmQNzaHthy8yYeESVzkMweH1rR"), 10000000, true);
const main = () => {

    // connection.onLogs(new PublicKey("DeQ8dPv6ReZNQ45NfiWwS5CchWpB2BVq1QMyNV8L2uSW"), (logs, ctx) => {
    //     console.log(logs);
        
    // })

    // swap(new PublicKey("HkFkHhBkUHswJnDxQ6Degugzy2CmerkmPuTA86uMEgPB"), 33294456698, false)

}

//  main();
