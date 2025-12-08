# System Program Study Roadmap

## Overview

This roadmap is designed based on actual System Program usage patterns found in the `pump_meteora` program. The System Program (program ID: `11111111111111111111111111111111`) is Solana's foundational program that handles account creation, SOL transfers, and account management.

## Application Scenarios from pump_meteora

### 1. Account Creation (`CreateAccount`)

**Location**: [`instructions/admin/configure.rs`](pumpfun_program/programs/pump-meteora/src/instructions/admin/configure.rs:72-77)

- **Use Case**: Creating PDA accounts for program state
- **Example**: Config PDA initialization
- **Key Pattern**: Using `system_program::create_account` via CPI with PDA signer

### 2. SOL Transfer from User (`Transfer`)

**Location**: [`utils.rs`](pumpfun_program/programs/pump-meteora/src/utils.rs:14-30) and [`state/bondingcurve.rs`](pumpfun_program/programs/pump-meteora/src/state/bondingcurve.rs:246-251)

- **Use Case**: Users sending SOL to program-controlled accounts
- **Example**: Buy operations, fee payments
- **Key Pattern**: `system_instruction::transfer` with `invoke()`

### 3. SOL Transfer from PDA (`Transfer` with Signer)

**Location**: [`utils.rs`](pumpfun_program/programs/pump-meteora/src/utils.rs:77-91) and [`instructions/migration/create_pool.rs`](pumpfun_program/programs/pump-meteora/src/instructions/migration/create_pool.rs:392-409)

- **Use Case**: Program-controlled accounts sending SOL
- **Example**: Sell operations, fee distributions, pool creation
- **Key Pattern**: `system_instruction::transfer` with `invoke_signed()` and PDA seeds

### 4. Account Reallocation

**Location**: [`instructions/admin/configure.rs`](pumpfun_program/programs/pump-meteora/src/instructions/admin/configure.rs:90-103)

- **Use Case**: Resizing accounts when data grows
- **Key Pattern**: `system_program::transfer` for rent, then `realloc()`

### 5. CPI Integration

**Location**: Multiple files

- **Use Case**: Passing System Program to other programs (Token Program, Associated Token Program, Metadata Program)
- **Example**: Creating associated token accounts, metadata accounts
- **Key Pattern**: System Program as required account in CPI contexts

## Study Roadmap

### Phase 1: Fundamentals (Week 1-2)

1. **System Program Architecture**

- Program ID and location
- Instruction set overview
- Account model basics
- Rent and account ownership

2. **Core Instructions**

- `CreateAccount`: Account creation mechanics
- `Assign`: Account ownership assignment
- `Transfer`: SOL transfer operations
- `CreateAccountWithSeed`: Deterministic account creation
- `AdvanceNonceAccount`: Nonce account management
- `WithdrawNonceAccount`: Nonce account withdrawal
- `InitializeNonceAccount`: Nonce account setup
- `AuthorizeNonceAccount`: Nonce account authorization
- `Allocate`: Account space allocation
- `AllocateWithSeed`: Deterministic allocation
- `AssignWithSeed`: Deterministic assignment
- `TransferWithSeed`: Seed-based transfers
- `UpgradeNonceAccount`: Nonce account upgrades

### Phase 2: Account Creation Patterns (Week 3-4)

1. **Standard Account Creation**

- Creating accounts from users
- Rent calculation and payment
- Account initialization patterns
- **Practice**: Implement account creation similar to `configure.rs`

2. **PDA Account Creation**

- Program Derived Addresses (PDAs)
- Creating accounts owned by your program
- Seed derivation and bump seeds
- **Practice**: Create PDA accounts like config PDA in pump_meteora

3. **Account Creation via CPI**

- Cross-Program Invocation (CPI) patterns
- Creating accounts from within programs
- Signer seeds and PDA signing
- **Practice**: Implement `create_account` CPI like in `configure.rs:72-77`

### Phase 3: SOL Transfer Operations (Week 5-6)

1. **User-to-Program Transfers**

- Direct SOL transfers from users
- Using `system_instruction::transfer`
- `invoke()` vs `invoke_signed()`
- **Practice**: Implement `sol_transfer_from_user` utility

2. **Program-to-User Transfers**

- PDA signing for transfers
- `invoke_signed()` with seed arrays
- Fee distribution patterns
- **Practice**: Implement `sol_transfer_with_signer` utility

3. **Transfer Scenarios**

- Buy operations (user → program)
- Sell operations (program → user)
- Fee distributions (program → multiple recipients)
- Pool creation funding
- **Practice**: Implement swap operations with fee handling

### Phase 4: Account Management (Week 7-8)

1. **Account Reallocation**

- Resizing accounts dynamically
- Rent adjustment calculations
- Data migration patterns
- **Practice**: Implement config account reallocation

2. **Account Ownership**

- Transferring account ownership
- Program ownership vs user ownership
- Account closure and rent reclamation

3. **Account Validation**

- Verifying System Program in constraints
- Account existence checks
- Rent-exempt status verification

### Phase 5: Advanced Patterns (Week 9-10)

1. **CPI Integration**

- System Program as required account
- Passing System Program to other programs
- Token account creation (ATA)
- Metadata account creation
- **Practice**: Create token accounts with metadata

2. **Complex Workflows**

- Multi-step account creation
- Conditional account creation (`init_if_needed`)
- Account initialization patterns
- **Practice**: Implement bonding curve creation workflow

3. **Error Handling**

- System Program error codes
- Rent calculation errors
- Account creation failures
- Transfer failures

### Phase 6: Security & Best Practices (Week 11-12)

1. **Security Considerations**

- PDA signer validation
- Account ownership checks
- Rent-exempt minimums
- Reentrancy protection

2. **Optimization**

- Batch operations
- Rent efficiency
- Account size optimization
- Compute unit management

3. **Testing**

- Unit tests for System Program operations
- Integration tests for transfers
- PDA creation tests
- Error case testing

## Practical Exercises

### Exercise 1: Basic Account Creation

Create a program that:

- Creates a PDA account for storing user data
- Handles account initialization
- Implements account reallocation

### Exercise 2: SOL Transfer System

Create a program that:

- Accepts SOL from users
- Distributes SOL to multiple recipients
- Handles fee calculations
- Uses PDA signing for transfers

### Exercise 3: Complete Workflow

Implement a simplified version of `create_bonding_curve`:

- Create token mint
- Create bonding curve PDA
- Create associated token accounts
- Transfer initial SOL
- Create metadata accounts

### Exercise 4: Fee Distribution System

Implement fee distribution similar to swap operations:

- Calculate platform fees
- Calculate creator fees
- Distribute fees to multiple wallets
- Handle edge cases (zero fees, rounding)

## Resources

### Official Documentation

- Solana System Program: https://docs.solana.com/developing/runtime-facilities/programs#system-program
- Account Model: https://docs.solana.com/developing/programming-model/accounts
- Rent: https://docs.solana.com/developing/programming-model/accounts#rent

### Code References

- System Program Source: https://github.com/solana-labs/solana/tree/master/programs/system/src
- Anchor System Program: https://github.com/coral-xyz/anchor/tree/master/lang/src/system_program

### Study Files from pump_meteora

- Account Creation: `instructions/admin/configure.rs`
- SOL Transfers: `utils.rs`, `state/bondingcurve.rs`
- Complex Workflows: `instructions/curve/create_bonding_curve.rs`
- Pool Operations: `instructions/migration/create_pool.rs`

## Assessment Criteria

### Beginner (Phase 1-2)

- Understand System Program basics
- Can create simple accounts
- Understands rent concept

### Intermediate (Phase 3-4)

- Can implement SOL transfers
- Understands PDA creation
- Can handle account reallocation

### Advanced (Phase 5-6)

- Can integrate System Program in complex CPIs
- Understands security implications
- Can optimize account operations
- Can debug System Program errors

## Timeline Summary

- **Weeks 1-2**: Fundamentals
- **Weeks 3-4**: Account Creation
- **Weeks 5-6**: SOL Transfers
- **Weeks 7-8**: Account Management
- **Weeks 9-10**: Advanced Patterns
- **Weeks 11-12**: Security & B