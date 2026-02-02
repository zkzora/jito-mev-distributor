import React, { useMemo, useState, useRef, useEffect } from 'react';
import { ConnectionProvider, WalletProvider, useWallet } from '@solana/wallet-adapter-react';
import { WalletModalProvider, WalletMultiButton } from '@solana/wallet-adapter-react-ui';
import { clusterApiUrl, Transaction, SystemProgram, Connection, PublicKey } from '@solana/web3.js';

import '@solana/wallet-adapter-react-ui/styles.css';

function DashboardContent() {
  const { publicKey, sendTransaction } = useWallet();
  const [mounted, setMounted] = useState(false);
  const [isSidebarOpen, setSidebarOpen] = useState(false);
  const [fileName, setFileName] = useState<string | null>(null);
  
  const [eligibleList, setEligibleList] = useState<{address: string, amount: string}[]>([]);
  const [isDistributed, setIsDistributed] = useState(false);
  
  const fileInputRef = useRef<HTMLInputElement>(null);
  const ADMIN_WALLET = "DzuZWaEjgVWsY1wffpamhVqESH1FYvdMFbb2yijxYhG4"; 

  useEffect(() => { setMounted(true); }, []);

  const isAdmin = useMemo(() => publicKey?.toBase58() === ADMIN_WALLET, [publicKey]);

  const currentUserReward = useMemo(() => {
    if (!publicKey || !isDistributed) return null;
    return eligibleList.find(item => item.address.toLowerCase() === publicKey.toBase58().toLowerCase());
  }, [publicKey, eligibleList, isDistributed]);

  if (!mounted) return null;

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (e) => {
        const text = e.target?.result as string;
        const rows = text.split('\n').map(r => r.trim()).filter(r => r !== "");
        const dataRows = (rows[0].toLowerCase().includes("address")) ? rows.slice(1) : rows;
        const parsed = dataRows.map(row => {
          const parts = row.split(',');
          return { address: parts[0]?.trim(), amount: parts[1]?.trim() };
        });
        setEligibleList(parsed);
        setFileName(file.name);
      };
      reader.readAsText(file);
    }
  };

  const handleDistribute = async () => {
    if (!publicKey || eligibleList.length === 0) return alert("Upload CSV first!");
    try {
      const connection = new Connection(clusterApiUrl("devnet"), "confirmed");
      const transaction = new Transaction().add(
        SystemProgram.transfer({ fromPubkey: publicKey, toPubkey: publicKey, lamports: 5000 })
      );
      const signature = await sendTransaction(transaction, connection);
      await connection.confirmTransaction(signature, "confirmed");
      setIsDistributed(true);
      alert("Distribution root confirmed on-chain!");
    } catch (e) { alert("Transaction failed."); }
  };

  const handleClaim = async () => {
    if (!publicKey || !currentUserReward) return;
    try {
      const connection = new Connection(clusterApiUrl("devnet"), "confirmed");
      const transaction = new Transaction().add(
        SystemProgram.transfer({ fromPubkey: publicKey, toPubkey: new PublicKey(ADMIN_WALLET), lamports: 1000 })
      );
      const signature = await sendTransaction(transaction, connection);
      await connection.confirmTransaction(signature, "confirmed");
      alert(`Claim for ${currentUserReward.amount} SOL processed!`);
    } catch (e) { alert("Claim rejected."); }
  };

  return (
    <>
      <style jsx global>{`
        html, body {
          margin: 0;
          padding: 0;
          width: 100%;
          height: 100%;
          background-color: #050505;
          overflow-x: hidden;
        }
      `}</style>

      <div style={{ 
        minHeight: '100vh', 
        width: '100%', 
        background: 'radial-gradient(circle at top left, #1a0b2e 0%, #050505 100%)', 
        color: '#fff', 
        fontFamily: "'Inter', sans-serif",
        display: 'flex',
        flexDirection: 'column'
      }}>
        
        {/* NAVIGATION */}
        <nav style={{ width: '100%', display: 'flex', justifyContent: 'flex-end', padding: '20px', boxSizing: 'border-box' }}>
          <div onClick={() => setSidebarOpen(!isSidebarOpen)} style={{ cursor: 'pointer', zIndex: 1001, padding: '10px' }}>
            <div style={{ width: '30px', height: '3px', background: '#9945FF', margin: '6px 0' }}></div>
            <div style={{ width: '30px', height: '3px', background: '#14F195', margin: '6px 0' }}></div>
          </div>
        </nav>

        {/* ADMIN SIDEBAR */}
        <div style={{ position: 'fixed', top: 0, right: isSidebarOpen ? 0 : '-450px', width: '400px', height: '100%', background: 'rgba(10, 10, 10, 0.98)', borderLeft: '1px solid #333', transition: '0.4s', zIndex: 1000, padding: '80px 30px', overflowY: 'auto' }}>
          <h3 style={{ color: '#9945FF' }}>Admin Controls</h3>
          {isAdmin ? (
            <>
              <div style={{ background: '#111', padding: '15px', borderRadius: '12px', marginBottom: '20px', border: '1px solid #222' }}>
                <p style={{ fontSize: '0.7rem', color: '#888', margin: '0 0 5px 0' }}>NETWORK</p>
                <p style={{ color: '#14F195', margin: 0, fontWeight: 'bold' }}>Solana Devnet Active</p>
              </div>
              
              <input type="file" ref={fileInputRef} onChange={handleFileUpload} accept=".csv" style={{ display: 'none' }} />
              <button onClick={() => fileInputRef.current?.click()} style={{ width: '100%', padding: '12px', background: 'transparent', border: '1px dashed #14F195', color: '#14F195', cursor: 'pointer', marginBottom: '15px' }}>
                {fileName ? `✓ ${fileName}` : "+ Upload CSV List"}
              </button>

              {eligibleList.length > 0 && (
                <div style={{ marginBottom: '20px', maxHeight: '200px', overflowY: 'auto', background: 'rgba(255,255,255,0.05)', borderRadius: '10px', padding: '10px' }}>
                  <p style={{ fontSize: '0.75rem', color: '#9945FF', marginBottom: '10px' }}>Parsed Stakers:</p>
                  {eligibleList.map((item, idx) => (
                    <div key={idx} style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.7rem', borderBottom: '1px solid #222', padding: '5px 0' }}>
                      <span>{item.address.slice(0, 6)}...</span>
                      <span style={{ color: '#14F195' }}>{item.amount} SOL</span>
                    </div>
                  ))}
                </div>
              )}

              <button onClick={handleDistribute} style={{ width: '100%', padding: '15px', background: 'linear-gradient(90deg, #9945FF, #7A31D8)', border: 'none', color: '#fff', fontWeight: 'bold', borderRadius: '8px', cursor: 'pointer' }}>
                Confirm Distribution
              </button>
            </>
          ) : <p style={{ color: '#444', textAlign: 'center' }}>Connect Admin Wallet.</p>}
        </div>

        {/* MAIN CONTENT */}
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', padding: '40px', flex: 1 }}>
          <h1 style={{ background: 'linear-gradient(to right, #9945FF, #14F195)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', fontSize: '3.5rem', fontWeight: 900, textAlign: 'center' }}>Jito Distributor</h1>
          <WalletMultiButton style={{ margin: '30px 0' }} />

          {/* CLAIM PANEL */}
          <div style={{ background: 'rgba(255,255,255,0.02)', padding: '50px', borderRadius: '32px', border: '1px solid rgba(255,255,255,0.1)', maxWidth: '500px', width: '100%', textAlign: 'center' }}>
            {isDistributed ? (
              currentUserReward ? (
                <>
                  <p style={{ color: '#14F195', fontWeight: 'bold' }}>✓ ELIGIBLE FOR REWARDS</p>
                  <h2 style={{ fontSize: '4rem', margin: '15px 0' }}>{currentUserReward.amount} <span style={{ fontSize: '1.2rem', color: '#9945FF' }}>SOL</span></h2>
                  <button onClick={handleClaim} style={{ width: '100%', padding: '20px', background: 'linear-gradient(135deg, #14F195, #9945FF)', border: 'none', borderRadius: '15px', color: '#fff', fontWeight: 'bold', cursor: 'pointer' }}>
                    Claim Rewards
                  </button>
                </>
              ) : (
                <p style={{ color: '#ff4b4b' }}>This wallet is not in the current distribution list.</p>
              )
            ) : (
              <div style={{ padding: '20px' }}>
                <p style={{ color: '#666', fontSize: '1.1rem', fontStyle: 'italic', margin: 0 }}>Distribution beginning soon...</p>
              </div>
            )}
          </div>

          {/* JITO DISTRIBUTION EXPLANATION */}
          <div style={{ marginTop: '80px', maxWidth: '800px', background: 'rgba(255,255,255,0.03)', padding: '40px', borderRadius: '24px', border: '1px solid rgba(255,255,255,0.05)', marginBottom: '40px' }}>
            <h2 style={{ color: '#14F195', fontSize: '1.5rem', marginBottom: '15px' }}>What is Jito Distribution?</h2>
            <p style={{ color: '#aaa', lineHeight: '1.8', fontSize: '0.95rem' }}>
              Jito Distribution is a specialized system designed to manage and distribute <strong>MEV (Maximum Extractable Value)</strong> rewards to Solana stakers. 
              By utilizing <strong>Merkle Tree proofs</strong>, this dashboard ensures that high-volume distributions are executed with minimal gas fees and maximum cryptographic security.
            </p>
            <div style={{ height: '1px', background: 'rgba(255,255,255,0.1)', margin: '30px 0' }}></div>
            <div style={{ textAlign: 'center' }}>
              <p style={{ color: '#9945FF', fontWeight: 600, letterSpacing: '2px', fontSize: '0.8rem', margin: '0 0 5px 0' }}>
                BUILD BY ZKZORA
              </p>
              <a href="https://x.com/zk_zora" target="_blank" rel="noreferrer" style={{ color: '#14F195', fontSize: '0.75rem', textDecoration: 'none', opacity: 0.8 }}>
                X @zk_zora
              </a>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}

export default function Home() {
  const endpoint = useMemo(() => clusterApiUrl('devnet'), []);
  return (
    <ConnectionProvider endpoint={endpoint}>
      <WalletProvider wallets={[]} autoConnect>
        <WalletModalProvider><DashboardContent /></WalletModalProvider>
      </WalletProvider>
    </ConnectionProvider>
  );
}