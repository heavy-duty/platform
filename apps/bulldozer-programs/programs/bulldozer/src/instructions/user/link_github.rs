use crate::collections::{GithubUser, GithubUserLink, User};
use anchor_lang::prelude::*;

#[derive(AnchorSerialize, AnchorDeserialize)]
pub struct LinkGithubArguments {
  pub handle: String,
}

#[derive(Accounts)]
#[instruction(arguments: LinkGithubArguments)]
pub struct LinkGithub<'info> {
  #[account(mut)]
  pub authority: Signer<'info>,
  #[account(
    init,
    payer = authority,
    space = GithubUser::space(),
    seeds = [
      b"github_user".as_ref(),
      arguments.handle.as_bytes()
    ],
    bump
  )]
  pub github_user: Box<Account<'info, GithubUser>>,
  #[account(
    seeds = [
      b"user".as_ref(),
      authority.key().as_ref(),
    ],
    bump = user.bump
  )]
  pub user: Box<Account<'info, User>>,
  #[account(
    init,
    payer = authority,
    space = GithubUserLink::space(),
    seeds = [
      b"github_user_link".as_ref(),
      user.key().as_ref()
    ],
    bump
  )]
  pub github_user_link: Box<Account<'info, GithubUserLink>>,
  pub system_program: Program<'info, System>,
}

pub fn handle(ctx: Context<LinkGithub>, arguments: LinkGithubArguments) -> ProgramResult {
  msg!("Link GitHub");
  ctx.accounts.github_user.initialize(
    *ctx.accounts.authority.key,
    arguments.handle,
    *ctx.bumps.get("github_user").unwrap(),
  );
  ctx.accounts.github_user_link.initialize(
    *ctx.accounts.authority.key,
    ctx.accounts.user.key(),
    ctx.accounts.github_user.key(),
    *ctx.bumps.get("github_user_link").unwrap(),
  );
  Ok(())
}
