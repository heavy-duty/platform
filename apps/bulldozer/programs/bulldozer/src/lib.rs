use anchor_lang::prelude::*;

declare_id!("Fg6PaFpoGXkYsidMpWTK6W2BeZ7FEfcYkg476zPFsLnS");

#[program]
pub mod bulldozer {
    use super::*;

    pub fn create_application(ctx: Context<CreateApplication>, name: String) -> ProgramResult {
        msg!("Create application");
        ctx.accounts.application.name = parse_string(name);
        ctx.accounts.application.authority = ctx.accounts.authority.key();
        Ok(())
    }

    pub fn update_application(ctx: Context<UpdateApplication>, name: String) -> ProgramResult {
        msg!("Update application");
        ctx.accounts.application.name = parse_string(name);
        Ok(())
    }

    pub fn delete_application(_ctx: Context<DeleteApplication>) -> ProgramResult {
        msg!("Delete application");
        Ok(())
    }

    pub fn create_collection(ctx: Context<CreateCollection>, name: String) -> ProgramResult {
        msg!("Create collection");
        ctx.accounts.collection.name = parse_string(name);
        ctx.accounts.collection.authority = ctx.accounts.authority.key();
        ctx.accounts.collection.application = ctx.accounts.application.key();
        Ok(())
    }

    pub fn update_collection(ctx: Context<UpdateCollection>, name: String) -> ProgramResult {
        msg!("Update collection");
        ctx.accounts.collection.name = parse_string(name);
        Ok(())
    }

    pub fn delete_collection(_ctx: Context<DeleteCollection>) -> ProgramResult {
        msg!("Delete collection");
        Ok(())
    }

    pub fn create_collection_attribute(ctx: Context<CreateCollectionAttribute>, name: String, kind: u8, modifier: u8, size: u8) -> ProgramResult {
        msg!("Create collection attribute");
        ctx.accounts.attribute.name = parse_string(name);
        ctx.accounts.attribute.kind = AttributeKind::from(kind)?;
        ctx.accounts.attribute.modifier = AttributeKindModifier::from(modifier, size)?;
        ctx.accounts.attribute.authority = ctx.accounts.authority.key();
        ctx.accounts.attribute.collection = ctx.accounts.collection.key();
        ctx.accounts.attribute.application = ctx.accounts.application.key();
        Ok(())
    }

    pub fn update_collection_attribute(ctx: Context<UpdateCollectionAttribute>, name: String, kind: u8, modifier: u8, size: u8) -> ProgramResult {
        msg!("Update collection attribute");
        ctx.accounts.attribute.name = parse_string(name);
        ctx.accounts.attribute.kind = AttributeKind::from(kind)?;
        ctx.accounts.attribute.modifier = AttributeKindModifier::from(modifier, size)?;
        Ok(())
    }

    pub fn delete_collection_attribute(_ctx: Context<DeleteCollectionAttribute>) -> ProgramResult {
        msg!("Delete collection attribute");
        Ok(())
    }

    pub fn create_instruction(ctx: Context<CreateInstruction>, name: String) -> ProgramResult {
        msg!("Create instruction");
        ctx.accounts.instruction.name = parse_string(name);
        ctx.accounts.instruction.authority = ctx.accounts.authority.key();
        ctx.accounts.instruction.application = ctx.accounts.application.key();
        Ok(())
    }

    pub fn update_instruction(ctx: Context<UpdateInstruction>, name: String) -> ProgramResult {
        msg!("Update instruction");
        ctx.accounts.instruction.name = parse_string(name);
        Ok(())
    }

    pub fn delete_instruction(_ctx: Context<DeleteInstruction>) -> ProgramResult {
        msg!("Delete instruction");
        Ok(())
    }

    pub fn create_instruction_argument(ctx: Context<CreateInstructionArgument>, name: String, kind: u8, modifier: u8, size: u8) -> ProgramResult {
        msg!("Create instruction argument");
        ctx.accounts.argument.name = parse_string(name);
        ctx.accounts.argument.kind = AttributeKind::from(kind)?;
        ctx.accounts.argument.modifier = AttributeKindModifier::from(modifier, size)?;
        ctx.accounts.argument.authority = ctx.accounts.authority.key();
        ctx.accounts.argument.instruction = ctx.accounts.instruction.key();
        ctx.accounts.argument.application = ctx.accounts.application.key();
        Ok(())
    }

    pub fn update_instruction_argument(ctx: Context<UpdateInstructionArgument>, name: String, kind: u8, modifier: u8, size: u8) -> ProgramResult {
        msg!("Update instruction argument");
        ctx.accounts.argument.name = parse_string(name);
        ctx.accounts.argument.kind = AttributeKind::from(kind)?;
        ctx.accounts.argument.modifier = AttributeKindModifier::from(modifier, size)?;
        Ok(())
    }

    pub fn delete_instruction_argument(_ctx: Context<DeleteInstructionArgument>) -> ProgramResult {
        msg!("Delete instruction argument");
        Ok(())
    }

    pub fn create_instruction_basic_account(ctx: Context<CreateInstructionBasicAccount>, name: String, mark_attribute: u8) -> ProgramResult {
        msg!("Create instruction basic account");
        ctx.accounts.account.authority = ctx.accounts.authority.key();
        ctx.accounts.account.application = ctx.accounts.application.key();
        ctx.accounts.account.instruction = ctx.accounts.instruction.key();
        ctx.accounts.account.name = parse_string(name);
        ctx.accounts.account.collection = ctx.accounts.collection.key();
        ctx.accounts.account.mark_attribute = MarkAttribute::from(mark_attribute)?;
        Ok(())
    }

    pub fn update_instruction_basic_account(ctx: Context<UpdateInstructionBasicAccount>, name: String, mark_attribute: u8) -> ProgramResult {
        msg!("Update instruction basic account");
        ctx.accounts.account.name = parse_string(name);
        ctx.accounts.account.collection = ctx.accounts.collection.key();
        ctx.accounts.account.mark_attribute = MarkAttribute::from(mark_attribute)?;
        Ok(())
    }

    pub fn delete_instruction_basic_account(_ctx: Context<DeleteInstructionBasicAccount>) -> ProgramResult {
        msg!("Delete instruction basic account");
        Ok(())
    }

    pub fn create_instruction_signer_account(ctx: Context<CreateInstructionSignerAccount>, name: String, mark_attribute: u8) -> ProgramResult {
        msg!("Create instruction signer account");
        ctx.accounts.account.authority = ctx.accounts.authority.key();
        ctx.accounts.account.application = ctx.accounts.application.key();
        ctx.accounts.account.instruction = ctx.accounts.instruction.key();
        ctx.accounts.account.name = parse_string(name);
        ctx.accounts.account.mark_attribute = MarkAttribute::from(mark_attribute)?;
        Ok(())
    }

    pub fn update_instruction_signer_account(ctx: Context<UpdateInstructionSignerAccount>, name: String, mark_attribute: u8) -> ProgramResult {
        msg!("Update instruction signer account");
        ctx.accounts.account.name = parse_string(name);
        ctx.accounts.account.mark_attribute = MarkAttribute::from(mark_attribute)?;
        Ok(())
    }

    pub fn delete_instruction_signer_account(_ctx: Context<DeleteInstructionSignerAccount>) -> ProgramResult {
        msg!("Delete instruction signer account");
        Ok(())
    }

    pub fn create_instruction_program_account(ctx: Context<CreateInstructionProgramAccount>, name: String) -> ProgramResult {
        msg!("Create instruction program account");
        ctx.accounts.account.authority = ctx.accounts.authority.key();
        ctx.accounts.account.application = ctx.accounts.application.key();
        ctx.accounts.account.instruction = ctx.accounts.instruction.key();
        ctx.accounts.account.name = parse_string(name);
        ctx.accounts.account.program = ctx.accounts.program.key();
        Ok(())
    }

    pub fn update_instruction_program_account(ctx: Context<UpdateInstructionProgramAccount>, name: String) -> ProgramResult {
        msg!("Update instruction program account");
        ctx.accounts.account.name = parse_string(name);
        ctx.accounts.account.program = ctx.accounts.program.key();
        Ok(())
    }

    pub fn delete_instruction_program_account(_ctx: Context<DeleteInstructionProgramAccount>) -> ProgramResult {
        msg!("Delete instruction program account");
        Ok(())
    }
}

#[derive(Accounts)]
#[instruction(name: String)]
pub struct CreateApplication<'info> {
    #[account(
        init,
        payer = authority,
        space = 8 + 32 + 32,
    )]
    pub application: Box<Account<'info, Application>>,
    #[account(mut)]
    pub authority: Signer<'info>,
    pub system_program: Program<'info, System>,
}

#[derive(Accounts)]
#[instruction(name: String)]
pub struct UpdateApplication<'info> {
    #[account(mut, has_one = authority)]
    pub application: Box<Account<'info, Application>>,
    pub authority: Signer<'info>,
}

#[derive(Accounts)]
pub struct DeleteApplication<'info> {
    #[account(mut, has_one = authority, close = authority)]
    pub application: Account<'info, Application>,
    pub authority: Signer<'info>,
}

#[derive(Accounts)]
#[instruction(name: String)]
pub struct CreateCollection<'info> {
    #[account(
        init,
        payer = authority,
        space = 8 + 32 + 32 + 32
    )]
    pub collection: Box<Account<'info, Collection>>,
    pub application: Box<Account<'info, Application>>,
    #[account(mut)]
    pub authority: Signer<'info>,
    pub system_program: Program<'info, System>,
}

#[derive(Accounts)]
#[instruction(name: String)]
pub struct UpdateCollection<'info> {
    #[account(mut, has_one = authority)]
    pub collection: Box<Account<'info, Collection>>,
    pub authority: Signer<'info>,
}

#[derive(Accounts)]
pub struct DeleteCollection<'info> {
    #[account(mut, has_one = authority, close = authority)]
    pub collection: Account<'info, Collection>,
    pub authority: Signer<'info>,
}

#[derive(Accounts)]
#[instruction(name: String, kind: u8, modifier: u8, size: u8)]
pub struct CreateCollectionAttribute<'info> {
    #[account(
        init,
        payer = authority,
        space = 8 + 32 + 32 + 32 + 32 + 3 + 3
    )]
    pub attribute: Box<Account<'info, CollectionAttribute>>,
    pub application: Box<Account<'info, Application>>,
    pub collection: Box<Account<'info, Collection>>,
    #[account(mut)]
    pub authority: Signer<'info>,
    pub system_program: Program<'info, System>,
}

#[derive(Accounts)]
#[instruction(name: String, kind: u8, modifier: u8, size: u8)]
pub struct UpdateCollectionAttribute<'info> {
    #[account(mut, has_one = authority)]
    pub attribute: Account<'info, CollectionAttribute>,
    pub authority: Signer<'info>,
}

#[derive(Accounts)]
pub struct DeleteCollectionAttribute<'info> {
    #[account(mut, has_one = authority, close = authority)]
    pub attribute: Account<'info, CollectionAttribute>,
    pub authority: Signer<'info>,
}

#[derive(Accounts)]
#[instruction(name: String)]
pub struct CreateInstruction<'info> {
    #[account(
        init,
        payer = authority,
        space = 8 + 32 + 32 + 32
    )]
    pub instruction: Box<Account<'info, Instruction>>,
    pub application: Box<Account<'info, Application>>,
    #[account(mut)]
    pub authority: Signer<'info>,
    pub system_program: Program<'info, System>,
}

#[derive(Accounts)]
#[instruction(name: String)]
pub struct UpdateInstruction<'info> {
    #[account(mut, has_one = authority)]
    pub instruction: Box<Account<'info, Instruction>>,
    pub authority: Signer<'info>,
}

#[derive(Accounts)]
pub struct DeleteInstruction<'info> {
    #[account(mut, has_one = authority, close = authority)]
    pub instruction: Account<'info, Instruction>,
    pub authority: Signer<'info>,
}

#[derive(Accounts)]
#[instruction(name: String, kind: u8, modifier: u8, array_size: u8)]
pub struct CreateInstructionArgument<'info> {
    #[account(
        init,
        payer = authority,
        space = 8 + 32 + 32 + 32 + 32 + 3 + 3,
    )]
    pub argument: Box<Account<'info, InstructionArgument>>,
    pub application: Box<Account<'info, Application>>,
    pub instruction: Box<Account<'info, Instruction>>,
    #[account(mut)]
    pub authority: Signer<'info>,
    pub system_program: Program<'info, System>,
}

#[derive(Accounts)]
#[instruction(name: String, kind: u8, modifier: u8, array_size: u8)]
pub struct UpdateInstructionArgument<'info> {
    #[account(mut, has_one = authority)]
    pub argument: Box<Account<'info, InstructionArgument>>,
    pub authority: Signer<'info>,
}

#[derive(Accounts)]
pub struct DeleteInstructionArgument<'info> {
    #[account(mut, has_one = authority, close = authority)]
    pub argument: Account<'info, InstructionArgument>,
    pub authority: Signer<'info>,
}

#[derive(Accounts)]
#[instruction(name: String, mark_attribute: u8)]
pub struct CreateInstructionBasicAccount<'info> {
    #[account(
        init,
        payer = authority,
        space = 8 + 32 + 32 + 32 + 32 + 32 + 2
    )]
    pub account: Box<Account<'info, InstructionBasicAccount>>,
    pub application: Box<Account<'info, Application>>,
    pub collection: Box<Account<'info, Collection>>,
    pub instruction: Box<Account<'info, Instruction>>,
    #[account(mut)]
    pub authority: Signer<'info>,
    pub system_program: Program<'info, System>,
}

#[derive(Accounts)]
#[instruction(name: String, mark_attribute: u8)]
pub struct UpdateInstructionBasicAccount<'info> {
    #[account(mut, has_one = authority)]
    pub account: Box<Account<'info, InstructionBasicAccount>>,
    pub collection: Box<Account<'info, Collection>>,
    pub authority: Signer<'info>,
}

#[derive(Accounts)]
pub struct DeleteInstructionBasicAccount<'info> {
    #[account(mut, close = authority, has_one = authority)]
    pub account: Account<'info, InstructionBasicAccount>,
    pub authority: Signer<'info>,
}

#[derive(Accounts)]
#[instruction(name: String, mark_attribute: u8)]
pub struct CreateInstructionSignerAccount<'info> {
    #[account(
        init,
        payer = authority,
        space = 8 + 32 + 32 + 32 + 32 + 2
    )]
    pub account: Box<Account<'info, InstructionSignerAccount>>,
    pub application: Box<Account<'info, Application>>,
    pub instruction: Box<Account<'info, Instruction>>,
    #[account(mut)]
    pub authority: Signer<'info>,
    pub system_program: Program<'info, System>,
}

#[derive(Accounts)]
#[instruction(name: String, mark_attribute: u8)]
pub struct UpdateInstructionSignerAccount<'info> {
    #[account(mut, has_one = authority)]
    pub account: Box<Account<'info, InstructionSignerAccount>>,
    pub authority: Signer<'info>,
}

#[derive(Accounts)]
pub struct DeleteInstructionSignerAccount<'info> {
    #[account(mut, close = authority, has_one = authority)]
    pub account: Account<'info, InstructionSignerAccount>,
    pub authority: Signer<'info>,
}

#[derive(Accounts)]
#[instruction(name: String)]
pub struct CreateInstructionProgramAccount<'info> {
    #[account(
        init,
        payer = authority,
        space = 8 + 32 + 32 + 32 + 32 + 32 + 2
    )]
    pub account: Box<Account<'info, InstructionProgramAccount>>,
    pub application: Box<Account<'info, Application>>,
    #[account(executable)]
    pub program: UncheckedAccount<'info>,
    pub instruction: Box<Account<'info, Instruction>>,
    #[account(mut)]
    pub authority: Signer<'info>,
    pub system_program: Program<'info, System>,
}

#[derive(Accounts)]
#[instruction(name: String)]
pub struct UpdateInstructionProgramAccount<'info> {
    #[account(mut, has_one = authority)]
    pub account: Box<Account<'info, InstructionProgramAccount>>,
    #[account(executable)]
    pub program: UncheckedAccount<'info>,
    pub authority: Signer<'info>,
}

#[derive(Accounts)]
pub struct DeleteInstructionProgramAccount<'info> {
    #[account(mut, close = authority, has_one = authority)]
    pub account: Account<'info, InstructionProgramAccount>,
    pub authority: Signer<'info>,
}

#[account]
pub struct Application {
    pub authority: Pubkey,
    pub name: [u8; 32],
}

#[account]
pub struct Collection {
    pub authority: Pubkey,
    pub application: Pubkey,
    pub name: [u8; 32],
}

#[account]
pub struct CollectionAttribute {
    pub authority: Pubkey,
    pub application: Pubkey,
    pub collection: Pubkey,
    pub name: [u8; 32],
    pub kind: AttributeKind,
    pub modifier: AttributeKindModifier,
}

#[account]
pub struct Instruction {
    pub authority: Pubkey,
    pub application: Pubkey,
    pub name: [u8; 32],
}

#[account]
pub struct InstructionArgument {
    pub authority: Pubkey,
    pub application: Pubkey,
    pub instruction: Pubkey,
    pub name: [u8; 32],
    pub kind: AttributeKind,
    pub modifier: AttributeKindModifier,
}

#[account]
pub struct InstructionBasicAccount {
    pub authority: Pubkey,
    pub application: Pubkey,
    pub instruction: Pubkey,
    pub name: [u8; 32],
    // collection associated to the account
    pub collection: Pubkey,
    pub mark_attribute: MarkAttribute,
}

#[account]
pub struct InstructionSignerAccount {
    pub authority: Pubkey,
    pub application: Pubkey,
    pub instruction: Pubkey,
    pub name: [u8; 32],
    pub mark_attribute: MarkAttribute,
}

#[account]
pub struct InstructionProgramAccount {
    pub authority: Pubkey,
    pub application: Pubkey,
    pub instruction: Pubkey,
    pub name: [u8; 32],
    // program associated to the account
    pub program: Pubkey,
}

pub fn parse_string(string: String) -> [u8; 32] {
    let src = string.as_bytes();
    let mut data = [0u8; 32];
    data[..src.len()].copy_from_slice(src);
    return data;
}

#[derive(AnchorSerialize, AnchorDeserialize, Clone, Debug, PartialEq)]
pub enum AttributeKind {
    U8 {
      id: u8,
      size: u8
    },
    U16 {
      id: u8,
      size: u8
    },
    U32 {
      id: u8,
      size: u8
    },
    U64 {
      id: u8,
      size: u8
    },
    U128 {
      id: u8,
      size: u8
    },
    Pubkey {
      id: u8,
      size: u8
    },
}

impl AttributeKind {
    fn from(index: u8) -> Result<Self> {
        match index {
            0 => Ok(AttributeKind::U8 { id: 0, size: 1 }),
            1 => Ok(AttributeKind::U16 { id: 1, size: 2 }),
            2 => Ok(AttributeKind::U32 { id: 2, size: 4 }),
            3 => Ok(AttributeKind::U64 { id: 3, size: 8 }),
            4 => Ok(AttributeKind::U128 { id: 4, size: 16 }),
            5 => Ok(AttributeKind::Pubkey { id: 5, size: 32 }),
            _ => Err(ErrorCode::InvalidAttributeKind.into()),
        }
    }
}

#[repr(u8)]
#[derive(AnchorSerialize, AnchorDeserialize, Clone, Debug, PartialEq)]
pub enum AttributeKindModifier {
    None {
      id: u8,
      size: u8
    },
    Array {
      id: u8,
      size: u8
    },
    Vector {
      id: u8,
      size: u8
    }
}

impl AttributeKindModifier {
    fn from(index: u8, size: u8) -> Result<Self> {
        match index {
            0 => Ok(AttributeKindModifier::None { id: 0, size: 1 }),
            1 => Ok(AttributeKindModifier::Array { id: 1, size: size }),
            2 => Ok(AttributeKindModifier::Vector { id: 2, size: 1 }),
            _ => Err(ErrorCode::InvalidAttributeModifier.into()),
        }
    }
}

#[repr(u8)]
#[derive(AnchorSerialize, AnchorDeserialize, Clone, Debug, PartialEq)]
pub enum MarkAttribute {
    None {
        id: u8
    },
    Init {
        id: u8
    },
    Mut {
        id: u8
    },
    Zero {
        id: u8
    },
}

impl MarkAttribute {
    fn from(index: u8) -> Result<Self> {
        match index {
            0 => Ok(MarkAttribute::None{ id: 0 }),
            1 => Ok(MarkAttribute::Init{ id: 1 }),
            2 => Ok(MarkAttribute::Mut{ id: 2 }),
            3 => Ok(MarkAttribute::Zero{ id: 3 }),
            _ => Err(ErrorCode::InvalidMarkAttribute.into()),
        }
    }
}

#[error]
pub enum ErrorCode {
    #[msg("Invalid attribute kind")]
    InvalidAttributeKind,
    #[msg("Invalid attribute modifier")]
    InvalidAttributeModifier,
    #[msg("Invalid mark attribute")]
    InvalidMarkAttribute,
}
