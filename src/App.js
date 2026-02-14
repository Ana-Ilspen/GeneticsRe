import React, { useState, useMemo } from 'react';
import { useDrag, useDrop } from 'react-dnd';

// --- GENE GENERATOR ---
const generateLibrary = () => {
  const lib = { "Prime Specimens": [{ id: 'h1', name: 'Human Baseline' }] };
  const pre = ["Xeno", "Void", "Neo", "Bio", "Cryo", "Aether", "Proto", "Cyber"];
  for (let i = 1; i <= 500; i++) {
    const cat = i % 2 === 0 ? "Synthetic Lab" : "Xeno-Classified";
    if (!lib[cat]) lib[cat] = [];
    lib[cat].push({ id: `g${i}`, name: `${pre[i % 8]} Strand #${1000 + i}` });
  }
  return lib;
};
const GENE_DATABASE = generateLibrary();

// --- DRAGGABLE ITEM ---
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

// --- MAIN LAB ---
export default function App() {
  const [active, setActive] = useState([]);
  const [search, setSearch] = useState("");

  const [{ isOver }, drop] = useDrop(() => ({
    accept: 'GENE',
    drop: (item) => setActive(prev => [...prev, item.gene]),
    collect: (monitor) => ({ isOver: !!monitor.isOver() })
  }));

  return (
    <div style={{ display: 'flex', height: '100vh', background: '#000', color: '#0f0', fontFamily: 'monospace' }}>
      <div style={{ width: '280px', borderRight: '1px solid #040', padding: '15px', overflowY: 'auto' }}>
        <h3>REGISTRY (500+)</h3>
        <input style={{ width: '100%', background: '#111', color: '#0f0', border: '1px solid #0f0', marginBottom: '10px' }} 
               placeholder="Search..." onChange={e => setSearch(e.target.value)} />
        {Object.keys(GENE_DATABASE).map(cat => (
          <details key={cat} open={search.length > 0}>
            <summary style={{cursor: 'pointer', color: '#fff'}}>{cat}</summary>
            {GENE_DATABASE[cat].filter(g => g.name.toLowerCase().includes(search.toLowerCase())).map(g => (
              <GeneBlock key={g.id} gene={g} />
            ))}
          </details>
        ))}
      </div>
      <div ref={drop} style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', background: isOver ? '#051105' : '#000' }}>
        <h2>GENETIC LAB CANVAS</h2>
        <div style={{ width: '80%', height: '60%', border: '2px dashed #040', display: 'flex', flexWrap: 'wrap', gap: '10px', padding: '20px', overflowY: 'auto' }}>
          {active.map((g, i) => (
            <div key={i} style={{ width: '40px', height: '40px', background: '#0f0', borderRadius: '50%', boxShadow: '0 0 10px #0f0' }} />
          ))}
        </div>
      </div>
    </div>
  );
}
