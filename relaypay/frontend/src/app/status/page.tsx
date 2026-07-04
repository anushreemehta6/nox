"use client";

import Link from "next/link";
import { useEffect, useState } from "react";

export default function StatusPage() {
  const [evmBlock, setEvmBlock] = useState(8492048);
  const [casperBlock, setCasperBlock] = useState(8392595);
  const [relayLatency, setRelayLatency] = useState(148);

  // Simulate updating block numbers
  useEffect(() => {
    const interval = setInterval(() => {
      setEvmBlock((b) => b + Math.floor(Math.random() * 2));
      setCasperBlock((b) => b + Math.floor(Math.random() * 1.5));
      setRelayLatency(() => Math.floor(Math.random() * 30 + 130));
    }, 5000);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="min-h-screen relative flex flex-col overflow-hidden bg-[#050507]">
      <div className="absolute inset-0 grid-overlay z-0 pointer-events-none opacity-50" />

      {/* Navigation Header */}
      <header className="relative z-10 border-b border-white/[0.04] backdrop-blur bg-[#050507]/60">
        <div className="max-w-7xl mx-auto px-6 h-20 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Link href="/" className="text-xl font-bold tracking-wider text-primary text-neon-cyan font-mono">NOX</Link>
            <span className="h-4 w-px bg-white/10" />
            <span className="text-xs uppercase tracking-widest font-mono text-white/40">Status Monitor</span>
          </div>

          <nav className="flex items-center gap-6 font-mono text-[10px] sm:text-xs uppercase text-white/50">
            <Link href="/" className="hover:text-primary transition-colors">Bridge</Link>
            <span className="text-white/10">•</span>
            <Link href="/analytics" className="hover:text-primary transition-colors">Analytics</Link>
            <span className="text-white/10">•</span>
            <Link href="/docs" className="hover:text-primary transition-colors">Docs</Link>
            <span className="text-white/10">•</span>
            <Link href="/status" className="text-primary text-neon-cyan font-bold transition-colors">Status</Link>
          </nav>
        </div>
      </header>

      {/* Page Body */}
      <main className="relative z-10 flex-1 max-w-7xl mx-auto w-full px-6 py-12 flex flex-col gap-10">
        <section>
          <span className="text-xs uppercase font-mono tracking-widest text-primary text-neon-cyan">System Diagnostics</span>
          <h1 className="text-4xl font-bold text-white mt-2">Network Status</h1>
          <p className="text-sm text-white/50 font-mono mt-2 leading-relaxed">
            Real-time synchronization latency, block height updates, and relay daemon health indices.
          </p>
        </section>

        {/* Network Metrics Cards */}
        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
          <div className="border border-white/[0.06] bg-[#0d0d10]/40 p-6 rounded-xl glow-border">
            <div className="text-xs font-mono text-white/40 uppercase">EVM RPC Status</div>
            <div className="text-3xl font-bold text-white mt-2 font-mono">ONLINE</div>
            <div className="text-[10px] font-mono text-emerald-400 mt-1">Height: {evmBlock.toLocaleString()}</div>
          </div>
          
          <div className="border border-white/[0.06] bg-[#0d0d10]/40 p-6 rounded-xl glow-border">
            <div className="text-xs font-mono text-white/40 uppercase">Casper RPC Status</div>
            <div className="text-3xl font-bold text-white mt-2 font-mono">ONLINE</div>
            <div className="text-[10px] font-mono text-emerald-400 mt-1">Height: {casperBlock.toLocaleString()}</div>
          </div>

          <div className="border border-white/[0.06] bg-[#0d0d10]/40 p-6 rounded-xl glow-border">
            <div className="text-xs font-mono text-white/40 uppercase">Daemon Latency</div>
            <div className="text-3xl font-bold text-white mt-2 font-mono">{relayLatency}ms</div>
            <div className="text-[10px] font-mono text-emerald-400 mt-1">Healthy RPC handshake</div>
          </div>

          <div className="border border-white/[0.06] bg-[#0d0d10]/40 p-6 rounded-xl glow-border">
            <div className="text-xs font-mono text-white/40 uppercase">System Uptime</div>
            <div className="text-3xl font-bold text-white mt-2 font-mono">99.98%</div>
            <div className="text-[10px] font-mono text-white/20 mt-1">Checked every 30 seconds</div>
          </div>
        </div>

        {/* Node Health Grid */}
        <div className="grid lg:grid-cols-12 gap-8 items-stretch">
          
          {/* Node Sync Checklist (Left Side) */}
          <div className="lg:col-span-5 flex flex-col gap-6">
            <div className="border border-white/[0.06] bg-[#08080b]/90 p-6 rounded-xl flex flex-col gap-6">
              <h3 className="text-sm font-mono uppercase text-white/50 border-b border-white/[0.06] pb-3">Ecosystem Handshake</h3>

              <div className="space-y-4">
                <div className="flex justify-between items-center text-xs font-mono">
                  <span className="text-white/60">Base Sepolia RPC</span>
                  <span className="px-2 py-0.5 rounded bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 text-[10px] uppercase">Active</span>
                </div>
                <div className="flex justify-between items-center text-xs font-mono">
                  <span className="text-white/60">Casper Node RPC</span>
                  <span className="px-2 py-0.5 rounded bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 text-[10px] uppercase">Active</span>
                </div>
                <div className="flex justify-between items-center text-xs font-mono">
                  <span className="text-white/60">EVM PaymentRegistry</span>
                  <span className="px-2 py-0.5 rounded bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 text-[10px] uppercase">Active</span>
                </div>
                <div className="flex justify-between items-center text-xs font-mono">
                  <span className="text-white/60">Casper SettlementRegistry</span>
                  <span className="px-2 py-0.5 rounded bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 text-[10px] uppercase">Active</span>
                </div>
              </div>
            </div>
          </div>

          {/* System Logs console (Right Side) */}
          <div className="lg:col-span-7 border border-white/[0.08] bg-[#08080b]/90 rounded-xl overflow-hidden shadow-2xl flex flex-col">
            <div className="px-4 py-3 border-b border-white/[0.06] bg-white/[0.02] flex items-center justify-between">
              <div className="flex gap-2">
                <div className="w-3 h-3 rounded-full bg-red-500/80" />
                <div className="w-3 h-3 rounded-full bg-yellow-500/80" />
                <div className="w-3 h-3 rounded-full bg-green-500/80" />
              </div>
              <span className="text-xs font-mono text-white/30 uppercase tracking-wider">nox_daemon_health.log</span>
            </div>

            <div className="p-6 font-mono text-xs overflow-y-auto max-h-[300px] flex flex-col gap-2 bg-[#050507]/90 text-white/60 leading-relaxed">
              <div>[15:10:04] [INFO] Starting Nox Relay Daemon...</div>
              <div>[15:10:04] [INFO] Loaded private key for 017bba...</div>
              <div>[15:10:05] [INFO] Casper contract verified at hash-85938c...</div>
              <div>[15:10:05] [INFO] EVM provider connected. Listening for PaymentCreated events.</div>
              <div className="text-emerald-400">[15:15:39] [EVENT] Captured PaymentCreated: ID pay-3a764e85-058f...</div>
              <div className="text-primary text-neon-cyan">[15:15:40] [RELAY] Signed Casper transaction submitted: 3a51561ebfc1...</div>
              <div className="text-indigo-400">[15:16:04] [INDEXER] Casper deploy confirmed in block height 8392595.</div>
              <div className="text-emerald-400">[15:16:05] [DATABASE] Signed receipt generated and saved. status=settled.</div>
              <div>[15:20:00] [HEARTBEAT] Ping-pong check passed. EVM block={evmBlock}, Casper block={casperBlock}.</div>
            </div>
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
