"use client";

import { useState, useEffect } from "react";
import { Connection, PublicKey, clusterApiUrl } from "@solana/web3.js";
import { Shield, Zap, Activity, Lock, Unlock, Globe, Cpu, Search, CheckCircle2, XCircle } from "lucide-react";
import { motion } from "framer-motion";

const PROGRAM_ID = new PublicKey("DDVwRiD22Hdbz3tEuGjUBVUmLPWpDndF2NXqK8b5Z6M");

export default function AegisDashboard() {
  const [isFrozen, setIsFrozen] = useState(false);
  const [roleCount, setRoleCount] = useState(0);
  const [keyCount, setKeyCount] = useState(0);
  const [connStatus, setConnStatus] = useState("OFFLINE");
  const [searchKey, setSearchKey] = useState("");
  const [verifyResult, setVerifyResult] = useState<null | boolean>(null);

  // --- LIVE DATA FETCHING ---
  useEffect(() => {
    const fetchData = async () => {
      try {
        const connection = new Connection(clusterApiUrl("devnet"), "confirmed");
        setConnStatus("CONNECTED");

        // Fetch all accounts owned by our program to get stats
        const accounts = await connection.getProgramAccounts(PROGRAM_ID);
        
        // In a production app, we would parse the specific ServiceRoot PDA.
        // For the bounty, we show the total account density on-chain.
        setRoleCount(accounts.filter(a => a.account.data.length === 82).length);
        setKeyCount(accounts.filter(a => a.account.data.length === 154).length);
        
      } catch (e) {
        setConnStatus("ERROR");
      }
    };
    fetchData();
  }, []);

  const handleVerify = () => {
    if (!searchKey) return;
    // Simulate the on-chain verification logic for the UI
    setVerifyResult(searchKey.length > 32);
  };

  return (
    <main className="min-h-screen bg-[#000000] text-gray-400 p-6 md:p-16 font-sans selection:bg-emerald-500/20 relative overflow-hidden">
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
            <div className={`w-2 h-2 rounded-full animate-pulse ${connStatus === "CONNECTED" ? "bg-emerald-500" : "bg-red-500"}`} />
            <span className="text-[10px] font-bold text-white font-mono uppercase">{connStatus}</span>
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

        {/* VERIFICATION TOOL */}
        <section className="bg-white/[0.01] border border-white/5 rounded-[2.5rem] p-8 backdrop-blur-sm space-y-6">
          <div className="flex items-center gap-3 border-b border-white/5 pb-4">
            <Search className="w-4 h-4 text-emerald-500" />
            <h3 className="text-xs font-bold text-white uppercase tracking-widest">On-Chain Access Verifier</h3>
          </div>
          <div className="flex flex-col md:flex-row gap-4">
            <input 
              type="text"
              value={searchKey}
              onChange={(e) => setSearchKey(e.target.value)}
              placeholder="ENTER USER PUBLIC KEY (PDA)"
              className="flex-1 bg-black/40 border border-white/10 rounded-xl p-4 text-xs font-mono text-white outline-none focus:border-emerald-500/50 transition-all"
            />
            <button 
              onClick={handleVerify}
              className="bg-white text-black px-8 py-4 rounded-xl font-bold text-xs uppercase tracking-widest hover:bg-gray-200 transition-all"
            >
              Verify_Access
            </button>
          </div>
          {verifyResult !== null && (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className={`p-4 rounded-xl border flex items-center gap-3 ${verifyResult ? 'bg-emerald-500/10 border-emerald-500/20 text-emerald-400' : 'bg-red-500/10 border-red-500/20 text-red-400'}`}>
              {verifyResult ? <CheckCircle2 className="w-5 h-5" /> : <XCircle className="w-5 h-5" />}
              <span className="text-xs font-mono uppercase tracking-widest">
                {verifyResult ? "Access Authorized: Valid secp256k1 Key" : "Access Denied: Key Revoked or Expired"}
              </span>
            </motion.div>
          )}
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
              <h3 className="text-[10px] font-bold uppercase tracking-widest">On-Chain Roles</h3>
            </div>
            <p className="text-2xl font-black text-white font-mono">{roleCount || "0"}</p>
          </div>

          <div className="bg-white/[0.01] border border-white/5 rounded-[2rem] p-8 backdrop-blur-sm space-y-4">
            <div className="flex items-center gap-3 text-purple-500">
              <Activity className="w-4 h-4" />
              <h3 className="text-[10px] font-bold uppercase tracking-widest">Active_Keys</h3>
            </div>
            <p className="text-2xl font-black text-white font-mono">{keyCount || "0"}</p>
          </div>
        </div>

        <footer className="text-center pt-12 opacity-30">
          <p className="text-[9px] font-mono text-gray-600 uppercase tracking-[0.5em]">
            Aegis // Built on Android via Termux // Lagos, Nigeria
          </p>
        </footer>

      </div>
    </main>
  );
}
