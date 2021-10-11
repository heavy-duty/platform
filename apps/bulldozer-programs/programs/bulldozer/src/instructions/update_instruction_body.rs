use crate::collections::Instruction;
use crate::utils::vectorize_string;
use anchor_lang::prelude::*;

#[derive(Accounts)]
#[instruction(body: String)]
pub struct UpdateInstructionBody<'info> {
  #[account(mut, has_one = authority)]
  pub instruction: Box<Account<'info, Instruction>>,
  pub authority: Signer<'info>,
}

pub fn handler(ctx: Context<UpdateInstructionBody>, body: String) -> ProgramResult {
  msg!("Update instruction body");
  ctx.accounts.instruction.body = vectorize_string(body, 2000);
  Ok(())
}
