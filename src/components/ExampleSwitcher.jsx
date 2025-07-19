// src/components/ExampleSwitcher.jsx
import { useState } from 'react';
import { RoadmapPlanner } from './RoadmapPlanner.jsx';

// Import the different example data files
import quarterlyData from '../data/roadmap-quarterly.md?raw';
import dailyData from '../data/roadmap-daily.md?raw';

/**
 * Component to switch between different roadmap examples
 */
export const ExampleSwitcher = () => {
  const [selectedExample, setSelectedExample] = useState('quarterly');

  const examples = {
    quarterly: {
      name: 'Quarterly Roadmap (Q2-Q4 2025)',
      description: 'Full quarterly planning with multiple teams, streams, milestones, and risks',
      data: quarterlyData
    },
    daily: {
      name: 'Daily Sprint Roadmap (Sprint 24)',
      description: 'Two-week sprint with daily granularity and comprehensive risk tracking',
      data: dailyData
    }
  };

  const currentExample = examples[selectedExample];

  return (
    <div className="w-full h-screen bg-gray-50">
      {/* Example Selector */}
      <div className="no-print bg-white border-b border-gray-200 p-4">
        <div className="max-w-6xl mx-auto">
          <h1 className="text-2xl font-bold text-gray-800 mb-4">
            Team Roadmap Capacity Planner - Examples
          </h1>
          
          <div className="flex gap-4 mb-4">
            {Object.entries(examples).map(([key, example]) => (
              <button
                key={key}
                onClick={() => setSelectedExample(key)}
                className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                  selectedExample === key
                    ? 'bg-blue-600 text-white'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                {example.name}
              </button>
            ))}
          </div>
          
          <p className="text-gray-600 text-sm">
            <strong>Current:</strong> {currentExample.description}
          </p>
          
          <div className="mt-2 text-xs text-gray-500">
            <strong>Features showcased:</strong> 
            {selectedExample === 'quarterly' ? (
              <span> Team capacity planning, multiple streams, milestone tracking, risk management (high/medium/low), hard/soft deadlines, quarterly timeline view</span>
            ) : (
              <span> Daily granularity, sprint planning, comprehensive risk tracking, milestone management, team leave handling, detailed task breakdown</span>
            )}
          </div>
        </div>
      </div>

      {/* Roadmap Display */}
      <div className="h-full pt-16"> {/* Account for fixed header */}
        <RoadmapPlanner 
          markdownData={currentExample.data}
          enableDebug={false}
          loadingDelay={500}
        />
      </div>
    </div>
  );
};

export default ExampleSwitcher;
