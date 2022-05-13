use crate::collections::Board;
use {anchor_lang::prelude::*, anchor_spl::token::*};

#[derive(Accounts)]
#[instruction(
    board_id: u32,
    lock_time: i64
)]
pub struct InitializeBoard<'info> {
  #[account(
        init,
        payer = authority,
        space = Board::space(),
        seeds = [
            b"board".as_ref(), 
            &board_id.to_le_bytes(),
        ],
        bump,
    )]
  pub board: Box<Account<'info, Board>>,
  pub accepted_mint: Box<Account<'info, Mint>>,
  #[account(
        init,
        payer = authority,
        seeds = [
            b"board_vault".as_ref(), 
            board.key().as_ref()
        ],
        bump,
        token::mint = accepted_mint,
        token::authority = board,
    )]
  pub board_vault: Box<Account<'info, TokenAccount>>,
  #[account(mut)]
  pub authority: Signer<'info>,
  pub rent: Sysvar<'info, Rent>,
  pub token_program: Program<'info, Token>,
  pub system_program: Program<'info, System>,
}

pub fn handle(ctx: Context<InitializeBoard>, board_id: u32, lock_time: i64) -> Result<()> {
  ctx.accounts.board.initialize(
    ctx.accounts.authority.key(),
    board_id,
    lock_time,
    ctx.accounts.accepted_mint.key(),
    *ctx.bumps.get("board").unwrap(),
    *ctx.bumps.get("board_vault").unwrap(),
  );
  Ok(())
}
