import React from 'react';

/**
 * PoolIQ Bottom Navigation — Warm Humanist Tab Bar
 * Simple, tactile, readable icons and labels without monospace or futuristic clutter.
 */
export default function BottomNav({ activeTab, setActiveTab, userRole = 'passenger' }) {
  const passengerTabs = [
    { id: 'pool', label: 'Rides', icon: 'explore' },
    { id: 'journey', label: 'Journey', icon: 'near_me' },
    { id: 'fairness', label: 'Fairness', icon: 'verified_user' },
    { id: 'routes', label: 'Corridors', icon: 'alt_route' }
  ];

  const adminTabs = [
    { id: 'dispatch', label: 'Dispatch', icon: 'map' },
    { id: 'fleet', label: 'Fleet', icon: 'hub' },
    { id: 'stats', label: 'Analytics', icon: 'insights' },
    { id: 'routes', label: 'Corridors', icon: 'alt_route' }
  ];

  const currentTabs = userRole === 'admin' ? adminTabs : passengerTabs;

  return (
    <nav className="fixed bottom-0 inset-x-0 z-40 pb-safe bg-[#FAF7F2]/95 backdrop-blur-md border-t border-[#EAE5DC]/80 shadow-xs">
      <div className="flex items-center justify-around h-14 max-w-md mx-auto px-2">
        {currentTabs.map((tab) => {
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex flex-col items-center justify-center min-w-[64px] h-12 gap-0.5 rounded-xl transition-all cursor-pointer select-none ${
                isActive
                  ? 'text-[#1D1D22]'
                  : 'text-[#787571] hover:text-[#1D1D22]'
              }`}
            >
              <div className="relative flex items-center justify-center">
                <span
                  className={`material-symbols-outlined text-[22px] transition-transform ${
                    isActive ? 'font-bold scale-105 text-[#1D1D22]' : 'text-[#787571]'
                  }`}
                >
                  {tab.icon}
                </span>
                {isActive && (
                  <span className="absolute -top-0.5 -right-1 w-1.5 h-1.5 rounded-full bg-[#F5C451]"></span>
                )}
              </div>
              <span
                className={`text-[11px] tracking-tight leading-none ${
                  isActive ? 'font-bold text-[#1D1D22]' : 'font-medium text-[#787571]'
                }`}
              >
                {tab.label}
              </span>
            </button>
          );
        })}
      </div>
    </nav>
  );
}
