import { useState } from 'react';
import ProductsManager from './ProductsManager';
import POSManager from './POSManager'; // 🚀 ይሄንን አዲሱን ጨምር
// ካለህ EmployeesManager ን ከዚህ በታች ካለው ኮመንት አውጣው
// import EmployeesManager from './EmployeesManager'; 

function AdminDashboard({ user, onLogout }) {
  // የሰራተኛውን ፈቃዶች (Permissions) መለየት
  const userPermissions = typeof user?.permissions === 'string' ? user.permissions.split(',') : (user?.permissions || []);
  
  const hasAccess = (moduleName) => {
    if (user?.role_code === 'admin' || user?.position?.includes('አድሚን')) return true;
    return userPermissions.includes(moduleName);
  };

  const [activeMenu, setActiveMenu] = useState('products');
  // 🚀 አዲሱ የጎን ሜኑ መክፈቻ/መዝጊያ 
  const [sidebarOpen, setSidebarOpen] = useState(true); 

  return (
    <div className="flex h-screen bg-gray-100 font-sans overflow-hidden">
      
      {/* 🚀 Sidebar (የጎን ሜኑ) - ስፋቱ የሚቀያየር */}
      <div className={`${sidebarOpen ? 'w-64' : 'w-20'} bg-slate-900 text-white flex flex-col transition-all duration-300 shadow-xl z-20 flex-shrink-0`}>
        
        <div className="p-4 flex items-center justify-between border-b border-slate-800">
          {sidebarOpen && <span className="text-lg font-bold text-amber-400 whitespace-nowrap">⚡ ኢትዮ-ኤሌክትሮኒክስ</span>}
          <button onClick={() => setSidebarOpen(!sidebarOpen)} className="text-gray-300 hover:text-white p-2 rounded-md hover:bg-slate-800 transition-colors">
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6h16M4 12h16M4 18h16"></path></svg>
          </button>
        </div>
        
        <div className="px-4 py-4 bg-slate-800/50 border-b border-slate-700/50 flex flex-col items-center">
          <div className="w-10 h-10 bg-blue-600 rounded-full flex items-center justify-center font-bold text-xl mb-2 shadow-inner">
            {user?.full_name ? user.full_name.charAt(0) : '👤'}
          </div>
          {sidebarOpen && (
            <div className="text-center overflow-hidden">
              <p className="text-sm font-bold text-white truncate w-48">{user?.full_name || 'Admin User'}</p>
              <p className="text-xs text-blue-400 mt-1">{user?.position || 'Admin'}</p>
            </div>
          )}
        </div>
        
        <nav className="flex-1 p-3 space-y-1.5 mt-2 overflow-y-auto custom-scrollbar">
          
          {hasAccess('dashboard') && (
            <button onClick={() => setActiveMenu('dashboard')} className={`w-full flex items-center p-3 rounded-lg transition-colors ${activeMenu === 'dashboard' ? 'bg-blue-600 text-white shadow-md' : 'text-slate-400 hover:bg-slate-800 hover:text-slate-200'}`} title="ዋና ዳሽቦርድ">
              <span className="text-xl">📊</span>
              {sidebarOpen && <span className="ml-3 font-medium whitespace-nowrap">ዋና ዳሽቦርድ</span>}
            </button>
          )}

          {hasAccess('products') && (
            <button onClick={() => setActiveMenu('products')} className={`w-full flex items-center p-3 rounded-lg transition-colors ${activeMenu === 'products' ? 'bg-blue-600 text-white shadow-md' : 'text-slate-400 hover:bg-slate-800 hover:text-slate-200'}`} title="ዕቃዎች ማስተዳደሪያ">
              <span className="text-xl">📦</span>
              {sidebarOpen && <span className="ml-3 font-medium whitespace-nowrap">ዕቃዎች ማስተዳደሪያ</span>}
            </button>
          )}

          {hasAccess('pos') && (
            <button onClick={() => setActiveMenu('pos')} className={`w-full flex items-center p-3 rounded-lg transition-colors ${activeMenu === 'pos' ? 'bg-blue-600 text-white shadow-md' : 'text-slate-400 hover:bg-slate-800 hover:text-slate-200'}`} title="የሽያጭ ዴስክ">
              <span className="text-xl">💰</span>
              {sidebarOpen && <span className="ml-3 font-medium whitespace-nowrap">የሽያጭ ዴስክ (POS)</span>}
            </button>
          )}

          {hasAccess('transfers') && (
            <button onClick={() => setActiveMenu('transfers')} className={`w-full flex items-center p-3 rounded-lg transition-colors ${activeMenu === 'transfers' ? 'bg-blue-600 text-white shadow-md' : 'text-slate-400 hover:bg-slate-800 hover:text-slate-200'}`} title="የመጋዘን ዝውውር">
              <span className="text-xl">🔄</span>
              {sidebarOpen && <span className="ml-3 font-medium whitespace-nowrap">የመጋዘን ዝውውር</span>}
            </button>
          )}

          {hasAccess('employees') && (
            <button onClick={() => setActiveMenu('employees')} className={`w-full flex items-center p-3 rounded-lg transition-colors ${activeMenu === 'employees' ? 'bg-blue-600 text-white shadow-md' : 'text-slate-400 hover:bg-slate-800 hover:text-slate-200'}`} title="ሠራተኞች">
              <span className="text-xl">👥</span>
              {sidebarOpen && <span className="ml-3 font-medium whitespace-nowrap">ሠራተኞች (HR)</span>}
            </button>
          )}

        </nav>
        
        <div className="p-4 border-t border-slate-800">
           <button onClick={onLogout} className="w-full flex items-center justify-center p-2.5 bg-red-500/10 text-red-500 hover:bg-red-500 hover:text-white rounded-lg transition-colors font-bold" title="ውጣ (Logout)">
             <span className="text-lg">🚪</span>
             {sidebarOpen && <span className="ml-2">ውጣ (Logout)</span>}
           </button>
        </div>
      </div>

      {/* 🚀 Main Content (ዋናው ማሳያ ክፍል - የጠባብ ስክሪን ችግር የተፈታው እዚህ ነው!) */}
      {/* ⚠️ min-w-0 በጣም ወሳኝ ነች: ጠባብ ስክሪን ላይ ወደ ውጭ እንዳይወጣ ትከላከላለች */}
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden bg-slate-50">
        
        <header className="bg-white px-6 py-4 shadow-sm border-b border-gray-100 flex justify-between items-center shrink-0 z-10">
          <h1 className="text-xl font-bold text-gray-800 truncate">
            {activeMenu === 'dashboard' && '📊 ዋና የንግድ ዳሽቦርድ'}
            {activeMenu === 'products' && '📦 የዕቃዎች እና ክምችት ማስተዳደሪያ'}
            {activeMenu === 'pos' && '💰 የካሺር መቆጣጠሪያ (POS)'}
            {activeMenu === 'transfers' && '🔄 የመጋዘን ዝውውር'}
            {activeMenu === 'employees' && '👥 የሠራተኞች አስተዳደር'}
          </h1>
          <div className="flex items-center space-x-3 text-sm flex-shrink-0">
            <span className="bg-green-100 text-green-700 px-3 py-1 rounded-full font-bold shadow-sm flex items-center">
              <span className="w-2 h-2 bg-green-500 rounded-full mr-2 animate-pulse"></span>
              Active
            </span>
          </div>
        </header>

        {/* 🚀 አዲሱ የ Scroll ማስተካከያ (overflow-x-hidden እና overflow-y-auto) */}
        <main className="flex-1 overflow-x-hidden overflow-y-auto w-full">
          <div className="p-4 md:p-6 w-full max-w-[1600px] mx-auto">
            
            {activeMenu === 'products' && <ProductsManager user={user} />}
            
            {/* activeMenu === 'employees' && <EmployeesManager user={user} /> */}

            {activeMenu === 'pos' && <POSManager />}
            {activeMenu === 'dashboard' && (
              <div className="flex flex-col items-center justify-center h-[60vh] text-gray-400">
                <span className="text-6xl mb-4">📊</span>
                <h2 className="text-2xl font-bold text-gray-600">ዋና ዳሽቦርድ እዚህ ይገባል</h2>
              </div>
            )}
            {activeMenu === 'transfers' && (
              <div className="flex flex-col items-center justify-center h-[60vh] text-gray-400">
                <span className="text-6xl mb-4">🔄</span>
                <h2 className="text-2xl font-bold text-gray-600">የመጋዘን ዝውውር እዚህ ይገባል</h2>
              </div>
            )}
          </div>
        </main>
      </div>

    </div>
  );
}

export default AdminDashboard;