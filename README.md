# Jito MEV Reward Distributor
Secure Merkle-Based Distribution Dashboard for Solana Stakers

Developed by zkzora  
X (Twitter): https://x.com/zk_zora

## Overview

The Jito MEV Reward Distributor is a web-based application designed to manage and distribute Maximum Extractable Value (MEV) rewards to Solana stakers in a secure, transparent, and scalable manner.

Built on the Solana blockchain, the system leverages Merkle Tree–based distribution to efficiently handle high-volume reward allocations while minimizing on-chain costs. Eligible users can independently verify their allocations and claim rewards directly through their own wallets without relinquishing custody of funds.

The project focuses on clarity, security, and operational efficiency, making it suitable as a reference implementation for decentralized reward distribution systems on Solana.

## Technical Stack

- Framework: Next.js (React)
- Language: TypeScript
- Blockchain API: @solana/web3.js
- Wallet Connection: @solana/wallet-adapter
- Network: Solana Devnet
- Deployment: Vercel

## Security Architecture and Roadmap

### Current Implementation

- Distribution data is committed using Merkle roots to reduce on-chain storage requirements
- Distribution roots are published via administrator-signed Solana transactions
- Administrative actions are restricted to a predefined ADMIN_WALLET address
- Users retain full custody and must sign their own claim transactions

### Security Roadmap

- Migration of the administrative control panel into a dedicated isolated portal
- Multi-signature approval using Squads or equivalent multisig governance
- Automated public audit logs for all distribution events and roots

## Installation and Local Setup

Clone the repository and start the local development server:

```bash
git clone https://github.com/zkzora/jito-mev-distributor.git
cd jito-mev-distributor
npm install
npm run dev
```
### Administrator Overview

An authorized administrator can upload reward distributions and publish Merkle roots on-chain. Administrative actions are restricted to a predefined wallet address and require explicit transaction signatures.

### User Claim Flow

Users can connect their Solana wallets to verify eligibility and claim rewards directly. All claims are non-custodial and require user-signed transactions.

### Distribution Data Format

Reward distributions are provided via a CSV file with the following structure:

address,amount
<solana_public_key>,<reward_amount>
