use crate::collections::Board;
use anchor_lang::prelude::*;

#[derive(Accounts)]
#[instruction(board_id: u32)]
pub struct SetBoardAuthority<'info> {
  #[account(
        mut,
        seeds = [
            b"board".as_ref(), 
            &board_id.to_le_bytes(),
        ],
        bump = board.board_bump,
        constraint = board.authority == authority.key(),
    )]
  pub board: Box<Account<'info, Board>>,
  pub authority: Signer<'info>,
  pub new_authority: SystemAccount<'info>,
}

pub fn handle(ctx: Context<SetBoardAuthority>) -> Result<()> {
  ctx
    .accounts
    .board
    .set_authority(ctx.accounts.new_authority.key());
  Ok(())
}
