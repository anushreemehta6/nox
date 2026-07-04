Nox
Cross-Chain x402 Settlement Relay

Overview
Casper RelayPay is a hackathon-focused proof of concept demonstrating cross-chain payment settlement between an EVM blockchain (Base Sepolia or Ethereum Sepolia) and Casper.
The goal is NOT to build a production bridge.
The goal is to prove that:
A payment can be initiated on an EVM chain.
A relay service can detect and verify the payment.
An equivalent settlement record can be created on Casper.
Both chains contain verifiable receipts.
A frontend can display proof of settlement.

Core Demo Flow
User clicks "Pay".
Frontend
    ↓
EVM Smart Contract
    ↓
Payment Event Emitted
    ↓
Relay Service Detects Event
    ↓
Relay Calls Casper Contract
    ↓
Settlement Recorded
    ↓
Receipt Generated
    ↓
Frontend Displays Both Transactions

