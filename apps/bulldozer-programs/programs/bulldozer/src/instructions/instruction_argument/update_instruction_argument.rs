use crate::collections::InstructionArgument;
use anchor_lang::prelude::*;
use crate::enums::{
  get_attribute_kind,
  get_attribute_modifier
};
use crate::errors::ErrorCode;

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
  #[account(
    mut,
    has_one = authority,
    constraint = arguments.kind == 0 || arguments.kind == 1 && arguments.max != None || arguments.kind == 2 @ ErrorCode::MissingMax,
    constraint = arguments.kind == 0 || arguments.kind == 1 || arguments.kind == 2 && arguments.max_length != None @ ErrorCode::MissingMaxLength,
  )]
  pub argument: Box<Account<'info, InstructionArgument>>,
  pub authority: Signer<'info>,
  pub clock: Sysvar<'info, Clock>,
}

pub fn handle(ctx: Context<UpdateInstructionArgument>, arguments: UpdateInstructionArgumentArguments) -> ProgramResult {
  msg!("Update instruction argument");
  ctx.accounts.argument.kind = get_attribute_kind(arguments.kind, arguments.max, arguments.max_length)?;
  ctx.accounts.argument.modifier = get_attribute_modifier(arguments.modifier, arguments.size)?;
  ctx.accounts.argument.updated_at = ctx.accounts.clock.unix_timestamp;
  Ok(())
}
