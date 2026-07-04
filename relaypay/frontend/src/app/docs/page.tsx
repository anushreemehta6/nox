"use client";

import Link from "next/link";
import { useState } from "react";

type CodeTab = "typescript" | "rust";

export default function DocsPage() {
  const [activeTab, setActiveTab] = useState<CodeTab>("typescript");

  const tsCode = `import { ethers } from "ethers";

// 1. Initialize Contract & Provider
const provider = new ethers.JsonRpcProvider("http://localhost:8545");
const wallet = new ethers.Wallet("PRIVATE_KEY", provider);
const registry = new ethers.Contract(
  "0x5FbDB2315678afecb367f032d93F642f64180aa3", 
  ["function pay(string memory paymentId) external payable"], 
  wallet
);

// 2. Submit payment (e.g. 1 wei paywall)
const paymentId = "pay-" + crypto.randomUUID();
console.log(\`Generated Payment ID: \${paymentId}\`);

const tx = await registry.pay(paymentId, { value: 1 });
await tx.wait();

console.log(\`EVM payment confirmed. Tx: \${tx.hash}\`);
console.log(\`Poll GET http://localhost:3001/receipt/\${paymentId} for Casper settlement confirmation.\`);`;

  const rustCode = `// Casper Odra Smart Contract
#[odra::module]
impl SettlementRegistry {
    pub fn record_settlement(
        &mut self,
        payment_id: String,
        payer: Address,
        amount: U512,
        evm_tx_hash: String,
    ) {
        // Assert that the record does not exist yet
        if self.settlements.get(&payment_id).is_some() {
            self.env().revert(ContractErrors::AlreadyExists);
        }

        let record = Settlement {
            payment_id,
            payer,
            amount,
            timestamp: self.env().get_block_time(),
            evm_tx_hash,
            status: Status::Settled,
        };

        self.settlements.set(&payment_id, record);
    }
}`;

  return (
    <div className="min-h-screen relative flex flex-col overflow-hidden bg-[#050507]">
      <div className="absolute inset-0 grid-overlay z-0 pointer-events-none opacity-50" />

      {/* Navigation Header */}
      <header className="relative z-10 border-b border-white/[0.04] backdrop-blur bg-[#050507]/60">
        <div className="max-w-7xl mx-auto px-6 h-20 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Link href="/" className="text-xl font-bold tracking-wider text-primary text-neon-cyan font-mono">NOX</Link>
            <span className="h-4 w-px bg-white/10" />
            <span className="text-xs uppercase tracking-widest font-mono text-white/40">Developer Portal</span>
          </div>

          <nav className="flex items-center gap-6 font-mono text-[10px] sm:text-xs uppercase text-white/50">
            <Link href="/" className="hover:text-primary transition-colors">Bridge</Link>
            <span className="text-white/10">•</span>
            <Link href="/analytics" className="hover:text-primary transition-colors">Analytics</Link>
            <span className="text-white/10">•</span>
            <Link href="/docs" className="text-primary text-neon-cyan font-bold transition-colors">Docs</Link>
            <span className="text-white/10">•</span>
            <Link href="/status" className="hover:text-primary transition-colors">Status</Link>
          </nav>
        </div>
      </header>

      {/* Page Body */}
      <main className="relative z-10 flex-1 max-w-7xl mx-auto w-full px-6 py-12 grid md:grid-cols-12 gap-12">
        {/* Left Side: Sidebar */}
        <aside className="md:col-span-3 flex flex-col gap-6 text-sm font-mono">
          <div className="flex flex-col gap-2">
            <span className="text-[10px] uppercase tracking-widest text-white/30">Introduction</span>
            <a href="#overview" className="text-primary text-neon-cyan hover:underline">Overview</a>
            <a href="#architecture" className="text-white/60 hover:text-white transition-colors">System Architecture</a>
          </div>

          <div className="flex flex-col gap-2">
            <span className="text-[10px] uppercase tracking-widest text-white/30">Integration</span>
            <a href="#quickstart" className="text-white/60 hover:text-white transition-colors">Client Quick Start</a>
            <a href="#mcp" className="text-white/60 hover:text-white transition-colors">Multi-Agent Systems</a>
          </div>

          <div className="flex flex-col gap-2">
            <span className="text-[10px] uppercase tracking-widest text-white/30">API References</span>
            <a href="#endpoints" className="text-white/60 hover:text-white transition-colors">Receipt Endpoints</a>
            <a href="#contract-abi" className="text-white/60 hover:text-white transition-colors">EVM Contract ABI</a>
          </div>
        </aside>

        {/* Right Side: Docs Content */}
        <article className="md:col-span-9 flex flex-col gap-10 text-white/80 leading-relaxed text-sm">
          <section id="overview" className="flex flex-col gap-4">
            <span className="text-xs uppercase font-mono tracking-widest text-primary text-neon-cyan">Developer Portal</span>
            <h2 className="text-3xl font-bold text-white font-sans">Nox x402 Integration</h2>
            <p>
              Nox is a high-speed relay settlement protocol built on top of the Casper Network and Ethereum Virtual Machine (EVM) compatible networks. It exposes payment hooks that allow multi-agent systems, AI nodes, and decentralized applications to verify payments off-chain and automatically write receipt proof on the Casper blockchain.
            </p>
          </section>

          <section id="architecture" className="border border-white/[0.06] bg-[#0d0d10]/40 p-6 rounded-xl">
            <h3 className="text-lg font-bold text-white mb-2 font-sans">System Architecture Flow</h3>
            <ol className="list-decimal list-inside space-y-2 text-white/60 font-mono text-xs">
              <li>Payer triggers <code className="text-white bg-white/5 px-1 py-0.5 rounded">pay(paymentId)</code> transaction on EVM.</li>
              <li>EVM Registry emits a <code className="text-white bg-white/5 px-1 py-0.5 rounded">PaymentCreated</code> event containing payment metadata.</li>
              <li>Nox Relay Daemon captures the event, validates the payload, and calls the Casper Registry contract.</li>
              <li>Casper Network mines the transaction, storing the proof record on-chain.</li>
              <li>Nox API generates and signs the receipt JSON, making it queryable via HTTP.</li>
            </ol>
          </section>

          <section id="quickstart" className="flex flex-col gap-4">
            <h3 className="text-xl font-bold text-white font-sans">Integration Templates</h3>
            <p>
              Copy the code snippet below to integrate the payment logic directly into your client or AI agent daemon.
            </p>

            {/* Code Tabs */}
            <div className="border border-white/[0.08] bg-[#08080b]/90 rounded-xl overflow-hidden shadow-2xl">
              <div className="px-4 py-2 border-b border-white/[0.06] bg-white/[0.02] flex items-center justify-between">
                <div className="flex gap-2">
                  <button 
                    onClick={() => setActiveTab("typescript")}
                    className={`px-3 py-2 text-xs font-mono transition-colors uppercase ${activeTab === "typescript" ? "text-primary text-neon-cyan border-b border-primary" : "text-white/40"}`}
                  >
                    TypeScript (Ethers.js)
                  </button>
                  <button 
                    onClick={() => setActiveTab("rust")}
                    className={`px-3 py-2 text-xs font-mono transition-colors uppercase ${activeTab === "rust" ? "text-primary text-neon-cyan border-b border-primary" : "text-white/40"}`}
                  >
                    Rust (Odra Framework)
                  </button>
                </div>
                <span className="text-[10px] font-mono text-white/30">nox.code.template</span>
              </div>

              <div className="p-6 font-mono text-xs overflow-x-auto bg-[#050507]/90 text-white/70 max-h-[300px]">
                <pre className="leading-relaxed whitespace-pre">{activeTab === "typescript" ? tsCode : rustCode}</pre>
              </div>
            </div>
          </section>

          <section id="endpoints" className="flex flex-col gap-4">
            <h3 className="text-xl font-bold text-white font-sans">HTTP API Endpoints</h3>
            <p>
              Nox exposes a signed receipt lookup server to check the settlement confirmation.
            </p>

            <div className="border border-white/[0.06] bg-[#08080b]/90 rounded-xl p-4 flex flex-col gap-3 font-mono text-xs">
              <div className="flex items-center gap-4">
                <span className="px-2 py-0.5 rounded bg-blue-500/20 text-blue-400 border border-blue-500/30 text-[10px]">GET</span>
                <span className="text-white">/receipt/:paymentId</span>
              </div>
              <p className="text-white/50 text-[11px] leading-normal pl-16">
                Queries the Casper receipt store by Payment ID. Returns 404 if the settlement is still pending or processing on the relay.
              </p>
              
              <div className="mt-3 p-4 border border-white/[0.04] bg-[#050507]/50 rounded-lg text-white/60">
                <span className="text-[10px] uppercase text-white/30 tracking-wider">Example Response</span>
                <pre className="text-[10px] mt-2 leading-normal">{`{
  "paymentId": "pay-3a764e85-058f-4afd-ba02-56b7c2c70082",
  "evmTxHash": "0xbd747be68deb332c18d7c623fa19faf326f2420c5f2843f0bb5c26404613a0c8",
  "casperTxHash": "3a51561ebfc147bab2746832a6c9e51931d225a0b42f6a46b065c4ed97848dd9",
  "status": "settled",
  "casperDryRun": false
}`}</pre>
              </div>
            </div>
          </section>
        </article>
      </main>

      {/* Footer */}
      <footer className="relative z-10 border-t border-white/[0.04] py-8 bg-[#050507]">
        <div className="max-w-7xl mx-auto px-6 flex flex-col md:flex-row justify-between items-center gap-4 text-xs font-mono text-white/30">
          <span>NOX - CC0 Hackathon License</span>
          <div className="flex gap-6">
            <a href="https://testnet.cspr.live" target="_blank" rel="noopener noreferrer" className="hover:text-primary transition-colors">Casper Testnet</a>
            <a href="https://sepolia.basescan.org" target="_blank" rel="noopener noreferrer" className="hover:text-primary transition-colors">Basescan</a>
          </div>
        </div>
      </footer>
    </div>
  );
}
