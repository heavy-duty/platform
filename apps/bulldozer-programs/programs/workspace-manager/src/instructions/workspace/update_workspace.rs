use crate::collections::Workspace;
use crate::errors::ErrorCode;
use anchor_lang::prelude::*;

#[derive(AnchorSerialize, AnchorDeserialize)]
pub struct UpdateWorkspaceArguments {
  pub name: String,
}

#[derive(Accounts)]
#[instruction(arguments: UpdateWorkspaceArguments)]
pub struct UpdateWorkspace<'info> {
  pub authority: Signer<'info>,
  #[account(
    mut,
    has_one = authority @ ErrorCode::UnauthorizedWorkspaceUpdate
  )]
  pub workspace: Account<'info, Workspace>,
}

pub fn handle(ctx: Context<UpdateWorkspace>, arguments: UpdateWorkspaceArguments) -> Result<()> {
  msg!("Update workspace");
  ctx.accounts.workspace.name = arguments.name;
  ctx.accounts.workspace.updated_at = Clock::get()?.unix_timestamp;
  Ok(())
}
