"use client";

import Link from "next/link";
import { useState } from "react";

type MockTx = {
  id: string;
  time: string;
  amount: string;
  status: string;
  evmHash: string;
  casperHash: string;
};

const INITIAL_MOCK_TXS: MockTx[] = [
  {
    id: "pay-c1b2d3e4-f5a6-47b8-89c0",
    time: "2 mins ago",
    amount: "1 Wei",
    status: "settled",
    evmHash: "0x3a76...7008",
    casperHash: "faf0...0b3a",
  },
  {
    id: "pay-958ea09a-a08a-4cb7-a2fc",
    time: "10 mins ago",
    amount: "1 Wei",
    status: "settled",
    evmHash: "0xfebc...57c0",
    casperHash: "dry-run...5222",
  },
  {
    id: "pay-4a3b2c1d-0e9f-8a7b-6c5d",
    time: "1 hour ago",
    amount: "5000 Wei",
    status: "settled",
    evmHash: "0x89ab...ef01",
    casperHash: "9a8b...1234",
  },
  {
    id: "pay-fe8d7c6b-5a4f-3e2d-1c0b",
    time: "3 hours ago",
    amount: "1 Wei",
    status: "settled",
    evmHash: "0x5678...9abc",
    casperHash: "c5d6...7890",
  },
];

export default function AnalyticsPage() {
  const [searchTerm, setSearchTerm] = useState("");
  const [transactions] = useState<MockTx[]>(INITIAL_MOCK_TXS);

  const filtered = transactions.filter(
    (tx) =>
      tx.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
      tx.evmHash.toLowerCase().includes(searchTerm.toLowerCase()) ||
      tx.casperHash.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="min-h-screen relative flex flex-col overflow-hidden bg-[#050507]">
      <div className="absolute inset-0 grid-overlay z-0 pointer-events-none opacity-50" />

      {/* Navigation Header */}
      <header className="relative z-10 border-b border-white/[0.04] backdrop-blur bg-[#050507]/60">
        <div className="max-w-7xl mx-auto px-6 h-20 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Link href="/" className="text-xl font-bold tracking-wider text-primary text-neon-cyan font-mono">NOX</Link>
            <span className="h-4 w-px bg-white/10" />
            <span className="text-xs uppercase tracking-widest font-mono text-white/40">Analytics</span>
          </div>

          <nav className="flex items-center gap-6 font-mono text-[10px] sm:text-xs uppercase text-white/50">
            <Link href="/" className="hover:text-primary transition-colors">Bridge</Link>
            <span className="text-white/10">•</span>
            <Link href="/analytics" className="text-primary text-neon-cyan font-bold transition-colors">Analytics</Link>
            <span className="text-white/10">•</span>
            <Link href="/docs" className="hover:text-primary transition-colors">Docs</Link>
            <span className="text-white/10">•</span>
            <Link href="/status" className="hover:text-primary transition-colors">Status</Link>
          </nav>
        </div>
      </header>

      {/* Page Body */}
      <main className="relative z-10 flex-1 max-w-7xl mx-auto w-full px-6 py-12 flex flex-col gap-10">
        <section>
          <span className="text-xs uppercase font-mono tracking-widest text-primary text-neon-cyan">Real-Time Data Feed</span>
          <h1 className="text-4xl font-bold text-white mt-2">Relay Analytics</h1>
          <p className="text-sm text-white/50 font-mono mt-2 leading-relaxed">
            Consolidated overview of cross-chain settlement volumes, sync latency, and Casper transaction indexing.
          </p>
        </section>

        {/* Dashboard Grid */}
        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
          <div className="border border-white/[0.06] bg-[#0d0d10]/40 p-6 rounded-xl glow-border">
            <div className="text-xs font-mono text-white/40 uppercase">Total Settled</div>
            <div className="text-3xl font-bold text-white mt-2 font-mono">24,859</div>
            <div className="text-[10px] font-mono text-emerald-400 mt-1">▲ +12.4% (24h)</div>
          </div>
          
          <div className="border border-white/[0.06] bg-[#0d0d10]/40 p-6 rounded-xl glow-border">
            <div className="text-xs font-mono text-white/40 uppercase">Average Latency</div>
            <div className="text-3xl font-bold text-white mt-2 font-mono">18.4s</div>
            <div className="text-[10px] font-mono text-primary text-neon-cyan mt-1">Optimal Sync (1 block)</div>
          </div>

          <div className="border border-white/[0.06] bg-[#0d0d10]/40 p-6 rounded-xl glow-border">
            <div className="text-xs font-mono text-white/40 uppercase">Relay Success Rate</div>
            <div className="text-3xl font-bold text-white mt-2 font-mono">99.98%</div>
            <div className="text-[10px] font-mono text-white/20 mt-1">2 incidents flagged in 30d</div>
          </div>

          <div className="border border-white/[0.06] bg-[#0d0d10]/40 p-6 rounded-xl glow-border">
            <div className="text-xs font-mono text-white/40 uppercase">EVM Gas Spent (Relayer)</div>
            <div className="text-3xl font-bold text-white mt-2 font-mono">0.084 ETH</div>
            <div className="text-[10px] font-mono text-white/20 mt-1">Casper Faucets auto-renewed</div>
          </div>
        </div>

        {/* Chart Sparkline Section */}
        <div className="grid lg:grid-cols-2 gap-8">
          <div className="border border-white/[0.06] bg-[#08080b]/90 p-6 rounded-xl flex flex-col gap-4">
            <h3 className="text-sm font-mono uppercase text-white/50">Settlement Volume (Hourly)</h3>
            <div className="h-40 w-full flex items-end gap-1.5 pt-4">
              {[20, 35, 15, 45, 60, 50, 75, 40, 95, 80, 110, 85].map((val, i) => (
                <div key={i} className="flex-1 flex flex-col justify-end h-full">
                  <div 
                    style={{ height: `${val}%` }} 
                    className="w-full bg-[#00f2fe]/10 hover:bg-[#00f2fe]/40 border-t border-[#00f2fe]/30 rounded-t-sm transition-all duration-300"
                  />
                  <div className="text-[9px] font-mono text-white/20 text-center mt-2">{i * 2}h</div>
                </div>
              ))}
            </div>
          </div>

          <div className="border border-white/[0.06] bg-[#08080b]/90 p-6 rounded-xl flex flex-col gap-4">
            <h3 className="text-sm font-mono uppercase text-white/50">Average Sync Time (Seconds)</h3>
            <div className="h-40 w-full flex items-end gap-1.5 pt-4">
              {[30, 28, 25, 20, 18, 19, 21, 17, 18, 19, 18, 18].map((val, i) => (
                <div key={i} className="flex-1 flex flex-col justify-end h-full">
                  <div 
                    style={{ height: `${(val / 35) * 100}%` }} 
                    className="w-full bg-indigo-500/10 hover:bg-indigo-500/40 border-t border-indigo-500/30 rounded-t-sm transition-all duration-300"
                  />
                  <div className="text-[9px] font-mono text-white/20 text-center mt-2">{i * 2}h</div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Database Search Table */}
        <div className="border border-white/[0.08] bg-[#08080b]/80 rounded-xl overflow-hidden shadow-2xl">
          <div className="p-6 border-b border-white/[0.06] bg-white/[0.01] flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
            <h3 className="text-sm font-mono uppercase text-white/50">Settlement Receipts Database</h3>
            <input
              type="text"
              placeholder="Search Payment ID or Tx Hash..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="px-4 py-2 w-full sm:max-w-xs bg-[#050507]/60 border border-white/[0.1] rounded-lg text-xs font-mono text-white placeholder-white/30 focus:outline-none focus:border-primary"
            />
          </div>

          <div className="overflow-x-auto">
            <table className="w-full border-collapse font-mono text-xs text-white/70">
              <thead>
                <tr className="border-b border-white/[0.06] bg-white/[0.01] text-left text-white/40 text-[10px] uppercase">
                  <th className="p-4">Payment ID</th>
                  <th className="p-4">Time</th>
                  <th className="p-4">Amount</th>
                  <th className="p-4">EVM Hash</th>
                  <th className="p-4">Casper Hash</th>
                  <th className="p-4 text-right">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/[0.04]">
                {filtered.length > 0 ? (
                  filtered.map((tx) => (
                    <tr key={tx.id} className="hover:bg-white/[0.01] transition-colors">
                      <td className="p-4 text-white font-medium">{tx.id}</td>
                      <td className="p-4 text-white/50">{tx.time}</td>
                      <td className="p-4">{tx.amount}</td>
                      <td className="p-4 text-primary text-neon-cyan">{tx.evmHash}</td>
                      <td className="p-4 text-indigo-400">{tx.casperHash}</td>
                      <td className="p-4 text-right">
                        <span className="inline-block px-2 py-0.5 rounded bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 text-[9px] uppercase">
                          {tx.status}
                        </span>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={6} className="p-8 text-center text-white/30">
                      No matching settlement records found.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
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
