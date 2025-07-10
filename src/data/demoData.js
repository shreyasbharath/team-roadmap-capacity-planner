// src/data/demoData.js
// Configuration constants for the roadmap planner

export const QUARTERS_CONFIG = [
  { name: 'Q2 2025', months: ['Jun'] },
  { name: 'Q3 2025', months: ['Jul', 'Aug', 'Sep'] },
  { name: 'Q4 2025', months: ['Oct', 'Nov', 'Dec'] }
];

export const DEFAULT_COLORS = {
  currentWeek: '#10B981',
  hardDeadline: '#EF4444', 
  softDeadline: '#3B82F6',
  teamCapacity: '#F59E0B',
  risk: {
    high: '#DC2626',
    medium: '#F59E0B', 
    low: '#059669'
  }
};
