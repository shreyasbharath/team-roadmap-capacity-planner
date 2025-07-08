// src/App.jsx
import React from 'react';
import { RoadmapPlanner } from './components/RoadmapPlanner.jsx';
import './styles/globals.css';

/**
 * Main application component
 */
function App() {
  return (
    <div className="App">
      <RoadmapPlanner enableDebug={import.meta.env.DEV} />
    </div>
  );
}

export default App;
