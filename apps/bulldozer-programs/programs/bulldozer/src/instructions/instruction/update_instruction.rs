use crate::collections::Instruction;
use anchor_lang::prelude::*;


#[derive(AnchorSerialize, AnchorDeserialize)]
pub struct UpdateInstructionArguments {
  pub name: String,
}

#[derive(Accounts)]
#[instruction(arguments: UpdateInstructionArguments)]
pub struct UpdateInstruction<'info> {
  #[account(mut, has_one = authority)]
  pub instruction: Box<Account<'info, Instruction>>,
  pub authority: Signer<'info>,
}

pub fn handle(ctx: Context<UpdateInstruction>, arguments: UpdateInstructionArguments) -> ProgramResult {
  msg!("Update instruction");
  ctx.accounts.instruction.name = arguments.name;
  ctx.accounts.instruction.updated_at = Clock::get()?.unix_timestamp;
  Ok(())
}
