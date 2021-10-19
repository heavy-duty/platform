use crate::collections::InstructionArgument;
use crate::utils::vectorize_string;
use anchor_lang::prelude::*;

#[derive(Accounts)]
#[instruction(
  name: String,
  kind: u8,
  modifier: Option<u8>,
  size: Option<u32>,
  max: Option<u32>,
  max_length: Option<u32>
)]
pub struct UpdateInstructionArgument<'info> {
  #[account(mut, has_one = authority)]
  pub argument: Box<Account<'info, InstructionArgument>>,
  pub authority: Signer<'info>,
}

pub fn handler(
  ctx: Context<UpdateInstructionArgument>,
  name: String,
  kind: u8,
  modifier: Option<u8>,
  size: Option<u32>,
  max: Option<u32>,
  max_length: Option<u32>,
) -> ProgramResult {
  msg!("Update instruction argument");
  ctx.accounts.argument.name = vectorize_string(name, 32);
  ctx.accounts.argument.set_kind(kind, max, max_length)?;
  ctx.accounts.argument.set_modifier(modifier, size)?;
  Ok(())
}
