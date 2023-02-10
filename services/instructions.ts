import { PublicKey, TransactionInstruction } from "@solana/web3.js";
import { BN, BorshCoder, Idl } from "@project-serum/anchor";
import MultisendIdl from "../target/idl/multisend.json";
import {
  IdlParserService,
  TOKEN_PROGRAM_ID,
  TokenProgramService,
} from "@coin98/solana-support-library";

const parser = new IdlParserService(MultisendIdl as Idl) as any;
const coder = new BorshCoder(MultisendIdl as Idl);

export class Instructions {
  static TransferTokenInstruction(
    payer: PublicKey,
    fromAccount: PublicKey,
    toAccount: PublicKey,
    mintAccount: PublicKey,
    authorityAccount: PublicKey,
    amount: BN,
    programId: PublicKey
  ): TransactionInstruction {
    const fromATA = TokenProgramService.findAssociatedTokenAddress(
      fromAccount,
      mintAccount
    );
    const toATA = TokenProgramService.findAssociatedTokenAddress(
      toAccount,
      mintAccount
    );
    return parser.transferToken(
      {
        amount,
      },
      {
        payer,
        fromAtaAccount: fromATA,
        toAtaAccount: toATA,
        authorityAccount,
        tokenProgram: TOKEN_PROGRAM_ID,
      },
      programId
    );
  }
}
