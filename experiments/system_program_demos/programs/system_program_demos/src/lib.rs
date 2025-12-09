use anchor_lang::prelude::*;

declare_id!("8HdbTzXojDz31raV3k19x3XWb4hx7AwjtpXJ7BBLC81Q");

#[program]
pub mod system_program_demos {
    use super::*;

    pub fn initialize(ctx: Context<Initialize>) -> Result<()> {
        msg!("Greetings from: {:?}", ctx.program_id);
        Ok(())
    }
}

#[derive(Accounts)]
pub struct Initialize {}
