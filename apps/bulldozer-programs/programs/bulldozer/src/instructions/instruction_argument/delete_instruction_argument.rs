use crate::collections::{Instruction, InstructionArgument};
use anchor_lang::prelude::*;
use crate::errors::ErrorCode;

#[derive(Accounts)]
pub struct DeleteInstructionArgument<'info> {
  #[account(
    mut,
    has_one = authority,
    close = authority
  )]
  pub argument: Account<'info, InstructionArgument>,
  #[account(
    mut,
    constraint = instruction.key() == argument.instruction @ ErrorCode::InstructionDoesntMatchArgument
  )]
  pub instruction: Account<'info, Instruction>,
  pub authority: Signer<'info>,
}

pub fn handler(ctx: Context<DeleteInstructionArgument>) -> ProgramResult {
  msg!("Delete instruction argument");
  ctx.accounts.instruction.quantity_of_arguments -= 1;
  Ok(())
}
