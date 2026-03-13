# AEGIS ARCHITECTURAL THESIS
### JWT vs. On-Chain PDAs: The Sovereignty Shift

## 1. THE FAILURE OF CENTRALIZED AUTH (JWT)
JSON Web Tokens (JWT) are corporate permissions. The issuer (Auth0, AWS, Google) holds the ultimate power of censorship. If the issuer rotates a key or suspends an account, the user's identity is erased. Furthermore, revocation requires expensive server-side "Blacklists," reintroducing the stateful overhead JWTs were meant to solve.

## 2. THE AEGIS SOLUTION (ON-CHAIN PDAs)
Aegis reframes Identity & Access Management as a **Distributed State Machine**. 

### Key Differentiators:
*   **Cryptographic Ownership:** Access is a Program Derived Address (PDA) owned by the user's wallet. It is a cryptographic right, not a database row.
*   **O(1) Global Revocation:** The "Circuit Breaker" logic on the `ServiceRoot` allows a provider to freeze an entire service in a single transaction by flipping one bit. Every verification check hits this bit first.
*   **Immutable Audit Trail:** Every permission grant, freeze, or revocation is a signed transaction on the Solana ledger. It is auditable by any third party without needing access to a private database.

## 3. HIERARCHICAL STATE MODEL
Aegis implements a strict 4-tier hierarchy:
1. **ServiceRoot:** The anchor of the service provider.
2. **RoleDefinition:** The template for permissions (Bitmask-based).
3. **UserAccessKey:** The user-specific instance of a role.
4. **AuditLog:** The on-chain record of access events.

This hierarchy ensures that permissions are not just "stored," but are **discoverable and verifiable** natively on the blockchain.
