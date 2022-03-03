use anchor_lang::prelude::*;

#[account]
pub struct InstructionRelation {
  pub authority: Pubkey,
  pub workspace: Pubkey,
  pub application: Pubkey,
  pub instruction: Pubkey,
  pub from: Pubkey,
  pub to: Pubkey,
  pub bump: u8,
  pub created_at: i64,
  pub updated_at: i64,
}

impl InstructionRelation {
  pub fn initialize(
    &mut self,
    authority: Pubkey,
    workspace: Pubkey,
    application: Pubkey,
    instruction: Pubkey,
    from: Pubkey,
    to: Pubkey,
    bump: u8,
  ) -> () {
    self.authority = authority;
    self.workspace = workspace;
    self.application = application;
    self.instruction = instruction;
    self.from = from;
    self.to = to;
    self.bump = bump;
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
    // instruction + from + to + bump + created at + updated at
    8 + 32 + 32 + 32 + 32 + 32 + 32 + 1 + 8 + 8
  }
}
