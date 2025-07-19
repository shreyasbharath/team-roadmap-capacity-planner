import { IntegratedRoadmapEditor } from './components/IntegratedRoadmapEditor.jsx';
import './styles/globals.css';

/**
 * Main application component with integrated markdown editor
 * 
 * Users can now:
 * - Load any roadmap file using the Load button
 * - Edit roadmaps in real-time with the markdown editor
 * - Save their work using the Save button
 * - Export to PDF
 */
function App() {
  return (
    <div className="App">
      <IntegratedRoadmapEditor enableDebug={import.meta.env.DEV} />
    </div>
  );
}

export default App;
