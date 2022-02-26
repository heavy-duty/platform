use anchor_lang::prelude::*;

#[account]
pub struct Collection {
  pub authority: Pubkey,
  pub workspace: Pubkey,
  pub application: Pubkey,
  pub name: String,
  pub quantity_of_attributes: u8,
  pub created_at: i64,
  pub updated_at: i64,
}

impl Collection {
  pub fn initialize(
    &mut self,
    name: String,
    authority: Pubkey,
    workspace: Pubkey,
    application: Pubkey,
  ) -> () {
    self.name = name;
    self.authority = authority;
    self.application = application;
    self.workspace = workspace;
    self.quantity_of_attributes = 0;
  }

  pub fn rename(&mut self, name: String) -> () {
    self.name = name;
  }

  pub fn increase_attribute_quantity(&mut self) -> () {
    self.quantity_of_attributes += 1;
  }

  pub fn decrease_attribute_quantity(&mut self) -> () {
    self.quantity_of_attributes -= 1;
  }

  pub fn initialize_timestamp(&mut self) -> ProgramResult {
    self.created_at = Clock::get()?.unix_timestamp;
    self.updated_at = Clock::get()?.unix_timestamp;
    Ok(())
  }

  pub fn bump_timestamp(&mut self) -> ProgramResult {
    self.updated_at = Clock::get()?.unix_timestamp;
    Ok(())
  }

  pub fn space() -> usize {
    // discriminator + authority + workspace + application + string (size 32 + 4 ?)
    // quantity of attributes + created at + updated at
    8 + 32 + 32 + 32 + 36 + 1 + 8 + 8
  }
}
