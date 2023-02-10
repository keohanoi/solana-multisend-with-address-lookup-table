use anchor_lang::prelude::*;
use crate::constants::*;

#[derive(Accounts)]
pub struct TransferTokenContext<'info> {
  #[account(mut)]
  pub payer: Signer<'info>,

  /// CHECK:
  #[account(
    mut,
  )]
  pub from_ata_account: AccountInfo<'info>,

  /// CHECK:
  #[account(
    mut,
  )]
  pub to_ata_account: AccountInfo<'info>,

  /// CHECK:
  pub authority_account: AccountInfo<'info>,

  /// CHECK:
  #[account(address = TOKEN_PROGRAM_ID)]
  pub token_program: AccountInfo<'info>,
}

#[derive(Accounts)]
pub struct TransferTokenWithALT<'info> {
  #[account(mut)]
  pub payer: Signer<'info>,

  /// CHECK:
  #[account(mut)]
  pub authority_address: AccountInfo<'info>,

  /// CHECK:
  #[account(mut)]
  pub payer_address: AccountInfo<'info>,

  /// CHECK:
  #[account(mut)]
  pub from_account: AccountInfo<'info>,

  /// CHECK:
  #[account(
    mut
  )]
  pub from_ata_account: AccountInfo<'info>,

  /// CHECK:
  #[account(mut)]
  pub mint_account: AccountInfo<'info>,
  /// CHECK:
  pub token_program: AccountInfo<'info>,
}