use crate::collections::Workspace;
use anchor_lang::prelude::*;

#[derive(AnchorSerialize, AnchorDeserialize)]
pub struct CreateWorkspaceArguments {
  pub name: String
}

#[derive(Accounts)]
#[instruction(arguments: CreateWorkspaceArguments)]
pub struct CreateWorkspace<'info> {
  #[account(
        init,
        payer = authority,
        // discriminator + authority + name (size 32 + 4 ?)
        // quantity of apps + quantity of collaborators +
        // created_at + updated_at
        space = 8 + 32 + 36 + 1 + 1 + 8 + 8,
    )]
  pub workspace: Box<Account<'info, Workspace>>,
  #[account(mut)]
  pub authority: Signer<'info>,
  pub system_program: Program<'info, System>,
}

pub fn handle(ctx: Context<CreateWorkspace>, arguments: CreateWorkspaceArguments) -> ProgramResult {
  msg!("Create workspace");
  ctx.accounts.workspace.name = arguments.name;
  ctx.accounts.workspace.authority = ctx.accounts.authority.key();
  ctx.accounts.workspace.quantity_of_applications = 0;
  ctx.accounts.workspace.quantity_of_collaborators = 0;
  ctx.accounts.workspace.created_at = Clock::get()?.unix_timestamp;
  ctx.accounts.workspace.updated_at = Clock::get()?.unix_timestamp;
  Ok(())
}
