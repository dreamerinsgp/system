/**
 * Create Account Example
 * 
 * This example demonstrates how to create a new account using the Solana System Program's
 * create_account instruction.
 * 
 * Key concepts:
 * - Both payer and new_account must sign the transaction
 * - Each account uses its own private key to sign
 * - The new account's keypair is generated before the account exists on-chain
 * - Rent exemption must be calculated for the account space
 */

import {
    appendTransactionMessageInstruction,
    fetchEncodedAccount,
    generateKeyPairSigner,
    pipe,
    Address,
    BaseTransactionMessage,
    Commitment,
    Rpc,
    RpcSubscriptions,
    SolanaRpcApi,
    SolanaRpcSubscriptionsApi,
    TransactionMessageWithBlockhashLifetime,
    TransactionMessageWithFeePayer,
    TransactionSigner,
    airdropFactory,
    assertIsSendableTransaction,
    assertIsTransactionWithBlockhashLifetime,
    createSolanaRpc,
    createSolanaRpcSubscriptions,
    createTransactionMessage,
    getSignatureFromTransaction,
    lamports,
    setTransactionMessageFeePayerSigner,
    setTransactionMessageLifetimeUsingBlockhash,
    signTransactionMessageWithSigners,
    sendAndConfirmTransactionFactory,
} from '@solana/kit';
// Import from local source code
// Path: ../../clients/js/src (from typescripts directory)
import { SYSTEM_PROGRAM_ADDRESS } from '../../clients/js/src/generated/programs/system.js';
import { getCreateAccountInstruction } from '../../clients/js/src/generated/instructions/createAccount.js';

type Client = {
    rpc: Rpc<SolanaRpcApi>;
    rpcSubscriptions: RpcSubscriptions<SolanaRpcSubscriptionsApi>;
};

const createDefaultSolanaClient = (rpcUrl?: string, wsUrl?: string): Client => {
    // Default to localhost, but allow override via environment variables
    const rpcEndpoint = rpcUrl || process.env.SOLANA_RPC_URL || 'http://127.0.0.1:8899';
    const wsEndpoint = wsUrl || process.env.SOLANA_WS_URL || 'ws://127.0.0.1:8900';
    
    console.log(`Connecting to RPC: ${rpcEndpoint}`);
    const rpc = createSolanaRpc(rpcEndpoint);
    const rpcSubscriptions = createSolanaRpcSubscriptions(wsEndpoint);
    return { rpc, rpcSubscriptions };
};

const generateKeyPairSignerWithSol = async (client: Client, putativeLamports: bigint = 1_000_000_000n) => {
    const signer = await generateKeyPairSigner();
    await airdropFactory(client)({
        recipientAddress: signer.address,
        lamports: lamports(putativeLamports),
        commitment: 'confirmed',
    });
    return signer;
};

const createDefaultTransaction = async (client: Client, feePayer: TransactionSigner) => {
    const { value: latestBlockhash } = await client.rpc.getLatestBlockhash().send();
    return pipe(
        createTransactionMessage({ version: 0 }),
        tx => setTransactionMessageFeePayerSigner(feePayer, tx),
        tx => setTransactionMessageLifetimeUsingBlockhash(latestBlockhash, tx),
    );
};

const signAndSendTransaction = async (
    client: Client,
    transactionMessage: BaseTransactionMessage &
        TransactionMessageWithFeePayer &
        TransactionMessageWithBlockhashLifetime,
    commitment: Commitment = 'confirmed',
) => {
    const signedTransaction = await signTransactionMessageWithSigners(transactionMessage);
    const signature = getSignatureFromTransaction(signedTransaction);
    assertIsSendableTransaction(signedTransaction);
    assertIsTransactionWithBlockhashLifetime(signedTransaction);
    await sendAndConfirmTransactionFactory(client)(signedTransaction, {
        commitment,
    });
    return signature;
};

/**
 * Creates a new account with the specified space and lamports
 * 
 * @param space - The data space to allocate for the account (in bytes)
 * @param lamports - Optional lamports to transfer to the new account. 
 *                   If not provided, rent exemption will be calculated automatically.
 * @returns The created account information
 */
async function createAccount(
    space: bigint = 42n,
    lamports?: bigint,
    rpcUrl?: string,
    wsUrl?: string
): Promise<{
    address: string;
    lamports: bigint;
    space: bigint;
    owner: string;
    signature: string;
}> {
    console.log('=== Create Account Example ===\n');

    // Step 1: Initialize Solana client
    const client = createDefaultSolanaClient(rpcUrl, wsUrl);
    console.log('✓ Initialized Solana client');

    // Step 2: Generate keypairs and calculate rent
    console.log('\n--- Step 1: Prepare Accounts ---');
    
    const [payer, newAccount, rentExemption] = await Promise.all([
        // Generate a payer account with SOL (for testing)
        generateKeyPairSignerWithSol(client),
        // Generate a new account keypair (account doesn't exist yet)
        generateKeyPairSigner(),
        // Calculate minimum rent exemption for the account space
        client.rpc.getMinimumBalanceForRentExemption(space).send(),
    ]);

    // Use provided lamports or rent exemption + some extra
    const accountLamports = lamports ?? rentExemption + 1000000n; // Add 0.001 SOL extra

    console.log('Payer address:', payer.address);
    console.log('New account address:', newAccount.address);
    console.log('Account space:', space.toString(), 'bytes');
    console.log('Rent exemption:', rentExemption.toString(), 'lamports');
    console.log('Account lamports:', accountLamports.toString(), 'lamports');

    // Step 3: Check payer balance before
    console.log('\n--- Step 2: Check Balances ---');
    const payerBalanceBefore = await client.rpc.getBalance(payer.address).send();
    console.log('Payer balance before:', payerBalanceBefore.toString(), 'lamports');

    // Step 4: Create the instruction
    console.log('\n--- Step 3: Create Instruction ---');
    const createAccountInstruction = getCreateAccountInstruction({
        payer,                    // Payer account (must sign with payer's private key)
        newAccount,               // New account (must sign with new account's private key)
        space,                    // Data space in bytes
        lamports: accountLamports, // Lamports to transfer to new account
        programAddress: SYSTEM_PROGRAM_ADDRESS, // Owner program (System Program)
    });
    console.log('✓ Created create_account instruction');

    // Step 5: Build and sign transaction
    console.log('\n--- Step 4: Build and Sign Transaction ---');
    console.log('Signing with:');
    console.log('  - Payer private key (for transfer authorization)');
    console.log('  - New account private key (for account ownership proof)');

    const signature = await pipe(
        await createDefaultTransaction(client, payer),
        (tx) => {
            console.log('✓ Created default transaction');
            return tx;
        },
        (tx) => appendTransactionMessageInstruction(createAccountInstruction, tx),
        (tx) => {
            console.log('✓ Added instruction to transaction');
            return tx;
        },
        async (tx) => {
            const sig = await signAndSendTransaction(client, tx);
            console.log('✓ Transaction signed and sent');
            return sig;
        }
    );

    console.log('Transaction signature:', signature);

    // Step 6: Wait for confirmation and verify
    console.log('\n--- Step 5: Verify Account Creation ---');
    
    // Wait a bit for the transaction to be confirmed
    await new Promise(resolve => setTimeout(resolve, 2000));

    // Fetch the created account
    const fetchedAccount = await fetchEncodedAccount(client.rpc, newAccount.address);
    
    if (!fetchedAccount.exists) {
        throw new Error('Account was not created!');
    }

    console.log('✓ Account successfully created!');
    console.log('\nAccount details:');
    console.log('  Address:', fetchedAccount.address);
    console.log('  Lamports:', fetchedAccount.lamports.toString());
    console.log('  Space:', fetchedAccount.space.toString(), 'bytes');
    console.log('  Owner:', fetchedAccount.programAddress);
    console.log('  Executable:', fetchedAccount.executable);
    console.log('  Data length:', fetchedAccount.data.length, 'bytes');

    // Step 7: Check payer balance after
    console.log('\n--- Step 6: Check Final Balances ---');
    const payerBalanceAfter = await client.rpc.getBalance(payer.address).send();
    const balanceDiff = payerBalanceBefore - payerBalanceAfter;
    console.log('Payer balance after:', payerBalanceAfter.toString(), 'lamports');
    console.log('Balance difference:', balanceDiff.toString(), 'lamports');
    console.log('  (includes transaction fee + transferred lamports)');

    return {
        address: fetchedAccount.address,
        lamports: fetchedAccount.lamports,
        space: fetchedAccount.space,
        owner: fetchedAccount.programAddress,
        signature,
    };
}

/**
 * Example: Create an account with custom space and lamports
 */
async function example1() {
    console.log('\n\n=== Example 1: Create Account with Custom Space ===\n');
    
    try {
        const result = await createAccount(100n, undefined);
        console.log('\n✓ Example 1 completed successfully');
        return result;
    } catch (error) {
        console.error('✗ Example 1 failed:', error);
        throw error;
    }
}

/**
 * Example: Create an account with specific lamports
 */
async function example2() {
    console.log('\n\n=== Example 2: Create Account with Specific Lamports ===\n');
    
    try {
        // Create account with 0.1 SOL (100,000,000 lamports)
        const result = await createAccount(50n, 100_000_000n);
        console.log('\n✓ Example 2 completed successfully');
        return result;
    } catch (error) {
        console.error('✗ Example 2 failed:', error);
        throw error;
    }
}

/**
 * Main function to run examples
 */
async function main() {
    try {
        // Run example 1
        await example1();
        
        // Wait a bit between examples
        await new Promise(resolve => setTimeout(resolve, 3000));
        
        // Run example 2
        await example2();
        
        console.log('\n\n=== All Examples Completed Successfully ===');
    } catch (error) {
        console.error('\n\n=== Error ===');
        console.error(error);
        process.exit(1);
    }
}

// Run if this file is executed directly
// Note: This check works differently in ESM vs CommonJS
// For ESM, you can just call main() directly
main().catch(console.error);

export { createAccount, example1, example2 };

