import React, { useState } from 'react';
import { Leaf, Droplet, Sparkles, Wind, Trophy } from 'lucide-react';

const TREE_SPECIES = [
  { name: 'Redwood Oak', absorption: 24, icon: '🌳', desc: 'Highly resilient and excellent at carbon storage.' },
  { name: 'Sugar Maple', absorption: 21, icon: '🌲', desc: 'Dense foliage absorbing standard urban emissions.' },
  { name: 'Douglas Fir', absorption: 18, icon: '🌿', desc: 'Evergreen species absorbing carbon year-round.' },
  { name: 'Silver Birch', absorption: 16, icon: '🌳', desc: 'Rapidly growing species that pioneers new forests.' }
];

export default function Forest({ points, treesPlanted, setPoints }) {
  const [lastWatered, setLastWatered] = useState({});
  const [wateringMessage, setWateringMessage] = useState('');

  // Calculate trees from points (1 tree per 300 XP)
  const treesCount = Math.max(treesPlanted, Math.floor(points / 300));
  
  // Calculate total yearly carbon absorption (22 kg per tree average)
  const annualAbsorption = treesCount * 22;

  // Generate tree assets for grid
  const getForestGrid = () => {
    const grid = [];
    for (let i = 0; i < 9; i++) {
      if (i < treesCount) {
        // Unlocked tree details
        const speciesIndex = i % TREE_SPECIES.length;
        const species = TREE_SPECIES[speciesIndex];
        
        // Stage of growth based on points remaining
        // Trees unlocked earlier are mature, latest tree is a sapling
        let stage = 'Mature';
        let stageIcon = '🌳';
        if (i === treesCount - 1) {
          const excessXP = points % 300;
          if (excessXP < 100) {
            stage = 'Sapling';
            stageIcon = '🌱';
          } else if (excessXP < 200) {
            stage = 'Sprout';
            stageIcon = '🌿';
          } else {
            stage = 'Young';
            stageIcon = '🌴';
          }
        } else {
          stageIcon = species.icon;
        }

        grid.push({
          id: i,
          species: species.name,
          absorption: species.absorption,
          stage,
          icon: stageIcon,
          desc: species.desc,
          isLocked: false
        });
      } else {
        // Locked slot
        grid.push({
          id: i,
          isLocked: true,
          reqXP: (i + 1) * 300
        });
      }
    }
    return grid;
  };

  const forestGrid = getForestGrid();

  const handleWaterTree = (treeId) => {
    const today = new Date().toDateString();
    if (lastWatered[treeId] === today) {
      setWateringMessage("This tree has already been watered today!");
      setTimeout(() => setWateringMessage(''), 2000);
      return;
    }

    setLastWatered(prev => ({ ...prev, [treeId]: today }));
    setPoints(prev => prev + 10); // Reward 10 XP for watering
    setWateringMessage("Watered! You earned +10 XP!");
    setTimeout(() => setWateringMessage(''), 2500);
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '32px' }}>
      
      {/* HEADER */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '16px' }}>
        <div>
          <h2 style={{ fontSize: '2rem', fontWeight: 800 }}>My Virtual Forest</h2>
          <p style={{ color: 'var(--text-secondary)' }}>Your real-world carbon reduction points grow a virtual forest that acts as a simulated carbon sink.</p>
        </div>
        <div className="glass-panel" style={{ display: 'flex', alignItems: 'center', gap: '12px', padding: '10px 18px', borderLeft: '4px solid var(--accent-secondary)' }}>
          <Wind style={{ color: 'var(--accent-secondary)' }} />
          <div>
            <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', fontWeight: 600 }}>ANNUAL ABSORPTION SINK</div>
            <div style={{ fontWeight: 700, fontSize: '1rem', color: 'var(--accent-secondary)' }}>
              -{annualAbsorption} kg CO₂/year
            </div>
          </div>
        </div>
      </div>

      {/* TOP OVERVIEW CARD */}
      <div className="glass-panel" style={{ padding: '24px', display: 'grid', gridTemplateColumns: '1.2fr 1fr', gap: '32px', alignItems: 'center' }}>
        <div>
          <h3 style={{ fontSize: '1.25rem', marginBottom: '8px' }}>How the Forest Works</h3>
          <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', lineHeight: '1.6', marginBottom: '16px' }}>
            EcoSync partners with digital tree-planting foundations (like OneTreePlanted). For every tree that you nurture to maturity (unlocked via XP milestones), a real-world tree sapling is financed and planted in global reforestation zones.
          </p>
          <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap' }}>
            <span className="tag tag-green">1 Tree = 22kg CO₂ Annual Offset</span>
            <span className="tag tag-blue">300 XP = Unlock New Tree</span>
          </div>
        </div>
        
        <div style={{ background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.05)', padding: '20px', borderRadius: '12px', textAlign: 'center' }}>
          <div style={{ fontSize: '2.5rem', marginBottom: '8px' }}>🌳</div>
          <div style={{ fontWeight: 700, fontSize: '1.1rem' }}>Forest Canopy Status</div>
          <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginTop: '4px' }}>
            {treesCount === 0 
              ? "Your plot is currently empty. Complete challenges to plant your first tree!" 
              : `You have successfully established a ${treesCount}-tree carbon sink.`}
          </div>
        </div>
      </div>

      {/* FOREST GRID & WATERING HUD */}
      <div style={{ display: 'grid', gridTemplateColumns: '1.8fr 1fr', gap: '32px', alignItems: 'start' }}>
        
        {/* FOREST GRID */}
        <div className="glass-panel" style={{ padding: '24px' }}>
          <h3 style={{ fontSize: '1.2rem', marginBottom: '20px' }}>Your Forest Plot</h3>
          
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '20px' }}>
            {forestGrid.map((cell) => {
              if (cell.isLocked) {
                return (
                  <div 
                    key={cell.id} 
                    style={{
                      height: '140px',
                      background: 'rgba(0,0,0,0.15)',
                      border: '2px dashed rgba(255,255,255,0.04)',
                      borderRadius: '12px',
                      display: 'flex',
                      flexDirection: 'column',
                      alignItems: 'center',
                      justifyContent: 'center',
                      color: 'var(--text-muted)',
                      gap: '8px'
                    }}
                  >
                    <span style={{ fontSize: '1.5rem', opacity: 0.25 }}>🔒</span>
                    <span style={{ fontSize: '0.75rem', fontWeight: 600 }}>Unlock at {cell.reqXP} XP</span>
                  </div>
                );
              }

              return (
                <div 
                  key={cell.id}
                  className="glass-panel"
                  style={{
                    height: '140px',
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    justifyContent: 'center',
                    position: 'relative',
                    cursor: 'pointer',
                    background: 'rgba(16, 185, 129, 0.03)',
                    border: '1px solid rgba(16, 185, 129, 0.1)'
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.borderColor = 'var(--accent-primary)';
                    e.currentTarget.style.background = 'rgba(16, 185, 129, 0.06)';
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.borderColor = 'rgba(16, 185, 129, 0.1)';
                    e.currentTarget.style.background = 'rgba(16, 185, 129, 0.03)';
                  }}
                >
                  <span style={{ fontSize: '2.5rem' }} className="animate-float">{cell.icon}</span>
                  <span style={{ fontSize: '0.8rem', fontWeight: 700, marginTop: '8px' }}>{cell.species.split(' ')[0]}</span>
                  <span className="tag tag-green" style={{ fontSize: '0.65rem', marginTop: '4px', padding: '2px 6px' }}>{cell.stage}</span>
                  
                  {/* Water Action Overlay */}
                  <button 
                    onClick={(e) => {
                      e.stopPropagation();
                      handleWaterTree(cell.id);
                    }}
                    style={{
                      position: 'absolute',
                      bottom: '8px',
                      right: '8px',
                      background: 'rgba(6, 182, 212, 0.15)',
                      border: '1px solid rgba(6, 182, 212, 0.2)',
                      color: 'var(--accent-secondary)',
                      borderRadius: '50%',
                      width: '24px',
                      height: '24px',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      cursor: 'pointer',
                      transition: 'var(--transition)'
                    }}
                    title="Water this tree (+10 XP)"
                  >
                    <Droplet style={{ width: '12px', height: '12px', fill: 'var(--accent-secondary)' }} />
                  </button>
                </div>
              );
            })}
          </div>
        </div>

        {/* DETAILS SIDEBAR & WATERING HUD */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
          
          <div className="glass-panel" style={{ padding: '24px' }}>
            <h3 style={{ fontSize: '1.1rem', marginBottom: '16px' }}>Reforestation Species</h3>
            
            <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              {TREE_SPECIES.map((spec, idx) => (
                <div key={idx} style={{ display: 'flex', gap: '12px', alignItems: 'start' }}>
                  <div style={{ fontSize: '1.5rem', background: 'rgba(255,255,255,0.03)', padding: '6px', borderRadius: '8px' }}>
                    {spec.icon}
                  </div>
                  <div>
                    <h4 style={{ fontSize: '0.85rem', fontWeight: 700 }}>{spec.name}</h4>
                    <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: '2px' }}>{spec.desc}</p>
                    <span style={{ fontSize: '0.7rem', color: 'var(--accent-primary)', fontWeight: 600, display: 'block', marginTop: '4px' }}>
                      Offset Capacity: {spec.absorption} kg/yr
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Toast Notification Box */}
          {wateringMessage && (
            <div className="glass-panel-glow animate-pulse-glow" style={{ padding: '16px', display: 'flex', alignItems: 'center', gap: '10px', background: 'rgba(6, 182, 212, 0.1)', borderColor: 'var(--accent-secondary)' }}>
              <Sparkles style={{ color: 'var(--accent-secondary)', width: '18px', height: '18px' }} />
              <span style={{ fontSize: '0.85rem', fontWeight: 600, color: '#fff' }}>{wateringMessage}</span>
            </div>
          )}

        </div>

      </div>

    </div>
  );
}
