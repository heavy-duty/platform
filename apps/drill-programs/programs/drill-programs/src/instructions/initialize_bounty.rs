use {anchor_lang::prelude::*, anchor_spl::token::*};
use crate::collections::{Board, Bounty};

#[derive(Accounts)]
#[instruction(
    board_id: u32, 
    bounty_id: u32,
)]
pub struct InitializeBounty<'info> {
    #[account(
        seeds = [
            b"board".as_ref(), 
            &board_id.to_le_bytes(),
        ],
        bump = board.board_bump,
    )]
    pub board: Box<Account<'info, Board>>,
    #[account(
        init,
        payer = authority,
        space = Bounty::space(),
        seeds = [
            b"bounty".as_ref(), 
            board.key().as_ref(), 
            &bounty_id.to_le_bytes(),
        ],
        bump,
    )]
    pub bounty: Box<Account<'info, Bounty>>,
    pub accepted_mint: Box<Account<'info, Mint>>,
    #[account(
        init,
        payer = authority,
        seeds = [
            b"bounty_vault".as_ref(),
            bounty.key().as_ref()
        ],
        bump,
        token::mint = accepted_mint,
        token::authority = board,
    )]
    pub bounty_vault: Box<Account<'info, TokenAccount>>,
    #[account(mut)]
    pub authority: Signer<'info>,
    pub rent: Sysvar<'info, Rent>,
    pub token_program: Program<'info, Token>,
    pub system_program: Program<'info, System>,
}

pub fn handle(
  ctx: Context<InitializeBounty>,  
  board_id: u32, 
  bounty_id: u32
) -> Result<()> {
  ctx.accounts.bounty.initialize(
      board_id, 
      bounty_id, 
      *ctx.bumps.get("bounty").unwrap(), 
      *ctx.bumps.get("bounty_vault").unwrap()
  );
  Ok(())
}