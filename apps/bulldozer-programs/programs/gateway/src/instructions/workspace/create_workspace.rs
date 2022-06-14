use crate::collections::Gateway;
use anchor_lang::prelude::*;
use user_manager::collections::User;
use user_manager::program::UserManager;
use workspace_manager::program::WorkspaceManager;

#[derive(Accounts)]
#[instruction(id: u32, name: String, initial_deposit: u64)]
pub struct CreateWorkspace<'info> {
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
  #[account(
    mut,
    seeds = [
      b"workspace".as_ref(),
      user.key().as_ref(),
      &id.to_le_bytes(),
    ],
    bump,
    seeds::program = workspace_manager_program.key()
  )]
  /// CHECK: workspace is created through a CPI.
  pub workspace: UncheckedAccount<'info>,
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
  #[account(
    mut,
    seeds = [
      b"budget".as_ref(),
      workspace.key().as_ref(),
    ],
    bump,
    seeds::program = workspace_manager_program.key(),
  )]
  /// CHECK: budget is created through a CPI.
  pub budget: UncheckedAccount<'info>,
  #[account(
    mut,
    seeds = [
      b"budget_wallet".as_ref(),
      budget.key().as_ref(),
    ],
    bump,
    seeds::program = workspace_manager_program.key(),
  )]
  /// CHECK: workspace_stats is created through a CPI.
  pub budget_wallet: UncheckedAccount<'info>,
}

pub fn handle(
  ctx: Context<CreateWorkspace>,
  id: u32,
  name: String,
  initial_deposit: u64,
) -> Result<()> {
  msg!("Create workspace {}", ctx.accounts.workspace.key());

  workspace_manager::cpi::create_workspace(
    CpiContext::new(
      ctx.accounts.workspace_manager_program.to_account_info(),
      workspace_manager::cpi::accounts::CreateWorkspace {
        user_manager_program: ctx.accounts.user_manager_program.to_account_info(),
        user: ctx.accounts.user.to_account_info(),
        workspace: ctx.accounts.workspace.to_account_info(),
        authority: ctx.accounts.authority.to_account_info(),
        system_program: ctx.accounts.system_program.to_account_info(),
      },
    ),
    workspace_manager::instructions::CreateWorkspaceArguments { id, name },
  )?;

  workspace_manager::cpi::set_workspace_authority(CpiContext::new(
    ctx.accounts.workspace_manager_program.to_account_info(),
    workspace_manager::cpi::accounts::SetWorkspaceAuthority {
      workspace: ctx.accounts.workspace.to_account_info(),
      authority: ctx.accounts.authority.to_account_info(),
      new_authority: ctx.accounts.gateway.to_account_info(),
    },
  ))?;

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
      is_admin: true,
      status: 1,
    },
  )?;

  workspace_manager::cpi::create_budget(CpiContext::new_with_signer(
    ctx.accounts.workspace_manager_program.to_account_info(),
    workspace_manager::cpi::accounts::CreateBudget {
      user_manager_program: ctx.accounts.user_manager_program.to_account_info(),
      budget: ctx.accounts.budget.to_account_info(),
      budget_wallet: ctx.accounts.budget_wallet.to_account_info(),
      user: ctx.accounts.user.to_account_info(),
      workspace: ctx.accounts.workspace.to_account_info(),
      authority: ctx.accounts.gateway.to_account_info(),
      payer: ctx.accounts.authority.to_account_info(),
      system_program: ctx.accounts.system_program.to_account_info(),
    },
    signer,
  ))?;

  workspace_manager::cpi::deposit_to_budget(
    CpiContext::new(
      ctx.accounts.workspace_manager_program.to_account_info(),
      workspace_manager::cpi::accounts::DepositToBudget {
        budget: ctx.accounts.budget.to_account_info(),
        budget_wallet: ctx.accounts.budget_wallet.to_account_info(),
        workspace: ctx.accounts.workspace.to_account_info(),
        authority: ctx.accounts.authority.to_account_info(),
        system_program: ctx.accounts.system_program.to_account_info(),
      },
    ),
    workspace_manager::instructions::DepositToBudgetArguments {
      amount: initial_deposit,
    },
  )?;

  Ok(())
}
