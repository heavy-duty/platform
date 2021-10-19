use crate::enums::{AttributeKind, AttributeKindModifier};
use crate::errors::ErrorCode;
use anchor_lang::prelude::*;

#[account]
pub struct CollectionAttribute {
  pub authority: Pubkey,
  pub application: Pubkey,
  pub collection: Pubkey,
  pub name: Vec<u8>,
  pub kind: AttributeKind,
  pub modifier: Option<AttributeKindModifier>,
}

impl CollectionAttribute {
  pub fn set_kind(
    &mut self,
    kind: u8,
    max: Option<u32>,
    max_length: Option<u32>,
  ) -> Result<&Self, ProgramError> {
    self.kind = match kind {
      0 => match max {
        None => return Err(ErrorCode::MissingMax.into()),
        Some(max) => AttributeKind::from_index(kind, max)?,
      },
      1 => match max_length {
        None => return Err(ErrorCode::MissingMaxLength.into()),
        Some(max_length) => AttributeKind::from_index(kind, max_length)?,
      },
      2 => AttributeKind::from_index(kind, 32)?,
      _ => AttributeKind::from_index(kind, 0)?,
    };

    Ok(self)
  }

  pub fn set_modifier(
    &mut self,
    modifier: Option<u8>,
    size: Option<u32>,
  ) -> Result<&Self, ProgramError> {
    self.modifier = match (modifier, size) {
      (Some(modifier), Some(size)) => Some(AttributeKindModifier::from_index(modifier, size)?),
      (_, _) => return Ok(self),
    };

    Ok(self)
  }
}
