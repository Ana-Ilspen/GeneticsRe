import React, { useState, useMemo } from 'react';
import { DndProvider, useDrag, useDrop } from 'react-dnd';
import { HTML5Backend } from 'react-dnd-html5-backend';

// --- 1. DATA ---
const generateLibrary = () => {
  const lib = { "Prime": [{ id: 'h1', name: 'Human' }] };
  const pre = ["Xeno", "Void", "Neo", "Bio", "Cryo", "Aether", "Proto", "Cyber"];
  for (let i = 1; i <= 500; i++) {
    const cat = i % 2 === 0 ? "Lab" : "Xeno";
    if (!lib[cat]) lib[cat] = [];
    lib[cat].push({ id: `g${i}`, name: `${pre[i % 8]} #${1000 + i}` });
  }
  return lib;
};
const GENE_DATABASE = generateLibrary();

// --- 2. DRAGGABLE ---
const GeneBlock = ({ gene }) => {
  const [{ isDragging }, drag] = useDrag(() => ({
    type: 'GENE',
    item: { gene },
    collect: (monitor) => ({ isDragging: !!monitor.isDragging() })
  }), [gene]);

  return (
    <div ref={drag} style={{ padding: '8px', margin: '4px', border: '1px solid #0f0', background: isDragging ? '#222' : '#000', cursor: 'grab', opacity: isDragging ? 0.5 : 1 }}>
      {gene.name}
    </div>
  );
};

// --- 3. LAB UI ---
const LabUI = () => {
  const [active, setActive] = useState([]);
  const [search, setSearch] = useState("");

  const [{ isOver }, drop] = useDrop(() => ({
    accept: 'GENE',
    drop: (item) => setActive(prev => [...prev, item.gene]),
    collect: (monitor) => ({ isOver: !!monitor.isOver() })
  }));

  return (
    <div style={{ display: 'flex', height: '100vh', background: '#000', color: '#0f0', fontFamily: 'monospace' }}>
      <div style={{ width: '250px', borderRight: '1px solid #040', padding: '10px', overflowY: 'auto' }}>
        <h3>REGISTRY</h3>
        <input style={{width: '100%', background: '#111', color: '#0f0', border: '1px solid #0f0'}} onChange={e => setSearch(e.target.value)} placeholder="Search..." />
        {Object.keys(GENE_DATABASE).map(cat => (
          <details key={cat} open={search.length > 0}>
            <summary style={{cursor: 'pointer'}}>{cat}</summary>
            {GENE_DATABASE[cat].filter(g => g.name.toLowerCase().includes(search.toLowerCase())).map(g => (
              <GeneBlock key={g.id} gene={g} />
            ))}
          </details>
        ))}
      </div>
      <div ref={drop} style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', background: isOver ? '#051105' : '#000' }}>
        <h2>GENETIC LAB</h2>
        <div style={{ width: '80%', height: '60%', border: '2px dashed #040', display: 'flex', flexWrap: 'wrap', gap: '10px', padding: '20px' }}>
          {active.map((g, i) => <div key={i} style={{ width: '30px', height: '30px', background: '#0f0', borderRadius: '50%' }} />)}
        </div>
      </div>
    </div>
  );
};

// --- 4. EXPORT ---
export default function App() {
  return (
    <DndProvider backend={HTML5Backend}>
       <LabUI />
    </DndProvider>
  );
}
