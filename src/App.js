import React, { useState, useMemo } from 'react';
import { useDrag, useDrop } from 'react-dnd';

// --- 1. DATA GENERATOR (500+ Items) ---
const generateMassiveLibrary = () => {
  const lib = { "Human/Apex": [
    { id: 'h1', name: 'Neural Alpha' }, { id: 'a1', name: 'Cheetah ACTN3' }
  ]};
  const pre = ["Xeno", "Void", "Neo", "Bio", "Cryo", "Aether", "Proto", "Cyber"];
  for (let i = 1; i <= 500; i++) {
    const cat = i % 2 === 0 ? "Synthetic Lab" : "Xeno-Classified";
    if (!lib[cat]) lib[cat] = [];
    lib[cat].push({ id: `g${i}`, name: `${pre[i % 8]} Strand #${1000 + i}` });
  }
  return lib;
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
      padding: '8px', margin: '4px', border: '1px solid #0f0', 
      background: isDragging ? '#222' : '#000', cursor: 'grab', opacity: isDragging ? 0.5 : 1 
    }}>{gene.name}</div>
  );
};

// --- 3. MAIN LAB INTERFACE ---
export default function App() {
  const [active, setActive] = useState([]);
  const [search, setSearch] = useState("");

  const [{ isOver }, drop] = useDrop(() => ({
    accept: 'GENE',
    drop: (item) => setActive(prev => [...prev, item.gene]),
    collect: (monitor) => ({ isOver: !!monitor.isOver() })
  }));

  const filtered = useMemo(() => {
    const res = {};
    Object.keys(GENE_DATABASE).forEach(cat => {
      const match = GENE_DATABASE[cat].filter(g => g.name.toLowerCase().includes(search.toLowerCase()));
      if (match.length) res[cat] = match;
    });
    return res;
  }, [search]);

  return (
    <div style={{ display: 'flex', height: '100vh', background: '#000', color: '#0f0', fontFamily: 'monospace' }}>
      <div style={{ width: '280px', borderRight: '1px solid #040', padding: '15px', overflowY: 'auto' }}>
        <h3 style={{borderBottom: '1px solid #0f0'}}>REGISTRY (500+)</h3>
        <input style={{ width: '100%', background: '#111', color: '#0f0', border: '1px solid #0f0', marginBottom: '10px' }} 
               placeholder="Filter..." onChange={e => setSearch(e.target.value)} />
        {Object.keys(filtered).map(cat => (
          <details key={cat} open style={{marginBottom: '10px'}}>
            <summary style={{cursor: 'pointer', color: '#fff'}}>{cat}</summary>
            {filtered[cat].map(g => <GeneBlock key={g.id} gene={g} />)}
          </details>
        ))}
      </div>
      <div ref={drop} style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', background: isOver ? '#051105' : '#000' }}>
        <h2>GENETIC LAB CANVAS</h2>
        <div style={{ width: '80%', height: '60%', border: '2px dashed #040', display: 'flex', flexWrap: 'wrap', gap: '10px', padding: '20px', overflowY: 'auto' }}>
          {active.map((g, i) => (
            <div key={i} style={{ width: '40px', height: '40px', background: '#0f0', borderRadius: '50%', boxShadow: '0 0 10px #0f0' }} title={g.name} />
          ))}
          {active.length === 0 && <p style={{opacity: 0.3}}>DRAG MATERIAL HERE</p>}
        </div>
        <button onClick={() => setActive([])} style={{marginTop: '20px', background: 'none', color: '#f00', border: '1px solid #f00', cursor: 'pointer', padding: '5px 10px'}}>WIPE LAB</button>
      </div>
    </div>
  );
}
