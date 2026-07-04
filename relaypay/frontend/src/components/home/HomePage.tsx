"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { formatEther } from "viem";
import { useAccount, useBalance, useChainId, useDisconnect } from "wagmi";
import { ConnectWalletButton } from "@/components/wallet/ConnectWalletButton";
import { HardhatSetupPanel } from "@/components/wallet/HardhatSetupPanel";
import { PayButton } from "@/components/payment/PayButton";
import { getPaymentAmountWei, getPaymentRegistryAddress } from "@/lib/contracts/paymentRegistry";
import { usePayment } from "@/hooks/usePayment";
import { fetchReceipt, type Receipt, casperLiveUrl } from "@/lib/receipt/fetchReceipt";

export function HomePage() {
  const { pay, transaction, isProcessing, isConnected, canPay } = usePayment();
  const { address } = useAccount();
  const chainId = useChainId();
  const { disconnect } = useDisconnect();
  const { data: balance } = useBalance({ address });
  const paymentAmountWei = getPaymentAmountWei();
  const registryAddress = getPaymentRegistryAddress();

  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const terminalEndRef = useRef<HTMLDivElement | null>(null);

  const [logs, setLogs] = useState<string[]>([]);
  const [receipt, setReceipt] = useState<Receipt | null>(null);

  // Background Particle Animation
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    let animationFrameId: number;
    let width = (canvas.width = window.innerWidth);
    let height = (canvas.height = window.innerHeight);

    const handleResize = () => {
      if (canvas) {
        width = canvas.width = window.innerWidth;
        height = canvas.height = window.innerHeight;
      }
    };
    window.addEventListener("resize", handleResize);

    const particles: Array<{ x: number; y: number; vx: number; vy: number; radius: number }> = [];
    const count = 35;

    for (let i = 0; i < count; i++) {
      particles.push({
        x: Math.random() * width,
        y: Math.random() * height,
        vx: (Math.random() - 0.5) * 0.4,
        vy: (Math.random() - 0.5) * 0.4,
        radius: Math.random() * 2 + 1,
      });
    }

    const draw = () => {
      ctx.clearRect(0, 0, width, height);
      ctx.fillStyle = "rgba(255, 255, 255, 0.02)";
      ctx.strokeStyle = "rgba(255, 255, 255, 0.02)";
      ctx.lineWidth = 0.8;

      particles.forEach((p, i) => {
        p.x += p.vx;
        p.y += p.vy;

        if (p.x < 0 || p.x > width) p.vx *= -1;
        if (p.y < 0 || p.y > height) p.vy *= -1;

        ctx.beginPath();
        ctx.arc(p.x, p.y, p.radius, 0, Math.PI * 2);
        ctx.fillStyle = "rgba(255, 255, 255, 0.08)";
        ctx.fill();

        for (let j = i + 1; j < particles.length; j++) {
          const p2 = particles[j];
          const dist = Math.hypot(p.x - p2.x, p.y - p2.y);
          if (dist < 150) {
            ctx.beginPath();
            ctx.moveTo(p.x, p.y);
            ctx.lineTo(p2.x, p2.y);
            ctx.stroke();
          }
        }
      });

      animationFrameId = requestAnimationFrame(draw);
    };

    draw();

    return () => {
      cancelAnimationFrame(animationFrameId);
      window.removeEventListener("resize", handleResize);
    };
  }, []);

  // System Logs Generator
  const addLog = (msg: string) => {
    const time = new Date().toLocaleTimeString();
    setLogs((prev) => [...prev, `[${time}] ${msg}`]);
  };

  // Initial Connection Log
  useEffect(() => {
    addLog("System initialized. Listening for EVM connections.");
    addLog(`Configured EVM Registry: ${registryAddress}`);
  }, []);

  // Watch Wallet Connection Changes
  useEffect(() => {
    if (isConnected && address) {
      addLog(`Wallet Connected: ${address.slice(0, 6)}...${address.slice(-4)} (Chain ID: ${chainId})`);
      if (balance) {
        addLog(`Balance: ${formatEther(balance.value)} ETH`);
      }
    } else {
      addLog("Wallet Disconnected.");
    }
  }, [isConnected, address, chainId]);

  // Watch EVM Payment Status Changes
  useEffect(() => {
    if (transaction.status === "pending") {
      addLog(`[EVM] Status: Pending...`);
      if (transaction.paymentId) {
        addLog(`[EVM] Payment ID generated: ${transaction.paymentId}`);
      }
      if (transaction.txHash) {
        addLog(`[EVM] Transaction hash: ${transaction.txHash}`);
      }
      if (transaction.message) {
        addLog(`[EVM] ${transaction.message}`);
      }
    } else if (transaction.status === "confirmed") {
      addLog(`[EVM] SUCCESS: PaymentCreated event emitted.`);
      addLog(`[RELAY] Event detected! Relay is settling transaction on Casper...`);
    } else if (transaction.status === "failed") {
      addLog(`[EVM] ERROR: Payment failed.`);
      if (transaction.message) {
        addLog(`[EVM] Details: ${transaction.message}`);
      }
    }
  }, [transaction]);

  // Poll Casper Receipt
  useEffect(() => {
    if (transaction.status !== "confirmed" || !transaction.paymentId) {
      setReceipt(null);
      return;
    }

    let active = true;
    const interval = setInterval(async () => {
      try {
        const res = await fetchReceipt(transaction.paymentId!);
        if (res && active) {
          setReceipt(res);
          addLog(`[CASPER] Settlement SUCCESS.`);
          addLog(`[CASPER] Status: ${res.status.toUpperCase()}`);
          addLog(`[CASPER] Deploy Hash: ${res.casperTxHash}`);
          if (res.casperDryRun) {
            addLog(`[CASPER] Note: Transaction run in simulated/dry-run mode.`);
          }
          clearInterval(interval);
        }
      } catch (err: unknown) {
        const msg = err instanceof Error ? err.message : String(err);
        addLog(`[RELAY] Error polling receipt: ${msg}`);
      }
    }, 2000);

    return () => {
      active = false;
      clearInterval(interval);
    };
  }, [transaction.status, transaction.paymentId]);

  // Scroll Terminal to bottom
  useEffect(() => {
    terminalEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [logs]);

  const handleDisconnect = () => {
    disconnect();
  };

  const testAgent = async () => {
    addLog(`[AI AGENT] Connecting to x402 Protected Endpoint...`);
    
    const headers: Record<string, string> = {
      "Content-Type": "application/json"
    };
    
    if (receipt && transaction.paymentId) {
      headers["Authorization"] = `x402 ${transaction.paymentId}`;
      addLog(`[AI AGENT] Using NOX Receipt: ${transaction.paymentId}`);
    } else {
      addLog(`[AI AGENT] Sending request without valid receipt...`);
    }

    try {
      const res = await fetch("http://localhost:3002/api/v1/agent/chat", {
        method: "POST",
        headers,
        body: JSON.stringify({ message: "Hello AI" })
      });
      
      const data = await res.json();
      
      if (res.status === 402) {
        addLog(`[AI AGENT] ❌ ERROR 402: ${data.error}`);
        addLog(`[AI AGENT] Details: ${data.message}`);
      } else if (res.ok) {
        addLog(`[AI AGENT] ✅ SUCCESS: ${data.message}`);
        addLog(`[AI AGENT] Response: "${data.data.response}"`);
      } else {
        addLog(`[AI AGENT] ERROR: ${JSON.stringify(data)}`);
      }
    } catch (err: any) {
      addLog(`[AI AGENT] Fetch failed. Ensure backend/x402-api is running on port 3002.`);
    }
  };

  return (
    <div className="min-h-screen relative flex flex-col overflow-hidden bg-[#050507]">
      {/* Background grid + particle canvas */}
      <canvas ref={canvasRef} className="absolute inset-0 z-0 pointer-events-none" />
      <div className="absolute inset-0 grid-overlay z-0 pointer-events-none opacity-50" />

      {/* Navigation Header */}
      <header className="relative z-10 border-b border-white/[0.04] backdrop-blur bg-[#050507]/60">
        <div className="max-w-7xl mx-auto px-6 h-20 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <span className="text-xl font-bold tracking-wider text-primary text-neon-cyan font-mono">NOX</span>
            <span className="h-4 w-px bg-white/10" />
            <span className="text-xs uppercase tracking-widest font-mono text-white/40">x402: Settlement Bridge</span>
          </div>

          <nav className="flex items-center gap-6 font-mono text-[10px] sm:text-xs uppercase text-white/50">
            <Link href="/" className="text-primary text-neon-cyan font-bold transition-colors">Bridge</Link>
            <span className="text-white/10">•</span>
            <Link href="/analytics" className="hover:text-primary transition-colors">Analytics</Link>
            <span className="text-white/10">•</span>
            <Link href="/docs" className="hover:text-primary transition-colors">Docs</Link>
            <span className="text-white/10">•</span>
            <Link href="/status" className="hover:text-primary transition-colors">Status</Link>
          </nav>

          <div className="flex items-center gap-4">
            {isConnected ? (
              <button onClick={handleDisconnect} className="h-10 px-4 btn-angled text-xs uppercase font-mono">
                [ Disconnect ]
              </button>
            ) : (
              <ConnectWalletButton />
            )}
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="relative z-10 flex-1 max-w-7xl mx-auto w-full px-6 py-12 flex flex-col justify-center gap-10">
        
        {/* Hero Section */}
        <section className="text-center md:text-left max-w-3xl">
          <span className="text-xs uppercase font-mono tracking-widest text-primary text-neon-cyan">
            EVM → Relay → Casper Network
          </span>
          <h1 className="text-5xl md:text-9xl font-bold tracking-tight text-white mt-4 font-sans leading-none">
            Nox 
          </h1>

          <h1 className="text-2xl md:text-3xl font-bold tracking-tight text-white mt-4 font-sans leading-none">
            x402 Settlement Relay
          </h1>
          <p className="text-sm md:text-base text-white/50 font-mono mt-4 max-w-2xl leading-relaxed">
            Infrastructure enabling cross-chain value tracking and automatic settlement recording on Casper.
          </p>
          <div className="mt-6 flex items-center justify-center md:justify-start gap-2 font-mono text-xs text-white/30">
            <span className="text-primary text-neon-cyan">$</span>
            <span>npx @nox-pay/relay --package {registryAddress.slice(0, 12)}...</span>
          </div>
        </section>

        {/* Local Setup Guidance if chain is local */}
          {/* <HardhatSetupPanel /> */}

        {/* Core Workspace split layout */}
        <div className="grid lg:grid-cols-12 gap-8 items-stretch">
          
          {/* Action Steps (Left Side) */}
          <div className="lg:col-span-5 flex flex-col gap-6">
            
            {/* Step 1: Connect */}
            <div className="border border-white/[0.06] bg-[#0d0d10]/40 backdrop-blur rounded-xl p-6 glow-border">
              <div className="flex justify-between items-center mb-4">
                <span className="text-xs font-mono uppercase text-white/40">Step 01</span>
                <span className={`h-2 w-2 rounded-full ${isConnected ? "bg-primary animate-pulse" : "bg-white/10"}`} />
              </div>
              <h3 className="text-lg font-bold text-white mb-2">Connect Web3 Wallet</h3>
              <p className="text-xs text-white/50 leading-relaxed mb-4">
                Establish EVM connection to initiate payments on localhost/Base testnet.
              </p>
              <ConnectWalletButton />
            </div>

            {/* Step 2: Pay */}
            <div className="border border-white/[0.06] bg-[#0d0d10]/40 backdrop-blur rounded-xl p-6 glow-border">
              <div className="flex justify-between items-center mb-4">
                <span className="text-xs font-mono uppercase text-white/40">Step 02</span>
                <span className={`h-2 w-2 rounded-full ${transaction.status === "pending" ? "bg-yellow-400 animate-pulse" : transaction.status === "confirmed" ? "bg-emerald-400" : "bg-white/10"}`} />
              </div>
              <h3 className="text-lg font-bold text-white mb-2">Submit EVM Payment</h3>
              <p className="text-xs text-white/50 leading-relaxed mb-4">
                Executes contract call <code className="px-1 py-0.5 rounded bg-white/5 font-mono text-[10px]">pay(paymentId)</code> with <span className="text-white font-mono">{formatEther(paymentAmountWei)} ETH</span>.
              </p>
              <PayButton
                disabled={!canPay}
                isLoading={isProcessing}
                onPay={pay}
              />
              {!isConnected && (
                <span className="block mt-3 text-[10px] font-mono text-white/30">Connect wallet to unlock.</span>
              )}
            </div>

            {/* Step 3: Settled Receipt Info */}
            <div className="border border-white/[0.06] bg-[#0d0d10]/40 backdrop-blur rounded-xl p-6 glow-border">
              <div className="flex justify-between items-center mb-4">
                <span className="text-xs font-mono uppercase text-white/40">Step 03</span>
                <span className={`h-2 w-2 rounded-full ${receipt ? "bg-primary text-neon-cyan animate-pulse" : "bg-white/10"}`} />
              </div>
              <h3 className="text-lg font-bold text-white mb-1">Casper Settlement Verification</h3>
              <p className="text-xs text-white/50 leading-relaxed">
                Nox relay automatically validates EVM events, triggers Casper contract, and logs receipts.
              </p>
            </div>

            {/* Step 4: Test x402 AI Agent */}
            <div className="border border-indigo-500/[0.15] bg-[#0d0d10]/40 backdrop-blur rounded-xl p-6 shadow-[0_0_15px_rgba(79,70,229,0.1)]">
              <div className="flex justify-between items-center mb-4">
                <span className="text-xs font-mono uppercase text-indigo-400/80">Step 04 (x402 Demo)</span>
              </div>
              <h3 className="text-lg font-bold text-indigo-300 mb-2">Access Premium AI Agent</h3>
              <p className="text-xs text-white/50 leading-relaxed mb-4">
                Attempt to ping the AI Agent API. If unpaid, it returns 402. If you have a settled NOX receipt, it unlocks the response.
              </p>
              <button 
                onClick={testAgent}
                className="w-full h-10 bg-indigo-600/20 hover:bg-indigo-600/40 border border-indigo-500/50 text-indigo-300 text-xs uppercase font-mono transition-colors"
              >
                [ Ping AI Agent ]
              </button>
            </div>

          </div>

          {/* Interactive Live Terminal (Right Side) */}
          <div className="lg:col-span-7 flex flex-col border border-white/[0.08] bg-[#08080b]/90 rounded-xl overflow-hidden shadow-2xl">
            
            {/* Terminal Header */}
            <div className="px-4 py-3 border-b border-white/[0.06] bg-white/[0.02] flex items-center justify-between">
              <div className="flex gap-2">
                <div className="w-3 h-3 rounded-full bg-red-500/80" />
                <div className="w-3 h-3 rounded-full bg-yellow-500/80" />
                <div className="w-3 h-3 rounded-full bg-green-500/80" />
              </div>
              <span className="text-xs font-mono text-white/30 uppercase tracking-wider">Nox_Relay_Console.log</span>
              <button 
                onClick={() => setLogs([])}
                className="text-[10px] uppercase font-mono text-white/30 hover:text-white/80 transition-colors"
              >
                Clear
              </button>
            </div>

            {/* Terminal Logs Output */}
            <div className="flex-1 p-5 font-mono text-[11px] leading-relaxed overflow-y-auto max-h-[420px] min-h-[300px] flex flex-col gap-2 bg-[#050507]/90 text-white/70">
              {logs.map((log, index) => {
                let colorClass = "text-white/60";
                if (log.includes("SUCCESS")) colorClass = "text-emerald-400";
                else if (log.includes("Connected")) colorClass = "text-emerald-300";
                else if (log.includes("Pending")) colorClass = "text-amber-400";
                else if (log.includes("ERROR")) colorClass = "text-red-400 font-bold";
                else if (log.includes("[RELAY]")) colorClass = "text-[#00f2fe] text-neon-cyan";
                else if (log.includes("[CASPER]")) colorClass = "text-indigo-400";

                return (
                  <div key={index} className={`whitespace-pre-wrap break-all ${colorClass}`}>
                    {log}
                  </div>
                );
              })}

              {/* Receipt object representation if available */}
              {receipt && (
                <div className="mt-3 p-3 border border-indigo-500/20 bg-indigo-950/20 rounded-lg text-indigo-300">
                  <div className="font-bold text-[10px] uppercase tracking-wider mb-2 text-indigo-400">Casper Verified Receipt</div>
                  <pre className="text-[10px] leading-normal">{JSON.stringify(receipt, null, 2)}</pre>
                  
                  <div className="mt-3 pt-2 border-t border-indigo-500/20 flex flex-wrap gap-x-4 gap-y-1 text-[10px] text-white/50">
                    <div>
                      <span>Casper Explorer: </span>
                      <a 
                        href={casperLiveUrl(receipt.casperTxHash)}
                        target="_blank" 
                        rel="noopener noreferrer"
                        className="text-primary hover:underline text-neon-cyan font-bold"
                      >
                        [ View Transaction ]
                      </a>
                    </div>
                  </div>
                </div>
              )}

              <div ref={terminalEndRef} />
            </div>

            {/* Terminal Footer Bar */}
            <div className="px-4 py-3 border-t border-white/[0.06] bg-white/[0.02] flex items-center justify-between text-[10px] font-mono text-white/30">
              <div className="flex items-center gap-2">
                <span className="w-1.5 h-1.5 rounded-full bg-primary text-neon-cyan animate-pulse" />
                <span>Status: LISTENING</span>
              </div>
              <div>
                <span>Network: {isConnected ? `EVM ${chainId}` : "OFFLINE"}</span>
              </div>
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
