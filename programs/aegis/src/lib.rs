use anchor_lang::prelude::*;

declare_id!("Aegis11111111111111111111111111111111111111");

#[program]
pub mod aegis {
    use super::*;

    /// Level 0: Initialize the Service Root.
    /// This is the anchor for the entire service provider's identity.
    pub fn initialize_service(
        ctx: Context<InitializeService>, 
        service_id: [u8; 32]
    ) -> Result<()> {
        let service_root = &mut ctx.accounts.service_root;
        service_root.authority = ctx.accounts.authority.key();
        service_root.service_id = service_id;
        service_root.circuit_breaker = false; // System starts active
        service_root.role_count = 0;
        service_root.access_key_count = 0;
        service_root.created_at = Clock::get()?.unix_timestamp;
        service_root.bump = ctx.bumps.service_root;
        
        msg!("Aegis Service Initialized: {:?}", service_id);
        Ok(())
    }

    /// Level 1: Create a Role Definition.
    /// Defines a template of permissions (bitmask) under a Service Root.
    pub fn create_role(
        ctx: Context<CreateRole>, 
        role_id: [u8; 16], 
        role_name: String, 
        permissions: u64
    ) -> Result<()> {
        let role_def = &mut ctx.accounts.role_definition;
        role_def.service_root = ctx.accounts.service_root.key();
        role_def.role_id = role_id;
        role_def.role_name = role_name;
        role_def.permissions = permissions;
        role_def.is_active = true;
        role_def.bump = ctx.bumps.role_definition;

        ctx.accounts.service_root.role_count += 1;
        
        msg!("Role Created: {}", role_def.role_name);
        Ok(())
    }

    /// Level 2: Issue a User Access Key.
    /// Grants a specific user a subset of permissions from a Role.
    pub fn issue_access_key(
        ctx: Context<IssueAccessKey>, 
        permissions: u64, 
        ttl: i64
    ) -> Result<()> {
        let role_def = &ctx.accounts.role_definition;
        
        // SECURITY: Ensure granted permissions do not exceed role definition
        let granted = role_def.permissions & permissions;
        require!(granted == permissions, AegisError::PermissionExceedsRole);

        let access_key = &mut ctx.accounts.access_key;
        access_key.service_root = ctx.accounts.service_root.key();
        access_key.role_definition = role_def.key();
        access_key.user = ctx.accounts.user.key();
        access_key.granted_permissions = permissions;
        access_key.issued_at = Clock::get()?.unix_timestamp;
        access_key.expires_at = if ttl > 0 { access_key.issued_at + ttl } else { 0 };
        access_key.is_revoked = false;
        access_key.use_count = 0;
        access_key.bump = ctx.bumps.access_key;

        ctx.accounts.service_root.access_key_count += 1;

        msg!("Access Key Issued for User: {}", access_key.user);
        Ok(())
    }

    /// Level 3: Verify Access.
    /// The core authorization gate. Checks circuit breaker, expiry, and bitmask.
    pub fn verify_access(ctx: Context<VerifyAccess>, required_permission: u64) -> Result<()> {
        let service_root = &ctx.accounts.service_root;
        let access_key = &mut ctx.accounts.access_key;

        // 1. GLOBAL CIRCUIT BREAKER CHECK (O(1) Revocation)
        require!(!service_root.circuit_breaker, AegisError::ServiceFrozen);

        // 2. INDIVIDUAL REVOCATION CHECK
        require!(!access_key.is_revoked, AegisError::KeyRevoked);

        // 3. TEMPORAL EXPIRY CHECK
        if access_key.expires_at > 0 {
            require!(
                Clock::get()?.unix_timestamp < access_key.expires_at,
                AegisError::KeyExpired
            );
        }

        // 4. BITMASK PERMISSION CHECK
        require!(
            (access_key.granted_permissions & required_permission) == required_permission,
            AegisError::InsufficientPermissions
        );

        // Update usage metadata
        access_key.last_used = Clock::get()?.unix_timestamp;
        access_key.use_count += 1;

        msg!("Access Verified. Permission Bit: {}", required_permission);
        Ok(())
    }

    /// Administrative: Toggle Global Circuit Breaker.
    pub fn toggle_circuit_breaker(ctx: Context<ToggleCircuitBreaker>, frozen: bool) -> Result<()> {
        ctx.accounts.service_root.circuit_breaker = frozen;
        msg!("Global Circuit Breaker State: {}", frozen);
        Ok(())
    }
}

#[derive(Accounts)]
#[instruction(service_id: [u8; 32])]
pub struct InitializeService<'info> {
    #[account(
        init,
        payer = authority,
        space = 8 + 32 + 32 + 1 + 8 + 8 + 8 + 1,
        seeds = [b"service_root", authority.key().as_ref(), service_id.as_ref()],
        bump
    )]
    pub service_root: Account<'info, ServiceRoot>,
    #[account(mut)]
    pub authority: Signer<'info>,
    pub system_program: Program<'info, System>,
}

#[derive(Accounts)]
#[instruction(role_id: [u8; 16])]
pub struct CreateRole<'info> {
    #[account(
        init,
        payer = authority,
        space = 8 + 32 + 16 + 32 + 8 + 4 + 1 + 1,
        seeds = [b"role_def", service_root.key().as_ref(), role_id.as_ref()],
        bump
    )]
    pub role_definition: Account<'info, RoleDefinition>,
    #[account(mut, has_one = authority)]
    pub service_root: Account<'info, ServiceRoot>,
    #[account(mut)]
    pub authority: Signer<'info>,
    pub system_program: Program<'info, System>,
}

#[derive(Accounts)]
pub struct IssueAccessKey<'info> {
    #[account(
        init,
        payer = authority,
        space = 8 + 32 + 32 + 32 + 8 + 8 + 8 + 8 + 8 + 1 + 64 + 1,
        seeds = [b"access_key", role_definition.key().as_ref(), user.key().as_ref()],
        bump
    )]
    pub access_key: Account<'info, UserAccessKey>,
    #[account(mut)]
    pub service_root: Account<'info, ServiceRoot>,
    #[account(
        constraint = role_definition.service_root == service_root.key() @ AegisError::RoleMismatch
    )]
    pub role_definition: Account<'info, RoleDefinition>,
    /// CHECK: The user receiving access
    pub user: AccountInfo<'info>,
    #[account(mut, constraint = authority.key() == service_root.authority)]
    pub authority: Signer<'info>,
    pub system_program: Program<'info, System>,
}

#[derive(Accounts)]
pub struct VerifyAccess<'info> {
    pub service_root: Account<'info, ServiceRoot>,
    #[account(
        mut,
        constraint = access_key.service_root == service_root.key() @ AegisError::KeyServiceMismatch,
        constraint = access_key.user == user.key() @ AegisError::KeyUserMismatch
    )]
    pub access_key: Account<'info, UserAccessKey>,
    pub user: Signer<'info>,
}

#[derive(Accounts)]
pub struct ToggleCircuitBreaker<'info> {
    #[account(mut, has_one = authority)]
    pub service_root: Account<'info, ServiceRoot>,
    pub authority: Signer<'info>,
}

#[account]
pub struct ServiceRoot {
    pub authority: Pubkey,
    pub service_id: [u8; 32],
    pub circuit_breaker: bool,
    pub role_count: u64,
    pub access_key_count: u64,
    pub created_at: i64,
    pub bump: u8,
}

#[account]
pub struct RoleDefinition {
    pub service_root: Pubkey,
    pub role_id: [u8; 16],
    pub role_name: String,
    pub permissions: u64,
    pub is_active: bool,
    pub bump: u8,
}

#[account]
pub struct UserAccessKey {
    pub service_root: Pubkey,
    pub role_definition: Pubkey,
    pub user: Pubkey,
    pub granted_permissions: u64,
    pub issued_at: i64,
    pub expires_at: i64,
    pub last_used: i64,
    pub use_count: u64,
    pub is_revoked: bool,
    pub bump: u8,
}

#[error_code]
pub enum AegisError {
    #[msg("Service is currently frozen by global circuit breaker.")]
    ServiceFrozen,
    #[msg("This access key has been revoked.")]
    KeyRevoked,
    #[msg("This access key has expired.")]
    KeyExpired,
    #[msg("Insufficient permissions for this instruction.")]
    InsufficientPermissions,
    #[msg("The provided role does not belong to this service.")]
    RoleMismatch,
    #[msg("The access key does not match the provided service.")]
    KeyServiceMismatch,
    #[msg("The access key does not belong to the signing user.")]
    KeyUserMismatch,
    #[msg("Requested permissions exceed the role definition.")]
    PermissionExceedsRole,
    #[msg("Unauthorized authority.")]
    Unauthorized,
}
