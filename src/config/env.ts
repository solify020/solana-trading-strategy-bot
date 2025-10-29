import { config } from "dotenv";

config();

const RPC_URL=process.env.RPC_URL;
const PRIVATE_KEY=process.env.PRIVATE_KEY;
const TOKEN_PROGRAM_ID=process.env.TOKEN_PROGRAM_ID;

export {
    RPC_URL,
    PRIVATE_KEY,
    TOKEN_PROGRAM_ID
}