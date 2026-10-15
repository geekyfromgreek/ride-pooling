import React, { useState, useRef, useEffect } from 'react';

/**
 * PoolIQ Header — Warm Humanist Interface
 * Designed with tactile reassurance, clean geometry, and elegant role switching.
 */
export default function Header({
  title = "PoolIQ",
  showBack = false,
  onBack = null,
  onTuneClick = null,
  userRole = 'passenger',
  setUserRole = null,
  backendStatus = 'Online'
}) {
  const [showProfileMenu, setShowProfileMenu] = useState(false);
  const menuRef = useRef(null);

  useEffect(() => {
    function handleClickOutside(e) {
      if (menuRef.current && !menuRef.current.contains(e.target)) {
        setShowProfileMenu(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleRoleSelect = (role) => {
    if (setUserRole) setUserRole(role);
    setShowProfileMenu(false);
  };

  return (
    <header className="fixed top-0 inset-x-0 z-[1100] bg-[#FAF7F2]/90 backdrop-blur-md border-b border-[#EAE5DC]/80 shadow-xs pt-safe transition-colors">
      <div className="h-14 px-4 flex items-center justify-between max-w-5xl mx-auto">
        {/* Brand & Left Navigation */}
        <div className="flex items-center gap-2.5">
          {showBack && (
            <button
              onClick={onBack}
              className="w-9 h-9 -ml-1 rounded-full bg-white border border-[#EAE5DC] shadow-xs flex items-center justify-center text-[#1D1D22] hover:bg-[#F4EFEB] active:scale-95 transition-all cursor-pointer"
              aria-label="Back"
            >
              <span className="material-symbols-outlined text-[19px]">arrow_back</span>
            </button>
          )}

          <div className="flex items-center gap-2.5">
            {/* Custom PoolIQ SVG Brandmark */}
            <div className="relative w-8 h-8 rounded-xl bg-[#1D1D22] flex items-center justify-center shadow-sm select-none shrink-0 border border-[#EAE5DC]">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                {/* Converging route lines */}
                <path d="M4 18C4 13.5 8 12 12 12" stroke="#FAF7F2" strokeWidth="2.2" strokeLinecap="round" />
                <path d="M4 6C4 10.5 8 12 12 12" stroke="#F5C451" strokeWidth="2.2" strokeLinecap="round" />
                <path d="M12 12H20" stroke="#F5C451" strokeWidth="2.5" strokeLinecap="round" />
                {/* Node dots */}
                <circle cx="4" cy="6" r="2" fill="#F5C451" />
                <circle cx="4" cy="18" r="2" fill="#FAF7F2" />
                <circle cx="19" cy="12" r="2.5" fill="#F5C451" stroke="#1D1D22" strokeWidth="1.5" />
              </svg>
            </div>
            <div className="flex flex-col">
              <div className="flex items-center gap-1 leading-none">
                <span className="font-sans font-extrabold text-[16px] tracking-tight text-[#1D1D22]">
                  Pool<span className="text-[#D97706]">IQ</span>
                </span>
                <span className="text-[9px] font-bold uppercase tracking-wider px-1.5 py-0.5 rounded-full bg-[#FAF7F2] border border-[#EAE5DC] text-[#787571]">
                  v1.0
                </span>
              </div>
              <span className="text-[11px] font-medium text-[#787571] mt-0.5">
                {title !== 'PoolIQ' && title !== 'pool-IQ' ? title : (userRole === 'admin' ? 'Dispatch Console' : 'Dynamic Ride Pooling')}
              </span>
            </div>
          </div>
        </div>

        {/* Right Controls: Engine Tune & Profile */}
        <div className="flex items-center gap-2">
          {/* Operator Engine Controls button (Only in admin mode or if clicked) */}
          {onTuneClick && userRole === 'admin' && (
            <button
              onClick={onTuneClick}
              className="w-8 h-8 rounded-full bg-white border border-[#EAE5DC] shadow-xs flex items-center justify-center text-[#1D1D22] hover:bg-[#F4EFEB] transition-colors cursor-pointer"
              title="Engine Controls & Zero-Trust Gate"
            >
              <span className="material-symbols-outlined text-[17px]">tune</span>
            </button>
          )}

          {/* Profile Button with Interactive Role Switcher Dropdown */}
          <div className="relative" ref={menuRef}>
            <button
              onClick={() => setShowProfileMenu(!showProfileMenu)}
              className="flex items-center gap-1 p-0.5 rounded-full hover:bg-white/80 border border-transparent hover:border-[#EAE5DC] transition-all cursor-pointer"
              title="Account & Role Switcher"
              id="profile-role-switcher"
            >
              <div className="w-8 h-8 rounded-full bg-[#1D1D22] text-white flex items-center justify-center shadow-xs text-xs font-semibold border border-[#EAE5DC]">
                NK
              </div>
              <span className="material-symbols-outlined text-[16px] text-[#787571]">expand_more</span>
            </button>

            {/* Profile Popover / Role Switcher Menu */}
            {showProfileMenu && (
              <>
                <div
                  className="fixed inset-0 z-[1101] bg-black/20 backdrop-blur-[1px] animate-fade-in"
                  onClick={() => setShowProfileMenu(false)}
                />
                <div className="absolute right-0 mt-2 w-72 max-w-[calc(100vw-2rem)] bg-white rounded-2xl p-3.5 shadow-[0_12px_36px_rgba(29,29,34,0.12)] border border-[#EAE5DC] z-[1102] animate-fade-in flex flex-col gap-3">
                  {/* User Identity */}
                  <div className="flex items-center gap-2.5 pb-2.5 border-b border-[#EAE5DC]">
                    <div className="w-9 h-9 rounded-full bg-[#1D1D22] text-[#F5C451] flex items-center justify-center text-xs font-bold shadow-xs">
                      NK
                    </div>
                    <div className="flex flex-col min-w-0">
                      <span className="text-[13px] font-bold text-[#1D1D22] truncate">Nakul Karpe</span>
                      <span className="text-[11px] text-[#787571] truncate">karpenakul885@gmail.com</span>
                    </div>
                  </div>

                  {/* Role Switcher Section */}
                  <div className="flex flex-col gap-1.5">
                    <span className="text-[11px] font-semibold text-[#787571] px-1">
                      Choose Mode
                    </span>

                    {/* Passenger Option */}
                    <button
                      onClick={() => handleRoleSelect('passenger')}
                      className={`flex items-start gap-2.5 p-2.5 rounded-xl text-left transition-all cursor-pointer ${
                        userRole === 'passenger'
                          ? 'bg-[#F4EFEB] border border-[#1D1D22] text-[#1D1D22]'
                          : 'hover:bg-[#FAF7F2] text-[#787571]'
                      }`}
                    >
                      <span className="material-symbols-outlined text-[19px] text-[#1D1D22] mt-0.5">person</span>
                      <div className="flex flex-col">
                        <span className="text-[13px] font-semibold text-[#1D1D22]">Passenger App</span>
                        <span className="text-[11px] text-[#787571]">Request rides, route tracking &amp; fair fare splits</span>
                      </div>
                      {userRole === 'passenger' && (
                        <span className="material-symbols-outlined text-[17px] text-[#F5C451] ml-auto">check_circle</span>
                      )}
                    </button>

                    {/* Admin Option */}
                    <button
                      onClick={() => handleRoleSelect('admin')}
                      className={`flex items-start gap-2.5 p-2.5 rounded-xl text-left transition-all cursor-pointer ${
                        userRole === 'admin'
                          ? 'bg-[#1D1D22] text-white border border-[#1D1D22]'
                          : 'hover:bg-[#FAF7F2] text-[#787571]'
                      }`}
                    >
                      <span className={`material-symbols-outlined text-[19px] mt-0.5 ${userRole === 'admin' ? 'text-[#F5C451]' : 'text-[#787571]'}`}>
                        admin_panel_settings
                      </span>
                      <div className="flex flex-col">
                        <span className={`text-[13px] font-semibold ${userRole === 'admin' ? 'text-white' : 'text-[#1D1D22]'}`}>
                          Transit Dispatcher
                        </span>
                        <span className={`text-[11px] ${userRole === 'admin' ? 'text-[#EAE5DC]' : 'text-[#787571]'}`}>
                          Fleet operations, batch solver &amp; network analytics
                        </span>
                      </div>
                      {userRole === 'admin' && (
                        <span className="material-symbols-outlined text-[17px] text-[#F5C451] ml-auto">check_circle</span>
                      )}
                    </button>
                  </div>

                  {/* Footer status */}
                  <div className="pt-2 border-t border-[#EAE5DC] flex items-center justify-between text-[11px] text-[#787571]">
                    <span>Engine: {backendStatus}</span>
                    <span className="text-[#1D1D22] font-semibold">Production Ready</span>
                  </div>
                </div>
              </>
            )}
          </div>
        </div>
      </div>
    </header>
  );
}
