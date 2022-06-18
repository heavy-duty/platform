use anchor_lang::prelude::*;

#[account]
pub struct InstructionAccountConstraint {
  pub authority: Pubkey,
  pub workspace: Pubkey,
  pub application: Pubkey,
  pub instruction: Pubkey,
  pub account: Pubkey,
  pub name: String,
  pub body: String,
  pub created_at: i64,
  pub updated_at: i64,
}

impl InstructionAccountConstraint {
  pub fn initialize(
    &mut self,
    name: String,
    body: String,
    authority: Pubkey,
    workspace: Pubkey,
    application: Pubkey,
    instruction: Pubkey,
    account: Pubkey,
  ) -> () {
    self.authority = authority;
    self.workspace = workspace;
    self.application = application;
    self.instruction = instruction;
    self.account = account;
    self.name = name;
    self.body = body;
  }

  pub fn initialize_timestamp(&mut self) -> Result<()> {
    self.created_at = Clock::get()?.unix_timestamp;
    self.updated_at = Clock::get()?.unix_timestamp;
    Ok(())
  }

  pub fn bump_timestamp(&mut self) -> Result<()> {
    self.updated_at = Clock::get()?.unix_timestamp;
    Ok(())
  }

  pub fn space() -> usize {
    // discriminator + authority + workspace + application
    // instruction + account + name (size 32 + 4 ?) + body
    // created at + updated at
    8 + 32 + 32 + 32 + 32 + 32 + 36 + 260
  }
}
