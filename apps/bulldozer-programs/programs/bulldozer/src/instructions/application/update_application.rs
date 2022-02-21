use crate::collections::{Application, Collaborator, User, Workspace};
use anchor_lang::prelude::*;

#[derive(AnchorSerialize, AnchorDeserialize)]
pub struct UpdateApplicationArguments {
  name: String,
}

#[derive(Accounts)]
#[instruction(arguments: UpdateApplicationArguments)]
pub struct UpdateApplication<'info> {
  #[account(mut)]
  pub application: Box<Account<'info, Application>>,
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

pub fn handle(
  ctx: Context<UpdateApplication>,
  arguments: UpdateApplicationArguments,
) -> ProgramResult {
  msg!("Update application");
  ctx.accounts.application.rename(arguments.name);
  ctx.accounts.application.bump_timestamp()?;
  Ok(())
}
