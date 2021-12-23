use anchor_lang::prelude::*;

#[account]
pub struct Workspace {
  pub authority: Pubkey,
  pub name: String,
}
