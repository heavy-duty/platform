use crate::collections::Gateway;
use crate::errors::ErrorCode;
use anchor_lang::prelude::*;
use application_manager::collections::Application;
use collection_manager::collections::{Collection, CollectionAttribute};
use collection_manager::program::CollectionManager;
use user_manager::collections::User;
use user_manager::program::UserManager;
use workspace_manager::collections::{Collaborator, Workspace};
use workspace_manager::enums::CollaboratorStatus;
use workspace_manager::program::WorkspaceManager;

#[derive(Accounts)]
#[instruction(
  name: String,
  kind: u8,
  modifier: Option<u8>,
  size: Option<u32>,
  max: Option<u32>,
  max_length: Option<u32>,
)]
pub struct UpdateCollectionAttribute<'info> {
  pub system_program: Program<'info, System>,
  pub user_manager_program: Program<'info, UserManager>,
  pub workspace_manager_program: Program<'info, WorkspaceManager>,
  pub collection_manager_program: Program<'info, CollectionManager>,
  pub authority: Signer<'info>,
  pub gateway: Box<Account<'info, Gateway>>,
  #[account(
    constraint = application.owner == workspace.key() @ ErrorCode::InvalidWorkspace
  )]
  pub workspace: Box<Account<'info, Workspace>>,
  #[account(
    constraint = collection.owner == application.key() @ ErrorCode::InvalidApplication
  )]
  pub application: Box<Account<'info, Application>>,
  #[account(
    mut,
    constraint = collection_attribute.owner == collection.key() @ ErrorCode::InvalidCollection
  )]
  pub collection: Box<Account<'info, Collection>>,
  #[account(
    seeds = [
      b"user".as_ref(),
      authority.key().as_ref(),
    ],
    bump = user.bump,
    seeds::program = user_manager_program.key()
  )]
  pub user: Box<Account<'info, User>>,
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
  pub collaborator: Box<Account<'info, Collaborator>>,
  #[account(mut)]
  pub collection_attribute: Box<Account<'info, CollectionAttribute>>,
}

pub fn handle(
  ctx: Context<UpdateCollectionAttribute>,
  name: String,
  kind: u8,
  modifier: Option<u8>,
  size: Option<u32>,
  max: Option<u32>,
  max_length: Option<u32>,
) -> Result<()> {
  msg!(
    "Update collection attribute {}",
    ctx.accounts.collection_attribute.key()
  );

  let gateway_seeds = &[
    b"gateway".as_ref(),
    ctx.accounts.gateway.base.as_ref(),
    &[ctx.accounts.gateway.bump],
  ];

  // Create the collection
  collection_manager::cpi::update_collection_attribute(
    CpiContext::new_with_signer(
      ctx.accounts.collection_manager_program.to_account_info(),
      collection_manager::cpi::accounts::UpdateCollectionAttribute {
        collection_attribute: ctx.accounts.collection_attribute.to_account_info(),
        authority: ctx.accounts.gateway.to_account_info(),
      },
      &[&gateway_seeds[..]],
    ),
    collection_manager::instructions::UpdateCollectionAttributeArguments {
      name,
      kind,
      modifier,
      size,
      max,
      max_length,
    },
  )?;

  Ok(())
}
