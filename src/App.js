import React, { useState, useMemo } from 'react';
import { DndProvider, useDrag, useDrop } from 'react-dnd';
import { HTML5Backend } from 'react-dnd-html5-backend';

// --- 1. DATA GENERATOR ---
const generateMassiveLibrary = () => {
  const library = {
    "Human Baseline": [
      { id: 'h1', name: 'Neural Pathway Alpha', origin: 'Human', ability: 'Intelligence' },
      { id: 'h2', name: 'Skeletal Density Max', origin: 'Human', ability: 'Durability' },
    ],
    "Apex Predators": [
      { id: 'a1', name: 'Cheetah ACTN3 Sprint', origin: 'Cheetah', ability: 'Speed' },
      { id: 'a2', name: 'Puma Vertical Leap', origin: 'Puma', ability: 'Leap' },
    ]
  };
  const prefixes = ["Xeno", "Proto", "Neo", "Cryo", "Aether", "Void", "Bio", "Cyber"];
  const suffixes = ["Strand", "Helix", "Node", "Link", "Core", "Catalyst"];
  for (let i = 1; i <= 500; i++) {
    const cat = i % 2 === 0 ? "Synthetic Lab" : "Xeno-Class Classified";
    if (!library[cat]) library[cat] = [];
    library[cat].push({
      id: `gen_${i}`,
      name: `${prefixes[i % prefixes.length]} ${suffixes[i % suffixes.length]} #${1000 + i}`,
      origin: i % 2 === 0 ? 'Laboratory' : 'Unknown',
      ability: i % 4 === 0 ? 'Speed' : 'Leap'
    });
  }
  return library;
};

const GENE_DATABASE = generateMassiveLibrary();

// --- 2. DRAGGABLE COMPONENT ---
const GeneBlock = ({ gene }) => {
  const [{ isDragging }, drag] = useDrag(() => ({
    type: 'GENE',
    item: { gene },
    collect: (monitor) => ({ isDragging: !!monitor.isDragging() })
  }));

  return (
    <div ref={drag} style={{
      padding: '10px', margin: '6px 0', border: '1px solid #00ff00',
      backgroundColor: isDragging ? '#222' : '#0a0a0a', cursor: 'grab', 
      color: '#00ff00', fontSize: '11px', textTransform: 'uppercase',
      opacity: isDragging ? 0.5 : 1
    }}>
      {gene.name} <span style={{color: '#005500', fontSize: '9px'}}>[{gene.origin}]</span>
    </div>
  );
};

// --- 3. THE INTERNAL LAB (Where the hooks live) ---
const LabInterface = () => {
  const [activeGenes, setActiveGenes] = useState([]);
  const [logs, setLogs] = useState(["[SYSTEM]: Lab Online."]);
  const [searchTerm, setSearchTerm] = useState("");

  const filteredLibrary = useMemo(() => {
    if (!searchTerm) return GENE_DATABASE;
    const filtered = {};
    Object.keys(GENE_DATABASE).forEach(cat => {
      const matches = GENE_DATABASE[cat].filter(g => 
        g.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
        g.origin.toLowerCase().includes(searchTerm.toLowerCase())
      );
      if (matches.length > 0) filtered[cat] = matches;
    });
    return filtered;
  }, [searchTerm]);

  const [{ isOver }, drop] = useDrop(() => ({
    accept: 'GENE',
    drop: (item) => {
      if (activeGenes.find(g => g.id === item.gene.id)) return;
      setActiveGenes(prev => [...prev, item.gene]);
      setLogs(prev => [`[SEQUENCE]: Integrated ${item.gene.name}.`, ...prev]);
    },
    collect: (monitor) => ({ isOver: !!monitor.isOver() })
  }));

  return (
    <div style={containerStyle}>
      <div style={sidebarStyle}>
        <h2 style={headerStyle}>GENE REGISTRY (500+)</h2>
        <input type="text" placeholder="Filter..." style={inputStyle} onChange={(e) => setSearchTerm(e.target.value)} />
        <div style={{ overflowY: 'auto', flex: 1 }}>
          {Object.keys(filteredLibrary).map(cat => (
            <details key={cat} open={searchTerm.length > 0} style={{ marginBottom: '10px' }}>
              <summary style={{ cursor: 'pointer', color: '#fff' }}>{cat}</summary>
              {filteredLibrary[cat].map(g => <GeneBlock key={g.id} gene={g} />)}
            </details>
          ))}
        </div>
      </div>

      <div ref={drop} style={{ ...playgroundStyle, backgroundColor: isOver ? '#111' : '#000' }}>
        <h1 style={{margin: 0}}>LAB PLAYGROUND</h1>
        <div style={canvasStyle}>
          {activeGenes.length === 0 && <p style={{opacity: 0.3}}>[DRAG GENES HERE]</p>}
          {activeGenes.map((g, i) => (
            <div key={i} style={orbContainer}><div style={orbStyle}></div><p style={{fontSize: '10px'}}>{g.name}</p></div>
          ))}
        </div>
      </div>
      
      <div style={dashboardStyle}>
        <h3>SYSTEM LOGS</h3>
        <div style={logStyle}>{logs.map((l, i) => <div key={i}>> {l}</div>)}</div>
      </div>
    </div>
  );
};

// --- 4. THE MAIN EXPORT (The Wrapper) ---
export default function App() {
  return (
    <DndProvider backend={HTML5Backend}>
      <LabInterface />
    </DndProvider>
  );
}

// Styles
const containerStyle = { display: 'flex', height: '100vh', backgroundColor: '#000', color: '#00ff00', fontFamily: 'monospace', overflow: 'hidden' };
const sidebarStyle = { width: '300px', borderRight: '1px solid #004400', padding: '20px', display: 'flex', flexDirection: 'column', background: '#050505' };
const playgroundStyle = { flex: 1, padding: '30px', display: 'flex', flexDirection: 'column' };
const dashboardStyle = { width: '300px', borderLeft: '1px solid #004400', padding: '20px', background: '#050505' };
const headerStyle = { fontSize: '1.2em', borderBottom: '1px solid #00ff00', paddingBottom: '10px' };
const inputStyle = { width: '100%', background: '#111', border: '1px solid #00ff00', color: '#00ff00', padding: '8px', marginBottom: '15px', fontFamily: 'monospace' };
const canvasStyle = { flex: 1, border: '1px dashed #004400', borderRadius: '20px', marginTop: '20px', display: 'flex', flexWrap: 'wrap', justifyContent: 'center', alignItems: 'center', gap: '20px', overflowY: 'auto' };
const orbContainer = { width: '80px', textAlign: 'center' };
const orbStyle = { width: '40px', height: '40px', borderRadius: '50%', background: 'radial-gradient(circle, #00ff00 0%, #001100 100%)', margin: '0 auto 5px', boxShadow: '0 0 10px #00ff00' };
const logStyle = { flex: 1, fontSize: '10px', color: '#008800', overflowY: 'auto' };
