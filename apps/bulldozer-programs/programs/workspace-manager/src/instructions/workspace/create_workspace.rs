use crate::collections::Workspace;
use anchor_lang::prelude::*;
use user_manager::collections::User;
use user_manager::program::UserManager;

#[derive(AnchorSerialize, AnchorDeserialize)]
pub struct CreateWorkspaceArguments {
  pub id: u32,
  pub name: String,
}

#[derive(Accounts)]
#[instruction(arguments: CreateWorkspaceArguments)]
pub struct CreateWorkspace<'info> {
  pub user_manager_program: Program<'info, UserManager>,
  pub system_program: Program<'info, System>,
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
    init,
    payer = authority,
    space = Workspace::space(),
    seeds = [
      b"workspace".as_ref(),
      user.key().as_ref(),
      &arguments.id.to_le_bytes(),
    ],
    bump
  )]
  pub workspace: Account<'info, Workspace>,
}

pub fn handle(ctx: Context<CreateWorkspace>, arguments: CreateWorkspaceArguments) -> Result<()> {
  msg!("Create workspace");
  ctx.accounts.workspace.id = arguments.id;
  ctx.accounts.workspace.name = arguments.name;
  ctx.accounts.workspace.authority = *ctx.accounts.authority.key;
  ctx.accounts.workspace.bump = *ctx.bumps.get("workspace").unwrap();
  ctx.accounts.workspace.created_at = Clock::get()?.unix_timestamp;
  ctx.accounts.workspace.updated_at = Clock::get()?.unix_timestamp;
  Ok(())
}
