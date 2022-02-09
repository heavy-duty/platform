use crate::collections::{Instruction, InstructionAccount};
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
  #[account(
    mut,
    constraint = instruction.key() == account.instruction @ ErrorCode::InstructionDoesntMatchAccount
  )]
  pub instruction: Account<'info, Instruction>,
  pub authority: Signer<'info>,
}

pub fn handle(ctx: Context<DeleteInstructionAccount>) -> ProgramResult {
  msg!("Delete instruction account");
  ctx.accounts.instruction.quantity_of_accounts -= 1;
  Ok(())
}
