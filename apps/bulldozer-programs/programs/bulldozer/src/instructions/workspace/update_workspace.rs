use crate::collections::Workspace;
use anchor_lang::prelude::*;

#[derive(AnchorSerialize, AnchorDeserialize)]
pub struct UpdateWorkspaceArguments {
  pub name: String
}

#[derive(Accounts)]
#[instruction(arguments: UpdateWorkspaceArguments)]
pub struct UpdateWorkspace<'info> {
  #[account(mut, has_one = authority)]
  pub workspace: Box<Account<'info, Workspace>>,
  pub authority: Signer<'info>,
  pub clock: Sysvar<'info, Clock>,
}

pub fn handle(ctx: Context<UpdateWorkspace>, arguments: UpdateWorkspaceArguments) -> ProgramResult {
  msg!("Update workspace");
  ctx.accounts.workspace.name = arguments.name;
  ctx.accounts.workspace.updated_at = ctx.accounts.clock.unix_timestamp;
  Ok(())
}
