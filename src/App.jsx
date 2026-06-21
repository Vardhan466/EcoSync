import React, { useState, useEffect } from 'react';
import { LayoutDashboard, FileText, Compass, Trophy, TreePine, Leaf, Sparkles, User } from 'lucide-react';
import Dashboard from './components/Dashboard';
import Ledger from './components/Ledger';
import Roadmap from './components/Roadmap';
import Quests from './components/Quests';
import Forest from './components/Forest';

// Default habits at startup (simulating user profile)
const DEFAULT_HABITS = {
  transportKmPerWeek: 120,
  transportType: 'petrol_car',
  beefMealsPerWeek: 4,
  poultryMealsPerWeek: 6,
  vegMealsPerWeek: 8,
  veganMealsPerWeek: 3,
  kwhPerMonth: 280,
  renewablePercentage: 15,
  wasteKgPerWeek: 12,
  recyclingPercentage: 35
};

// Default ledger items representing recent actions in the current week
const DEFAULT_LEDGER = [
  {
    id: 't-1',
    category: 'transport',
    subType: 'metro_train',
    label: 'Metro Subway (15 km)',
    value: 15,
    unit: 'km',
    co2e: 0.6,
    timestamp: new Date(Date.now() - 1000 * 60 * 60 * 2).toISOString() // 2 hours ago
  },
  {
    id: 'f-1',
    category: 'food',
    subType: 'vegetarian',
    label: 'Vegetarian Pasta Dinner',
    value: 1,
    unit: 'meals',
    co2e: 0.6,
    timestamp: new Date(Date.now() - 1000 * 60 * 60 * 5).toISOString() // 5 hours ago
  },
  {
    id: 't-2',
    category: 'transport',
    subType: 'petrol_car',
    label: 'Petrol Car Commute (22 km)',
    value: 22,
    unit: 'km',
    co2e: 4.2,
    timestamp: new Date(Date.now() - 1000 * 60 * 60 * 24).toISOString() // 1 day ago
  },
  {
    id: 'e-1',
    category: 'energy',
    subType: 'average_grid',
    label: 'Grid Power (12 kWh)',
    value: 12,
    unit: 'kWh',
    co2e: 4.6,
    timestamp: new Date(Date.now() - 1000 * 60 * 60 * 28).toISOString() // 1.1 days ago
  }
];

export default function App() {
  const [activeTab, setActiveTab] = useState('dashboard');
  
  // Load state from localStorage or use defaults
  const [habits, setHabits] = useState(() => {
    const saved = localStorage.getItem('ecosync_habits');
    return saved ? JSON.parse(saved) : DEFAULT_HABITS;
  });
  
  const [ledgerItems, setLedgerItems] = useState(() => {
    const saved = localStorage.getItem('ecosync_ledger');
    return saved ? JSON.parse(saved) : DEFAULT_LEDGER;
  });

  const [points, setPoints] = useState(() => {
    const saved = localStorage.getItem('ecosync_points');
    return saved ? parseInt(saved, 10) : 380; // Default starts with some points
  });

  const [streak, setStreak] = useState(() => {
    const saved = localStorage.getItem('ecosync_streak');
    return saved ? parseInt(saved, 10) : 5; // Default 5 day streak
  });

  // Sync to localStorage when state changes
  useEffect(() => {
    localStorage.setItem('ecosync_habits', JSON.stringify(habits));
  }, [habits]);

  useEffect(() => {
    localStorage.setItem('ecosync_ledger', JSON.stringify(ledgerItems));
  }, [ledgerItems]);

  useEffect(() => {
    localStorage.setItem('ecosync_points', points.toString());
  }, [points]);

  useEffect(() => {
    localStorage.setItem('ecosync_streak', streak.toString());
  }, [streak]);

  const addPoints = (amount) => {
    setPoints(prev => prev + amount);
  };

  // Helper to determine trees based on points
  const treesPlanted = Math.floor(points / 300);

  const renderActiveComponent = () => {
    switch (activeTab) {
      case 'dashboard':
        return <Dashboard habits={habits} setHabits={setHabits} ledgerItems={ledgerItems} />;
      case 'ledger':
        return <Ledger ledgerItems={ledgerItems} setLedgerItems={setLedgerItems} addPoints={addPoints} />;
      case 'roadmap':
        return <Roadmap habits={habits} addPoints={addPoints} />;
      case 'quests':
        return <Quests points={points} streak={streak} treesPlanted={treesPlanted} />;
      case 'forest':
        return <Forest points={points} treesPlanted={treesPlanted} setPoints={setPoints} />;
      default:
        return <Dashboard habits={habits} setHabits={setHabits} ledgerItems={ledgerItems} />;
    }
  };

  const navItems = [
    { id: 'dashboard', name: 'Dashboard', icon: LayoutDashboard },
    { id: 'ledger', name: 'Smart Ledger', icon: FileText },
    { id: 'roadmap', name: 'Roadmaps', icon: Compass },
    { id: 'quests', name: 'Quests Hub', icon: Trophy },
    { id: 'forest', name: 'My Forest', icon: TreePine }
  ];

  return (
    <div className="app-container">
      
      {/* SIDEBAR NAVIGATION */}
      <aside className="sidebar">
        {/* LOGO */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <div style={{ background: 'rgba(16, 185, 129, 0.12)', padding: '8px', borderRadius: '10px', display: 'flex' }}>
            <Leaf style={{ color: 'var(--accent-primary)', width: '24px', height: '24px' }} className="animate-float" />
          </div>
          <h1 style={{ fontSize: '1.4rem', fontWeight: 800, letterSpacing: '-0.03em' }}>
            EcoSync<span style={{ color: 'var(--accent-secondary)' }}>.</span>
          </h1>
        </div>

        {/* PROFILE WIDGET */}
        <div className="glass-panel" style={{ padding: '16px', display: 'flex', alignItems: 'center', gap: '12px' }}>
          <div style={{ width: '40px', height: '40px', borderRadius: '50%', background: 'linear-gradient(135deg, var(--accent-primary), var(--accent-secondary))', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <User style={{ color: '#fff', width: '20px', height: '20px' }} />
          </div>
          <div>
            <div style={{ fontWeight: 700, fontSize: '0.85rem' }}>Green Champion</div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginTop: '2px' }}>
              <span className="tag tag-green" style={{ fontSize: '0.65rem', padding: '1px 5px' }}>Lvl {Math.floor(points / 500) + 1}</span>
              <span style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>{points} XP</span>
            </div>
          </div>
        </div>

        {/* NAVIGATION LINKS */}
        <nav style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = activeTab === item.id;
            return (
              <button
                key={item.id}
                onClick={() => setActiveTab(item.id)}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '12px',
                  width: '100%',
                  padding: '12px 16px',
                  borderRadius: '10px',
                  border: 'none',
                  fontSize: '0.9rem',
                  fontWeight: 600,
                  cursor: 'pointer',
                  textAlign: 'left',
                  background: isActive ? 'linear-gradient(135deg, rgba(16,185,129,0.15) 0%, rgba(6,182,212,0.15) 100%)' : 'transparent',
                  color: isActive ? '#fff' : 'var(--text-secondary)',
                  borderLeft: isActive ? '3px solid var(--accent-primary)' : '3px solid transparent',
                  transition: 'var(--transition)'
                }}
                onMouseEnter={(e) => {
                  if (!isActive) e.currentTarget.style.color = '#fff';
                }}
                onMouseLeave={(e) => {
                  if (!isActive) e.currentTarget.style.color = 'var(--text-secondary)';
                }}
              >
                <Icon style={{ width: '18px', height: '18px', color: isActive ? 'var(--accent-primary)' : 'var(--text-muted)' }} />
                {item.name}
              </button>
            );
          })}
        </nav>

        {/* FOOTER WIDGET */}
        <div style={{ marginTop: 'auto', display: 'flex', flexDirection: 'column', gap: '8px' }}>
          <div className="glass-panel" style={{ padding: '12px', display: 'flex', alignItems: 'center', gap: '8px', background: 'rgba(255,255,255,0.01)', border: '1px solid rgba(255,255,255,0.03)' }}>
            <Sparkles style={{ color: 'var(--accent-yellow)', width: '14px', height: '14px' }} />
            <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Offsetting the future, one step at a time.</span>
          </div>
        </div>
      </aside>

      {/* MAIN VIEW AREA */}
      <main className="main-content">
        {renderActiveComponent()}
      </main>

    </div>
  );
}
