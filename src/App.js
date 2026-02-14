import React, { useState, useMemo } from 'react';
import { DndProvider, useDrag, useDrop } from 'react-dnd';
import { HTML5Backend } from 'react-dnd-html5-backend';

// --- 1. DATA ENGINE (Moved outside to prevent re-renders) ---
const generateMassiveLibrary = () => {
  const library = {
    "Human Baseline": [
      { id: 'h1', name: 'Neural Pathway Alpha', origin: 'Human' },
      { id: 'h2', name: 'Skeletal Density Max', origin: 'Human' },
    ],
    "Apex Predators": [
      { id: 'a1', name: 'Cheetah ACTN3 Sprint', origin: 'Cheetah' },
      { id: 'a2', name: 'Puma Vertical Leap', origin: 'Puma' },
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
      origin: i % 2 === 0 ? 'Laboratory' : 'Unknown'
    });
  }
  return library;
};

const GENE_DATABASE = generateMassiveLibrary();

// --- 2. THE DRAGGABLE ITEM ---
const GeneBlock = ({ gene }) => {
  const [{ isDragging }, drag] = useDrag(() => ({
    type: 'GENE',
    item: { gene },
    collect: (monitor) => ({
      isDragging: !!monitor.isDragging(),
    }),
  }), [gene]); // Dependency array ensures it tracks the specific gene

  return (
    <div ref={drag} style={{
      padding: '10px', margin: '5px 0', border: '1px solid #00ff00',
      backgroundColor: isDragging ? '#222' : '#0a0a0a', cursor: 'grab', 
      color: '#00ff00', fontSize: '11px', opacity: isDragging ? 0.5 : 1
    }}>
      {gene.name}
    </div>
  );
};

// --- 3. THE LAB INTERFACE ---
const LabUI = () => {
  const [activeGenes, setActiveGenes] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");

  const [{ isOver }, drop] = useDrop(() => ({
    accept: 'GENE',
    drop: (item) => {
      setActiveGenes((prev) => {
        if (prev.find(g => g.id === item.gene.id)) return prev;
        return [...prev, item.gene];
      });
    },
    collect: (monitor) => ({ isOver: !!monitor.isOver() })
  }));

  const filtered = useMemo(() => {
    if (!searchTerm) return GENE_DATABASE;
    const result = {};
    Object.keys(GENE_DATABASE).forEach(cat => {
      const match = GENE_DATABASE[cat].filter(g => g.name.toLowerCase().includes(searchTerm.toLowerCase()));
      if (match.length) result[cat] = match;
    });
    return result;
  }, [searchTerm]);

  return (
    <div style={{ display: 'flex', height: '100vh', backgroundColor: '#000', color: '#00ff00', fontFamily: 'monospace' }}>
      {/* Sidebar */}
      <div style={{ width: '300px', borderRight: '1px solid #004400', padding: '20px', overflowY: 'auto' }}>
        <h3>GENE REGISTRY</h3>
        <input 
          style={{ width: '100%', background: '#111', border: '1px solid #00ff00', color: '#00ff00', padding: '5px', marginBottom: '10px' }}
          placeholder="Search 500+ strands..."
          onChange={(e) => setSearchTerm(e.target.value)}
        />
        {Object.keys(filtered).map(cat => (
          <details key={cat} open style={{ marginBottom: '10px' }}>
            <summary style={{ cursor: 'pointer', color: '#fff' }}>{cat}</summary>
            {filtered[cat].map(g => <GeneBlock key={g.id} gene={g} />)}
          </details>
        ))}
      </div>

      {/* Drop Zone */}
      <div ref={drop} style={{ flex: 1, padding: '40px', backgroundColor: isOver ? '#051105' : '#000', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' }}>
        <h2>LABORATORY CANVA</h2>
        <div style={{ border: '2px dashed #004400', width: '80%', height: '60%', display: 'flex', flexWrap: 'wrap', padding: '20px', gap: '10px' }}>
          {activeGenes.length === 0 && <p style={{ color: '#004400' }}>DROP GENETIC MATERIAL HERE</p>}
          {activeGenes.map((g) => (
            <div key={g.id} style={{ width: '50px', height: '50px', borderRadius: '50%', background: '#00ff00', boxShadow: '0 0 15px #00ff00' }} title={g.name} />
          ))}
        </div>
        <button onClick={() => setActiveGenes([])} style={{ marginTop: '20px', background: 'none', border: '1px solid #ff0000', color: '#ff0000', padding: '10px', cursor: 'pointer' }}>WIPE SEQUENCES</button>
      </div>
    </div>
  );
};

// --- 4. THE EXPORT ---
export default function App() {
  return (
    <DndProvider backend={HTML5Backend}>
      <LabUI />
    </DndProvider>
  );
}
