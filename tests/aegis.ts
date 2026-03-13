import * as anchor from "@coral-xyz/anchor";
import { Program } from "@coral-xyz/anchor";
import { Aegis } from "../target/types/aegis";
import { expect } from "chai";
import { crypto } from "crypto";

describe("aegis-protocol-adversarial-audit", () => {
  const provider = anchor.AnchorProvider.env();
  anchor.setProvider(provider);

  const program = anchor.workspace.Aegis as Program<Aegis>;
  const authority = provider.wallet;
  const serviceId = Array.from(new Uint8Array(32).fill(1)); // Mock Service ID
  const roleId = Array.from(new Uint8Array(16).fill(2));    // Mock Role ID
  const user = anchor.web3.Keypair.generate();

  // PDA Derivations
  const [serviceRoot] = anchor.web3.PublicKey.findProgramAddressSync(
    [Buffer.from("service_root"), authority.publicKey.toBuffer(), Buffer.from(serviceId)],
    program.programId
  );

  const [roleDefinition] = anchor.web3.PublicKey.findProgramAddressSync(
    [Buffer.from("role_def"), serviceRoot.toBuffer(), Buffer.from(roleId)],
    program.programId
  );

  const [accessKey] = anchor.web3.PublicKey.findProgramAddressSync(
    [Buffer.from("access_key"), roleDefinition.toBuffer(), user.publicKey.toBuffer()],
    program.programId
  );

  it("STRIKE 1: Initialize Sovereign Service Root", async () => {
    await program.methods
      .initializeService(serviceId)
      .accounts({
        serviceRoot,
        authority: authority.publicKey,
        systemProgram: anchor.web3.SystemProgram.programId,
      })
      .rpc();

    const account = await program.account.serviceRoot.fetch(serviceRoot);
    expect(account.circuitBreaker).to.be.false;
    expect(account.authority.toString()).to.equal(authority.publicKey.toString());
  });

  it("STRIKE 2: Define Role with Bitmask Permissions", async () => {
    const permissions = new anchor.BN(7); // Binary 111 (Read, Write, Execute)
    await program.methods
      .createRole(roleId, "ENGINEER", permissions)
      .accounts({
        roleDefinition,
        serviceRoot,
        authority: authority.publicKey,
        systemProgram: anchor.web3.SystemProgram.programId,
      })
      .rpc();

    const account = await program.account.roleDefinition.fetch(roleDefinition);
    expect(account.permissions.toNumber()).to.equal(7);
  });

  it("STRIKE 3: Issue User Access Key (Temporal Constraint)", async () => {
    const permissions = new anchor.BN(1); // Binary 001 (Read Only)
    const ttl = new anchor.BN(5);         // 5 second expiry
    
    await program.methods
      .issueAccessKey(permissions, ttl)
      .accounts({
        accessKey,
        serviceRoot,
        roleDefinition,
        user: user.publicKey,
        authority: authority.publicKey,
        systemProgram: anchor.web3.SystemProgram.programId,
      })
      .rpc();

    const account = await program.account.userAccessKey.fetch(accessKey);
    expect(account.grantedPermissions.toNumber()).to.equal(1);
  });

  it("STRIKE 4: Verify Access (Happy Path)", async () => {
    const requiredPermission = new anchor.BN(1);
    await program.methods
      .verifyAccess(requiredPermission)
      .accounts({
        serviceRoot,
        accessKey,
        user: user.publicKey,
      })
      .signers([user])
      .rpc();
  });

  it("STRIKE 5: The Temporal Trap (Wait for Expiry)", async () => {
    console.log("Waiting 6 seconds for key expiry...");
    await new Promise((resolve) => setTimeout(resolve, 6000));

    try {
      const requiredPermission = new anchor.BN(1);
      await program.methods
        .verifyAccess(requiredPermission)
        .accounts({
          serviceRoot,
          accessKey,
          user: user.publicKey,
        })
        .signers([user])
        .rpc();
      expect.fail("Key should have expired");
    } catch (err: any) {
      expect(err.error.errorCode.code).to.equal("KeyExpired");
    }
  });

  it("STRIKE 6: The Nuclear Option (Circuit Breaker)", async () => {
    // Freeze the entire service
    await program.methods
      .toggleCircuitBreaker(true)
      .accounts({
        serviceRoot,
        authority: authority.publicKey,
      })
      .rpc();

    try {
      const requiredPermission = new anchor.BN(1);
      await program.methods
        .verifyAccess(requiredPermission)
        .accounts({
          serviceRoot,
          accessKey,
          user: user.publicKey,
        })
        .signers([user])
        .rpc();
      expect.fail("Service should be frozen");
    } catch (err: any) {
      expect(err.error.errorCode.code).to.equal("ServiceFrozen");
    }
  });
});
