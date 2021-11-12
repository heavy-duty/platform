use crate::enums::{AttributeKinds, AttributeModifiers};
use crate::errors::ErrorCode;
use crate::utils::vectorize_string;
use anchor_lang::prelude::*;

pub trait AttributeKind {
  fn set_kind(
    &mut self,
    kind: Option<u8>,
    max: Option<u32>,
    max_length: Option<u32>,
  ) -> Result<&Self, ProgramError>;
}

pub trait AttributeModifier {
  fn set_modifier(
    &mut self,
    modifier: Option<u8>,
    size: Option<u32>,
  ) -> Result<&Self, ProgramError>;
}

#[derive(AnchorSerialize, AnchorDeserialize, Clone)]
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
  pub kind: Option<AttributeKinds>,
  pub modifier: Option<AttributeModifiers>,
}

impl AttributeKind for Attribute {
  fn set_kind(
    &mut self,
    kind: Option<u8>,
    max: Option<u32>,
    max_length: Option<u32>,
  ) -> Result<&Self, ProgramError> {
    self.kind = match kind {
      Some(kind) => match kind {
        0 => Some(AttributeKinds::Boolean {
          id: kind,
          size: 1,
        }),
        1 => match max {
          None => return Err(ErrorCode::MissingMax.into()),
          Some(max) => Some(AttributeKinds::Number {
            id: kind,
            size: max,
          }),
        },
        2 => match max_length {
          None => return Err(ErrorCode::MissingMaxLength.into()),
          Some(max_length) => Some(AttributeKinds::String {
            id: kind,
            size: max_length,
          }),
        },
        3 => Some(AttributeKinds::Pubkey { id: kind, size: 32 }),
        _ => return Err(ErrorCode::InvalidAttributeKind.into()),
      },
      _ => return Ok(self),
    };

    Ok(self)
  }
}

impl AttributeModifier for Attribute {
  fn set_modifier(
    &mut self,
    modifier: Option<u8>,
    size: Option<u32>,
  ) -> Result<&Self, ProgramError> {
    self.modifier = match (modifier, size) {
      (Some(modifier), Some(size)) => match modifier {
        0 => Some(AttributeModifiers::Array {
          id: modifier,
          size: size,
        }),
        1 => Some(AttributeModifiers::Vector {
          id: modifier,
          size: size,
        }),
        _ => return Err(ErrorCode::InvalidAttributeModifier.into()),
      },
      (_, _) => return Ok(self),
    };

    Ok(self)
  }
}

impl Attribute {
  pub fn create(dto: AttributeDto) -> Result<Self, ProgramError> {
    let mut attribute = Attribute {
      name: vectorize_string(dto.name, 32),
      kind: None,
      modifier: None,
    };
    attribute.set_kind(Some(dto.kind), dto.max, dto.max_length)?;
    attribute.set_modifier(dto.modifier, dto.size)?;
    return Ok(attribute);
  }
}
