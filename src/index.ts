import { LAMPORTS_PER_SOL, PublicKey } from "@solana/web3.js";
import connection from "./config/connection";
import swap from "./controllers/swap";

const main = () => {

    // connection.onLogs(new PublicKey("DeQ8dPv6ReZNQ45NfiWwS5CchWpB2BVq1QMyNV8L2uSW"), (logs, ctx) => {
    //     console.log(logs);
        
    // })

    swap(new PublicKey("EFojunAC3j8yiUeHKmvwjKEpx52C1wig9djvVkB1F6Y"), 10_000_000, true)

}

main();