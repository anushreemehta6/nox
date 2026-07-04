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


Success Criteria
The project is complete when:
User can submit a payment transaction on Base Sepolia.
Relay service automatically detects payment.
Casper smart contract stores settlement record.
Frontend shows:
EVM transaction hash
Casper transaction hash
Payment ID
Settlement status

Recommended Stack
Frontend:
Next.js
TypeScript
Tailwind
Backend:
Node.js
Express
ethers.js
Database:
PostgreSQL (optional)
SQLite (acceptable for MVP)
EVM:
Solidity
Hardhat
Casper:
Rust
Odra Framework

Resources
Casper Developer Docs:
https://docs.casper.network/developers
Casper AI Initiative:
https://www.casper.network/ai
Odra Framework:
https://odra.dev
Odra LLM Documentation:
https://odra.dev/llms.txt
Hardhat:
https://hardhat.org
Ethers:
https://docs.ethers.org

Project Structure
relaypay/

├── frontend/
│   ├── nextjs app
│
├── backend/
│   ├── relay service
│   ├── receipt api
│
├── evm-contracts/
│   ├── PaymentRegistry.sol
│
├── casper-contracts/
│   ├── SettlementRegistry
│
├── shared/
│   ├── types
│
└── docs/


Development Plan
The AI should complete tasks in order.
DO NOT SKIP TASKS.

PHASE 1
Task 1
Create a Next.js frontend.
Requirements:
Home page
Connect wallet button
Pay button
Transaction status card
Output:
Wallet Connected
Pay Button Visible


PHASE 2
Task 2
Create EVM Payment Contract.
Contract Name:
PaymentRegistry.sol
Responsibilities:
Accept payment requests
Generate payment id
Emit payment event
Event:
event PaymentCreated(
    string paymentId,
    address payer,
    uint256 amount
);

Functions:
function pay(string memory paymentId)

Acceptance Criteria:
Contract deploys on Base Sepolia
Event emitted successfully

PHASE 3
Task 3
Integrate Frontend With Contract
Requirements:
When user clicks Pay:
Transaction submitted
Wait for confirmation
Show tx hash
Acceptance Criteria:
User can trigger PaymentCreated event.

PHASE 4
Task 4
Build Relay Service
Folder:
backend/relay

Responsibilities:
Connect to Base Sepolia
Listen for PaymentCreated event
Parse event data
Log payment information
Acceptance Criteria:
Payment detected
Payment ID logged
Amount logged


PHASE 5
Task 5
Create Casper Settlement Contract
Use:
Rust
Odra
Contract Name:
SettlementRegistry
Storage:
payment_id
payer
amount
timestamp

Functions:
record_settlement()
get_settlement()

Acceptance Criteria:
Settlement can be stored and retrieved.

PHASE 6
Task 6
Connect Relay To Casper
When relay detects:
PaymentCreated

it should call:
record_settlement()

on Casper.
Acceptance Criteria:
Every EVM payment creates a Casper settlement.

PHASE 7
Task 7
Generate Receipt Object
Create:
{
  "paymentId": "123",
  "evmTxHash": "...",
  "casperTxHash": "...",
  "status": "settled"
}

Store locally.
Acceptance Criteria:
Receipt generated after settlement.

PHASE 8
Task 8
Receipt API
Endpoints:
GET /receipt/
Response:
{
  "paymentId": "",
  "evmTxHash": "",
  "casperTxHash": "",
  "status": ""
}

Acceptance Criteria:
Receipt retrievable via API.

PHASE 9
Task 9
Frontend Receipt Viewer
Requirements:
Input:
Payment ID

Output:
Payment Status
EVM Tx
Casper Tx

Acceptance Criteria:
Receipt displayed correctly.

PHASE 10
Task 10
Polish UI
Add:
Progress states
Success screen
Error handling
Loading indicators
Acceptance Criteria:
Demo ready.

Optional Bonus
AI Agent Demo
Instead of a user:
User clicks Pay

Create:
AI Agent requests service
↓
Service returns 402
↓
Agent pays
↓
Relay settles on Casper
↓
Service returns result

This aligns directly with Casper AI and x402 narratives.

Deliverables
The final project should include:
Frontend application
Solidity contract
Casper Odra contract
Relay service
Receipt API
README
Architecture diagram
Demo video

Important Constraint
This is NOT a token bridge.
Do NOT build:
Liquidity pools
Wrapped tokens
Asset bridging
Cross-chain swaps
The project only demonstrates:
Payment Verification
+
Cross-Chain Settlement Recording
+
Receipt Generation

Keep the implementation simple and demo-focused.
