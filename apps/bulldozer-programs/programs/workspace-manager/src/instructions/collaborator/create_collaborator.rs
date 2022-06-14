use crate::collections::{Collaborator, Workspace};
use crate::enums::CollaboratorStatus;
use crate::errors::ErrorCode;
use anchor_lang::prelude::*;
use user_manager::collections::User;
use user_manager::program::UserManager;

#[derive(AnchorSerialize, AnchorDeserialize)]
pub struct CreateCollaboratorArguments {
  pub is_admin: bool,
  pub status: u8,
}

#[derive(Accounts)]
pub struct CreateCollaborator<'info> {
  pub user_manager_program: Program<'info, UserManager>,
  pub system_program: Program<'info, System>,
  pub authority: Signer<'info>,
  #[account(mut)]
  pub payer: Signer<'info>,
  #[account(
    has_one = authority @ ErrorCode::UnauthorizedCreateCollaborator
  )]
  pub workspace: Account<'info, Workspace>,
  pub user: Account<'info, User>,
  #[account(
    init,
    payer = payer,
    space = Collaborator::space(),
    seeds = [
      b"collaborator".as_ref(),
      workspace.key().as_ref(),
      user.key().as_ref()
    ],
    bump
  )]
  pub collaborator: Account<'info, Collaborator>,
}

pub fn handle(
  ctx: Context<CreateCollaborator>,
  arguments: CreateCollaboratorArguments,
) -> Result<()> {
  msg!("Create collaborator");
  ctx.accounts.collaborator.authority = *ctx.accounts.authority.key;
  ctx.accounts.collaborator.workspace = ctx.accounts.workspace.key();
  ctx.accounts.collaborator.user = ctx.accounts.user.key();
  ctx.accounts.collaborator.status = CollaboratorStatus::create(arguments.status)?;
  ctx.accounts.collaborator.is_admin = arguments.is_admin;
  ctx.accounts.collaborator.bump = *ctx.bumps.get("collaborator").unwrap();
  ctx.accounts.collaborator.created_at = Clock::get()?.unix_timestamp;
  ctx.accounts.collaborator.updated_at = Clock::get()?.unix_timestamp;
  Ok(())
}
