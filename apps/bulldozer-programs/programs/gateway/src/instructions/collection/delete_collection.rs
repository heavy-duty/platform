use crate::collections::Gateway;
use crate::errors::ErrorCode;
use anchor_lang::prelude::*;
use application_manager::collections::Application;
use collection_manager::collections::Collection;
use collection_manager::program::CollectionManager;
use user_manager::collections::User;
use user_manager::program::UserManager;
use workspace_manager::collections::{Budget, Collaborator, Workspace};
use workspace_manager::enums::CollaboratorStatus;
use workspace_manager::program::WorkspaceManager;

#[derive(Accounts)]
pub struct DeleteCollection<'info> {
  pub system_program: Program<'info, System>,
  pub user_manager_program: Program<'info, UserManager>,
  pub workspace_manager_program: Program<'info, WorkspaceManager>,
  pub collection_manager_program: Program<'info, CollectionManager>,
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
  pub authority: Signer<'info>,
  #[account(
    constraint = application.owner == workspace.key() @ ErrorCode::InvalidWorkspace
  )]
  pub workspace: Box<Account<'info, Workspace>>,
  #[account(
    constraint = collection.owner == application.key() @ ErrorCode::InvalidApplication
  )]
  pub application: Box<Account<'info, Application>>,
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
    constraint = collection.owner == application.key() @ ErrorCode::InvalidCollection
  )]
  pub collection: Box<Account<'info, Collection>>,
}

pub fn handle(ctx: Context<DeleteCollection>) -> Result<()> {
  msg!("Delete collection {}", ctx.accounts.collection.key());

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

  // Delete the collection
  collection_manager::cpi::delete_collection(CpiContext::new_with_signer(
    ctx.accounts.collection_manager_program.to_account_info(),
    collection_manager::cpi::accounts::DeleteCollection {
      collection: ctx.accounts.collection.to_account_info(),
      receiver: ctx.accounts.gateway_wallet.to_account_info(),
      authority: ctx.accounts.gateway.to_account_info(),
    },
    &[&gateway_seeds[..], &gateway_wallet_seeds[..]],
  ))?;

  // Deposit to budget from gateway wallet
  workspace_manager::cpi::deposit_to_budget(
    CpiContext::new_with_signer(
      ctx.accounts.workspace_manager_program.to_account_info(),
      workspace_manager::cpi::accounts::DepositToBudget {
        budget: ctx.accounts.budget.to_account_info(),
        budget_wallet: ctx.accounts.budget_wallet.to_account_info(),
        workspace: ctx.accounts.workspace.to_account_info(),
        authority: ctx.accounts.gateway_wallet.to_account_info(),
        system_program: ctx.accounts.system_program.to_account_info(),
      },
      &[&gateway_wallet_seeds[..]],
    ),
    workspace_manager::instructions::DepositToBudgetArguments {
      amount: Rent::get()?.minimum_balance(Collection::space()),
    },
  )?;

  Ok(())
}
