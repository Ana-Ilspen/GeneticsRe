import React, { useState, useMemo } from 'react';
import { useDrag, useDrop } from 'react-dnd';

// --- 1. THE 500+ SPECIES DATABASE ---
const generateLibrary = () => {
  const lib = {
    "Core Species": [
      { id: 'c1', name: 'Human Baseline' },
      { id: 'c2', name: 'Apex Predator Alpha' }
    ]
  };
  const prefixes = ["Xeno", "Proto", "Neo", "Cryo", "Aether", "Void", "Bio", "Cyber"];
  for (let i = 1; i <= 500; i++) {
    const cat = i % 2 === 0 ? "Synthetic Lab" : "Classified Xeno";
    if (!lib[cat]) lib[cat] = [];
    lib[cat].push({ id: `g${i}`, name: `${prefixes[i % 8]} Strand #${1000 + i}` });
  }
  return lib;
};
const GENE_DATABASE = generateLibrary();

// --- 2. DRAGGABLE COMPONENT ---
const GeneBlock = ({ gene }) => {
  const [{ isDragging }, drag] = useDrag(() => ({
    type: 'GENE',
    item: { gene },
    collect: (monitor) => ({ isDragging: !!monitor.isDragging() })
  }));
  return (
    <div ref={drag} style={{ 
      padding: '10px', margin: '5px', border: '1px solid #00ff00', 
      background: isDragging ? '#222' : '#000', cursor: 'grab', opacity: isDragging ? 0.5 : 1 
    }}>{gene.name}</div>
  );
};

// --- 3. MAIN INTERFACE ---
export default function App() {
  const [active, setActive] = useState([]);
  const [search, setSearch] = useState("");

  const [{ isOver }, drop] = useDrop(() => ({
    accept: 'GENE',
    drop: (item) => setActive(prev => [...prev, item.gene]),
    collect: (monitor) => ({ isOver: !!monitor.isOver() })
  }));

  return (
    <div style={{ display: 'flex', height: '100vh', background: '#000', color: '#00ff00', fontFamily: 'monospace' }}>
      <div style={{ width: '300px', borderRight: '1px solid #004400', padding: '20px', overflowY: 'auto' }}>
        <h3>REGISTRY (500+)</h3>
        <input style={{ width: '100%', background: '#111', color: '#0f0', border: '1px solid #0f0' }} onChange={e => setSearch(e.target.value)} placeholder="Filter..." />
        {Object.keys(GENE_DATABASE).map(cat => (
          <div key={cat}>
            <p style={{ color: '#fff' }}>{cat}</p>
            {GENE_DATABASE[cat].filter(g => g.name.toLowerCase().includes(search.toLowerCase())).map(g => <GeneBlock key={g.id} gene={g} />)}
          </div>
        ))}
      </div>
      <div ref={drop} style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', background: isOver ? '#051105' : '#000' }}>
        <h2>LABORATORY</h2>
        <div style={{ width: '80%', height: '60%', border: '2px dashed #004400', display: 'flex', flexWrap: 'wrap', gap: '10px', padding: '20px' }}>
          {active.map((g, i) => <div key={i} style={{ width: '40px', height: '40px', background: '#0f0', borderRadius: '50%', boxShadow: '0 0 10px #0f0' }} />)}
        </div>
      </div>
    </div>
  );
}
