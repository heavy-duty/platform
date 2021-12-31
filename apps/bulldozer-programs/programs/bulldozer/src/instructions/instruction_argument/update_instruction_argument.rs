use crate::collections::{Attribute, AttributeDto, InstructionArgument};
use anchor_lang::prelude::*;

#[derive(Accounts)]
#[instruction(dto: AttributeDto)]
pub struct UpdateInstructionArgument<'info> {
  #[account(mut, has_one = authority)]
  pub argument: Box<Account<'info, InstructionArgument>>,
  pub authority: Signer<'info>,
}

pub fn handler(ctx: Context<UpdateInstructionArgument>, dto: AttributeDto) -> ProgramResult {
  msg!("Update instruction argument");
  ctx.accounts.argument.data = Attribute::create(dto)?;
  Ok(())
}
