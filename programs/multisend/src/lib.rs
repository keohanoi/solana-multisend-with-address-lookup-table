use anchor_lang::prelude::*;
// use anchor_lang::solana_program::message::v0::MessageAddressTableLookup;
mod utils;
mod states;
mod contexts;
mod constants;

use contexts::*;
use states::*;
use utils::*;

// use utils::{ _transfer_token };
declare_id!("2UaKRD8rNjaE7uhtdZokARjv79oX8yLiykt162tYSRvc");

#[program]
pub mod multisend {
  use super::*;
  pub fn transfer_token(ctx: Context<TransferTokenContext>, amount: u64) -> Result<()> {
    // let accounts = &ctx.remaining_accounts;

    _transfer_token(
      &ctx.accounts.authority_account,
      &ctx.accounts.from_ata_account,
      &ctx.accounts.to_ata_account,
      amount,
      &[]
    ).expect("CPI failed.");
    Ok(())
  }
}
