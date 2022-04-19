use anchor_lang::prelude::*;

#[account]
pub struct Budget {
  pub authority: Pubkey,
  pub workspace: Pubkey,
  pub bump: u8,
  pub total_deposited: u64,
  pub total_value_locked: u64,
  pub created_at: i64,
}

impl Budget {
  pub fn initialize(&mut self, authority: Pubkey, workspace: Pubkey, bump: u8) -> () {
    self.workspace = workspace;
    self.authority = authority;
    self.total_deposited = 0;
    self.total_value_locked = 0;
    self.bump = bump;
  }

  pub fn initialize_timestamp(&mut self) -> Result<()> {
    self.created_at = Clock::get()?.unix_timestamp;
    Ok(())
  }

  pub fn space() -> usize {
    // discriminator + authority + workspace + bump
    // total deposited + total value locked + created at
    8 + 32 + 32 + 1 + 8 + 8 + 8
  }

  pub fn deposit(&mut self, amount: u64) -> () {
    self.total_deposited = self.total_deposited.checked_add(amount).unwrap();
    self.total_value_locked = self.total_value_locked.checked_add(amount).unwrap();
  }

  pub fn withdraw(&mut self, amount: u64) -> () {
    self.total_value_locked = self.total_value_locked.checked_sub(amount).unwrap();
  }

  pub fn get_rent_exemption() -> Result<u64> {
    let rent = Rent::get()?;
    Ok(rent.minimum_balance(Budget::space()))
  }
}
