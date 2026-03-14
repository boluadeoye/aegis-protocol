# AEGIS PROTOCOL
### Sovereign On-Chain Identity & Access Management for the Decentralized Web

---

> "This program was architected, written, compiled, and deployed
>  entirely on an Android mobile device running Termux.
>  No MacBook. No cloud IDE. No local Solana CLI.
>  Just a phone, a terminal emulator, and the conviction
>  that the best systems are built under constraint."
>
> — Bolu Adeoye, Lagos, Nigeria

---

## THE THESIS
Web2 identity systems are permissions granted by corporations. Aegis is permissions owned by users. By rebuilding IAM as a Distributed State Machine on Solana, we eliminate the "Issuer as Censor" vulnerability inherent in JWT-based architectures.

## LIVE INFRASTRUCTURE
- **Program ID:** `DDVwRiD22Hdbz3tEuGjUBVUmLPWpDndF2NXqK8b5Z6M`
- **Frontend HUD:** [https://egis-hudd.vercel.app](https://egis-hudd.vercel.app)
- **Network:** Solana Devnet

## ON-CHAIN VERIFICATION
The protocol has passed a 5-strike adversarial audit on-chain, verifying hierarchical initialization, bitmask authorization, and O(1) global revocation.

**[View Live Program Activity on Solscan](https://solscan.io/account/DDVwRiD22Hdbz3tEuGjUBVUmLPWpDndF2NXqK8b5Z6M?cluster=devnet)**

## KEY DIFFERENTIATORS
1. **Hierarchical PDAs:** Strict `ServiceRoot` -> `RoleDefinition` -> `UserAccessKey` derivation ensures on-chain discoverability and relationship integrity.
2. **O(1) Global Revocation:** A "Circuit Breaker" on the ServiceRoot allows for instant, service-wide freezing of all access keys in a single transaction.
3. **Bitmask Permissions:** `u64` bitwise operations enable 64 discrete, composable permissions checkable in a single CPU instruction.

## PERFORMANCE & LATENCY
**Devnet instruction latency: 1100–1500ms.** 
This reflects current Solana devnet network conditions and RPC endpoint variability, not program execution time. The on-chain instruction compute units are minimal—permission verification is a single bitwise AND operation.

## SECURITY ARCHITECTURE
Detailed in `SECURITY.md`. Key mitigations include:
- **Account Substitution Defense:** Explicit cross-account relationship constraints.
- **Signer Validation:** Framework-level signature enforcement via `Signer<'info>`.
- **Overflow Protection:** Explicit upper-bound guards on `AuditLog` vectors.

## BUILD ENVIRONMENT
- **Device:** Android Smartphone
- **Environment:** Termux (Linux terminal emulator)
- **IDE:** Neovim via Termux
- **Deployment:** Solana Playground / Devnet
