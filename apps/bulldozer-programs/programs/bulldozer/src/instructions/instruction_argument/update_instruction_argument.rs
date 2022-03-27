use crate::collections::{Collaborator, Instruction, InstructionArgument, User, Workspace};
use crate::enums::{AttributeKinds, AttributeModifiers, CollaboratorStatus};
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
  pub authority: Signer<'info>,
  pub workspace: Box<Account<'info, Workspace>>,
  #[account(
    constraint = instruction.workspace == workspace.key() @ ErrorCode::InstructionDoesNotBelongToWorkspace
  )]
  pub instruction: Account<'info, Instruction>,
  #[account(
    mut,
    constraint = argument.workspace == workspace.key() @ ErrorCode::InstructionArgumentDoesNotBelongToWorkspace,
    constraint = argument.instruction == instruction.key() @ ErrorCode::InstructionArgumentDoesNotBelongToInstruction
  )]
  pub argument: Box<Account<'info, InstructionArgument>>,
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
      argument.workspace.as_ref(),
      user.key().as_ref(),
    ],
    bump = collaborator.bump,
    constraint = collaborator.status == CollaboratorStatus::Approved { id: 1 } @ ErrorCode::CollaboratorStatusNotApproved,
  )]
  pub collaborator: Box<Account<'info, Collaborator>>,
}

pub fn validate(
  _ctx: &Context<UpdateInstructionArgument>,
  arguments: &UpdateInstructionArgumentArguments,
) -> Result<bool> {
  match (arguments.kind, arguments.max, arguments.max_length) {
    (1, None, _) => Err(error!(ErrorCode::MissingMax)),
    (2, _, None) => Err(error!(ErrorCode::MissingMaxLength)),
    _ => Ok(true),
  }
}

pub fn handle(
  ctx: Context<UpdateInstructionArgument>,
  arguments: UpdateInstructionArgumentArguments,
) -> Result<()> {
  msg!("Update collection argument");
  ctx.accounts.argument.rename(arguments.name);
  ctx.accounts.argument.change_settings(
    AttributeKinds::create(arguments.kind, arguments.max, arguments.max_length)?,
    AttributeModifiers::create(arguments.modifier, arguments.size)?,
  );
  ctx.accounts.argument.bump_timestamp()?;
  Ok(())
}
