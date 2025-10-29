import { Keypair } from "@solana/web3.js";
import { PRIVATE_KEY } from "./env";
import bs58 from "bs58";

const secretKey = bs58.decode(PRIVATE_KEY);
const wallet = Keypair.fromSecretKey(secretKey);

export default wallet;