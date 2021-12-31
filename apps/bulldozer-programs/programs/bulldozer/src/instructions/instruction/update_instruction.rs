use crate::collections::Instruction;
use anchor_lang::prelude::*;

#[derive(Accounts)]
#[instruction(name: String)]
pub struct UpdateInstruction<'info> {
  #[account(mut, has_one = authority)]
  pub instruction: Box<Account<'info, Instruction>>,
  pub authority: Signer<'info>,
}

pub fn handler(ctx: Context<UpdateInstruction>, name: String) -> ProgramResult {
  msg!("Update instruction");
  ctx.accounts.instruction.name = name;
  Ok(())
}
