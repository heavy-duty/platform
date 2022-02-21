use anchor_lang::prelude::*;

#[account]
pub struct GithubUserLink {
  pub authority: Pubkey,
  pub user: Pubkey,
  pub github_user: Pubkey,
  pub bump: u8,
}

impl GithubUserLink {
  pub fn initialize(
    &mut self,
    authority: Pubkey,
    user: Pubkey,
    github_user: Pubkey,
    bump: u8,
  ) -> () {
    self.authority = authority;
    self.github_user = github_user;
    self.user = user;
    self.bump = bump;
  }

  pub fn space() -> usize {
    // discriminator + authority + bump + created at
    8 + 32 + 32 + 36 + 4
  }
}
