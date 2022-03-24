use anchor_lang::prelude::*;

#[account]
pub struct WorkspaceStats {
  pub quantity_of_collaborators: u8,
  pub quantity_of_applications: u8,
}

impl WorkspaceStats {
  pub fn initialize(&mut self) -> () {
    self.quantity_of_applications = 0;
    self.quantity_of_collaborators = 1;
  }

  pub fn increase_application_quantity(&mut self) -> () {
    self.quantity_of_applications += 1;
  }

  pub fn decrease_application_quantity(&mut self) -> () {
    self.quantity_of_applications -= 1;
  }

  pub fn increase_collaborator_quantity(&mut self) -> () {
    self.quantity_of_collaborators += 1;
  }

  pub fn decrease_collaborator_quantity(&mut self) -> () {
    self.quantity_of_collaborators -= 1;
  }

  pub fn space() -> usize {
    // discriminator + quantity of apps + quantity of collaborators +
    8 + 1 + 1
  }
}

#[account]
pub struct Workspace {
  pub authority: Pubkey,
  pub name: String,
  pub created_at: i64,
  pub updated_at: i64,
  pub workspace_stats_bump: u8,
}

impl Workspace {
  pub fn initialize(&mut self, name: String, authority: Pubkey, workspace_stats_bump: u8) -> () {
    self.name = name;
    self.authority = authority;
    self.workspace_stats_bump = workspace_stats_bump;
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
    // discriminator + authority + name (size 32 + 4)
    // created_at + updated_at + workspace stats bump
    8 + 32 + 36 + 8 + 8 + 1
  }
}
