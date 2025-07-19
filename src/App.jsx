import { ExampleSwitcher } from './components/ExampleSwitcher.jsx';
import './styles/globals.css';

/**
 * Main application component with example switching capability
 * 
 * To use the original single roadmap view, import RoadmapPlanner instead:
 * import { RoadmapPlanner } from './components/RoadmapPlanner.jsx';
 * 
 * And replace <ExampleSwitcher /> with:
 * <RoadmapPlanner enableDebug={import.meta.env.DEV} />
 */
function App() {
  return (
    <div className="App">
      <ExampleSwitcher />
    </div>
  );
}

export default App;
