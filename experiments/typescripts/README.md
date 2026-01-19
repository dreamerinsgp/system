# TypeScript Examples for System Program

This directory contains TypeScript examples demonstrating how to use Solana System Program instructions.

## createAccount.ts

A complete example showing how to create a new account using the `create_account` instruction.

### Features

- ✅ Generates a new account keypair before the account exists on-chain
- ✅ Calculates rent exemption automatically
- ✅ Demonstrates that both payer and new_account must sign
- ✅ Shows how each account uses its own private key to sign
- ✅ Verifies account creation and displays account details
- ✅ Includes balance tracking before and after

### Key Concepts Demonstrated

1. **Keypair Generation**: The new account's keypair is generated before the account exists on-chain
2. **Dual Signing**: Both payer and new_account must sign the transaction
   - Payer signs with payer's private key (for transfer authorization)
   - New account signs with new account's private key (for ownership proof)
3. **Rent Calculation**: Automatically calculates minimum rent exemption
4. **Account Verification**: Fetches and verifies the created account

### Usage

```typescript
import { createAccount } from './createAccount';

// Create an account with default settings (42 bytes, rent exemption)
const result = await createAccount();

// Create an account with custom space
const result2 = await createAccount(100n);

// Create an account with specific lamports
const result3 = await createAccount(50n, 100_000_000n); // 0.1 SOL
```

### Running the Example

**Prerequisites:**
1. Make sure you have a local Solana validator running on `http://127.0.0.1:8899`
2. Node.js and npm/pnpm installed

**Quick Setup (Recommended):**

Use the setup script to install all dependencies:

```bash
cd /home/ubuntu/system_program/system/experiments/typescripts
./setup.sh
```

**Manual Setup:**

1. **Install dependencies in the clients/js directory:**
```bash
cd /home/ubuntu/system_program/system/clients/js
npm install  # or pnpm install
# This will install @solana/kit and other dependencies
```

2. **Install dependencies for the example:**
```bash
cd /home/ubuntu/system_program/system/experiments/typescripts
npm install
# This installs tsx, typescript, and @types/node
```

**Note:** The example uses local code from `../../../clients/js/src` instead of npm packages. Make sure the path is correct.

**Run the example:**

```bash
# Using tsx (recommended - handles TypeScript and ESM without compilation)
npm run create-account

# Or directly with tsx
npx tsx createAccount.ts
```

**Important Notes:**

- The TypeScript linter may show errors about missing modules until dependencies are installed
- `tsx` handles TypeScript compilation and module resolution at runtime
- Make sure `@solana/kit` is installed in `clients/js/node_modules` before running
- The example connects to `http://127.0.0.1:8899` - ensure your local validator is running

**Troubleshooting:**

If you get import errors:
1. **Check @solana/kit installation:**
   ```bash
   ls /home/ubuntu/system_program/system/clients/js/node_modules/@solana/kit
   ```

2. **Verify the source path exists:**
   ```bash
   ls /home/ubuntu/system_program/system/clients/js/src/index.ts
   ```

3. **If using tsx, it should handle module resolution automatically**

4. **For IDE errors**: The TypeScript language server may show errors, but `tsx` will work at runtime if dependencies are installed correctly

### Example Output

```
=== Create Account Example ===

✓ Initialized Solana client

--- Step 1: Prepare Accounts ---
Payer address: 7xKXtg2CW87d97TXJSDpbD5jBkheTqA83TZRuJosgAsU
New account address: 9WzDXwBbmkg8ZTbNMqUxvQRAyrZzDsGYdLVL9zYtAWWM
Account space: 42 bytes
Rent exemption: 2039280 lamports
Account lamports: 3039280 lamports

--- Step 2: Check Balances ---
Payer balance before: 1000000000 lamports

--- Step 3: Create Instruction ---
✓ Created create_account instruction

--- Step 4: Build and Sign Transaction ---
Signing with:
  - Payer private key (for transfer authorization)
  - New account private key (for account ownership proof)
✓ Created default transaction
✓ Added instruction to transaction
✓ Transaction signed and sent
Transaction signature: 5j7s8K9...

--- Step 5: Verify Account Creation ---
✓ Account successfully created!

Account details:
  Address: 9WzDXwBbmkg8ZTbNMqUxvQRAyrZzDsGYdLVL9zYtAWWM
  Lamports: 3039280
  Space: 42 bytes
  Owner: 11111111111111111111111111111111
  Executable: false
  Data length: 42 bytes

--- Step 6: Check Final Balances ---
Payer balance after: 996965720 lamports
Balance difference: 3034280 lamports
  (includes transaction fee + transferred lamports)
```

### Important Notes

1. **Both accounts must sign**: The transaction requires signatures from both the payer and the new account, each using their own private key.

2. **Account doesn't exist yet**: The new account's keypair is generated before the account exists on-chain. The private key is used to sign the transaction, proving ownership.

3. **Rent exemption**: Accounts must maintain a minimum balance to be rent-exempt. The example automatically calculates this.

4. **Network requirements**: Make sure you're connected to a Solana network (localnet, devnet, or mainnet) and have sufficient SOL in your payer account.

### Related Documentation

- [Create Account Instruction Logic](../../lessons/指令_create_account/3.create_account_instruction_logic.md)
- [Why Account Must Be Signer](../../lessons/指令_create_account/3.2.为什么被创建的account自己要作为一个signer.md)
- [How Signing Works](../../lessons/指令_create_account/3.1.如何检查一个账户是否被签名.md)

