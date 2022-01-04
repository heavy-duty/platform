use crate::collections::Instruction;
use anchor_lang::prelude::*;
use crate::errors::ErrorCode;

#[derive(Accounts)]
pub struct DeleteInstruction<'info> {
  #[account(
    mut,
    has_one = authority,
    close = authority,
    constraint = instruction.quantity_of_arguments == 0 @ ErrorCode::CantDeleteInstructionWithArguments
  )]
  pub instruction: Account<'info, Instruction>,
  pub authority: Signer<'info>,
}

pub fn handler(_ctx: Context<DeleteInstruction>) -> ProgramResult {
  msg!("Delete instruction");
  Ok(())
}
