import { Keypair, Connection, PublicKey, clusterApiUrl } from "@solana/web3.js";
import { BN } from "@project-serum/anchor";
import { TokenProgramService } from "@coin98/solana-support-library";
import { SolanaConfigService } from "@coin98/solana-support-library/config";
import { Services } from "../services/services";
import { extendALT, getAccounts, createALT, delay } from "../services/utils";

describe("multisend", function () {
  // Configure the client to use the local cluster.
  const programId: PublicKey = new PublicKey(
    "2UaKRD8rNjaE7uhtdZokARjv79oX8yLiykt162tYSRvc"
  );
  let addressLookupTable: PublicKey;

  const connection = new Connection("http://localhost:8899", "confirmed");
  const tokenMint = Keypair.generate();
  let ownerAccount: Keypair;
  let recipients: PublicKey[] = getAccounts(41);

  before(async function () {
    ownerAccount = await SolanaConfigService.getDefaultAccount();

    console.log(" 🍑 🐳 🐳 🐳  ownerAccount", ownerAccount.publicKey);
  });

  it("Create Token Mint and Mint Token", async function () {
    // Add your test here.
    await TokenProgramService.createTokenMint(
      connection,
      ownerAccount,
      tokenMint,
      0,
      ownerAccount.publicKey,
      ownerAccount.publicKey
    );

    await TokenProgramService.mint(
      connection,
      ownerAccount,
      ownerAccount,
      tokenMint.publicKey,
      ownerAccount.publicKey,
      new BN(100000)
    );
  });

  it("Create ALT", async function () {
    addressLookupTable = await createALT(
      connection,
      ownerAccount,
      ownerAccount.publicKey
    );
    await delay(1000);
  });

  it("Multisend", async function () {
    const tx = await Services.transferTokenWithALT(
      connection,
      ownerAccount,
      ownerAccount.publicKey,
      recipients,
      addressLookupTable, // address lookup table should contains all recipients ata to reduce transaction size
      tokenMint.publicKey,
      ownerAccount.publicKey,
      new BN(1231),
      programId
    );
    console.log(
      `https://explorer.solana.com/tx/${tx}?cluster=custom&customUrl=http%3A%2F%2Flocalhost%3A8899`
    );
  });
});
