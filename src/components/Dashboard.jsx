import React, { useState, useEffect } from 'react';
import { 
  ResponsiveContainer, LineChart, Line, XAxis, YAxis, CartesianGrid, 
  Tooltip, Legend, PieChart, Pie, Cell 
} from 'recharts';
import { Leaf, ShieldAlert, Sparkles, Sliders, Calendar, Zap, Car, Utensils, Trash2 } from 'lucide-react';
import { projectNetZero, EMISSION_FACTORS } from '../utils/carbonCalculator';

export default function Dashboard({ habits, setHabits, ledgerItems }) {
  // Local state for sliders, initialized with current habits
  const [transportKm, setTransportKm] = useState(habits.transportKmPerWeek);
  const [transportType, setTransportType] = useState(habits.transportType);
  const [beefMeals, setBeefMeals] = useState(habits.beefMealsPerWeek);
  const [poultryMeals, setPoultryMeals] = useState(habits.poultryMealsPerWeek);
  const [vegMeals, setVegMeals] = useState(habits.vegMealsPerWeek);
  const [veganMeals, setVeganMeals] = useState(habits.veganMealsPerWeek);
  const [kwh, setKwh] = useState(habits.kwhPerMonth);
  const [renewable, setRenewable] = useState(habits.renewablePercentage);
  const [wasteKg, setWasteKg] = useState(habits.wasteKgPerWeek);
  const [recycling, setRecycling] = useState(habits.recyclingPercentage);

  // Sync state changes back to parent
  useEffect(() => {
    setHabits({
      transportKmPerWeek: transportKm,
      transportType,
      beefMealsPerWeek: beefMeals,
      poultryMealsPerWeek: poultryMeals,
      vegMealsPerWeek: vegMeals,
      veganMealsPerWeek: veganMeals,
      kwhPerMonth: kwh,
      renewablePercentage: renewable,
      wasteKgPerWeek: wasteKg,
      recyclingPercentage: recycling
    });
  }, [transportKm, transportType, beefMeals, poultryMeals, vegMeals, veganMeals, kwh, renewable, wasteKg, recycling]);

  // Calculate stats based on current habits
  const stats = projectNetZero(habits);

  // Calculate actual ledger emissions logged this week
  const thisWeekLedgerTotal = ledgerItems.reduce((acc, item) => acc + item.co2e, 0);
  const weeklyBudget = 52.0; // 52 kg CO2e is standard budget to stay on track for Paris Agreement (2.7 tonnes/year per capita)
  const budgetPercentage = Math.min(Math.round((thisWeekLedgerTotal / weeklyBudget) * 100), 100);

  // Recharts Donut data
  const pieData = [
    { name: 'Transport', value: stats.annualTransport, color: '#06b6d4' },
    { name: 'Food', value: stats.annualFood, color: '#10b981' },
    { name: 'Energy', value: stats.annualEnergy, color: '#f59e0b' },
    { name: 'Waste', value: stats.annualWaste, color: '#8b5cf6' }
  ].filter(d => d.value > 0);

  // Recharts Projection Data (Current vs Net Zero Target)
  const getProjectionData = () => {
    const data = [];
    const currentYear = new Date().getFullYear();
    let currentEmissions = stats.totalAnnual;
    // Target emissions dropping by 8% per year to hit target
    let targetEmissions = stats.totalAnnual;
    
    for (let year = currentYear; year <= 2050; year += 4) {
      data.push({
        year: year.toString(),
        'Unchanged Pathway': Math.round(currentEmissions),
        'EcoSync Pathway': Math.round(targetEmissions)
      });
      // Unchanged pathway slightly increases due to tech/standard habits (or flatlines)
      currentEmissions = currentEmissions * 0.99; 
      // EcoSync pathway drops
      targetEmissions = targetEmissions * 0.70; // 30% reduction every 4 years
      if (targetEmissions < 300) targetEmissions = 0; // complete carbon neutral
    }
    return data;
  };

  const projectionData = getProjectionData();

  // Color helper based on budget consumption
  const getBudgetColor = () => {
    if (thisWeekLedgerTotal > weeklyBudget) return '#ef4444'; // Red
    if (thisWeekLedgerTotal > weeklyBudget * 0.8) return '#f59e0b'; // Yellow
    return '#10b981'; // Green
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '32px' }}>
      
      {/* HEADER SECTION */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '16px' }}>
        <div>
          <h2 style={{ fontSize: '2rem', fontWeight: 800 }}>Environmental Impact Overview</h2>
          <p style={{ color: 'var(--text-secondary)' }}>Log actions, simulate choices, and track your path to net-zero carbon footprint.</p>
        </div>
        <div className="glass-panel" style={{ display: 'flex', alignItems: 'center', gap: '12px', padding: '10px 18px', borderLeft: '4px solid var(--accent-primary)' }}>
          <Leaf style={{ color: 'var(--accent-primary)', width: '20px', height: '20px' }} className="animate-float" />
          <div>
            <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', fontWeight: 600 }}>WEEKLY CARBON BUDGET</div>
            <div style={{ fontWeight: 700, fontSize: '1rem' }}>
              <span style={{ color: getBudgetColor() }}>{thisWeekLedgerTotal.toFixed(1)}</span> / {weeklyBudget} kg CO₂e
            </div>
          </div>
        </div>
      </div>

      {/* TOP STATS CARDS */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '24px' }}>
        
        {/* Weekly budget radial gauge */}
        <div className="glass-panel" style={{ padding: '24px', display: 'flex', alignItems: 'center', gap: '24px' }}>
          <div style={{ position: 'relative', width: '100px', height: '100px', flexShrink: 0 }}>
            {/* SVG Arc Gauge */}
            <svg width="100" height="100" viewBox="0 0 100 100">
              <circle cx="50" cy="50" r="40" fill="transparent" stroke="rgba(255, 255, 255, 0.05)" strokeWidth="8" />
              <circle cx="50" cy="50" r="40" fill="transparent" 
                stroke={getBudgetColor()} 
                strokeWidth="8" 
                strokeDasharray={`${2.51 * budgetPercentage} 251`}
                strokeLinecap="round" 
                transform="rotate(-90 50 50)"
                style={{ transition: 'stroke-dasharray 0.5s ease' }}
              />
            </svg>
            <div style={{ position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%, -50%)', textAlign: 'center' }}>
              <span style={{ fontSize: '1.4rem', fontWeight: 800 }}>{budgetPercentage}%</span>
            </div>
          </div>
          <div>
            <h3 style={{ fontSize: '1.1rem', marginBottom: '4px' }}>Carbon Allowance Used</h3>
            <p style={{ color: 'var(--text-secondary)', fontSize: '0.85rem' }}>
              {thisWeekLedgerTotal > weeklyBudget 
                ? "You've exceeded your safe weekly carbon budget." 
                : `${(weeklyBudget - thisWeekLedgerTotal).toFixed(1)} kg remaining to meet climate alignment goals.`
              }
            </p>
          </div>
        </div>

        {/* Projected Net Zero Year */}
        <div className="glass-panel-glow" style={{ padding: '24px', position: 'relative', overflow: 'hidden' }}>
          <div style={{ position: 'absolute', top: '-10px', right: '-10px', opacity: 0.15 }}>
            <Calendar style={{ width: '120px', height: '120px', color: 'var(--accent-secondary)' }} />
          </div>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px' }}>
              <Sparkles style={{ color: 'var(--accent-secondary)', width: '16px', height: '16px' }} />
              <span style={{ fontSize: '0.8rem', color: 'var(--accent-secondary)', fontWeight: 700, letterSpacing: '0.05em' }}>PROJECTED NET ZERO TARGET</span>
            </div>
            <h3 style={{ fontSize: '2.8rem', fontWeight: 800, lineHeight: 1.1 }} className="gradient-text">
              {stats.netZeroYear}
            </h3>
            <p style={{ color: 'var(--text-secondary)', fontSize: '0.85rem', marginTop: '6px' }}>
              Based on your simulated lifestyle choice. Adjust the sliders below to accelerate this date!
            </p>
          </div>
        </div>

        {/* Total Annual Projection */}
        <div className="glass-panel" style={{ padding: '24px' }}>
          <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', fontWeight: 600, marginBottom: '4px' }}>ESTIMATED ANNUAL CO₂e</div>
          <h3 style={{ fontSize: '2.2rem', fontWeight: 800 }}>{(stats.totalAnnual / 1000).toFixed(2)} <span style={{ fontSize: '1.2rem', fontWeight: 500, color: 'var(--text-secondary)' }}>tonnes</span></h3>
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginTop: '12px' }}>
            <span className={`tag ${stats.totalAnnual < 4000 ? 'tag-green' : stats.totalAnnual < 8000 ? 'tag-yellow' : 'tag-red'}`}>
              {stats.totalAnnual < 4000 ? 'Low Footprint' : stats.totalAnnual < 8000 ? 'Average' : 'High Footprint'}
            </span>
            <span style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>vs 8.0t national average</span>
          </div>
        </div>

      </div>

      {/* GRAPH & SLIDERS INTERACTIVE SECTION */}
      <div style={{ display: 'grid', gridTemplateColumns: '1.2fr 1fr', gap: '24px', flexWrap: 'wrap' }}>
        
        {/* LEFT PANEL: WHAT-IF SCENARIO SIMULATOR (SLIDERS) */}
        <div className="glass-panel" style={{ padding: '24px', display: 'flex', flexDirection: 'column', gap: '24px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <Sliders style={{ color: 'var(--accent-primary)' }} />
            <div>
              <h3 style={{ fontSize: '1.25rem' }}>"What-If" Scenario Simulator</h3>
              <p style={{ color: 'var(--text-secondary)', fontSize: '0.85rem' }}>Drag elements to see how green habits reshape your footprint.</p>
            </div>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
            
            {/* 1. TRANSPORTATION */}
            <div style={{ background: 'rgba(255,255,255,0.02)', padding: '16px', borderRadius: '12px', border: '1px solid rgba(255,255,255,0.03)' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <Car style={{ color: '#06b6d4', width: '18px', height: '18px' }} />
                  <span style={{ fontWeight: 600 }}>Transit Footprint</span>
                </div>
                <span className="tag tag-blue">{transportKm} km/wk</span>
              </div>
              <div className="slider-container" style={{ marginBottom: '12px' }}>
                <input 
                  type="range" 
                  min="0" 
                  max="300" 
                  value={transportKm} 
                  onChange={(e) => setTransportKm(Number(e.target.value))} 
                  className="custom-slider"
                  style={{ background: 'rgba(6, 182, 212, 0.15)' }}
                />
              </div>
              <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
                {Object.keys(EMISSION_FACTORS.transport).map((typeKey) => {
                  const displayNames = {
                    petrol_suv: 'SUV',
                    petrol_car: 'Petrol Car',
                    electric_car: 'Electric',
                    metro_train: 'Train/Metro',
                    bus: 'Bus',
                    bicycle_walk: 'Active'
                  };
                  return (
                    <button 
                      key={typeKey} 
                      onClick={() => setTransportType(typeKey)}
                      style={{
                        padding: '6px 12px',
                        borderRadius: '8px',
                        fontSize: '0.75rem',
                        border: '1px solid',
                        borderColor: transportType === typeKey ? 'var(--accent-secondary)' : 'rgba(255,255,255,0.08)',
                        background: transportType === typeKey ? 'rgba(6, 182, 212, 0.15)' : 'transparent',
                        color: transportType === typeKey ? '#06b6d4' : 'var(--text-secondary)',
                        cursor: 'pointer',
                        transition: 'var(--transition)'
                      }}
                    >
                      {displayNames[typeKey]}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* 2. DIET */}
            <div style={{ background: 'rgba(255,255,255,0.02)', padding: '16px', borderRadius: '12px', border: '1px solid rgba(255,255,255,0.03)' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '12px' }}>
                <Utensils style={{ color: '#10b981', width: '18px', height: '18px' }} />
                <span style={{ fontWeight: 600 }}>Diet & Food Meals (per week)</span>
              </div>
              
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.75rem' }}>
                    <span style={{ color: 'var(--text-secondary)' }}>Meat</span>
                    <span style={{ color: 'var(--accent-red)', fontWeight: 600 }}>{beefMeals}</span>
                  </div>
                  <input 
                    type="range" min="0" max="21" value={beefMeals} 
                    onChange={(e) => setBeefMeals(Number(e.target.value))} 
                    className="custom-slider" 
                  />
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.75rem' }}>
                    <span style={{ color: 'var(--text-secondary)' }}>Chicken</span>
                    <span style={{ color: 'var(--accent-yellow)', fontWeight: 600 }}>{poultryMeals}</span>
                  </div>
                  <input 
                    type="range" min="0" max="21" value={poultryMeals} 
                    onChange={(e) => setPoultryMeals(Number(e.target.value))} 
                    className="custom-slider" 
                  />
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.75rem' }}>
                    <span style={{ color: 'var(--text-secondary)' }}>Vegetarian</span>
                    <span style={{ color: 'var(--accent-primary)', fontWeight: 600 }}>{vegMeals}</span>
                  </div>
                  <input 
                    type="range" min="0" max="21" value={vegMeals} 
                    onChange={(e) => setVegMeals(Number(e.target.value))} 
                    className="custom-slider" 
                  />
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.75rem' }}>
                    <span style={{ color: 'var(--text-secondary)' }}>Vegan</span>
                    <span style={{ color: 'var(--accent-secondary)', fontWeight: 600 }}>{veganMeals}</span>
                  </div>
                  <input 
                    type="range" min="0" max="21" value={veganMeals} 
                    onChange={(e) => setVeganMeals(Number(e.target.value))} 
                    className="custom-slider" 
                  />
                </div>
              </div>
            </div>

            {/* 3. HOME ENERGY */}
            <div style={{ background: 'rgba(255,255,255,0.02)', padding: '16px', borderRadius: '12px', border: '1px solid rgba(255,255,255,0.03)' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <Zap style={{ color: '#f59e0b', width: '18px', height: '18px' }} />
                  <span style={{ fontWeight: 600 }}>Household Energy</span>
                </div>
                <span className="tag tag-yellow">{kwh} kWh/mo</span>
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                <div className="slider-container">
                  <input 
                    type="range" min="50" max="800" value={kwh} 
                    onChange={(e) => setKwh(Number(e.target.value))} 
                    className="custom-slider"
                    style={{ background: 'rgba(245, 158, 11, 0.15)' }}
                  />
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <span style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>Clean Renewable Percentage:</span>
                  <span style={{ color: 'var(--accent-secondary)', fontWeight: 700, fontSize: '0.85rem' }}>{renewable}%</span>
                </div>
                <div className="slider-container">
                  <input 
                    type="range" min="0" max="100" value={renewable} 
                    onChange={(e) => setRenewable(Number(e.target.value))} 
                    className="custom-slider"
                    style={{ background: 'rgba(6, 182, 212, 0.15)' }}
                  />
                </div>
              </div>
            </div>

            {/* 4. WASTE */}
            <div style={{ background: 'rgba(255,255,255,0.02)', padding: '16px', borderRadius: '12px', border: '1px solid rgba(255,255,255,0.03)' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <Trash2 style={{ color: '#8b5cf6', width: '18px', height: '18px' }} />
                  <span style={{ fontWeight: 600 }}>Household Waste & Recycling</span>
                </div>
                <span className="tag tag-purple">{wasteKg} kg/wk</span>
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                <div className="slider-container">
                  <input 
                    type="range" min="1" max="50" value={wasteKg} 
                    onChange={(e) => setWasteKg(Number(e.target.value))} 
                    className="custom-slider"
                    style={{ background: 'rgba(139, 92, 246, 0.15)' }}
                  />
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <span style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>Recycling Ratio:</span>
                  <span style={{ color: 'var(--accent-primary)', fontWeight: 700, fontSize: '0.85rem' }}>{recycling}%</span>
                </div>
                <div className="slider-container">
                  <input 
                    type="range" min="0" max="100" value={recycling} 
                    onChange={(e) => setRecycling(Number(e.target.value))} 
                    className="custom-slider"
                    style={{ background: 'rgba(16, 185, 129, 0.15)' }}
                  />
                </div>
              </div>
            </div>

          </div>
        </div>

        {/* RIGHT PANEL: CHARTS & STATS */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
          
          {/* Pie Chart Card */}
          <div className="glass-panel" style={{ padding: '24px', flex: 1, minHeight: '320px', display: 'flex', flexDirection: 'column' }}>
            <h3 style={{ fontSize: '1.1rem', marginBottom: '16px' }}>Carbon Emission Sources</h3>
            <div style={{ flex: 1, display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
              <ResponsiveContainer width="100%" height={200}>
                <PieChart>
                  <Pie
                    data={pieData}
                    cx="50%"
                    cy="50%"
                    innerRadius={55}
                    outerRadius={75}
                    paddingAngle={5}
                    dataKey="value"
                  >
                    {pieData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip 
                    contentStyle={{ background: '#0f172a', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '8px' }} 
                    itemStyle={{ color: 'var(--text-primary)' }}
                  />
                </PieChart>
              </ResponsiveContainer>
            </div>
            
            {/* Custom Legend */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px', marginTop: '16px' }}>
              {pieData.map((item, index) => (
                <div key={index} style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '0.85rem' }}>
                  <div style={{ width: '12px', height: '12px', borderRadius: '3px', background: item.color }} />
                  <span style={{ color: 'var(--text-secondary)' }}>{item.name}:</span>
                  <span style={{ fontWeight: 600 }}>{Math.round(item.value)} kg</span>
                </div>
              ))}
            </div>
          </div>

          {/* Line Chart Project Pathway Card */}
          <div className="glass-panel" style={{ padding: '24px', flex: 1.2, minHeight: '340px' }}>
            <h3 style={{ fontSize: '1.1rem', marginBottom: '8px' }}>Climate Trajectory to 2050</h3>
            <p style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', marginBottom: '16px' }}>
              Annual projections (kg CO₂e) of your lifestyle compared to Paris Climate Agreement pathway.
            </p>
            <div style={{ width: '100%', height: '200px' }}>
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={projectionData} margin={{ top: 5, right: 5, left: -25, bottom: 5 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
                  <XAxis dataKey="year" stroke="var(--text-muted)" fontSize={11} />
                  <YAxis stroke="var(--text-muted)" fontSize={11} />
                  <Tooltip
                    contentStyle={{ background: '#0f172a', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '8px' }}
                    labelStyle={{ color: 'var(--text-secondary)', fontWeight: 600 }}
                  />
                  <Legend verticalAlign="bottom" height={36} iconType="circle" wrapperStyle={{ fontSize: '11px', paddingTop: '10px' }} />
                  <Line type="monotone" dataKey="Unchanged Pathway" stroke="#ef4444" strokeWidth={2} dot={false} activeDot={{ r: 6 }} />
                  <Line type="monotone" dataKey="EcoSync Pathway" stroke="#10b981" strokeWidth={3} dot={false} activeDot={{ r: 6 }} />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </div>

        </div>

      </div>

    </div>
  );
}
