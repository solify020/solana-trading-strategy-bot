import { PublicKey } from "@solana/web3.js";
import connection from "../config/connection";

const getTokenVault = async (walletAddress: string, tokenAddress: string) => {
  const ownerPubkey = new PublicKey(walletAddress);
  const mintPubkey = new PublicKey(tokenAddress);

  const accounts = await connection.getTokenAccountsByOwner(ownerPubkey, {
    mint: mintPubkey
  });

  if (accounts.value.length > 0) {
    console.log('Token Vault Address:', accounts.value[0].pubkey.toString());
    return accounts.value[0].pubkey.toString();
  } else {
    console.log('No vault found—create one with getOrCreateAssociatedTokenAccount.');
  }
}