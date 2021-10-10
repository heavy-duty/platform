use anchor_lang::prelude::*;
use anchor_lang::error;

#[error]
pub enum ErrorCode {
    #[msg("Invalid attribute kind")]
    InvalidAttributeKind,
    #[msg("Invalid attribute modifier")]
    InvalidAttributeModifier,
    #[msg("Invalid mark attribute")]
    InvalidMarkAttribute,
    #[msg("Invalid account kind")]
    InvalidAccountKind,
    #[msg("Invalid account modifier")]
    InvalidAccountModifier,
}
