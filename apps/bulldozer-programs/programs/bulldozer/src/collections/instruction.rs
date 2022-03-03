use anchor_lang::prelude::*;

#[account]
pub struct Instruction {
  pub authority: Pubkey,
  pub workspace: Pubkey,
  pub application: Pubkey,
  pub name: String,
  pub body: String,
  pub quantity_of_arguments: u8,
  pub quantity_of_accounts: u8,
  pub created_at: i64,
  pub updated_at: i64,
}

impl Instruction {
  pub fn initialize(
    &mut self,
    name: String,
    authority: Pubkey,
    workspace: Pubkey,
    application: Pubkey,
  ) -> () {
    self.authority = authority;
    self.workspace = workspace;
    self.application = application;
    self.name = name;
    self.body = "".to_string();
    self.quantity_of_arguments = 0;
    self.quantity_of_accounts = 0;
  }

  pub fn rename(&mut self, name: String) -> () {
    self.name = name;
  }

  pub fn change_body(&mut self, body: String) -> () {
    self.body = body;
  }

  pub fn increase_argument_quantity(&mut self) -> () {
    self.quantity_of_arguments += 1;
  }

  pub fn decrease_argument_quantity(&mut self) -> () {
    self.quantity_of_arguments -= 1;
  }

  pub fn increase_account_quantity(&mut self) -> () {
    self.quantity_of_accounts += 1;
  }

  pub fn decrease_account_quantity(&mut self) -> () {
    self.quantity_of_accounts -= 1;
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
    // name (size 32 + 4 ?) + body + quantity of arguments
    // quantity of accounts + created at + updated at
    8 + 32 + 32 + 32 + 33 + 2000 + 1 + 1 + 8 + 8
  }
}
