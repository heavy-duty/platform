use crate::collections::Gateway;
use crate::errors::ErrorCode;
use anchor_lang::prelude::*;
use application_manager::collections::Application;
use application_manager::program::ApplicationManager;
use user_manager::collections::User;
use user_manager::program::UserManager;
use workspace_manager::collections::{Collaborator, Workspace};
use workspace_manager::enums::CollaboratorStatus;
use workspace_manager::program::WorkspaceManager;

#[derive(Accounts)]
#[instruction(name: String)]
pub struct UpdateApplication<'info> {
  pub system_program: Program<'info, System>,
  pub user_manager_program: Program<'info, UserManager>,
  pub workspace_manager_program: Program<'info, WorkspaceManager>,
  pub application_manager_program: Program<'info, ApplicationManager>,
  pub gateway: Account<'info, Gateway>,
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
    constraint = application.owner == workspace.key() @ ErrorCode::InvalidWorkspace
  )]
  pub application: Account<'info, Application>,
}

pub fn handle(ctx: Context<UpdateApplication>, name: String) -> Result<()> {
  msg!("Update application {}", ctx.accounts.application.key());

  let gateway_seeds = &[
    b"gateway".as_ref(),
    ctx.accounts.gateway.base.as_ref(),
    &[ctx.accounts.gateway.bump],
  ];

  // Create the application
  application_manager::cpi::update_application(
    CpiContext::new_with_signer(
      ctx.accounts.application_manager_program.to_account_info(),
      application_manager::cpi::accounts::UpdateApplication {
        application: ctx.accounts.application.to_account_info(),
        authority: ctx.accounts.gateway.to_account_info(),
      },
      &[&gateway_seeds[..]],
    ),
    application_manager::instructions::UpdateApplicationArguments { name: name.clone() },
  )?;

  Ok(())
}
