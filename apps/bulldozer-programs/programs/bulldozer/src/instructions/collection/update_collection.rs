use crate::collections::{Collaborator, Collection, User, Workspace};
use anchor_lang::prelude::*;

#[derive(AnchorSerialize, AnchorDeserialize)]
pub struct UpdateCollectionArguments {
  name: String,
}

#[derive(Accounts)]
#[instruction(arguments: UpdateCollectionArguments)]
pub struct UpdateCollection<'info> {
  #[account(mut)]
  pub collection: Box<Account<'info, Collection>>,
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
  ctx: Context<UpdateCollection>,
  arguments: UpdateCollectionArguments,
) -> ProgramResult {
  msg!("Update collection");
  ctx.accounts.collection.rename(arguments.name);
  ctx.accounts.collection.bump_timestamp()?;
  Ok(())
}
