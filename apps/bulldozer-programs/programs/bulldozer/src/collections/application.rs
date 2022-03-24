use anchor_lang::prelude::*;

#[account]
pub struct ApplicationStats {
  pub quantity_of_collections: u8,
  pub quantity_of_instructions: u8,
}

impl ApplicationStats {
  pub fn initialize(&mut self) -> () {
    self.quantity_of_collections = 0;
    self.quantity_of_instructions = 0;
  }

  pub fn increase_collection_quantity(&mut self) -> () {
    self.quantity_of_collections += 1;
  }

  pub fn decrease_collection_quantity(&mut self) -> () {
    self.quantity_of_collections -= 1;
  }

  pub fn increase_instruction_quantity(&mut self) -> () {
    self.quantity_of_instructions += 1;
  }

  pub fn decrease_instruction_quantity(&mut self) -> () {
    self.quantity_of_instructions -= 1;
  }

  pub fn space() -> usize {
    // discriminator + quantity of collections + quantity of instructions
    8 + 1 + 1
  }
}

#[account]
pub struct Application {
  pub authority: Pubkey,
  pub workspace: Pubkey,
  pub name: String,
  pub created_at: i64,
  pub updated_at: i64,
  pub application_stats_bump: u8,
}

impl Application {
  pub fn initialize(
    &mut self,
    name: String,
    authority: Pubkey,
    workspace: Pubkey,
    application_stats_bump: u8,
  ) -> () {
    self.name = name;
    self.authority = authority;
    self.workspace = workspace;
    self.application_stats_bump = application_stats_bump;
  }

  pub fn rename(&mut self, name: String) -> () {
    self.name = name;
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
    // discriminator + authority + workspace + name (size 32 + 4 ?) +
    // created at + updated at + application stats bump
    8 + 32 + 32 + 36 + 8 + 8 + 1
  }
}
