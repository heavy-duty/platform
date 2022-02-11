use crate::collections::Instruction;
use anchor_lang::prelude::*;

#[derive(AnchorSerialize, AnchorDeserialize)]
pub struct UpdateInstructionBodyArguments {
  pub body: String,
}

#[derive(Accounts)]
#[instruction(arguments: UpdateInstructionBodyArguments)]
pub struct UpdateInstructionBody<'info> {
  #[account(mut, has_one = authority)]
  pub instruction: Box<Account<'info, Instruction>>,
  pub authority: Signer<'info>,
}

pub fn handle(ctx: Context<UpdateInstructionBody>, arguments: UpdateInstructionBodyArguments) -> ProgramResult {
  msg!("Update instruction body");
  ctx.accounts.instruction.body = arguments.body;
  ctx.accounts.instruction.updated_at = Clock::get()?.unix_timestamp;
  Ok(())
}
