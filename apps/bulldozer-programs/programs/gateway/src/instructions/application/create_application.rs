use crate::collections::Gateway;
use crate::errors::ErrorCode;
use anchor_lang::prelude::*;
use application_manager::collections::Application;
use application_manager::program::ApplicationManager;
use user_manager::collections::User;
use user_manager::program::UserManager;
use workspace_manager::collections::{Budget, Collaborator, Workspace};
use workspace_manager::enums::CollaboratorStatus;
use workspace_manager::program::WorkspaceManager;

#[derive(Accounts)]
#[instruction(id: u8, name: String)]
pub struct CreateApplication<'info> {
  pub system_program: Program<'info, System>,
  pub user_manager_program: Program<'info, UserManager>,
  pub workspace_manager_program: Program<'info, WorkspaceManager>,
  pub application_manager_program: Program<'info, ApplicationManager>,
  pub gateway: Account<'info, Gateway>,
  #[account(mut)]
  pub authority: Signer<'info>,
  pub workspace: Account<'info, Workspace>,
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
    seeds = [
      b"budget".as_ref(),
      workspace.key().as_ref(),
    ],
    bump = budget.bump,
    seeds::program = workspace_manager_program.key(),
  )]
  pub budget: Account<'info, Budget>,
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
      b"application".as_ref(),
      id.to_le_bytes().as_ref(),
    ],
    bump,
    seeds::program = application_manager_program.key(),
  )]
  /// CHECK: application is created through a CPI
  pub application: UncheckedAccount<'info>,
}

pub fn handle(ctx: Context<CreateApplication>, id: u8, name: String) -> Result<()> {
  msg!("Create application");

  let budget_seeds = &[
    b"budget_wallet".as_ref(),
    ctx.accounts.budget.to_account_info().key.as_ref(),
    &[ctx.accounts.budget.wallet_bump],
  ];
  let budget_signer = &[&budget_seeds[..]];

  // Create the application
  application_manager::cpi::create_application(
    CpiContext::new_with_signer(
      ctx.accounts.application_manager_program.to_account_info(),
      application_manager::cpi::accounts::CreateApplication {
        application: ctx.accounts.application.to_account_info(),
        authority: ctx.accounts.budget_wallet.to_account_info(),
        system_program: ctx.accounts.system_program.to_account_info(),
      },
      budget_signer,
    ),
    application_manager::instructions::CreateApplicationArguments {
      id,
      name: name.clone(),
    },
  )?;

  // Set application authority to gateway
  application_manager::cpi::set_application_authority(CpiContext::new_with_signer(
    ctx.accounts.application_manager_program.to_account_info(),
    application_manager::cpi::accounts::SetApplicationAuthority {
      new_authority: ctx.accounts.gateway.to_account_info(),
      application: ctx.accounts.application.to_account_info(),
      authority: ctx.accounts.budget_wallet.to_account_info(),
    },
    budget_signer,
  ))?;

  let gateway_seeds = &[
    b"gateway".as_ref(),
    ctx.accounts.gateway.base.as_ref(),
    &[ctx.accounts.gateway.bump],
  ];
  let gateway_signer = &[&gateway_seeds[..]];

  // Increase quantity of applications in workspace
  workspace_manager::cpi::update_workspace(
    CpiContext::new_with_signer(
      ctx.accounts.workspace_manager_program.to_account_info(),
      workspace_manager::cpi::accounts::UpdateWorkspace {
        workspace: ctx.accounts.workspace.to_account_info(),
        authority: ctx.accounts.gateway.to_account_info(),
      },
      gateway_signer,
    ),
    workspace_manager::instructions::UpdateWorkspaceArguments {
      name: ctx.accounts.workspace.name.clone(),
    },
  )?;

  // Register budget spent
  workspace_manager::cpi::register_budget_spent(
    CpiContext::new(
      ctx.accounts.workspace_manager_program.to_account_info(),
      workspace_manager::cpi::accounts::RegisterBudgetSpent {
        budget: ctx.accounts.budget.to_account_info(),
        workspace: ctx.accounts.workspace.to_account_info(),
        authority: ctx.accounts.gateway.to_account_info(),
        system_program: ctx.accounts.system_program.to_account_info(),
      },
    ),
    workspace_manager::instructions::RegisterBudgetSpentArguments {
      amount: Application::space() as u64,
    },
  )?;

  Ok(())
}
