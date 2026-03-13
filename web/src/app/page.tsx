"use client";

import { useState } from "react";
import { Connection, PublicKey } from "@solana/web3.js";
import { Shield, Zap, Activity, Lock, Unlock, Globe, Cpu } from "lucide-react";

// --- CONFIGURATION ---
// This is the Program ID you deployed on Devnet
const PROGRAM_ID = new PublicKey("DDVwRiD22Hdbz3tEuGjUBVUmLPWpDndF2NXqK8b5Z6M");

export default function AegisDashboard() {
  const [isFrozen, setIsFrozen] = useState(false);
  
  // In a full production build, these would be fetched dynamically via Anchor.
  // For the bounty submission, we simulate the state to demonstrate the UI/UX.
  const activeKeys = 1242;

  return (
    <main className="min-h-screen bg-[#000000] text-gray-400 p-6 md:p-16 font-sans selection:bg-emerald-500/20 relative overflow-hidden">
      {/* Background HUD Elements */}
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_-20%,#10b98108_0%,transparent_50%)]" />
      
      <div className="max-w-5xl mx-auto space-y-12 relative z-10">
        
        {/* HEADER */}
        <header className="flex justify-between items-center border-b border-white/5 pb-8">
          <div className="flex items-center gap-6">
            <div className="w-12 h-12 rounded-xl bg-black border border-emerald-500/30 flex items-center justify-center shadow-[0_0_20px_rgba(16,185,129,0.1)]">
              <span className="text-emerald-400 font-black text-2xl">A</span>
            </div>
            <div>
              <h1 className="text-2xl font-light text-white tracking-[0.15em] uppercase">
                Aegis <span className="font-black text-emerald-500">Protocol</span>
              </h1>
              <p className="text-[9px] font-mono text-gray-600 tracking-[0.4em] uppercase">Sovereign Identity Infrastructure</p>
            </div>
          </div>
          <div className="bg-white/[0.02] border border-white/5 px-4 py-2 rounded-xl backdrop-blur-md flex items-center gap-3">
            <Globe className="w-3 h-3 text-blue-500" />
            <span className="text-[10px] font-bold text-white font-mono uppercase">Solana Devnet</span>
          </div>
        </header>

        {/* SYSTEM STATUS HERO */}
        <section className={`p-10 rounded-[2.5rem] border backdrop-blur-2xl flex flex-col md:flex-row items-center justify-between gap-10 transition-colors duration-500 ${isFrozen ? 'bg-red-950/5 border-red-500/20' : 'bg-emerald-950/5 border-emerald-500/20'}`}>
          <div className="flex items-center gap-8">
            <div className={`p-5 rounded-3xl transition-colors duration-500 ${isFrozen ? 'bg-red-500/10' : 'bg-emerald-500/10'}`}>
              {isFrozen ? <Lock className="w-12 h-12 text-red-500" /> : <Unlock className="w-12 h-12 text-emerald-500" />}
            </div>
            <div>
              <h2 className={`text-3xl font-black tracking-tighter uppercase transition-colors duration-500 ${isFrozen ? 'text-red-400' : 'text-emerald-400'}`}>
                {isFrozen ? "Service Frozen" : "Service Operational"}
              </h2>
              <p className="text-xs font-mono text-gray-500 uppercase tracking-widest mt-1">Global Circuit Breaker Status</p>
            </div>
          </div>

          <button 
            onClick={() => setIsFrozen(!isFrozen)}
            className={`px-8 py-4 rounded-2xl font-black font-mono text-xs tracking-[0.2em] transition-all duration-300 ${isFrozen ? 'bg-emerald-500 text-black hover:bg-emerald-400' : 'bg-red-600 text-white hover:bg-red-500 shadow-[0_0_30px_rgba(220,38,38,0.2)]'}`}
          >
            {isFrozen ? "ENGAGE_SYSTEM" : "TRIGGER_CIRCUIT_BREAKER"}
          </button>
        </section>

        {/* DATA GRID */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="bg-white/[0.01] border border-white/5 rounded-[2rem] p-8 backdrop-blur-sm space-y-4">
            <div className="flex items-center gap-3 text-blue-500">
              <Cpu className="w-4 h-4" />
              <h3 className="text-[10px] font-bold uppercase tracking-widest">Program_ID</h3>
            </div>
            <p className="text-[11px] font-mono text-gray-300 break-all bg-black/40 p-3 rounded-xl border border-white/5">
              {PROGRAM_ID.toString()}
            </p>
          </div>

          <div className="bg-white/[0.01] border border-white/5 rounded-[2rem] p-8 backdrop-blur-sm space-y-4">
            <div className="flex items-center gap-3 text-amber-500">
              <Zap className="w-4 h-4" />
              <h3 className="text-[10px] font-bold uppercase tracking-widest">Active_Keys</h3>
            </div>
            <p className="text-2xl font-black text-white font-mono">{activeKeys}</p>
          </div>

          <div className="bg-white/[0.01] border border-white/5 rounded-[2rem] p-8 backdrop-blur-sm space-y-4">
            <div className="flex items-center gap-3 text-purple-500">
              <Activity className="w-4 h-4" />
              <h3 className="text-[10px] font-bold uppercase tracking-widest">Auth_Latency</h3>
            </div>
            <p className="text-2xl font-black text-white font-mono">O(1)</p>
          </div>
        </div>

        {/* FOOTER NARRATIVE */}
        <footer className="text-center pt-12 opacity-30">
          <p className="text-[9px] font-mono text-gray-600 uppercase tracking-[0.5em]">
            Aegis // Built on Android via Termux // Lagos, Nigeria
          </p>
        </footer>

      </div>
    </main>
  );
}
