use crate::collections::Gateway;
use anchor_lang::prelude::*;
use user_manager::collections::User;
use user_manager::program::UserManager;
use workspace_manager::collections::Workspace;
use workspace_manager::program::WorkspaceManager;

#[derive(Accounts)]
pub struct CreateCollaborator<'info> {
  pub user_manager_program: Program<'info, UserManager>,
  pub workspace_manager_program: Program<'info, WorkspaceManager>,
  pub system_program: Program<'info, System>,
  pub gateway: Account<'info, Gateway>,
  #[account(mut)]
  pub authority: Signer<'info>,
  #[account(
    seeds = [
      b"user".as_ref(),
      authority.key().as_ref(),
    ],
    bump = user.bump,
    seeds::program = user_manager_program.key()
  )]
  pub user: Account<'info, User>,
  pub workspace: Account<'info, Workspace>,
  #[account(
    mut,
    seeds = [
      b"collaborator".as_ref(),
      workspace.key().as_ref(),
      user.key().as_ref(),
    ],
    bump,
    seeds::program = workspace_manager_program.key(),
  )]
  /// CHECK: collaborator is created through a CPI.
  pub collaborator: UncheckedAccount<'info>,
}

pub fn handle(ctx: Context<CreateCollaborator>) -> Result<()> {
  msg!("Create collaborator");

  let seeds = &[
    b"gateway".as_ref(),
    ctx.accounts.gateway.base.as_ref(),
    &[ctx.accounts.gateway.bump],
  ];
  let signer = &[&seeds[..]];

  workspace_manager::cpi::create_collaborator(
    CpiContext::new_with_signer(
      ctx.accounts.workspace_manager_program.to_account_info(),
      workspace_manager::cpi::accounts::CreateCollaborator {
        user_manager_program: ctx.accounts.user_manager_program.to_account_info(),
        collaborator: ctx.accounts.collaborator.to_account_info(),
        user: ctx.accounts.user.to_account_info(),
        workspace: ctx.accounts.workspace.to_account_info(),
        authority: ctx.accounts.gateway.to_account_info(),
        payer: ctx.accounts.authority.to_account_info(),
        system_program: ctx.accounts.system_program.to_account_info(),
      },
      signer,
    ),
    workspace_manager::instructions::CreateCollaboratorArguments {
      is_admin: false,
      status: 0,
    },
  )?;

  Ok(())
}
