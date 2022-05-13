use anchor_lang::prelude::*;
use crate::collections::{Board, Bounty};

#[derive(Accounts)]
#[instruction(
    board_id: u32, 
    bounty_id: u32,
    bounty_hunter: String,
)]
pub struct SetBountyHunter<'info> {
    #[account(
        seeds = [
            b"board".as_ref(), 
            &board_id.to_le_bytes(),
        ],
        bump = board.board_bump,
        constraint = board.authority == authority.key(),
    )]
    pub board: Box<Account<'info, Board>>,
    #[account(
        mut,
        seeds = [
            b"bounty".as_ref(), 
            board.key().as_ref(), 
            &bounty_id.to_le_bytes(),
        ],
        bump = bounty.bounty_bump,
    )]
    pub bounty: Box<Account<'info, Bounty>>,
    pub authority: Signer<'info>,
}

pub fn handle(
  ctx: Context<SetBountyHunter>,
  bounty_hunter: String,
) -> Result<()> {
  ctx.accounts.bounty.set_bounty_hunter(bounty_hunter);
  Ok(())
}