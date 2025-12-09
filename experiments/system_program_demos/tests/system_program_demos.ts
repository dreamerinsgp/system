import * as anchor from "@coral-xyz/anchor";
import { Program } from "@coral-xyz/anchor";
import { SystemProgramDemos } from "../target/types/system_program_demos";
import { SystemProgram, LAMPORTS_PER_SOL } from "@solana/web3.js";
import { expect } from "chai";

describe("system_program_demos", () => {
  // Configure the client to use the local cluster.
  anchor.setProvider(anchor.AnchorProvider.env());

  const program = anchor.workspace.systemProgramDemos as Program<SystemProgramDemos>;
  const provider = anchor.AnchorProvider.env();

  it("Is initialized!", async () => {
    // Add your test here.
    const tx = await program.methods.initialize().rpc();
    console.log("Your transaction signature", tx);
  });

  it("Creates an account via system program", async () => {
    // Generate a new keypair for the account to be created
    const newAccount = anchor.web3.Keypair.generate();
    
    // Define account space (in bytes)
    const space = 100;
    
    // Calculate rent exemption
    const rentExemption = await provider.connection.getMinimumBalanceForRentExemption(space);
    
    // Add some extra lamports for the account balance
    const lamports = rentExemption + 0.1 * LAMPORTS_PER_SOL;
    
    console.log("Creating account:", newAccount.publicKey.toString());
    console.log("Space:", space, "bytes");
    console.log("Lamports:", lamports.toString());
    console.log("Rent exemption:", rentExemption.toString());
    
    // Get the payer's balance before
    const payerBefore = await provider.connection.getBalance(provider.wallet.publicKey);
    console.log("Payer balance before:", payerBefore);
    
    // Call the create_account instruction
    const tx = await program.methods
      .createAccount(
        new anchor.BN(lamports),
        new anchor.BN(space),
        SystemProgram.programId
      )
      .accounts({
        payer: provider.wallet.publicKey,
        newAccount: newAccount.publicKey,
        systemProgram: SystemProgram.programId,
      })
      .signers([newAccount])
      .rpc();
    
    console.log("Transaction signature:", tx);
    
    // Verify the account was created
    const accountInfo = await provider.connection.getAccountInfo(newAccount.publicKey);
    expect(accountInfo).to.not.be.null;
    expect(accountInfo!.lamports).to.equal(lamports);
    expect(accountInfo!.data.length).to.equal(space);
    expect(accountInfo!.owner.toString()).to.equal(SystemProgram.programId.toString());
    
    console.log("Account created successfully!");
    console.log("Account lamports:", accountInfo!.lamports.toString());
    console.log("Account owner:", accountInfo!.owner.toString());
    
    // Check payer's balance after
    const payerAfter = await provider.connection.getBalance(provider.wallet.publicKey);
    console.log("Payer balance after:", payerAfter);
    console.log("Lamports spent:", payerBefore - payerAfter);
  });

  it("Creates an account owned by the program itself", async () => {
    // Generate a new keypair for the account to be created
    const newAccount = anchor.web3.Keypair.generate();
    
    // Define account space (in bytes)
    const space = 200;
    
    // Calculate rent exemption
    const rentExemption = await provider.connection.getMinimumBalanceForRentExemption(space);
    
    // Add some extra lamports for the account balance
    const lamports = rentExemption + 0.1 * LAMPORTS_PER_SOL;
    
    console.log("Creating account owned by program:", newAccount.publicKey.toString());
    console.log("Program ID:", program.programId.toString());
    
    // Call the create_account instruction with program as owner
    const tx = await program.methods
      .createAccount(
        new anchor.BN(lamports),
        new anchor.BN(space),
        program.programId
      )
      .accounts({
        payer: provider.wallet.publicKey,
        newAccount: newAccount.publicKey,
        systemProgram: SystemProgram.programId,
      })
      .signers([newAccount])
      .rpc();
    
    console.log("Transaction signature:", tx);
    
    // Verify the account was created with program as owner
    const accountInfo = await provider.connection.getAccountInfo(newAccount.publicKey);
    expect(accountInfo).to.not.be.null;
    expect(accountInfo!.lamports).to.equal(lamports);
    expect(accountInfo!.data.length).to.equal(space);
    expect(accountInfo!.owner.toString()).to.equal(program.programId.toString());
    
    console.log("Account created successfully with program as owner!");
  });
});
