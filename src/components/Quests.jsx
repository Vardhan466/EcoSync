import React, { useState } from 'react';
import { Trophy, Flame, Award, Users, Compass, ChevronRight, Check, Star, ShieldAlert } from 'lucide-react';

const CAMPUS_LEADERBOARD = [
  { rank: 1, name: 'Oakwood University', members: 412, saving: 8940, points: 14200, isUser: false },
  { rank: 2, name: 'Greenwood Heights Campus', members: 320, saving: 7420, points: 12100, isUser: false },
  { rank: 3, name: 'Sutton Science College', members: 210, saving: 5410, points: 9800, isUser: false },
  { rank: 4, name: 'Westminster Polytechnic', members: 185, saving: 4210, points: 7600, isUser: false },
  { rank: 5, name: 'Your Campus (EcoSync Team)', members: 12, saving: 840, points: 1250, isUser: true }
];

const NEIGHBORHOOD_LEADERBOARD = [
  { rank: 1, name: 'Emerald Valley District', members: 640, saving: 15400, points: 24500, isUser: false },
  { rank: 2, name: 'Riverdale Green Sector', members: 480, saving: 11200, points: 19800, isUser: false },
  { rank: 3, name: 'Sunnyvale Eco-Village', members: 350, saving: 9200, points: 15600, isUser: false },
  { rank: 4, name: 'Parkside Commons', members: 110, saving: 2800, points: 4100, isUser: false },
  { rank: 5, name: 'Your Neighborhood (Greenwood)', members: 4, saving: 650, points: 1250, isUser: true }
];

const BADGES = [
  { id: 'b-1', name: 'Climate Rookie', desc: 'Reach 100 XP carbon mitigation score.', reqXP: 100, icon: Award, color: '#06b6d4' },
  { id: 'b-2', name: 'First Sapling', desc: 'Plant 1 virtual tree in the community forest.', reqXP: 300, icon: Star, color: '#10b981' },
  { id: 'b-3', name: 'Eco-Warrior', desc: 'Maintain a 5-day active logging streak.', reqXP: 600, icon: Flame, color: '#f59e0b' },
  { id: 'b-4', name: 'Net-Zero Guardian', desc: 'Achieve Level 3 Eco-Mitigator (1,000 XP).', reqXP: 1000, icon: Trophy, color: '#8b5cf6' }
];

export default function Quests({ points, streak, treesPlanted }) {
  const [boardType, setBoardType] = useState('campus'); // 'campus' or 'neighborhood'
  
  const currentLeaderboard = boardType === 'campus' ? CAMPUS_LEADERBOARD : NEIGHBORHOOD_LEADERBOARD;
  
  // Calculate level based on points (500 points per level)
  const userLevel = Math.floor(points / 500) + 1;
  const xpInCurrentLevel = points % 500;
  const levelProgressPercentage = Math.round((xpInCurrentLevel / 500) * 100);

  const getRankBadge = (rank) => {
    if (rank === 1) return <span style={{ color: '#ffd700', fontSize: '1.2rem', fontWeight: 800 }}>🥇</span>;
    if (rank === 2) return <span style={{ color: '#c0c0c0', fontSize: '1.2rem', fontWeight: 800 }}>🥈</span>;
    if (rank === 3) return <span style={{ color: '#cd7f32', fontSize: '1.2rem', fontWeight: 800 }}>🥉</span>;
    return <span style={{ color: 'var(--text-muted)', fontWeight: 600 }}>{rank}</span>;
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '32px' }}>
      
      {/* HEADER */}
      <div>
        <h2 style={{ fontSize: '2rem', fontWeight: 800 }}>Eco Quests & Leaderboard</h2>
        <p style={{ color: 'var(--text-secondary)' }}>Track your level progression, streaks, unlock badges, and check community rankings.</p>
      </div>

      {/* GAMIFICATION STATS GRID */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '24px' }}>
        
        {/* Streak card */}
        <div className="glass-panel" style={{ padding: '24px', display: 'flex', alignItems: 'center', gap: '20px' }}>
          <div 
            style={{ 
              background: 'rgba(239, 68, 68, 0.12)', 
              padding: '16px', 
              borderRadius: '50%', 
              border: '1px solid rgba(239, 68, 68, 0.2)',
              boxShadow: streak > 0 ? '0 0 20px rgba(239, 68, 68, 0.3)' : 'none'
            }}
            className={streak > 0 ? 'animate-float' : ''}
          >
            <Flame style={{ color: streak > 0 ? '#ef4444' : 'var(--text-muted)', width: '32px', height: '32px' }} />
          </div>
          <div>
            <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', fontWeight: 600 }}>LOGGING STREAK</div>
            <h3 style={{ fontSize: '2rem', fontWeight: 800, color: streak > 0 ? '#ef4444' : 'var(--text-primary)' }}>
              {streak} {streak === 1 ? 'Day' : 'Days'}
            </h3>
            <p style={{ color: 'var(--text-secondary)', fontSize: '0.8rem', marginTop: '2px' }}>
              {streak > 0 ? 'Keep logging daily to maintain your carbon-neutral streak!' : 'Log an activity today to start a streak.'}
            </p>
          </div>
        </div>

        {/* Level Progression card */}
        <div className="glass-panel" style={{ padding: '24px', display: 'flex', flexDirection: 'column', gap: '12px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <div>
              <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', fontWeight: 600 }}>MITIGATOR LEVEL</div>
              <h3 style={{ fontSize: '1.4rem', fontWeight: 800 }}>Lvl {userLevel} - {userLevel === 1 ? 'Rookie' : userLevel === 2 ? 'Explorer' : 'Guardian'}</h3>
            </div>
            <span style={{ fontSize: '0.8rem', color: 'var(--accent-secondary)', fontWeight: 700 }}>{points} XP Total</span>
          </div>
          
          <div style={{ width: '100%', height: '8px', background: 'rgba(255,255,255,0.05)', borderRadius: '4px', overflow: 'hidden' }}>
            <div 
              style={{ 
                width: `${levelProgressPercentage}%`, 
                height: '100%', 
                background: 'linear-gradient(90deg, var(--accent-primary), var(--accent-secondary))',
                borderRadius: '4px',
                transition: 'width 0.5s ease'
              }} 
            />
          </div>
          <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.75rem', color: 'var(--text-muted)' }}>
            <span>{xpInCurrentLevel} XP</span>
            <span>{500 - xpInCurrentLevel} XP to Lvl {userLevel + 1}</span>
          </div>
        </div>

        {/* Trees Planted card */}
        <div className="glass-panel" style={{ padding: '24px', display: 'flex', alignItems: 'center', gap: '20px' }}>
          <div style={{ background: 'rgba(16, 185, 129, 0.12)', padding: '16px', borderRadius: '50%', border: '1px solid rgba(16, 185, 129, 0.2)' }}>
            <Award style={{ color: 'var(--accent-primary)', width: '32px', height: '32px' }} />
          </div>
          <div>
            <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', fontWeight: 600 }}>TREES PLANTED</div>
            <h3 style={{ fontSize: '2rem', fontWeight: 800, color: 'var(--accent-primary)' }}>{treesPlanted}</h3>
            <p style={{ color: 'var(--text-secondary)', fontSize: '0.8rem', marginTop: '2px' }}>
              Every 300 XP logs a digital tree in your forest.
            </p>
          </div>
        </div>

      </div>

      {/* TWO PANEL ROW: LEADERBOARD & BADGES */}
      <div style={{ display: 'grid', gridTemplateColumns: '1.2fr 1fr', gap: '32px', alignItems: 'start' }}>
        
        {/* LEADERBOARD CARD */}
        <div className="glass-panel" style={{ padding: '24px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px', flexWrap: 'wrap', gap: '12px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <Users style={{ color: 'var(--accent-secondary)' }} />
              <h3 style={{ fontSize: '1.2rem' }}>Community Leaderboard</h3>
            </div>
            
            {/* Toggle buttons */}
            <div style={{ display: 'flex', background: 'rgba(0,0,0,0.2)', padding: '4px', borderRadius: '8px', border: '1px solid rgba(255,255,255,0.05)' }}>
              <button 
                onClick={() => setBoardType('campus')}
                style={{
                  padding: '6px 12px',
                  borderRadius: '6px',
                  border: 'none',
                  fontSize: '0.75rem',
                  fontWeight: 600,
                  cursor: 'pointer',
                  background: boardType === 'campus' ? 'rgba(255,255,255,0.08)' : 'transparent',
                  color: boardType === 'campus' ? '#fff' : 'var(--text-secondary)',
                  transition: 'var(--transition)'
                }}
              >
                Campuses
              </button>
              <button 
                onClick={() => setBoardType('neighborhood')}
                style={{
                  padding: '6px 12px',
                  borderRadius: '6px',
                  border: 'none',
                  fontSize: '0.75rem',
                  fontWeight: 600,
                  cursor: 'pointer',
                  background: boardType === 'neighborhood' ? 'rgba(255,255,255,0.08)' : 'transparent',
                  color: boardType === 'neighborhood' ? '#fff' : 'var(--text-secondary)',
                  transition: 'var(--transition)'
                }}
              >
                Neighborhoods
              </button>
            </div>
          </div>

          {/* Table display */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
            {currentLeaderboard.map((item, index) => (
              <div 
                key={index} 
                style={{
                  display: 'grid',
                  gridTemplateColumns: '40px 1.5fr 80px 100px 80px',
                  alignItems: 'center',
                  padding: '12px 16px',
                  background: item.isUser ? 'rgba(6, 182, 212, 0.1)' : 'rgba(255,255,255,0.01)',
                  border: '1px solid',
                  borderColor: item.isUser ? 'rgba(6, 182, 212, 0.25)' : 'rgba(255,255,255,0.04)',
                  borderRadius: '10px',
                  fontSize: '0.85rem'
                }}
              >
                <div style={{ display: 'flex', justifyContent: 'center' }}>
                  {getRankBadge(item.rank)}
                </div>
                <div style={{ fontWeight: item.isUser ? 700 : 500, color: item.isUser ? 'var(--accent-secondary)' : '#fff' }}>
                  {item.isUser ? `${item.name} (You)` : item.name}
                </div>
                <div style={{ color: 'var(--text-secondary)' }}>{item.members} acts</div>
                <div style={{ color: 'var(--accent-primary)', fontWeight: 600 }}>
                  -{item.saving.toLocaleString()} kg CO₂
                </div>
                <div style={{ textAlign: 'right', fontWeight: 700, color: 'var(--accent-yellow)' }}>
                  {item.isUser ? points : item.points} XP
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* BADGES COLLECTION CARD */}
        <div className="glass-panel" style={{ padding: '24px' }}>
          <h3 style={{ fontSize: '1.2rem', marginBottom: '16px', display: 'flex', alignItems: 'center', gap: '8px' }}>
            <Award style={{ color: 'var(--accent-primary)' }} />
            Mitigation Badges
          </h3>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr', gap: '16px' }}>
            {BADGES.map((badge) => {
              const BadgeIcon = badge.icon;
              const isUnlocked = points >= badge.reqXP;

              return (
                <div 
                  key={badge.id}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '16px',
                    padding: '12px',
                    background: 'rgba(255,255,255,0.01)',
                    border: '1px solid rgba(255,255,255,0.04)',
                    borderRadius: '10px',
                    opacity: isUnlocked ? 1 : 0.45,
                    position: 'relative'
                  }}
                >
                  <div 
                    style={{
                      background: isUnlocked ? `rgba(${badge.color === '#06b6d4' ? '6, 182, 212' : badge.color === '#10b981' ? '16, 185, 129' : badge.color === '#f59e0b' ? '245, 158, 11' : '139, 92, 246'}, 0.12)` : 'rgba(255,255,255,0.02)',
                      border: `1px dashed ${isUnlocked ? badge.color : 'rgba(255,255,255,0.2)'}`,
                      padding: '12px',
                      borderRadius: '50%'
                    }}
                  >
                    <BadgeIcon style={{ color: isUnlocked ? badge.color : 'var(--text-muted)', width: '24px', height: '24px' }} />
                  </div>
                  <div>
                    <h4 style={{ fontSize: '0.9rem', fontWeight: 700, color: isUnlocked ? '#fff' : 'var(--text-secondary)' }}>
                      {badge.name}
                    </h4>
                    <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: '2px' }}>{badge.desc}</p>
                  </div>
                  
                  {isUnlocked && (
                    <div style={{ position: 'absolute', top: '10px', right: '10px', background: 'rgba(16,185,129,0.15)', color: 'var(--accent-primary)', width: '18px', height: '18px', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                      <Check style={{ width: '10px', height: '10px', strokeWidth: 3 }} />
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>

      </div>

    </div>
  );
}
