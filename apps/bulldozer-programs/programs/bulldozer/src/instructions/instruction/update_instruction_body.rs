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
  pub clock: Sysvar<'info, Clock>,
}

pub fn handler(ctx: Context<UpdateInstructionBody>, arguments: UpdateInstructionBodyArguments) -> ProgramResult {
  msg!("Update instruction body");
  ctx.accounts.instruction.body = arguments.body;
  ctx.accounts.instruction.updated_at = ctx.accounts.clock.unix_timestamp;
  Ok(())
}
