# AEGIS PROTOCOL
### Sovereign On-Chain Identity & Access Management (IAM) for Solana

> **"A hierarchical IAM system for Solana with constant-time global revocation and CPU-level permission checks. Architected and deployed entirely on an Android device via Termux in Lagos, Nigeria."**

---

## ⚡ 30-SECOND ARCHITECTURE SNAPSHOT

Aegis reframes Solana as a distributed state-machine backend by mirroring the internal logic of **AWS IAM**.

### 1. The Hierarchy (Relational PDAs)
`ServiceRoot` (Global Authority)  
      ↓  
`RoleDefinition` (Permission Group)  
      ↓  
`UserAccessKey` (Individual Identity)

### 2. The Moat (Technical Differentiators)
*   **O(1) Revocation:** Trigger a "Circuit Breaker" on the `ServiceRoot` to freeze millions of keys in a single transaction.
*   **Bitmask Permissions:** 64 discrete, composable permissions verified via a single bitwise AND instruction (CPU-level speed).
*   **Relational Constraints:** Explicit Anchor constraints prevent **Account Substitution Attacks** by verifying the parent-child link of every PDA.

---

## 🛠️ LIVE INFRASTRUCTURE
*   **Program ID:** `DDVwRiD22Hdbz3tEuGjUjBVUmLPWpDndF2NXqK8b5Z6N`
*   **Frontend HUD:** [https://aegis-hudd.vercel.app/](https://aegis-hudd.vercel.app/)
*   **On-Chain Proof:** [View Live Program Activity & Transactions on Solscan](https://solscan.io/account/DDVwRiD22Hdbz3tEuGjUjBVUmLPWpDndF2NXqK8b5Z6N?cluster=devnet#txns)

---

## 🧠 WEB2 VS. SOLANA: THE SOVEREIGNTY SHIFT
| Feature | JWT (Web2) | Aegis PDA (Web3) |
| :--- | :--- | :--- |
| **Storage** | Private Database | Public On-Chain Account |
| **Revocation** | Server Blocklist (O(n)) | Circuit Breaker (O(1)) |
| **Censorship** | Issuer Controls Identity | User Owns, Service Authorizes |
| **Audit Trail** | Mutable Logs | Immutable Ledger |

---

## 🛡️ SECURITY MANIFESTO
Detailed adversarial mitigations are documented in `SECURITY.md`, covering:
1. Account Substitution Defense
2. Signer Validation Enforcement
3. AuditLog Vector Overflow Guards
4. Bitmask Overflow Protection

## 📱 THE BUILD ENVIRONMENT
This protocol was built under extreme resource constraints.
*   **Hardware:** Android Smartphone
*   **Environment:** Termux (Linux CLI)
*   **IDE:** Neovim
*   **Compiler:** Solana Playground
