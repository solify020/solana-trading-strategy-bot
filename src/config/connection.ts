import { Connection as Rpc } from "@solana/web3.js";
import { RPC_URL } from "./env";

const connection = new Rpc(RPC_URL);

export default connection;