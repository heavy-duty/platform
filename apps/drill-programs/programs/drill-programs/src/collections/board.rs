use anchor_lang::prelude::*;

#[account]
pub struct Board {
  pub authority: Pubkey,
  pub board_id: u32,
  pub accepted_mint: Pubkey,
  pub lock_time: i64,
  pub board_bump: u8,
  pub board_vault_bump: u8,
}

impl Board {
  pub fn initialize(
    &mut self,
    authority: Pubkey,
    board_id: u32,
    lock_time: i64,
    accepted_mint: Pubkey,
    board_bump: u8,
    board_vault_bump: u8,
  ) -> () {
    self.authority = authority;
    self.board_id = board_id;
    self.lock_time = lock_time;
    self.accepted_mint = accepted_mint;
    self.board_bump = board_bump;
    self.board_vault_bump = board_vault_bump;
  }

  pub fn set_authority(&mut self, authority: Pubkey) -> () {
    self.authority = authority;
  }
}
