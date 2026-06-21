import React, { useState } from 'react';
import { Send, FileText, Upload, RefreshCw, CheckCircle2, Trash2, Calendar, FileUp, Sparkles, AlertCircle } from 'lucide-react';
import { parseNaturalLanguage } from '../utils/nlpParser';

// Sample mock receipts for the OCR Simulator
const MOCK_RECEIPTS = [
  {
    id: 'rec-1',
    name: 'Utility Bill (Power)',
    merchant: 'GridEnergy Corp',
    date: 'June 18, 2026',
    items: [
      { text: 'Billing Period: 05/10 - 06/10', isMatch: false },
      { text: 'Electricity Consumption: 320 kWh', isMatch: true, value: '320 kWh', carbon: 121.6, detail: 'Average Grid Electricity' },
      { text: 'Delivery Charge: $18.40', isMatch: false },
      { text: 'Total Due: $65.80', isMatch: false }
    ]
  },
  {
    id: 'rec-2',
    name: 'Supermarket Grocery Receipt',
    merchant: 'Fresh Foods Market',
    date: 'June 20, 2026',
    items: [
      { text: '1x PREMIUM BEEF STEAK (0.6kg)', isMatch: true, value: 'Beef (1 meal equiv)', carbon: 5.5, detail: 'Beef Meal' },
      { text: '2x WHOLE CHICKEN WINGS (1.2kg)', isMatch: true, value: 'Poultry (2 meals equiv)', carbon: 3.0, detail: 'Poultry Meals' },
      { text: '1x ORGANIC LETTUCE MIX', isMatch: true, value: 'Vegan (1 meal equiv)', carbon: 0.3, detail: 'Vegan Meal' },
      { text: '1x ALMOND MILK 1L', isMatch: false },
      { text: 'TOTAL: $32.40', isMatch: false }
    ]
  },
  {
    id: 'rec-3',
    name: 'Gas Station Fuel Receipt',
    merchant: 'Shell Station #884',
    date: 'June 21, 2026',
    items: [
      { text: 'PUMP 04 REGULAR UNLEADED', isMatch: false },
      { text: 'FUEL VOLUME: 38 LITERS', isMatch: true, value: 'Petrol Car (approx 340 km)', carbon: 64.6, detail: 'Petrol Car Fuel' },
      { text: 'PRICE/LITER: $1.45', isMatch: false },
      { text: 'TOTAL PAID: $55.10', isMatch: false }
    ]
  }
];

export default function Ledger({ ledgerItems, setLedgerItems, addPoints }) {
  const [nlpInput, setNlpInput] = useState('');
  const [isNlpParsing, setIsNlpParsing] = useState(false);
  const [nlpSuggestions, setNlpSuggestions] = useState([]);
  
  // OCR scanner simulator states
  const [activeReceipt, setActiveReceipt] = useState(null);
  const [isScanning, setIsScanning] = useState(false);
  const [scanResult, setScanResult] = useState(null);

  // Handle Natural Language Input submission
  const handleNlpSubmit = (e) => {
    e.preventDefault();
    if (!nlpInput.trim()) return;

    setIsNlpParsing(true);
    setNlpSuggestions([]);

    // Simulate short network delay for Gemini AI API
    setTimeout(() => {
      const parsedResults = parseNaturalLanguage(nlpInput);
      setIsNlpParsing(false);
      
      if (parsedResults.length > 0) {
        setNlpSuggestions(parsedResults);
      } else {
        // Fallback warning suggestions if nothing is matched
        setNlpSuggestions([{
          isWarning: true,
          label: "No carbon-related actions detected. Try saying: 'I commuted 15km by metro today' or 'I ate a beef burger for lunch'"
        }]);
      }
    }, 1200);
  };

  // Add the approved NLP suggestion items to the ledger
  const acceptNlpSuggestion = (item) => {
    setLedgerItems(prev => [item, ...prev]);
    // Reward points for logging: 15 points per entry
    addPoints(15);
    // Remove from suggestions list
    setNlpSuggestions(prev => prev.filter(s => s.id !== item.id));
  };

  // Start OCR simulator scan
  const startOcrScan = (receipt) => {
    setActiveReceipt(receipt);
    setIsScanning(true);
    setScanResult(null);

    // Simulate glowing scanner going line-by-line
    setTimeout(() => {
      setIsScanning(false);
      
      // Filter out matches from receipt
      const extracted = receipt.items.filter(item => item.isMatch);
      const totalCarbon = extracted.reduce((sum, item) => sum + item.carbon, 0);

      setScanResult({
        receiptId: receipt.id,
        merchant: receipt.merchant,
        date: receipt.date,
        extractedItems: extracted,
        totalCarbon: parseFloat(totalCarbon.toFixed(1))
      });
    }, 2500);
  };

  // Confirm OCR scan results and add to ledger
  const confirmOcrResults = () => {
    if (!scanResult) return;

    const newTransactions = scanResult.extractedItems.map((item, idx) => {
      // Map receipt category
      let category = 'energy';
      if (item.detail.includes('Car') || item.detail.includes('SUV')) category = 'transport';
      if (item.detail.includes('Meal')) category = 'food';

      return {
        id: `ocr-${scanResult.receiptId}-${idx}-${Math.random().toString(36).substr(2, 9)}`,
        category,
        subType: 'ocr',
        label: `OCR Scan: ${scanResult.merchant} - ${item.value}`,
        value: 1,
        unit: 'receipt',
        co2e: item.carbon,
        timestamp: new Date().toISOString()
      };
    });

    setLedgerItems(prev => [...newTransactions, ...prev]);
    // Reward points for logging receipts: 50 points
    addPoints(50);
    
    // Reset states
    setActiveReceipt(null);
    setScanResult(null);
  };

  const deleteLedgerItem = (id) => {
    setLedgerItems(prev => prev.filter(item => item.id !== id));
  };

  const clearAllLedger = () => {
    if (confirm("Are you sure you want to clear your logged items for this week?")) {
      setLedgerItems([]);
    }
  };

  const getCategoryColor = (category) => {
    const colors = {
      transport: '#06b6d4',
      food: '#10b981',
      energy: '#f59e0b',
      waste: '#8b5cf6'
    };
    return colors[category] || '#ffffff';
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '32px' }}>
      
      {/* HEADER */}
      <div>
        <h2 style={{ fontSize: '2rem', fontWeight: 800 }}>Smart Carbon Ledger</h2>
        <p style={{ color: 'var(--text-secondary)' }}>Log your daily activities using natural language text or simulate receipt OCR scanning.</p>
      </div>

      {/* TWO COLUMN GRID: INPUTS & LEDGER TABLE */}
      <div style={{ display: 'grid', gridTemplateColumns: '1.1fr 1fr', gap: '32px', alignItems: 'start' }}>
        
        {/* LEFT COLUMN: LOGGING INTERFACES */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '32px' }}>
          
          {/* 1. NATURAL LANGUAGE LOGGER CARD */}
          <div className="glass-panel" style={{ padding: '24px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '16px' }}>
              <Sparkles style={{ color: 'var(--accent-secondary)' }} />
              <div>
                <h3 style={{ fontSize: '1.2rem' }}>AI-Powered Natural Language Logger</h3>
                <p style={{ color: 'var(--text-secondary)', fontSize: '0.8rem' }}>Type lifestyle choices naturally. Gemini parses the details.</p>
              </div>
            </div>

            <form onSubmit={handleNlpSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              <textarea
                value={nlpInput}
                onChange={(e) => setNlpInput(e.target.value)}
                placeholder="e.g. 'I commuted 20km by subway and ate a vegan salad for lunch today'"
                style={{
                  width: '100%',
                  height: '80px',
                  background: 'rgba(0,0,0,0.2)',
                  border: '1px solid rgba(255,255,255,0.1)',
                  borderRadius: '10px',
                  color: 'var(--text-primary)',
                  padding: '12px',
                  fontSize: '0.9rem',
                  fontFamily: 'inherit',
                  resize: 'none',
                  outline: 'none'
                }}
              />
              <button 
                type="submit" 
                className="btn-primary" 
                disabled={isNlpParsing || !nlpInput.trim()}
                style={{ alignSelf: 'flex-end', opacity: !nlpInput.trim() ? 0.6 : 1 }}
              >
                {isNlpParsing ? (
                  <>
                    <RefreshCw className="animate-spin-slow" style={{ width: '16px', height: '16px' }} />
                    AI Analyzing Input...
                  </>
                ) : (
                  <>
                    <Send style={{ width: '16px', height: '16px' }} />
                    Parse Activity
                  </>
                )}
              </button>
            </form>

            {/* AI Parsing Suggestions Box */}
            {nlpSuggestions.length > 0 && (
              <div style={{ marginTop: '20px', background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.05)', borderRadius: '10px', padding: '16px' }}>
                <h4 style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', marginBottom: '12px', display: 'flex', alignItems: 'center', gap: '6px' }}>
                  <CheckCircle2 style={{ color: 'var(--accent-primary)', width: '14px', height: '14px' }} />
                  Gemini AI Extraction Results
                </h4>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                  {nlpSuggestions.map((item, index) => {
                    if (item.isWarning) {
                      return (
                        <div key={index} style={{ display: 'flex', gap: '8px', alignItems: 'flex-start', color: 'var(--accent-yellow)', fontSize: '0.85rem' }}>
                          <AlertCircle style={{ flexShrink: 0, width: '16px', height: '16px', marginTop: '2px' }} />
                          <span>{item.label}</span>
                        </div>
                      );
                    }
                    return (
                      <div 
                        key={item.id} 
                        style={{
                          display: 'flex',
                          justifyContent: 'space-between',
                          alignItems: 'center',
                          padding: '10px',
                          background: 'rgba(255,255,255,0.03)',
                          borderRadius: '8px',
                          borderLeft: `3px solid ${getCategoryColor(item.category)}`
                        }}
                      >
                        <div>
                          <div style={{ fontSize: '0.85rem', fontWeight: 600 }}>{item.label}</div>
                          <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                            Category: {item.category.toUpperCase()} | Footprint: <span style={{ color: '#ef4444', fontWeight: 600 }}>{item.co2e} kg CO₂e</span>
                          </div>
                        </div>
                        <button 
                          onClick={() => acceptNlpSuggestion(item)}
                          style={{
                            background: 'rgba(16, 185, 129, 0.15)',
                            color: 'var(--accent-primary)',
                            border: '1px solid rgba(16, 185, 129, 0.2)',
                            padding: '6px 12px',
                            borderRadius: '6px',
                            cursor: 'pointer',
                            fontWeight: 600,
                            fontSize: '0.75rem',
                            transition: 'var(--transition)'
                          }}
                        >
                          Log Entry
                        </button>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}
          </div>

          {/* 2. OCR RECEIPT SCANNER CARD */}
          <div className="glass-panel" style={{ padding: '24px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '16px' }}>
              <FileUp style={{ color: 'var(--accent-primary)' }} />
              <div>
                <h3 style={{ fontSize: '1.2rem' }}>OCR Receipt Scanner Simulator</h3>
                <p style={{ color: 'var(--text-secondary)', fontSize: '0.8rem' }}>Upload or select a bill to extract carbon impact details.</p>
              </div>
            </div>

            {/* Simulated Receipt Selector */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              <div>
                <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginBottom: '8px', fontWeight: 600 }}>CHOOSE TEMPLATE FOR DEMO SCAN:</div>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(130px, 1fr))', gap: '10px' }}>
                  {MOCK_RECEIPTS.map((receipt) => (
                    <button 
                      key={receipt.id}
                      onClick={() => startOcrScan(receipt)}
                      disabled={isScanning}
                      style={{
                        padding: '10px',
                        background: activeReceipt?.id === receipt.id ? 'rgba(16, 185, 129, 0.15)' : 'rgba(255,255,255,0.02)',
                        border: '1px solid',
                        borderColor: activeReceipt?.id === receipt.id ? 'var(--accent-primary)' : 'rgba(255,255,255,0.08)',
                        color: activeReceipt?.id === receipt.id ? '#fff' : 'var(--text-secondary)',
                        borderRadius: '8px',
                        fontSize: '0.75rem',
                        fontWeight: 600,
                        cursor: 'pointer',
                        textAlign: 'left',
                        transition: 'var(--transition)'
                      }}
                    >
                      <FileText style={{ width: '14px', height: '14px', marginBottom: '4px', display: 'block', color: activeReceipt?.id === receipt.id ? 'var(--accent-primary)' : 'var(--text-muted)' }} />
                      {receipt.name}
                    </button>
                  ))}
                </div>
              </div>

              {/* Scanning screen interface */}
              {(isScanning || activeReceipt) && (
                <div 
                  className="glass-panel" 
                  style={{ 
                    position: 'relative', 
                    padding: '20px', 
                    background: '#0c111e', 
                    borderRadius: '12px',
                    border: '1px dashed rgba(255,255,255,0.15)',
                    overflow: 'hidden'
                  }}
                >
                  {/* Glowing Scanning Line */}
                  {isScanning && (
                    <div 
                      style={{
                        position: 'absolute',
                        left: 0,
                        right: 0,
                        height: '4px',
                        background: 'linear-gradient(90deg, transparent, var(--accent-primary), transparent)',
                        boxShadow: '0 0 15px var(--accent-primary)',
                        animation: 'scanLine 2.5s infinite linear',
                        zIndex: 2
                      }}
                    />
                  )}
                  <style>
                    {`
                      @keyframes scanLine {
                        0% { top: 0%; }
                        100% { top: 100%; }
                      }
                    `}
                  </style>

                  <div style={{ opacity: isScanning ? 0.4 : 1, transition: 'opacity 0.3s' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '1px solid rgba(255,255,255,0.1)', paddingBottom: '8px', marginBottom: '12px' }}>
                      <span style={{ fontSize: '0.85rem', fontWeight: 700, color: 'var(--accent-secondary)' }}>{activeReceipt.merchant.toUpperCase()}</span>
                      <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>{activeReceipt.date}</span>
                    </div>

                    {/* Receipt Items list */}
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                      {activeReceipt.items.map((item, idx) => (
                        <div 
                          key={idx} 
                          style={{ 
                            fontSize: '0.8rem', 
                            padding: '4px 8px', 
                            borderRadius: '4px',
                            background: item.isMatch && !isScanning ? 'rgba(16, 185, 129, 0.1)' : 'transparent',
                            border: item.isMatch && !isScanning ? '1px solid rgba(16, 185, 129, 0.2)' : 'none',
                            display: 'flex',
                            justifyContent: 'space-between'
                          }}
                        >
                          <span style={{ fontFamily: 'monospace' }}>{item.text}</span>
                          {item.isMatch && !isScanning && (
                            <span style={{ color: 'var(--accent-primary)', fontWeight: 600, fontSize: '0.75rem' }}>
                              +{item.carbon}kg CO₂e
                            </span>
                          )}
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Scanner results output */}
                  {scanResult && (
                    <div style={{ marginTop: '20px', paddingTop: '16px', borderTop: '1px solid rgba(255,255,255,0.1)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <div>
                        <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>TOTAL FOOTPRINT DETECTED</div>
                        <div style={{ fontSize: '1.25rem', fontWeight: 800, color: '#ef4444' }}>{scanResult.totalCarbon} kg CO₂e</div>
                      </div>
                      <button 
                        onClick={confirmOcrResults}
                        className="btn-primary"
                        style={{ padding: '8px 16px', fontSize: '0.8rem' }}
                      >
                        Confirm & Log
                      </button>
                    </div>
                  )}

                  {isScanning && (
                    <div style={{ position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%, -50%)', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '8px', zIndex: 3 }}>
                      <RefreshCw className="animate-spin-slow" style={{ color: 'var(--accent-primary)', width: '28px', height: '28px' }} />
                      <span style={{ fontSize: '0.8rem', fontWeight: 700, textShadow: '0 2px 10px #000' }}>OCR DATA EXTRACTION...</span>
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>

        </div>

        {/* RIGHT COLUMN: RECENT LEDGER ENTRIES */}
        <div className="glass-panel" style={{ padding: '24px', minHeight: '520px', display: 'flex', flexDirection: 'column' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
            <h3 style={{ fontSize: '1.25rem' }}>Weekly Activities Log</h3>
            {ledgerItems.length > 0 && (
              <button 
                onClick={clearAllLedger}
                style={{ background: 'transparent', border: 'none', color: 'var(--text-muted)', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '4px', fontSize: '0.75rem' }}
                onMouseEnter={(e) => e.target.style.color = '#ef4444'}
                onMouseLeave={(e) => e.target.style.color = 'var(--text-muted)'}
              >
                <Trash2 style={{ width: '12px', height: '12px' }} />
                Clear
              </button>
            )}
          </div>

          {ledgerItems.length === 0 ? (
            <div style={{ flex: 1, display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center', gap: '12px', color: 'var(--text-muted)', padding: '40px 20px', textAlign: 'center' }}>
              <FileText style={{ width: '48px', height: '48px', opacity: 0.3 }} />
              <div>
                <p style={{ fontWeight: 600 }}>Your ledger is empty.</p>
                <p style={{ fontSize: '0.8rem', marginTop: '4px' }}>Type an activity on the left or scan a receipt to log your first carbon action.</p>
              </div>
            </div>
          ) : (
            <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: '12px', overflowY: 'auto', maxHeight: '480px', paddingRight: '4px' }}>
              {ledgerItems.map((item) => (
                <div 
                  key={item.id}
                  style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    padding: '12px 16px',
                    background: 'rgba(255,255,255,0.02)',
                    border: '1px solid rgba(255,255,255,0.05)',
                    borderRadius: '10px',
                    transition: 'var(--transition)'
                  }}
                  onMouseEnter={(e) => e.currentTarget.style.borderColor = 'rgba(255,255,255,0.1)'}
                  onMouseLeave={(e) => e.currentTarget.style.borderColor = 'rgba(255,255,255,0.05)'}
                >
                  <div style={{ display: 'flex', gap: '12px', alignItems: 'center' }}>
                    <div 
                      style={{ 
                        width: '10px', 
                        height: '10px', 
                        borderRadius: '50%', 
                        background: getCategoryColor(item.category),
                        boxShadow: `0 0 10px ${getCategoryColor(item.category)}`
                      }} 
                    />
                    <div>
                      <div style={{ fontSize: '0.85rem', fontWeight: 600 }}>{item.label}</div>
                      <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', display: 'flex', alignItems: 'center', gap: '4px' }}>
                        <Calendar style={{ width: '10px', height: '10px' }} />
                        {new Date(item.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })} - {new Date(item.timestamp).toLocaleDateString([], { month: 'short', day: 'numeric' })}
                      </div>
                    </div>
                  </div>
                  
                  <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
                    <span style={{ fontWeight: 700, fontSize: '0.9rem', color: '#ef4444' }}>
                      {item.co2e.toFixed(1)} <span style={{ fontSize: '0.75rem', fontWeight: 400, color: 'var(--text-muted)' }}>kg</span>
                    </span>
                    <button 
                      onClick={() => deleteLedgerItem(item.id)}
                      style={{ background: 'transparent', border: 'none', color: 'var(--text-muted)', cursor: 'pointer', padding: '4px' }}
                      onMouseEnter={(e) => e.currentTarget.style.color = '#ef4444'}
                      onMouseLeave={(e) => e.currentTarget.style.color = 'var(--text-muted)'}
                    >
                      <Trash2 style={{ width: '14px', height: '14px' }} />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* Footer Total */}
          {ledgerItems.length > 0 && (
            <div style={{ borderTop: '1px solid rgba(255,255,255,0.1)', paddingTop: '16px', marginTop: '16px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <span style={{ fontSize: '0.85rem', fontWeight: 600, color: 'var(--text-secondary)' }}>TOTAL LOGGED CO₂e</span>
              <span style={{ fontSize: '1.2rem', fontWeight: 800, color: '#ef4444' }}>
                {ledgerItems.reduce((acc, item) => acc + item.co2e, 0).toFixed(1)} kg
              </span>
            </div>
          )}

        </div>

      </div>

    </div>
  );
}
