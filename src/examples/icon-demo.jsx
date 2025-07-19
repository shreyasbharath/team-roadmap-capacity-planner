// src/examples/icon-demo.jsx
import { MilestoneIcon, RiskIcon } from '../components/StreamComponents.jsx';

/**
 * Demo page showing the new clean milestone and risk icons
 */
export const IconDemo = () => {
  const sampleMilestones = [
    {
      name: 'Widget v2.0 Release',
      hardDate: '2025-08-15',
      color: '#FF0000'
    },
    {
      name: 'Beta Launch',
      softDate: '2025-09-01',
      color: '#0000FF'
    },
    {
      name: 'Marketing Campaign',
      softDate: '2025-11-01',
      color: '#00AAFF'
    }
  ];

  const sampleRisks = [
    {
      name: 'API compatibility issues',
      riskLevel: 'high',
      timeline: 'Aug W2-Aug W4',
      color: '#FF4444'
    },
    {
      name: 'Data migration complexity',
      riskLevel: 'medium',
      timeline: 'Aug W1-Aug W2',
      color: '#FFA500'
    },
    {
      name: 'Minor integration concern',
      riskLevel: 'low',
      timeline: 'Sep W1-Sep W2',
      color: '#FFD700'
    }
  ];

  return (
    <div className="p-8 bg-gray-50 min-h-screen">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-3xl font-bold text-gray-800 mb-8">
          Milestone & Risk Icons Demo
        </h1>
        
        <div className="bg-white rounded-lg shadow-lg p-6 mb-8">
          <h2 className="text-xl font-semibold text-gray-700 mb-4">
            Milestone Icons
          </h2>
          <p className="text-gray-600 mb-4">
            Clean, simple icons that show milestone type on hover
          </p>
          <div className="flex gap-4 items-center">
            {sampleMilestones.map((milestone, index) => (
              <div key={index} className="flex flex-col items-center gap-2">
                <MilestoneIcon milestone={milestone} />
                <span className="text-xs text-gray-500">
                  {milestone.hardDate ? 'Hard' : 'Soft'}
                </span>
              </div>
            ))}
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-lg p-6 mb-8">
          <h2 className="text-xl font-semibold text-gray-700 mb-4">
            Risk Icons
          </h2>
          <p className="text-gray-600 mb-4">
            Colour-coded risk indicators with detailed info on hover
          </p>
          <div className="flex gap-4 items-center">
            {sampleRisks.map((risk, index) => (
              <div key={index} className="flex flex-col items-center gap-2">
                <RiskIcon risk={risk} />
                <span className="text-xs text-gray-500 capitalize">
                  {risk.riskLevel}
                </span>
              </div>
            ))}
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-lg p-6">
          <h2 className="text-xl font-semibold text-gray-700 mb-4">
            Benefits of the New Design
          </h2>
          <ul className="list-disc list-inside text-gray-600 space-y-2">
            <li>✨ <strong>Clean Visual Design:</strong> Simple icons instead of text-heavy annotations</li>
            <li>🎯 <strong>Better Space Usage:</strong> Icons take up less space on the timeline</li>
            <li>📱 <strong>Hover for Details:</strong> Rich tooltips show full context when needed</li>
            <li>🎨 <strong>Improved Accessibility:</strong> Clear visual hierarchy and colour coding</li>
            <li>⚡ <strong>Performance:</strong> Lighter DOM with fewer text elements</li>
          </ul>
        </div>
      </div>
    </div>
  );
};

export default IconDemo;
