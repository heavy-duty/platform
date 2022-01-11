use crate::collections::InstructionArgument;
use anchor_lang::prelude::*;
use crate::utils::{
  get_attribute_kind,
  get_attribute_modifier
};

#[derive(AnchorSerialize, AnchorDeserialize)]
pub struct UpdateInstructionArgumentArguments {
  pub name: String,
  pub kind: u8,
  pub modifier: Option<u8>,
  pub size: Option<u32>,
  pub max: Option<u32>,
  pub max_length: Option<u32>,
}

#[derive(Accounts)]
#[instruction(arguments: UpdateInstructionArgumentArguments)]
pub struct UpdateInstructionArgument<'info> {
  #[account(mut, has_one = authority)]
  pub argument: Box<Account<'info, InstructionArgument>>,
  pub authority: Signer<'info>,
  pub clock: Sysvar<'info, Clock>,
}

pub fn handler(ctx: Context<UpdateInstructionArgument>, arguments: UpdateInstructionArgumentArguments) -> ProgramResult {
  msg!("Update instruction argument");
  ctx.accounts.argument.kind = get_attribute_kind(Some(arguments.kind), arguments.max, arguments.max_length)?;
  ctx.accounts.argument.modifier = get_attribute_modifier(arguments.modifier, arguments.size)?;
  ctx.accounts.argument.updated_at = ctx.accounts.clock.unix_timestamp;
  Ok(())
}
