use anchor_lang::prelude::*;

#[account]
pub struct Bounty {
  pub board_id: u32,
  pub bounty_id: u32,
  pub bounty_bump: u8,
  pub bounty_vault_bump: u8,
  pub bounty_hunter: Option<String>,
  pub closed_at: Option<i64>,
  pub is_closed: bool,
  pub claimed_at: Option<i64>,
  pub is_claimed: bool,
}

impl Bounty {
  pub fn initialize(
    &mut self,
    board_id: u32,
    bounty_id: u32,
    bounty_bump: u8,
    bounty_vault_bump: u8,
  ) -> () {
    self.board_id = board_id;
    self.bounty_id = bounty_id;
    self.bounty_bump = bounty_bump;
    self.bounty_vault_bump = bounty_vault_bump;
    self.bounty_hunter = None;
    self.closed_at = None;
    self.is_closed = false;
    self.claimed_at = None;
    self.is_claimed = false;
  }

  pub fn close(&mut self, bounty_hunter: Option<String>) -> Result<()> {
    self.is_closed = true;
    self.bounty_hunter = bounty_hunter;
    self.closed_at = Some(Clock::get()?.unix_timestamp);
    Ok(())
  }

  pub fn claim(&mut self) -> Result<()> {
    self.is_claimed = true;
    self.claimed_at = Some(Clock::get()?.unix_timestamp);
    Ok(())
  }

  pub fn set_bounty_hunter(&mut self, bounty_hunter: String) -> () {
    self.bounty_hunter = Some(bounty_hunter);
  }
}
