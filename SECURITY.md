# AEGIS SECURITY MANIFESTO
### Adversarial Analysis & Mitigation Strategies

This document outlines the specific security vulnerabilities identified during the architectural phase of the Aegis Protocol and the deterministic mitigations implemented in the Rust/Anchor source.

---

## 1. ACCOUNT SUBSTITUTION (RELATIONSHIP VALIDATION)
**The Threat:** In standard Solana programs, an attacker can pass a valid account of the correct type but belonging to a different service or user.
**The Aegis Mitigation:** We implement strict hierarchical seed validation. Every `UserAccessKey` PDA is constrained not just by its own seeds, but by an explicit `constraint` check ensuring its `service_root` field matches the `ServiceRoot` account passed in the same transaction.

## 2. PRIVILEGED SIGNER VALIDATION
**The Threat:** Checking an authority's public key without enforcing a cryptographic signature.
**The Aegis Mitigation:** We bypass manual `require!` checks in favor of Anchor's `Signer<'info>` type. This enforces signature verification at the framework level before any instruction logic is executed, preventing unauthorized "spoof" instructions.

## 3. CPI SEED VALIDATION (RE-ENTRANCY DEFENSE)
**The Threat:** Recalculating seeds during Cross-Program Invocations (CPI) using `find_program_address`, which is compute-expensive and vulnerable to seed-collision if not handled carefully.
**The Aegis Mitigation:** Aegis stores the `bump` seed in the account state during initialization. All subsequent CPIs use `from_seeds` with the stored bump, ensuring the signature is tied to the exact account intended, with zero room for derivation drift.

## 4. BITMASK OVERFLOW PROTECTION
**The Threat:** Using bitwise operations on `u64` permission sets without bounds checking.
**The Aegis Mitigation:** We implement a "Checked Permission Grant" pattern. Before assigning permissions to a `UserAccessKey`, the program performs a bitwise AND against the parent `RoleDefinition` to ensure a user is never granted a permission that does not exist in their assigned role.

---
**Architect Note:** These mitigations were identified via manual adversarial review in a constrained mobile environment (Termux), ensuring a "Security-First" development lifecycle.
