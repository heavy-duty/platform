use crate::collections::Gateway;
use crate::errors::ErrorCode;
use anchor_lang::prelude::*;
use application_manager::collections::Application;
use collection_manager::collections::Collection;
use collection_manager::program::CollectionManager;
use user_manager::collections::User;
use user_manager::program::UserManager;
use workspace_manager::collections::{Collaborator, Workspace};
use workspace_manager::enums::CollaboratorStatus;
use workspace_manager::program::WorkspaceManager;

#[derive(Accounts)]
#[instruction(name: String)]
pub struct UpdateCollection<'info> {
  pub system_program: Program<'info, System>,
  pub user_manager_program: Program<'info, UserManager>,
  pub workspace_manager_program: Program<'info, WorkspaceManager>,
  pub collection_manager_program: Program<'info, CollectionManager>,
  pub gateway: Account<'info, Gateway>,
  pub authority: Signer<'info>,
  pub workspace: Account<'info, Workspace>,
  #[account(
    constraint = application.owner == workspace.key() @ ErrorCode::InvalidApplication
  )]
  pub application: Account<'info, Application>,
  #[account(
    seeds = [
      b"user".as_ref(),
      authority.key().as_ref(),
    ],
    bump = user.bump,
    seeds::program = user_manager_program.key()
  )]
  pub user: Account<'info, User>,
  #[account(
    seeds = [
      b"collaborator".as_ref(),
      workspace.key().as_ref(),
      user.key().as_ref(),
    ],
    bump = collaborator.bump,
    constraint = collaborator.status == CollaboratorStatus::Approved { id: 1 } @ ErrorCode::CollaboratorStatusNotApproved,
    seeds::program = workspace_manager_program.key(),
  )]
  pub collaborator: Account<'info, Collaborator>,
  #[account(
    mut,
    constraint = collection.owner == application.key() @ ErrorCode::InvalidCollection
  )]
  pub collection: Account<'info, Collection>,
}

pub fn handle(ctx: Context<UpdateCollection>, name: String) -> Result<()> {
  msg!("Update collection {}", ctx.accounts.collection.key());

  let gateway_seeds = &[
    b"gateway".as_ref(),
    ctx.accounts.gateway.base.as_ref(),
    &[ctx.accounts.gateway.bump],
  ];

  // Create the collection
  collection_manager::cpi::update_collection(
    CpiContext::new_with_signer(
      ctx.accounts.collection_manager_program.to_account_info(),
      collection_manager::cpi::accounts::UpdateCollection {
        collection: ctx.accounts.collection.to_account_info(),
        authority: ctx.accounts.gateway.to_account_info(),
      },
      &[&gateway_seeds[..]],
    ),
    collection_manager::instructions::UpdateCollectionArguments { name: name.clone() },
  )?;

  Ok(())
}
