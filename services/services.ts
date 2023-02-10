import { Connection, Keypair, PublicKey } from "@solana/web3.js";
import { Instructions } from "./instructions";
import BN from "bn.js";
import { TOKEN_PROGRAM_ID } from "@coin98/solana-support-library";
import {
  createAssociatedTokenAccountIfNotExists,
  delay,
  extendALT,
} from "./utils";
import { sendTransactionV0WithLookupTable } from "./utils";

export class Services {
  static async transferTokenWithALT(
    connection: Connection,
    payer: Keypair,
    from: PublicKey,
    recipients: PublicKey[],
    addressLookupTable: PublicKey,
    mint: PublicKey,
    authority: PublicKey,
    amount: BN,
    programId: PublicKey
  ): Promise<string> {
    const promises = recipients.map(async (address) => {
      return createAssociatedTokenAccountIfNotExists(
        connection,
        payer,
        address,
        mint
      );
    });
    const ATAsAddress = await Promise.all(promises);
    const fromATA = await createAssociatedTokenAccountIfNotExists(
      connection,
      payer,
      from,
      mint
    );

    await extendALT(connection, payer, addressLookupTable, [
      ...ATAsAddress,
      TOKEN_PROGRAM_ID,
      fromATA,
      authority,
      from,
    ]);
    await delay(1000);

    const [lookupTable] = await Promise.all([
      connection.getAddressLookupTable(addressLookupTable, {
        commitment: "confirmed",
      }),
      ,
    ]);

    const addresses = lookupTable.value.state.addresses;
    console.log(" 🍑 🐳 🐳 🐳  addresses", addresses);

    const ixs = recipients.map((to: PublicKey) => {
      return Instructions.TransferTokenInstruction(
        payer.publicKey,
        from,
        to,
        mint,
        authority,
        amount,
        programId
      );
    });

    return sendTransactionV0WithLookupTable(
      connection,
      ixs,
      payer,
      addressLookupTable
    );
  }
}
