import { config } from "dotenv";

config();

const RPC_URL=process.env.RPC_URL as string;
const PRIVATE_KEY=process.env.PRIVATE_KEY as string;
const TOKEN_PROGRAM_ID=process.env.TOKEN_PROGRAM_ID as string;
const JITO_TIP_ADDRESS = process.env.JITO_TIP_ADDRESS as string;
const JITO_TIP_URL = process.env.JITO_TIP_URL as string;
const USE_JITO = process.env.USE_JITO;
const JITO_TIP_AMOUNT = process.env.JITO_TIP_AMOUNT as string;

export {
    RPC_URL,
    PRIVATE_KEY,
    TOKEN_PROGRAM_ID,
    JITO_TIP_AMOUNT,
    JITO_TIP_ADDRESS,
    JITO_TIP_URL,
    USE_JITO
}