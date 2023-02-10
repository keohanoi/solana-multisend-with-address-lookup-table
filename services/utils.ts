//@ts-nocheck
import {
  Connection,
  Keypair,
  PublicKey,
  TransactionInstruction,
  TransactionMessage,
  AddressLookupTableProgram,
  VersionedTransaction,
} from "@solana/web3.js";

import {
  SolanaService,
  TokenProgramService,
} from "@coin98/solana-support-library";

export async function sendTransactionV0WithLookupTable(
  connection: Connection,
  instructions: TransactionInstruction[],
  payer: Keypair,
  lookupTablePubkey: PublicKey
): Promise<string> {
  const lookupTableAccount = await connection
    .getAddressLookupTable(lookupTablePubkey)
    .then((res) => res.value);

  let blockhash = await connection
    .getLatestBlockhash()
    .then((res) => res.blockhash);

  const messageV0 = new TransactionMessage({
    payerKey: payer.publicKey,
    recentBlockhash: blockhash,
    instructions,
  }).compileToV0Message([lookupTableAccount]);

  const tx = new VersionedTransaction(messageV0);
  tx.sign([payer]);
  return connection.sendTransaction(tx);
}

export function createKeypairFromFile(path: string): Keypair {
  return Keypair.fromSecretKey(
    Buffer.from(JSON.parse(require("fs").readFileSync(path, "utf-8")))
  );
}

export async function sendTransactionV0(
  connection: Connection,
  instructions: TransactionInstruction[],
  payer: Keypair
): Promise<void> {
  let blockhash = await connection
    .getLatestBlockhash("confirmed")
    .then((res) => res.blockhash)
    .catch((err) => console.log(err));

  const messageV0 = new TransactionMessage({
    payerKey: payer.publicKey,
    recentBlockhash: blockhash,
    instructions,
  }).compileToV0Message();

  const tx = new VersionedTransaction(messageV0);
  tx.sign([payer]);
  return connection.sendTransaction(tx);
}
export async function createALT(
  connection: Connection,
  payer: Keypair,
  authority: PublicKey
): Promise<PublicKey> {
  const [ix, lookupTablePubkey] = AddressLookupTableProgram.createLookupTable({
    authority: authority,
    payer: payer.publicKey,
    recentSlot: await connection.getSlot("finalized"),
  });

  console.log(" 🍑 🐳 🐳 🐳  lookupTablePubkey", lookupTablePubkey);

  await sendTransactionV0(connection, [ix], payer);
  return lookupTablePubkey;
}

export async function extendALT(
  connection: Connection,
  payer: Keypair,
  lookupTablePubkey: PublicKey,
  recipients: PublicKey[]
): Promise<void[]> {
  let result: Promise<void>[] = [];
  let addresses = Array.from(recipients);

  if (addresses.length >= 15) {
    splitIntoArrays(addresses, 15).forEach((group) => {
      result.push(
        sendTransactionV0(
          connection,
          [
            AddressLookupTableProgram.extendLookupTable({
              addresses: group,
              authority: payer.publicKey,
              lookupTable: lookupTablePubkey,
              payer: payer.publicKey,
            }),
          ],
          payer
        )
      );
    });
  } else {
    result = [
      sendTransactionV0(
        connection,
        [
          AddressLookupTableProgram.extendLookupTable({
            addresses: addresses,
            authority: payer.publicKey,
            lookupTable: lookupTablePubkey,
            payer: payer.publicKey,
          }),
        ],
        payer
      ),
    ];
  }
  return Promise.all(result);
}

function splitIntoArrays(elements: any[], elementNumberEachArray: number) {
  if (elementNumberEachArray > elements.length) {
    console.log(
      "Invalid number of element each array greater than array's length."
    );
    return [];
  }
  const result: any[] = [];
  while (elements.length) {
    result.push(elements.splice(0, elementNumberEachArray));
  }
  return result;
}

export function getAccounts(numberOfAccounts: number): PublicKey[] {
  const result = [];
  for (let index = 0; index < numberOfAccounts; index++) {
    result.push(Keypair.generate().publicKey);
  }
  return result;
}

export async function createAssociatedTokenAccountIfNotExists(
  connection: Connection,
  payerAccount: Keypair,
  ownerAddress: PublicKey,
  tokenMintAddress: PublicKey
): Promise<PublicKey> {
  const tokenAccountAddress = TokenProgramService.findAssociatedTokenAddress(
    ownerAddress,
    tokenMintAddress
  );
  if (await SolanaService.isAddressInUse(connection, tokenAccountAddress)) {
    console.log(
      `SKIPPED: Associated Token Account ${tokenAccountAddress.toBase58()} of Account ${ownerAddress.toBase58()} is already existed`,
      "\n"
    );
    return tokenAccountAddress;
  }

  return TokenProgramService.createAssociatedTokenAccount(
    connection,
    payerAccount,
    ownerAddress,
    tokenMintAddress
  );
}

export const delay = (delayInms) => {
  return new Promise((resolve) => setTimeout(resolve, delayInms));
};
