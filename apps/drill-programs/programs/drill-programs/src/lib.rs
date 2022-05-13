use anchor_lang::prelude::*;

mod collections;
mod errors;
mod instructions;

use instructions::*;

declare_id!("ARp7sigi8EAfyi5omv7jKZTy9NJaQz7Bh6dt4urzFjWt");

#[program]
pub mod drill {
    use super::*;

    pub fn initialize_board(
        ctx: Context<InitializeBoard>,
        board_id: u32,
        lock_time: i64,
    ) -> Result<()> {
        instructions::initialize_board::handle(ctx, board_id, lock_time)
    }

    pub fn set_board_authority(ctx: Context<SetBoardAuthority>, _board_id: u32) -> Result<()> {
        instructions::set_board_authority::handle(ctx)
    }

    pub fn initialize_bounty(
        ctx: Context<InitializeBounty>,
        board_id: u32,
        bounty_id: u32,
    ) -> Result<()> {
        instructions::initialize_bounty::handle(ctx, board_id, bounty_id)
    }

    pub fn deposit(
        ctx: Context<Deposit>,
        _board_id: u32,
        _bounty_id: u32,
        amount: u64,
    ) -> Result<()> {
        instructions::deposit::handle(ctx, amount)
    }

    pub fn close_bounty(
        ctx: Context<CloseBounty>,
        _board_id: u32,
        _bounty_id: u32,
        bounty_hunter: Option<String>,
    ) -> Result<()> {
        instructions::close_bounty::handle(ctx, bounty_hunter)
    }

    pub fn set_bounty_hunter(
        ctx: Context<SetBountyHunter>,
        _board_id: u32,
        _bounty_id: u32,
        bounty_hunter: String,
    ) -> Result<()> {
        instructions::set_bounty_hunter::handle(ctx, bounty_hunter)
    }

    #[access_control(instructions::send_bounty::validate(&ctx))]
    pub fn send_bounty(
        ctx: Context<SendBounty>,
        board_id: u32,
        _bounty_id: u32,
        _bounty_hunter: String,
    ) -> Result<()> {
        instructions::send_bounty::handle(ctx, board_id)
    }
}
