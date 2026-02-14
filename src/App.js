import React, { useState, useMemo } from 'react';
import { DndProvider, useDrag, useDrop } from 'react-dnd';
import { HTML5Backend } from 'react-dnd-html5-backend';

// --- 1. DATA (500+ Items) ---
const generateLibrary = () => {
  const lib = { "Human/Apex": [{ id: 'h1', name: 'Neural Alpha' }, { id: 'a1', name: 'Cheetah Sprint' }] };
  const pre = ["Xeno", "Void", "Neo", "Bio", "Cryo", "Aether", "Proto", "Cyber"];
  for (let i = 1; i <= 500; i++) {
    const cat = i % 2 === 0 ? "Synthetic Lab" : "Xeno-Classified";
    if (!lib[cat]) lib[cat] = [];
    lib[cat].push({ id: `g${i}`, name: `${pre[i % 8]} Strand #${1000 + i}` });
  }
  return lib;
};
const GENE_DATABASE = generateLibrary();

// --- 2. THE DRAGGABLE GENE ---
const GeneBlock = ({ gene }) => {
  const [{ isDragging }, drag] = useDrag(() => ({
    type: 'GENE',
    item: { gene },
    collect: (monitor) => ({ isDragging: !!monitor.isDragging() })
  }), [gene]);

  return (
    <div ref={drag} style={{ 
      padding: '10px', margin: '5px 0', border: '1px solid #0f0', 
      background: isDragging ? '#222' : '#000', cursor: 'grab', 
      opacity: isDragging ? 0.5 : 1, fontSize: '12px' 
    }}>
      🧬 {gene.name}
    </div>
  );
};

// --- 3. THE LAB CONTENT ---
const LabUI = () => {
  const [active, setActive] = useState([]);
  const [search, setSearch] = useState("");

  const [{ isOver }, drop] = useDrop(() => ({
    accept: 'GENE',
    drop: (item) => setActive(prev => prev.find(g => g.id === item.gene.id) ? prev : [...prev, item.gene]),
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
      <div style={{ width: '300px', borderRight: '1px solid #040', padding: '20px', overflowY: 'auto' }}>
        <h3>REGISTRY (500+)</h3>
        <input 
          style={{ width: '100%', background: '#111', color: '#0f0', border: '1px solid #0f0', padding: '5px' }}
          placeholder="Filter..." onChange={e => setSearch(e.target.value)} 
        />
        {Object.keys(filtered).map(cat => (
          <details key={cat} open={search.length > 0} style={{marginTop: '10px'}}>
            <summary style={{cursor: 'pointer', color: '#fff'}}>{cat}</summary>
            {filtered[cat].map(g => <GeneBlock key={g.id} gene={g} />)}
          </details>
        ))}
      </div>

      <div ref={drop} style={{ flex: 1, padding: '40px', background: isOver ? '#051105' : '#000', display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
        <h2>GENETIC TANK</h2>
        <div style={{ width: '90%', flex: 1, border: '2px dashed #040', borderRadius: '20px', display: 'flex', flexWrap: 'wrap', gap: '15px', padding: '20px', alignItems: 'center', justifyContent: 'center' }}>
          {active.map((g, i) => (
            <div key={i} style={{ textAlign: 'center' }}>
              <div style={{ width: '45px', height: '45px', borderRadius: '50%', background: '#0f0', boxShadow: '0 0 15px #0f0' }} />
              <p style={{fontSize: '9px'}}>{g.name}</p>
            </div>
          ))}
          {active.length === 0 && <p style={{opacity: 0.3}}>DRAG SAMPLES HERE</p>}
        </div>
        <button onClick={() => setActive([])} style={{marginTop: '20px', border: '1px solid #f00', color: '#f00', background: 'none', cursor: 'pointer', padding: '10px'}}>WIPE LAB</button>
      </div>
    </div>
  );
};

// --- 4. THE EXPORT (Force Provider at Root) ---
export default function App() {
  return (
    <DndProvider backend={HTML5Backend}>
      <LabUI />
    </DndProvider>
  );
}
