import React, { useState } from 'react';
import { Target, Leaf, Sparkles, ChevronRight, CheckCircle2, Trophy, ArrowRight, Zap, Car, Utensils, Trash2 } from 'lucide-react';
import { projectNetZero } from '../utils/carbonCalculator';

// Available mock challenges
const CHALLENGES_DATABASE = [
  {
    id: 'ch-1',
    title: 'Meatless Tuesday',
    category: 'food',
    description: 'Swap beef/pork meals for delicious vegetarian or vegan alternatives for a whole day.',
    impact: 'Cuts daily meal footprint by 80%',
    points: 120,
    icon: Utensils,
    color: '#10b981'
  },
  {
    id: 'ch-2',
    title: 'Pedal Power Commute',
    category: 'transport',
    description: 'Substitute a drive under 10 km by walking, cycling, or using public metro transit.',
    impact: 'Saves approx 2.8 kg CO₂e per trip',
    points: 200,
    icon: Car,
    color: '#06b6d4'
  },
  {
    id: 'ch-3',
    title: 'Unplugged Evening',
    category: 'energy',
    description: 'Turn off heavy appliances and screens for 4 hours. Read a book or enjoy a nature walk instead.',
    impact: 'Saves approx 3.5 kWh of grid power',
    points: 150,
    icon: Zap,
    color: '#f59e0b'
  },
  {
    id: 'ch-4',
    title: 'Zero Waste Champion',
    category: 'waste',
    description: 'Compost organic scraps and ensure 100% of cardboard, tins, and plastics are recycled today.',
    impact: 'Prevents landfill methane emissions',
    points: 100,
    icon: Trash2,
    color: '#8b5cf6'
  }
];

export default function Roadmap({ habits, addPoints }) {
  const stats = projectNetZero(habits);
  const [acceptedChallenges, setAcceptedChallenges] = useState([]);
  const [completedChallenges, setCompletedChallenges] = useState([]);

  // Calculate the highest emission sector (hotspot)
  const getHotspot = () => {
    const sectors = [
      { name: 'Transport', value: stats.annualTransport, desc: 'High usage of petrol/diesel vehicles or high weekly travel distances.', icon: Car, color: '#06b6d4' },
      { name: 'Dietary', value: stats.annualFood, desc: 'High frequency of beef and poultry meals in your weekly food diary.', icon: Utensils, color: '#10b981' },
      { name: 'Home Energy', value: stats.annualEnergy, desc: 'Large energy footprint from standard fossil-fueled power grids.', icon: Zap, color: '#f59e0b' },
      { name: 'Waste', value: stats.annualWaste, desc: 'Low recycling ratios or large volumes of weekly household waste.', icon: Trash2, color: '#8b5cf6' }
    ];

    sectors.sort((a, b) => b.value - a.value);
    return sectors[0];
  };

  const hotspot = getHotspot();

  const handleAcceptChallenge = (id) => {
    if (!acceptedChallenges.includes(id)) {
      setAcceptedChallenges(prev => [...prev, id]);
    }
  };

  const handleCompleteChallenge = (id, points) => {
    setCompletedChallenges(prev => [...prev, id]);
    setAcceptedChallenges(prev => prev.filter(cId => cId !== id));
    addPoints(points);
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '32px' }}>
      
      {/* HEADER */}
      <div>
        <h2 style={{ fontSize: '2rem', fontWeight: 800 }}>Green Roadmaps</h2>
        <p style={{ color: 'var(--text-secondary)' }}>AI recommendation engine generates personalized roadmaps and micro-challenges to cut carbon hotspots.</p>
      </div>

      {/* ROADMAP LAYOUT: HOTSPOT CARD & ACTIVE CHALLENGES */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1.3fr', gap: '32px', alignItems: 'start' }}>
        
        {/* LEFT COLUMN: HOTSPOT ANALYZER CARD */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
          
          <div className="glass-panel-glow" style={{ padding: '28px', borderLeft: `5px solid ${hotspot.color}` }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '16px' }}>
              <Target style={{ color: hotspot.color, width: '24px', height: '24px' }} />
              <h3 style={{ fontSize: '1.25rem' }}>AI Hotspot Diagnosis</h3>
            </div>
            
            <div style={{ display: 'flex', alignItems: 'center', gap: '16px', marginBottom: '20px' }}>
              <div 
                style={{ 
                  background: `rgba(${hotspot.name === 'Transport' ? '6, 182, 212' : hotspot.name === 'Dietary' ? '16, 185, 129' : hotspot.name === 'Home Energy' ? '245, 158, 11' : '139, 92, 246'}, 0.12)`, 
                  padding: '16px', 
                  borderRadius: '12px',
                  border: `1px solid ${hotspot.color}`
                }}
              >
                <hotspot.icon style={{ color: hotspot.color, width: '32px', height: '32px' }} />
              </div>
              <div>
                <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)', fontWeight: 600 }}>PRIMARY CARBON DRIVER</div>
                <h4 style={{ fontSize: '1.4rem', fontWeight: 800, color: hotspot.color }}>{hotspot.name}</h4>
              </div>
            </div>

            <p style={{ fontSize: '0.9rem', color: 'var(--text-secondary)', lineHeight: '1.6', marginBottom: '16px' }}>
              {hotspot.desc} This sector accounts for approximately <span style={{ fontWeight: 700, color: '#fff' }}>{Math.round((hotspot.value / stats.totalAnnual) * 100)}%</span> of your total carbon emissions.
            </p>

            <div style={{ background: 'rgba(255,255,255,0.02)', padding: '14px', borderRadius: '10px', display: 'flex', alignItems: 'center', gap: '10px' }}>
              <Sparkles style={{ color: 'var(--accent-secondary)', width: '18px', height: '18px' }} />
              <span style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>
                We've adjusted your roadmap recommendations to prioritize high-impact {hotspot.name.toLowerCase()} reductions.
              </span>
            </div>
          </div>

          {/* ROADMAP TARGET STEPS */}
          <div className="glass-panel" style={{ padding: '24px' }}>
            <h3 style={{ fontSize: '1.1rem', marginBottom: '16px' }}>Your Net-Zero Roadmap</h3>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '16px', position: 'relative' }}>
              
              {/* Vertical timeline connector */}
              <div style={{ position: 'absolute', left: '15px', top: '24px', bottom: '24px', width: '2px', background: 'rgba(255,255,255,0.05)' }} />

              <div style={{ display: 'flex', gap: '16px', position: 'relative', zIndex: 2 }}>
                <div style={{ width: '32px', height: '32px', borderRadius: '50%', background: '#10b981', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 700, fontSize: '0.85rem' }}>1</div>
                <div>
                  <h4 style={{ fontSize: '0.9rem', fontWeight: 600 }}>Optimize Hotspots</h4>
                  <p style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>Complete active challenges focused on {hotspot.name.toLowerCase()} emissions.</p>
                </div>
              </div>

              <div style={{ display: 'flex', gap: '16px', position: 'relative', zIndex: 2 }}>
                <div style={{ width: '32px', height: '32px', borderRadius: '50%', background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 700, fontSize: '0.85rem', color: 'var(--text-muted)' }}>2</div>
                <div>
                  <h4 style={{ fontSize: '0.9rem', fontWeight: 600, color: 'var(--text-secondary)' }}>Earn Carbon Badges</h4>
                  <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>Achieve a 7-day green streak and unlock the 'Eco-Warrior' badge.</p>
                </div>
              </div>

              <div style={{ display: 'flex', gap: '16px', position: 'relative', zIndex: 2 }}>
                <div style={{ width: '32px', height: '32px', borderRadius: '50%', background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 700, fontSize: '0.85rem', color: 'var(--text-muted)' }}>3</div>
                <div>
                  <h4 style={{ fontSize: '0.9rem', fontWeight: 600, color: 'var(--text-secondary)' }}>Plant Your Forest</h4>
                  <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>Earn 1,000 points to plant your first digital seedling and expand your carbon sink.</p>
                </div>
              </div>

            </div>
          </div>

        </div>

        {/* RIGHT COLUMN: MICRO-CHALLENGES LIST */}
        <div className="glass-panel" style={{ padding: '24px' }}>
          <h3 style={{ fontSize: '1.25rem', marginBottom: '8px' }}>Active Carbon Quests</h3>
          <p style={{ color: 'var(--text-secondary)', fontSize: '0.85rem', marginBottom: '24px' }}>Accept micro-challenges to trim emissions and gain points.</p>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            {CHALLENGES_DATABASE.map((challenge) => {
              const IconComp = challenge.icon;
              const isAccepted = acceptedChallenges.includes(challenge.id);
              const isCompleted = completedChallenges.includes(challenge.id);

              return (
                <div 
                  key={challenge.id} 
                  style={{
                    background: 'rgba(255,255,255,0.01)',
                    border: '1px solid',
                    borderColor: isAccepted 
                      ? 'rgba(16, 185, 129, 0.2)' 
                      : isCompleted 
                        ? 'rgba(255,255,255,0.03)' 
                        : 'rgba(255,255,255,0.05)',
                    borderRadius: '12px',
                    padding: '18px',
                    display: 'flex',
                    flexDirection: 'column',
                    gap: '12px',
                    opacity: isCompleted ? 0.55 : 1,
                    transition: 'var(--transition)'
                  }}
                >
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                    <div style={{ display: 'flex', gap: '12px', alignItems: 'center' }}>
                      <div style={{ background: `rgba(255,255,255,0.03)`, border: `1px solid ${challenge.color}`, padding: '10px', borderRadius: '8px' }}>
                        <IconComp style={{ color: challenge.color, width: '20px', height: '20px' }} />
                      </div>
                      <div>
                        <h4 style={{ fontSize: '1rem', fontWeight: 700, color: '#fff' }}>{challenge.title}</h4>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginTop: '4px' }}>
                          <span style={{ fontSize: '0.75rem', color: challenge.color, fontWeight: 600 }}>{challenge.impact}</span>
                        </div>
                      </div>
                    </div>
                    <span className="tag" style={{ background: 'rgba(245, 158, 11, 0.12)', color: 'var(--accent-yellow)', border: '1px solid rgba(245, 158, 11, 0.2)' }}>
                      +{challenge.points} XP
                    </span>
                  </div>

                  <p style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', lineHeight: '1.5' }}>
                    {challenge.description}
                  </p>

                  <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: '4px' }}>
                    {isCompleted ? (
                      <div style={{ display: 'flex', alignItems: 'center', gap: '6px', color: 'var(--accent-primary)', fontSize: '0.8rem', fontWeight: 600 }}>
                        <CheckCircle2 style={{ width: '16px', height: '16px' }} />
                        Completed & Rewarded
                      </div>
                    ) : isAccepted ? (
                      <button 
                        onClick={() => handleCompleteChallenge(challenge.id, challenge.points)}
                        className="btn-primary animate-pulse-glow"
                        style={{ padding: '6px 14px', fontSize: '0.75rem' }}
                      >
                        <Trophy style={{ width: '14px', height: '14px' }} />
                        Complete Challenge
                      </button>
                    ) : (
                      <button 
                        onClick={() => handleAcceptChallenge(challenge.id)}
                        className="btn-secondary"
                        style={{ padding: '6px 14px', fontSize: '0.75rem' }}
                      >
                        Accept Quest
                        <ChevronRight style={{ width: '14px', height: '14px' }} />
                      </button>
                    )}
                  </div>

                </div>
              );
            })}
          </div>

        </div>

      </div>

    </div>
  );
}
