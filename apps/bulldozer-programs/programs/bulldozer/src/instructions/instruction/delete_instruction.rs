use crate::collections::{Application, Instruction};
use anchor_lang::prelude::*;
use crate::errors::ErrorCode;

#[derive(Accounts)]
pub struct DeleteInstruction<'info> {
  #[account(
    mut,
    has_one = authority,
    close = authority,
    constraint = instruction.quantity_of_arguments == 0 @ ErrorCode::CantDeleteInstructionWithArguments,
    constraint = instruction.quantity_of_accounts == 0 @ ErrorCode::CantDeleteInstructionWithAccounts,
  )]
  pub instruction: Account<'info, Instruction>,
  #[account(
    mut,
    constraint = instruction.application == application.key() @ ErrorCode::ApplicationDoesntMatchInstruction
  )]
  pub application: Account<'info, Application>,
  pub authority: Signer<'info>,
}

pub fn handle(ctx: Context<DeleteInstruction>) -> ProgramResult {
  msg!("Delete instruction");
  ctx.accounts.application.quantity_of_instructions -= 1;
  Ok(())
}
