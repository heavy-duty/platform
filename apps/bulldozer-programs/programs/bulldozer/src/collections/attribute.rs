use crate::enums::{AttributeKind, AttributeKindModifier};
use crate::errors::ErrorCode;
use anchor_lang::prelude::*;

pub trait AttributeKindSetter {
  fn set_kind(
    &mut self,
    kind: Option<u8>,
    max: Option<u32>,
    max_length: Option<u32>,
  ) -> Result<&Self, ProgramError>;
}

pub trait AttributeModifierSetter {
  fn set_modifier(
    &mut self,
    modifier: Option<u8>,
    size: Option<u32>,
  ) -> Result<&Self, ProgramError>;
}

#[account]
pub struct AttributeDto {
  pub name: String,
  pub kind: u8,
  pub modifier: Option<u8>,
  pub size: Option<u32>,
  pub max: Option<u32>,
  pub max_length: Option<u32>,
}

#[derive(AnchorSerialize, AnchorDeserialize, Clone)]
pub struct Attribute {
  pub name: Vec<u8>,
  pub kind: Option<AttributeKind>,
  pub modifier: Option<AttributeKindModifier>,
}

impl AttributeKindSetter for Attribute {
  fn set_kind(
    &mut self,
    kind: Option<u8>,
    max: Option<u32>,
    max_length: Option<u32>,
  ) -> Result<&Self, ProgramError> {
    self.kind = match kind {
      Some(kind) => match kind {
        0 => match max {
          None => return Err(ErrorCode::MissingMax.into()),
          Some(max) => Some(AttributeKind::from_index(kind, max)?),
        },
        1 => match max_length {
          None => return Err(ErrorCode::MissingMaxLength.into()),
          Some(max_length) => Some(AttributeKind::from_index(kind, max_length)?),
        },
        2 => Some(AttributeKind::from_index(kind, 32)?),
        _ => Some(AttributeKind::from_index(kind, 0)?),
      },
      _ => return Ok(self),
    };

    Ok(self)
  }
}

impl AttributeModifierSetter for Attribute {
  fn set_modifier(
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
