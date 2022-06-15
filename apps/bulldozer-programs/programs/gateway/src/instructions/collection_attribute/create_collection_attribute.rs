use crate::collections::Gateway;
use crate::errors::ErrorCode;
use anchor_lang::prelude::*;
use application_manager::collections::Application;
use collection_manager::collections::{Collection, CollectionAttribute};
use collection_manager::program::CollectionManager;
use user_manager::collections::User;
use user_manager::program::UserManager;
use workspace_manager::collections::{Budget, Collaborator, Workspace};
use workspace_manager::enums::CollaboratorStatus;
use workspace_manager::program::WorkspaceManager;

#[derive(Accounts)]
#[instruction(
  id: u32, 
  name: String,
  kind: u8,
  modifier: Option<u8>,
  size: Option<u32>,
  max: Option<u32>,
  max_length: Option<u32>,
)]
pub struct CreateCollectionAttribute<'info> {
  pub system_program: Program<'info, System>,
  pub user_manager_program: Program<'info, UserManager>,
  pub workspace_manager_program: Program<'info, WorkspaceManager>,
  pub collection_manager_program: Program<'info, CollectionManager>,
  pub authority: Signer<'info>,
  pub gateway: Box<Account<'info, Gateway>>,
  #[account(
    mut,
    seeds = [
      b"gateway_wallet".as_ref(),
      gateway.key().as_ref(),
    ],
    bump = gateway.wallet_bump,
  )]
  pub gateway_wallet: SystemAccount<'info>,
  #[account(
    constraint = application.owner == workspace.key() @ ErrorCode::InvalidWorkspace
  )]
  pub workspace: Box<Account<'info, Workspace>>,
  #[account(
    constraint = collection.owner == application.key() @ ErrorCode::InvalidApplication
  )]
  pub application: Box<Account<'info, Application>>,
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
  #[account(
    mut,
    seeds = [
      b"budget".as_ref(),
      workspace.key().as_ref(),
    ],
    bump = budget.bump,
    seeds::program = workspace_manager_program.key(),
  )]
  pub budget: Box<Account<'info, Budget>>,
  #[account(
    mut,
    seeds = [
      b"budget_wallet".as_ref(),
      budget.key().as_ref(),
    ],
    bump = budget.wallet_bump,
    seeds::program = workspace_manager_program.key(),
  )]
  pub budget_wallet: SystemAccount<'info>,
  #[account(
    mut,
    seeds = [
      b"collection_attribute".as_ref(),
      collection.key().as_ref(),
      &id.to_le_bytes(),
    ],
    bump,
    seeds::program = collection_manager_program.key(),
  )]
  /// CHECK: collection_attribute is created through a CPI
  pub collection_attribute: UncheckedAccount<'info>,
}

pub fn handle(
  ctx: Context<CreateCollectionAttribute>, 
  id: u32, 
  name: String,
  kind: u8,
  modifier: Option<u8>,
  size: Option<u32>,
  max: Option<u32>,
  max_length: Option<u32>
) -> Result<()> {
  msg!(
    "Create collection attribute {}",
    ctx.accounts.collection_attribute.key()
  );

  let gateway_seeds = &[
    b"gateway".as_ref(),
    ctx.accounts.gateway.base.as_ref(),
    &[ctx.accounts.gateway.bump],
  ];
  let gateway_wallet_seeds = &[
    b"gateway_wallet".as_ref(),
    ctx.accounts.gateway.to_account_info().key.as_ref(),
    &[ctx.accounts.gateway.wallet_bump],
  ];

  // Withdraw from budget to gateway wallet
  workspace_manager::cpi::withdraw_from_budget(
    CpiContext::new_with_signer(
      ctx.accounts.workspace_manager_program.to_account_info(),
      workspace_manager::cpi::accounts::WithdrawFromBudget {
        budget: ctx.accounts.budget.to_account_info(),
        budget_wallet: ctx.accounts.budget_wallet.to_account_info(),
        workspace: ctx.accounts.workspace.to_account_info(),
        authority: ctx.accounts.gateway.to_account_info(),
        receiver: ctx.accounts.gateway_wallet.to_account_info(),
        system_program: ctx.accounts.system_program.to_account_info(),
      },
      &[&gateway_seeds[..], &gateway_wallet_seeds[..]],
    ),
    workspace_manager::instructions::WithdrawFromBudgetArguments {
      amount: Rent::get()?.minimum_balance(CollectionAttribute::space()),
    },
  )?;

  // Create the collection attribute
  collection_manager::cpi::create_collection_attribute(
    CpiContext::new_with_signer(
      ctx.accounts.collection_manager_program.to_account_info(),
      collection_manager::cpi::accounts::CreateCollectionAttribute {
        collection_attribute: ctx.accounts.collection_attribute.to_account_info(),
        owner: ctx.accounts.collection.to_account_info(),
        authority: ctx.accounts.gateway_wallet.to_account_info(),
        system_program: ctx.accounts.system_program.to_account_info(),
      },
      &[&gateway_wallet_seeds[..]],
    ),
    collection_manager::instructions::CreateCollectionAttributeArguments {
      id,
      name,
      kind,
      modifier,
      size,
      max,
      max_length
    },
  )?;

  // Set collection authority to gateway
  collection_manager::cpi::set_collection_attribute_authority(CpiContext::new_with_signer(
    ctx.accounts.collection_manager_program.to_account_info(),
    collection_manager::cpi::accounts::SetCollectionAttributeAuthority {
      new_authority: ctx.accounts.gateway.to_account_info(),
      collection_attribute: ctx.accounts.collection_attribute.to_account_info(),
      authority: ctx.accounts.gateway_wallet.to_account_info(),
    },
    &[&gateway_wallet_seeds[..]],
  ))?;

  Ok(())
}
