use anchor_lang::prelude::*;

#[account]
pub struct WorkspaceStats {
  pub quantity_of_collaborators: u8,
  pub quantity_of_applications: u8,
}

impl WorkspaceStats {
  pub fn initialize(&mut self) -> () {
    self.quantity_of_applications = 0;
    self.quantity_of_collaborators = 0;
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
  pub id: u32,
  pub authority: Pubkey,
  pub name: String,
  pub bump: u8,
  pub created_at: i64,
  pub updated_at: i64,
  pub workspace_stats_bump: u8,
}

impl Workspace {
  pub fn space() -> usize {
    // discriminator + authority + name (size 32 + 4)
    // created_at + updated_at + bump + workspace stats bump
    // id
    8 + 1 + 32 + 36 + 8 + 8 + 1 + 1 + 4
  }
}
