use anchor_lang::prelude::*;
use anchor_lang::system_program;

// ID ini akan otomatis diupdate oleh Solana Playground saat deploy, biarkan saja.
declare_id!("g4aGcVP3VdEyuRi9BNQ9EFFN62kgrSz3ANQDfTRXP8x"); 

#[program]
pub mod jito_distributor {
    use super::*;

    // 1. Inisialisasi Vault
    pub fn initialize(ctx: Context<Initialize>) -> Result<()> {
        let vault = &mut ctx.accounts.vault;
        vault.authority = ctx.accounts.signer.key();
        vault.total_deposited = 0;
        Ok(())
    }

    // 2. Deposit (Simulasi Jito mengirim Tips)
    pub fn deposit_tips(ctx: Context<Deposit>, amount: u64) -> Result<()> {
        let vault = &mut ctx.accounts.vault;
        
        // Transfer SOL dari user ke Vault
        let cpi_context = CpiContext::new(
            ctx.accounts.system_program.to_account_info(),
            system_program::Transfer {
                from: ctx.accounts.signer.to_account_info(),
                to: vault.to_account_info(),
            },
        );
        system_program::transfer(cpi_context, amount)?;

        vault.total_deposited += amount;
        Ok(())
    }

    // 3. Claim (User mengambil reward)
    pub fn claim_reward(ctx: Context<Claim>, amount: u64) -> Result<()> {
        let vault = &mut ctx.accounts.vault;
        let vault_account_info = vault.to_account_info();
        let user_account_info = ctx.accounts.signer.to_account_info();

        // Mengurangi Lamports dari Vault (Manual manipulation - ini yang butuh audit!)
        **vault_account_info.try_borrow_mut_lamports()? -= amount;
        // Menambah Lamports ke User
        **user_account_info.try_borrow_mut_lamports()? += amount;

        Ok(())
    }
}

// --- BAGIAN INI YANG TADI ERROR (Sudah Diperbaiki menjadi 'struct') ---

#[derive(Accounts)]
pub struct Initialize<'info> {
    #[account(
        init, 
        payer = signer, 
        space = 8 + 32 + 8, 
        seeds = [b"vault"], 
        bump
    )]
    pub vault: Account<'info, Vault>,
    #[account(mut)]
    pub signer: Signer<'info>,
    pub system_program: Program<'info, System>,
}

#[derive(Accounts)]
pub struct Deposit<'info> {
    #[account(
        mut, 
        seeds = [b"vault"], 
        bump
    )]
    pub vault: Account<'info, Vault>,
    #[account(mut)]
    pub signer: Signer<'info>,
    pub system_program: Program<'info, System>,
}

#[derive(Accounts)]
pub struct Claim<'info> {
    #[account(
        mut, 
        seeds = [b"vault"], 
        bump
    )]
    pub vault: Account<'info, Vault>,
    #[account(mut)]
    pub signer: Signer<'info>,
    pub system_program: Program<'info, System>,
}

#[account]
pub struct Vault {
    pub authority: Pubkey,
    pub total_deposited: u64,
}