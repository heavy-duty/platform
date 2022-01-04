use crate::collections::InstructionAccount;
use anchor_lang::prelude::*;
use crate::errors::ErrorCode;

#[derive(Accounts)]
pub struct DeleteInstructionAccount<'info> {
  #[account(
    mut,
    close = authority,
    has_one = authority,
    constraint = account.quantity_of_relations == 0 @ ErrorCode::CantDeleteAccountWithRelations
  )]
  pub account: Account<'info, InstructionAccount>,
  pub authority: Signer<'info>,
}

pub fn handler(_ctx: Context<DeleteInstructionAccount>) -> ProgramResult {
  msg!("Delete instruction account");
  Ok(())
}
