use anchor_lang::prelude::*;
use anchor_lang::system_program;

declare_id!("8HdbTzXojDz31raV3k19x3XWb4hx7AwjtpXJ7BBLC81Q");

#[program]
pub mod system_program_demos {
    use super::*;

    pub fn initialize(ctx: Context<Initialize>) -> Result<()> {
        msg!("Greetings from: {:?}", ctx.program_id);
        Ok(())
    }

    pub fn create_account(
        ctx: Context<CreateAccount>,
        lamports: u64,
        space: u64,
        owner: Pubkey,
    ) -> Result<()> {
        msg!("Creating account with {} lamports and {} bytes space", lamports, space);
        msg!("Account owner: {:?}", owner);
        
        // Call system program to create the account via CPI
        anchor_lang::system_program::create_account(
            CpiContext::new(
                ctx.accounts.system_program.to_account_info(),
                anchor_lang::system_program::CreateAccount {
                    from: ctx.accounts.payer.to_account_info(),
                    to: ctx.accounts.new_account.to_account_info(),
                },
            ),
            lamports,
            space,
            &owner,
        )?;

        msg!("Account created successfully!");
        Ok(())
    }
}

#[derive(Accounts)]
pub struct Initialize {}

#[derive(Accounts)]
pub struct CreateAccount<'info> {
    #[account(mut)]
    pub payer: Signer<'info>,
    
    #[account(mut)]
    pub new_account: Signer<'info>,
    
    pub system_program: Program<'info, System>,
}
