use crate::collections::{Collaborator, Collection, User};
use crate::enums::CollaboratorStatus;
use crate::errors::ErrorCode;
use anchor_lang::prelude::*;

#[derive(AnchorSerialize, AnchorDeserialize)]
pub struct UpdateCollectionArguments {
  name: String,
}

#[derive(Accounts)]
#[instruction(arguments: UpdateCollectionArguments)]
pub struct UpdateCollection<'info> {
  pub authority: Signer<'info>,
  #[account(mut)]
  pub collection: Box<Account<'info, Collection>>,
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
      collection.workspace.as_ref(),
      user.key().as_ref(),
    ],
    bump = collaborator.bump,
    constraint = collaborator.status == CollaboratorStatus::Approved { id: 1 } @ ErrorCode::CollaboratorStatusNotApproved,
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
