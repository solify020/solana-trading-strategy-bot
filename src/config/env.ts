import { config } from "dotenv";

config();

const RPC_URL=process.env.RPC_URL as string;
const PRIVATE_KEY=process.env.PRIVATE_KEY as string;
const TOKEN_PROGRAM_ID=process.env.TOKEN_PROGRAM_ID as string;

export {
    RPC_URL,
    PRIVATE_KEY,
    TOKEN_PROGRAM_ID
}