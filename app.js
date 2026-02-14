import React, { useState, useEffect, useMemo } from 'react';
import { DndProvider, useDrag, useDrop } from 'react-dnd';
import { HTML5Backend } from 'react-dnd-html5-backend';

// --- 1. GENE DATABASE GENERATOR ---
const generateLibrary = () => {
  const base = {
    Human: [
      { id: 'h_1', name: 'Neural Pathway (Age 0-5)', origin: 'Human', type: 'base' },
      { id: 'h_2', name: 'Neural Pathway (Age 6-20)', origin: 'Human', type: 'base' },
      { id: 'h_3', name: 'Skeletal Density (Male)', origin: 'Human', type: 'base' },
      { id: 'h_4', name: 'Skeletal Density (Female)', origin: 'Human', type: 'base' },
    ],
    Felines: [
      { id: 'f_1', name: 'Cheetah Sprints (ACTN3)', origin: 'Cheetah', ability: 'Speed' },
      { id: 'f_2', name: 'Puma Vertical Leap', origin: 'Puma', ability: 'Leap' },
      { id: 'f_3', name: 'Night Vision (Tapetum)', origin: 'Leopard', ability: 'Visual' },
    ],
    "Deep Sea": [
      { id: 'd_1', name: 'Pressure Resistance', origin: 'Blobfish', ability: 'Durability' },
      { id: 'd_2', name: 'Bio-Luminescence', origin: 'Anglerfish', ability: 'Visual' },
    ]
  };

  for (let i = 1; i <= 100; i++) {
    base["Theoretical Lab"] = base["Theoretical Lab"] || [];
    base["Theoretical Lab"].push({
      id: `t_${i}`,
      name: `Synthetic Strand #${1000 + i}`,
      origin: 'Lab',
      ability: i % 2 === 0 ? 'Speed' : 'Durability'
    });
  }
  return base;
};

const GENE_LIBRARY = generateLibrary();

const GeneBlock = ({ gene }) => {
  const [{ isDragging }, drag] = useDrag(() => ({
    type: 'GENE',
    item: { gene },
    collect: (monitor) => ({ isDragging: !!monitor.isDragging() })
  }));

  return (
    <div ref={drag} style={{
      padding: '8px', margin: '5px 0', border: '1px solid #00ff00',
      backgroundColor: isDragging ? '#333' : '#111', cursor: 'grab', color: '#00ff00',
      fontSize: '11px', textTransform: 'uppercase'
    }}>
      {gene.name} <span style={{color: '#555', fontSize: '9px'}}>[{gene.origin}]</span>
    </div>
  );
};

export default function App() {
  const [activeGenes, setActiveGenes] = useState([]);
  const [logs, setLogs] = useState(["[SYSTEM]: Lab Online. Bioshields at 100%."]);
  const [searchTerm, setSearchTerm] = useState("");

  const filteredLibrary = useMemo(() => {
    if (!searchTerm) return GENE_LIBRARY;
    const filtered = {};
    Object.keys(GENE_LIBRARY).forEach(cat => {
      const matches = GENE_LIBRARY[cat].filter(g => 
        g.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
        g.origin.toLowerCase().includes(searchTerm.toLowerCase())
      );
      if (matches.length > 0) filtered[cat] = matches;
    });
    return filtered;
  }, [searchTerm]);

  const handleDrop = (gene) => {
    if (activeGenes.find(g => g.id === gene.id)) return; 
    setActiveGenes(prev => [...prev, gene]);
    let stability = Math.floor(Math.random() * 30) + 70;
    let msg = `[SEQUENCE]: Added ${gene.name}.`;
    if (gene.origin !== 'Human') msg += `\n[OPTIMIZER]: Animal DNA detected. Stability: ${stability}%.`;
    setLogs([msg, ...logs]);
  };

  const clearLab = () => {
    setActiveGenes([]);
    setLogs(["[SYSTEM]: Workspace Purged. Clean Slate.", ...logs]);
  };

  // --- SERUM EXPORT LOGIC ---
  const downloadSerum = () => {
    if (activeGenes.length === 0) {
      alert("No genetic material detected in playground.");
      return;
    }
    const content = `--- GENETIC SERUM PROTOCOL ---\n` +
      `Project Code: GEN-${Math.floor(Math.random() * 9000) + 1000}\n` +
      `Active Strands: ${activeGenes.map(g => g.name).join(', ')}\n\n` +
      `Optimizer Dialect: Human-V1.2\n` +
      `Stability Rating: ${activeGenes.length > 5 ? 'CAUTION: MULTI-ORGANISM COLLAPSE POSSIBLE' : 'STABLE'}\n` +
      `--- END OF DATA ---`;
    
    const element = document.createElement("a");
    const file = new Blob([content], {type: 'text/plain'});
    element.href = URL.createObjectURL(file);
    element.download = "serum_protocol.txt";
    document.body.appendChild(element); 
    element.click();
  };

  const [{ isOver }, drop] = useDrop(() => ({
    accept: 'GENE',
    drop: (item) => handleDrop(item.gene),
    collect: (monitor) => ({ isOver: !!monitor.isOver() })
  }));

  return (
    <DndProvider backend={HTML5Backend}>
      <div style={{ display: 'flex', height: '100vh', backgroundColor: '#000', color: '#00ff00', fontFamily: 'monospace' }}>
        
        {/* SIDEBAR LIBRARY */}
        <div style={{ width: '300px', borderRight: '2px solid #004400', padding: '15px', overflowY: 'auto', background: '#050505', display: 'flex', flexDirection: 'column' }}>
          <div style={{ flex: 1 }}>
            <h2 style={{ fontSize: '1.2em', borderBottom: '1px solid #00ff00' }}>GENE REGISTRY</h2>
            <input 
              type="text" 
              placeholder="Search genes/species..." 
              style={searchStyle} 
              onChange={(e) => setSearchTerm(e.target.value)}
            />
            {Object.keys(filteredLibrary).map(cat => (
              <details key={cat} open={searchTerm.length > 0} style={{ marginTop: '15px' }}>
                <summary style={{ cursor: 'pointer', fontWeight: 'bold', color: '#fff' }}>{cat} ({filteredLibrary[cat].length})</summary>
                {filteredLibrary[cat].map(g => <GeneBlock key={g.id} gene={g} />)}
              </details>
            ))}
          </div>

          {/* DISCLAIMER SECTION */}
          <div style={{ marginTop: '20px', padding: '10px', borderTop: '1px solid #004400', fontSize: '10px', color: '#006600', fontStyle: 'italic' }}>
            <p>** NOTICE: Creating hybrid humans may result in unexpected cravings for tuna, sudden urges to sit in cardboard boxes, or nocturnal zoomies. Use responsibly.</p>
          </div>
        </div>

        {/* MAIN PLAYGROUND */}
        <div ref={drop} style={{ flex: 1, padding: '20px', background: isOver ? '#0a0a0a' : '#000', display: 'flex', flexDirection: 'column' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <h1>PLAYGROUND v1.2</h1>
            <div style={{ display: 'flex', gap: '10px' }}>
              <button onClick={downloadSerum} style={serumBtnStyle}>DOWNLOAD SERUM</button>
              <button onClick={clearLab} style={clearBtnStyle}>WIPE LAB</button>
            </div>
          </div>

          <div style={canvasStyle}>
            {activeGenes.length === 0 && <p style={{opacity: 0.3}}>[WAITING FOR GENE INPUT...]</p>}
            {activeGenes.map((g, i) => (
              <div key={i} style={orbContainer}>
                <div style={orbStyle}></div>
                <p style={{fontSize: '9px'}}>{g.name}</p>
              </div>
            ))}
          </div>
        </div>

        {/* STATS & LOGS */}
        <div style={{ width: '320px', borderLeft: '2px solid #004400', padding: '20px', background: '#050505' }}>
          <h3>DASHBOARD</h3>
          <div style={statBox}>
            <p>🧬 STRANDS: {activeGenes.length}</p>
            <p>🏃 SPEED: {activeGenes.some(g => g.ability === 'Speed') ? '▲ 38 MPH' : '12 MPH'}</p>
            <p>🦘 LEAP: {activeGenes.some(g => g.ability === 'Leap') ? '▲ 18 FT' : '3 FT'}</p>
            <p>👁️ VISION: {activeGenes.some(g => g.ability === 'Visual') ? 'NIGHT SIGHT' : 'NORMAL'}</p>
          </div>
          
          <h3 style={{marginTop: '20px'}}>SYSTEM LOG</h3>
          <div style={logBox}>
            {logs.map((l, i) => <pre key={i} style={{whiteSpace: 'pre-wrap', marginBottom: '10px'}}>> {l}</pre>)}
          </div>
        </div>

      </div>
    </DndProvider>
  );
}

// --- STYLES ---
const searchStyle = { width: '100%', background: '#111', border: '1px solid #00ff00', color: '#00ff00', padding: '8px', marginTop: '10px', fontFamily: 'monospace', outline: 'none' };
const clearBtnStyle = { background: 'none', border: '1px solid #ff0000', color: '#ff0000', padding: '5px 15px', cursor: 'pointer', fontFamily: 'monospace' };
const serumBtnStyle = { background: '#00ff00', border: 'none', color: '#000', fontWeight: 'bold', padding: '5px 15px', cursor: 'pointer', fontFamily: 'monospace' };
const canvasStyle = { flex: 1, border: '1px dashed #004400', borderRadius: '15px', marginTop: '20px', display: 'flex', flexWrap: 'wrap', alignItems: 'center', justifyContent: 'center', gap: '20px', overflowY: 'auto' };
const orbContainer = { width: '100px', textAlign: 'center' };
const orbStyle = { width: '50px', height: '50px', borderRadius: '50%', background: 'radial-gradient(circle, #00ff00 0%, #002200 100%)', margin: '0 auto 8px', boxShadow: '0 0 15px #00ff00' };
const statBox = { border: '1px solid #00ff00', padding: '15px', fontSize: '14px' };
const logBox = { height: '350px', overflowY: 'auto', fontSize: '11px', color: '#00cc00', border: '1px solid #002200', padding: '10px' };