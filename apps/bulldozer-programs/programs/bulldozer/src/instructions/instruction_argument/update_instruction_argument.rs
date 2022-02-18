use crate::collections::{Collaborator, InstructionArgument, User, Workspace};
use crate::enums::{get_attribute_kind, get_attribute_modifier};
use crate::errors::ErrorCode;
use anchor_lang::prelude::*;

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
  #[account(mut)]
  pub argument: Box<Account<'info, InstructionArgument>>,
  pub workspace: Box<Account<'info, Workspace>>,
  pub authority: Signer<'info>,
  #[account(
    seeds = [
      b"user".as_ref(),
      authority.key().as_ref(),
    ],
    bump = user.bump
  )]
  pub user: Box<Account<'info, User>>,
  #[account(
    seeds = [
      b"collaborator".as_ref(),
      workspace.key().as_ref(),
      user.key().as_ref(),
    ],
    bump = collaborator.bump
  )]
  pub collaborator: Box<Account<'info, Collaborator>>,
}

pub fn validate(
  _ctx: &Context<UpdateInstructionArgument>,
  arguments: &UpdateInstructionArgumentArguments,
) -> std::result::Result<bool, ProgramError> {
  match (arguments.kind, arguments.max, arguments.max_length) {
    (1, None, _) => Err(ErrorCode::MissingMax.into()),
    (2, _, None) => Err(ErrorCode::MissingMaxLength.into()),
    _ => Ok(true),
  }
}

pub fn handle(
  ctx: Context<UpdateInstructionArgument>,
  arguments: UpdateInstructionArgumentArguments,
) -> ProgramResult {
  msg!("Update instruction argument");
  ctx.accounts.argument.name = arguments.name;
  ctx.accounts.argument.kind =
    get_attribute_kind(arguments.kind, arguments.max, arguments.max_length)?;
  ctx.accounts.argument.modifier = get_attribute_modifier(arguments.modifier, arguments.size)?;
  ctx.accounts.argument.updated_at = Clock::get()?.unix_timestamp;
  Ok(())
}
