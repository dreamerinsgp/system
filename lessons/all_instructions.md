# Solana System Program Instructions

This document provides a comprehensive overview of all instructions available in the Solana System Program. The System Program is the foundational program on Solana that handles account creation, SOL transfers, and nonce account management.

## Overview

The System Program (`11111111111111111111111111111111`) provides 13 core instructions that enable:
- Account creation and management
- SOL (native token) transfers
- Nonce account operations for durable transaction nonces

---

## Instruction List

### 1. CreateAccount (Discriminator: 0)

**Purpose**: Creates a new account with a specified amount of lamports and data space, assigning it to a program.

**Accounts**:
- `payer` [writable, signer]: Account that pays for the account creation (rent)
- `new_account` [writable, signer]: The new account being created

**Arguments**:
- `lamports` (u64): Initial amount of lamports to fund the account
- `space` (u64): Size of data space to allocate for the account
- `program_address` (Pubkey): Program ID to assign ownership of the account

**Role**: This is the fundamental instruction for creating new accounts on Solana. It allocates space, funds the account with lamports (for rent), and assigns ownership to a program. Both accounts must be signers, meaning the payer and new account keys must sign the transaction.

**Use Cases**:
- Creating program-derived accounts
- Setting up new accounts for dApps
- Initial account setup before data initialization

---

### 2. Assign (Discriminator: 1)

**Purpose**: Assigns ownership of an account to a program.

**Accounts**:
- `account` [writable, signer]: Account whose ownership is being reassigned

**Arguments**:
- `program_address` (Pubkey): New program ID to assign ownership to

**Role**: Changes the owner program of an existing account. The account must be a signer, meaning the account's keypair must sign the transaction. This is useful when you need to transfer account ownership or reassign accounts to different programs.

**Use Cases**:
- Transferring account ownership between programs
- Reassigning accounts after program upgrades
- Account migration scenarios

---

### 3. TransferSol (Discriminator: 2)

**Purpose**: Transfers SOL (lamports) from one account to another.

**Accounts**:
- `source` [writable, signer]: Account sending SOL
- `destination` [writable]: Account receiving SOL

**Arguments**:
- `amount` (u64): Number of lamports to transfer

**Role**: The primary mechanism for moving SOL between accounts. The source account must be a signer. This is the most commonly used instruction for payments and value transfers on Solana.

**Use Cases**:
- Payment processing
- User-to-user transfers
- Program-to-program value transfers
- Fee payments

---

### 4. CreateAccountWithSeed (Discriminator: 3)

**Purpose**: Creates a new account using a seed-based address derivation, allowing deterministic account addresses.

**Accounts**:
- `payer` [writable, signer]: Account that pays for the account creation
- `new_account` [writable]: The new account being created (derived from base + seed)
- `base_account` [signer, optional]: Base account used for address derivation

**Arguments**:
- `base` (Pubkey): Base public key for address derivation
- `seed` (string): Seed string used in address derivation
- `amount` (u64): Initial amount of lamports to fund the account
- `space` (u64): Size of data space to allocate
- `program_address` (Pubkey): Program ID to assign ownership

**Role**: Enables Program Derived Addresses (PDAs) and deterministic account creation. The account address is derived from a base public key and a seed string, allowing programs to predictably generate account addresses without needing the private key.

**Use Cases**:
- Creating PDAs (Program Derived Addresses)
- Deterministic account generation
- Cross-program invocation account management
- Seed-based account hierarchies

---

### 5. AdvanceNonceAccount (Discriminator: 4)

**Purpose**: Advances the stored nonce value in a nonce account to the next valid nonce.

**Accounts**:
- `nonce_account` [writable]: The nonce account to advance
- `recent_blockhashes_sysvar` [optional]: Recent blockhashes sysvar (defaults to `SysvarRecentB1ockHashes11111111111111111111`)
- `nonce_authority` [signer]: Authority that can advance the nonce

**Arguments**: None (only discriminator)

**Role**: Updates the nonce account's stored blockhash to the next valid one from the recent blockhashes sysvar. This is necessary when the current stored nonce has expired. Nonce accounts allow transactions to use durable nonces instead of expiring blockhashes.

**Use Cases**:
- Maintaining durable transaction nonces
- Offline transaction preparation
- Transaction scheduling
- Avoiding transaction expiration

---

### 6. WithdrawNonceAccount (Discriminator: 5)

**Purpose**: Withdraws lamports from a nonce account to a recipient account.

**Accounts**:
- `nonce_account` [writable]: Nonce account to withdraw from
- `recipient_account` [writable]: Account receiving the withdrawn lamports
- `recent_blockhashes_sysvar` [optional]: Recent blockhashes sysvar (defaults to `SysvarRecentB1ockHashes11111111111111111111`)
- `rent_sysvar` [optional]: Rent sysvar (defaults to `SysvarRent111111111111111111111111111111111`)
- `nonce_authority` [signer]: Authority that can withdraw from the nonce account

**Arguments**:
- `withdraw_amount` (u64): Number of lamports to withdraw

**Role**: Allows the nonce authority to extract lamports from a nonce account while ensuring the account maintains enough lamports for rent exemption. This is useful for reclaiming excess funds or closing nonce accounts.

**Use Cases**:
- Reclaiming excess funds from nonce accounts
- Closing nonce accounts
- Fund recovery from nonce accounts

---

### 7. InitializeNonceAccount (Discriminator: 6)

**Purpose**: Initializes a newly created account as a nonce account.

**Accounts**:
- `nonce_account` [writable]: Account to initialize as a nonce account
- `recent_blockhashes_sysvar` [optional]: Recent blockhashes sysvar (defaults to `SysvarRecentB1ockHashes11111111111111111111`)
- `rent_sysvar` [optional]: Rent sysvar (defaults to `SysvarRent111111111111111111111111111111111`)

**Arguments**:
- `nonce_authority` (Pubkey): Public key that will have authority over the nonce account

**Role**: Sets up an account as a nonce account by storing the initial nonce authority and current blockhash. After initialization, the account can be used for durable transaction nonces. The account must already exist and have sufficient lamports for rent exemption.

**Use Cases**:
- Setting up durable nonce accounts
- Enabling offline transaction signing
- Transaction nonce management

---

### 8. AuthorizeNonceAccount (Discriminator: 7)

**Purpose**: Changes the authority (owner) of a nonce account.

**Accounts**:
- `nonce_account` [writable]: Nonce account whose authority is being changed
- `nonce_authority` [signer]: Current authority (must sign to authorize the change)

**Arguments**:
- `new_nonce_authority` (Pubkey): New public key to become the nonce authority

**Role**: Transfers control of a nonce account from one authority to another. The current authority must sign the transaction. This is useful for key rotation, account recovery, or transferring nonce account control.

**Use Cases**:
- Key rotation for nonce accounts
- Account recovery scenarios
- Transferring nonce account control
- Security updates

---

### 9. Allocate (Discriminator: 8)

**Purpose**: Allocates data space to an existing account without transferring lamports or assigning ownership.

**Accounts**:
- `new_account` [writable, signer]: Account to allocate space for

**Arguments**:
- `space` (u64): Number of bytes to allocate

**Role**: Adds data space to an existing account. The account must be a signer and must have enough lamports to cover rent for the additional space. This is useful when you need to expand an account's data capacity after creation.

**Use Cases**:
- Expanding account data capacity
- Dynamic account resizing
- Post-creation account modification

---

### 10. AllocateWithSeed (Discriminator: 9)

**Purpose**: Allocates data space to an account derived from a base public key and seed.

**Accounts**:
- `new_account` [writable]: Account derived from base + seed to allocate space for
- `base_account` [signer]: Base account used for address derivation

**Arguments**:
- `base` (Pubkey): Base public key for address derivation
- `seed` (string): Seed string used in address derivation
- `space` (u64): Number of bytes to allocate
- `program_address` (Pubkey): Program ID to assign ownership

**Role**: Similar to `Allocate`, but works with seed-derived accounts (PDAs). This allows programs to allocate space for accounts whose addresses are deterministically derived, enabling predictable account management.

**Use Cases**:
- Allocating space for PDAs
- Program-managed account initialization
- Seed-based account setup

---

### 11. AssignWithSeed (Discriminator: 10)

**Purpose**: Assigns ownership of a seed-derived account to a program.

**Accounts**:
- `account` [writable]: Seed-derived account whose ownership is being reassigned
- `base_account` [signer]: Base account used for address derivation

**Arguments**:
- `base` (Pubkey): Base public key for address derivation
- `seed` (string): Seed string used in address derivation
- `program_address` (Pubkey): New program ID to assign ownership to

**Role**: Changes the owner program of a seed-derived account. This is the seed-based equivalent of `Assign`, allowing programs to reassign ownership of PDAs and other seed-derived accounts.

**Use Cases**:
- Reassigning PDA ownership
- Program migration for seed-derived accounts
- Cross-program account transfers

---

### 12. TransferSolWithSeed (Discriminator: 11)

**Purpose**: Transfers SOL from a seed-derived account to a destination account.

**Accounts**:
- `source` [writable]: Seed-derived source account sending SOL
- `base_account` [signer]: Base account used for source address derivation
- `destination` [writable]: Account receiving SOL

**Arguments**:
- `amount` (u64): Number of lamports to transfer
- `from_seed` (string): Seed string used in source address derivation
- `from_owner` (Pubkey): Program ID that owns the source account

**Role**: Enables SOL transfers from seed-derived accounts (PDAs). The base account must sign the transaction. This is essential for programs that hold funds in PDAs and need to transfer them.

**Use Cases**:
- Program-controlled fund transfers
- PDA-to-account transfers
- Automated payment systems
- Program treasury management

---

### 13. UpgradeNonceAccount (Discriminator: 12)

**Purpose**: Upgrades a legacy nonce account to the current nonce account format.

**Accounts**:
- `nonce_account` [writable]: Nonce account to upgrade

**Arguments**: None (only discriminator)

**Role**: Migrates older nonce account formats to the current version. This ensures compatibility with newer Solana runtime features and is typically used during network upgrades or when migrating legacy accounts.

**Use Cases**:
- Account format migration
- Network upgrade compatibility
- Legacy account modernization

---

## Instruction Categories

### Account Management
- `CreateAccount` - Basic account creation
- `CreateAccountWithSeed` - Seed-based account creation
- `Assign` - Ownership assignment
- `AssignWithSeed` - Seed-based ownership assignment
- `Allocate` - Space allocation
- `AllocateWithSeed` - Seed-based space allocation

### SOL Transfers
- `TransferSol` - Direct SOL transfer
- `TransferSolWithSeed` - SOL transfer from seed-derived accounts

### Nonce Account Operations
- `InitializeNonceAccount` - Nonce account setup
- `AdvanceNonceAccount` - Nonce advancement
- `WithdrawNonceAccount` - Nonce account withdrawal
- `AuthorizeNonceAccount` - Authority change
- `UpgradeNonceAccount` - Format upgrade

---

## Key Concepts

### Program Derived Addresses (PDAs)
Several instructions (`CreateAccountWithSeed`, `AllocateWithSeed`, `AssignWithSeed`, `TransferSolWithSeed`) work with seed-derived accounts. These enable deterministic account addresses that programs can generate without needing private keys, enabling powerful cross-program account management patterns.

### Nonce Accounts
Nonce accounts provide durable transaction nonces that don't expire like regular blockhashes. They're essential for:
- Offline transaction signing
- Transaction scheduling
- Avoiding transaction expiration issues

### Rent Exemption
Most account operations require accounts to maintain sufficient lamports for rent exemption. The System Program ensures accounts have enough funds to remain on-chain.

---

## Discriminator Reference

| Instruction | Discriminator | Category |
|------------|---------------|----------|
| CreateAccount | 0 | Account Management |
| Assign | 1 | Account Management |
| TransferSol | 2 | SOL Transfer |
| CreateAccountWithSeed | 3 | Account Management |
| AdvanceNonceAccount | 4 | Nonce Operations |
| WithdrawNonceAccount | 5 | Nonce Operations |
| InitializeNonceAccount | 6 | Nonce Operations |
| AuthorizeNonceAccount | 7 | Nonce Operations |
| Allocate | 8 | Account Management |
| AllocateWithSeed | 9 | Account Management |
| AssignWithSeed | 10 | Account Management |
| TransferSolWithSeed | 11 | SOL Transfer |
| UpgradeNonceAccount | 12 | Nonce Operations |

---

## Notes

- All instructions require proper account permissions (signers, writability)
- Seed-based instructions enable Program Derived Addresses (PDAs)
- Nonce accounts require initialization before use
- Most operations require sufficient lamports for rent exemption
- The System Program is the foundation for all account operations on Solana
