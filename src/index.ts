import { LAMPORTS_PER_SOL, PublicKey } from "@solana/web3.js";
import connection from "./config/connection";
import swap from "./controllers/swap";

const main = () => {

    // connection.onLogs(new PublicKey("DeQ8dPv6ReZNQ45NfiWwS5CchWpB2BVq1QMyNV8L2uSW"), (logs, ctx) => {
    //     console.log(logs);
        
    // })

    swap(new PublicKey("3WuhbyN2pe4QbRAxJeC3excAh15vRZMEQGUuFAVnidU2"), 10_000_000, true)

}

main();