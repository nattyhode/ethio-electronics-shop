import { useState, useEffect } from 'react';
import axios from 'axios';

function EmployeesManager() {
  const [employees, setEmployees] = useState([]);
  const [showModal, setShowModal] = useState(false);
  
  const [rolesList, setRolesList] = useState([
    { name: 'Admin', code: 'admin' },
    { name: 'Manager', code: 'manager' },
    { name: 'Store In-Keeper', code: 'store_keeper' },
    { name: 'Store Out / Loader', code: 'store_loader' }, 
    { name: 'Cashier / Sales', code: 'cashier' },          
    { name: 'Technician', code: 'technician' }
  ]);

  // 🚀 በሲስተሙ ውስጥ ያሉ የፈቃድ አይነቶች (Modules)
  const availablePermissions = [
    { id: 'dashboard', label: '📊 ዋና ዳሽቦርድ' },
    { id: 'pos', label: '💰 የሽያጭ ዴስክ (POS)' },
    { id: 'products', label: '📦 ዕቃዎች መመዝገቢያ' },
    { id: 'transfers', label: '🔄 የመጋዘን ዝውውር' },
    { id: 'employees', label: '👥 ሠራተኞች ማስተዳደሪያ' }
  ];

  const [showNewRoleInput, setShowNewRoleInput] = useState(false);
  const [newRoleName, setNewRoleName] = useState('');
  const [newRoleCode, setNewRoleCode] = useState('');

  const [isEditing, setIsEditing] = useState(false);
  const [editingId, setEditingId] = useState(null);

  const [newEmployee, setNewEmployee] = useState({
    full_name: '',
    phone: '',
    position: '',
    role_code: 'cashier',
    salary: '',
    status: 'Active',
    username: '',
    password: '',
    permissions: [] // 👈 የፈቃድ ዝርዝር መያዣ
  });

  const fetchEmployees = async () => {
    try {
      // 🚀 ሎካልሆስት ወደ ዳይናሚክ ዩአርኤል ተቀይሯል
      const res = await axios.get(`${import.meta.env.VITE_API_URL}/employees`);
      setEmployees(res.data);
    } catch (error) {
      console.error('የሠራተኞችን መረጃ ማምጣት አልተቻለም:', error);
    }
  };

  useEffect(() => {
    fetchEmployees();
  }, []);

  const handleChange = (e) => {
    const { name, value } = e.target;
    
    if (name === 'position' && value === 'ADD_NEW_ROLE') {
      setShowNewRoleInput(true);
      return;
    }

    if (name === 'position') {
      const selectedRole = rolesList.find(r => r.name === value);
      
      // 🚀 ሮል ሲመረጥ በራሱ ፈቃዶችን ቲክ እንዲያደርግ (Auto-check)
      let defaultPerms = [];
      if (value.includes('Admin')) defaultPerms = ['dashboard', 'pos', 'products', 'transfers', 'employees'];
      else if (value.includes('Manager')) defaultPerms = ['dashboard', 'pos', 'products', 'transfers'];
      else if (value.includes('Cashier')) defaultPerms = ['pos']; // ካሺር ፒኦኤስ ብቻ ይበራለታል፣ አድሚኑ ማስተላለፊያ መጨመር ይችላል
      else if (value.includes('Store')) defaultPerms = ['products', 'transfers'];

      setNewEmployee({
        ...newEmployee,
        position: value,
        role_code: selectedRole ? selectedRole.code : 'staff',
        permissions: defaultPerms // 👈 የተመረጡትን ፈቃዶች ያስገባል
      });
    } else {
      setNewEmployee({ ...newEmployee, [name]: value });
    }
  };

  // 🚀 የቼክ-ቦክስ (Checkbox) መምረጫ ፈንክሽን
  const handlePermissionToggle = (permId) => {
    let updatedPerms = [...newEmployee.permissions];
    if (updatedPerms.includes(permId)) {
      updatedPerms = updatedPerms.filter(p => p !== permId); // ካለ ያጠፋዋል
    } else {
      updatedPerms.push(permId); // ከሌለ ይጨምረዋል
    }
    setNewEmployee({ ...newEmployee, permissions: updatedPerms });
  };

  const handleAddNewRole = () => {
    if (newRoleName.trim() !== '' && newRoleCode.trim() !== '') {
      const formattedCode = newRoleCode.trim().toLowerCase().replace(/\s+/g, '_');
      setRolesList([...rolesList, { name: newRoleName, code: formattedCode }]);
      setNewEmployee({ ...newEmployee, position: newRoleName, role_code: formattedCode });
      setNewRoleName('');
      setNewRoleCode('');
      setShowNewRoleInput(false);
    } else {
      alert('እባክዎ የስራ ድርሻውን ስም እና የኮድ ስያሜ ይሙሉ!');
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const dataToSubmit = {
        ...newEmployee,
        permissions: newEmployee.permissions.join(',') // 👈 ወደ ዳታቤዝ ሲሄድ በነጠላ ሰረዝ ተለያይቶ ይሄዳል
      };

      if (isEditing) {
        // 🚀 ሎካልሆስት ወደ ዳይናሚክ ዩአርኤል ተቀይሯል (ባክቲክ ነበረው፣ በጥንቃቄ ተስተካክሏል)
        await axios.put(`${import.meta.env.VITE_API_URL}/employees/${editingId}`, dataToSubmit);
        alert('የሠራተኛው መረጃ በተሳካ ሁኔታ ተስተካክሏል! ✏️');
      } else {
        // 🚀 ሎካልሆስት ወደ ዳይናሚክ ዩአርኤል ተቀይሯል
        await axios.post(`${import.meta.env.VITE_API_URL}/employees`, dataToSubmit);
        alert('ሠራተኛው ከነ ፈቃዱ በተሳካ ሁኔታ ተመዝግቧል! 👤');
      }
      
      setNewEmployee({ full_name: '', phone: '', position: '', role_code: 'cashier', salary: '', status: 'Active', username: '', password: '', permissions: [] });
      setIsEditing(false);
      setEditingId(null);
      setShowModal(false);
      fetchEmployees();
    } catch (error) {
      alert('ስህተት ተፈጥሯል! ዩዘርኔም ተይዞ ሊሆን ይችላል።');
    }
  };

  const openEditModal = (emp) => {
    let cleanPosition = emp.position || '';
    if (cleanPosition.includes('አድሚን')) cleanPosition = 'Admin';
    if (cleanPosition.includes('ማናጀር')) cleanPosition = 'Manager';
    if (cleanPosition.includes('መጋዘን ገቢ')) cleanPosition = 'Store In-Keeper';
    if (cleanPosition.includes('መጋዘን አውጭ')) cleanPosition = 'Store Out / Loader';
    if (cleanPosition.includes('ካሽር')) cleanPosition = 'Cashier / Sales';
    if (cleanPosition.includes('ቴክኒሻን')) cleanPosition = 'Technician';

    setNewEmployee({
      full_name: emp.full_name,
      phone: emp.phone || '',
      position: cleanPosition,
      role_code: emp.role_code || 'cashier',
      salary: emp.salary || '',
      status: (emp.status === 'በስራ ላይ' || emp.status === 'Active') ? 'Active' : 'Inactive',
      username: emp.username || '',
      password: emp.password || '',
      permissions: emp.permissions ? emp.permissions.split(',') : [] // 👈 ከዳታቤዝ የመጣውን ፈቃድ ይከፍለዋል
    });
    setIsEditing(true);
    setEditingId(emp.id);
    setShowModal(true);
  };

  const openAddModal = () => {
    setNewEmployee({ full_name: '', phone: '', position: '', role_code: 'cashier', salary: '', status: 'Active', username: '', password: '', permissions: [] });
    setIsEditing(false);
    setEditingId(null);
    setShowModal(true);
  };

  return (
    <div className="space-y-8">
      <div className="flex justify-between items-center bg-white p-4 rounded-xl shadow-sm border border-gray-100">
        <div>
          <h2 className="text-lg font-bold text-gray-800">የሠራተኞች አስተዳደር (HR)</h2>
          <p className="text-sm text-gray-500">ሠራተኞችን መዝግብ እና የሲስተም መግቢያ ፈቃዳቸውን ምረጥ</p>
        </div>
        <button onClick={openAddModal} className="bg-blue-600 text-white font-medium px-4 py-2 rounded-lg hover:bg-blue-700 shadow-sm">
          + አዲስ ሠራተኛ 👤
        </button>
      </div>

      {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white p-6 rounded-xl shadow-xl w-[600px] max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center mb-4 border-b pb-3">
              <h3 className="text-lg font-bold text-gray-800">{isEditing ? 'መረጃ ማስተካከያ' : 'አዲስ ሠራተኛ መመዝገቢያ'}</h3>
              <button onClick={() => setShowModal(false)} className="text-gray-400 hover:text-gray-600 font-bold text-xl">✕</button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-2 gap-4 border-b pb-4">
                <div>
                  <label className="block text-gray-700 text-sm font-medium mb-1 text-blue-600">Username</label>
                  <input type="text" name="username" required value={newEmployee.username} onChange={handleChange} className="w-full px-3 py-2 border border-blue-200 rounded-md bg-blue-50 focus:outline-none" />
                </div>
                <div>
                  <label className="block text-gray-700 text-sm font-medium mb-1 text-blue-600">Password</label>
                  <input type="text" name="password" required value={newEmployee.password} onChange={handleChange} className="w-full px-3 py-2 border border-blue-200 rounded-md bg-blue-50 focus:outline-none" />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-gray-700 text-sm font-medium mb-1">Full Name (ሙሉ ስም)</label>
                  <input type="text" name="full_name" required value={newEmployee.full_name} onChange={handleChange} className="w-full px-3 py-2 border rounded-md focus:outline-none" />
                </div>
                <div>
                  <label className="block text-gray-700 text-sm font-medium mb-1">Phone (ስልክ ቁጥር)</label>
                  <input type="text" name="phone" required value={newEmployee.phone} onChange={handleChange} className="w-full px-3 py-2 border rounded-md focus:outline-none" />
                </div>
              </div>

              <div>
                <label className="block text-gray-700 text-sm font-medium mb-1">Role (የስራ ድርሻ)</label>
                <select name="position" value={newEmployee.position} onChange={handleChange} required={!showNewRoleInput} className="w-full px-3 py-2 border rounded-md bg-white focus:outline-none focus:ring-2 focus:ring-blue-500">
                  <option value="">-- Select Role --</option>
                  {rolesList.map((r, idx) => (
                    <option key={idx} value={r.name} className="font-medium text-gray-700">{r.name}</option>
                  ))}
                  <option value="ADD_NEW_ROLE" className="text-blue-600 font-bold bg-blue-50">+ Add New Role...</option>
                </select>
              </div>

              {/* 🚀 የፈቃድ መምረጫ (Permission Checkboxes) ክፍሉ እዚህ አለ */}
              <div className="bg-slate-50 p-4 rounded-lg border border-slate-200 mt-4">
                <label className="block text-slate-800 text-sm font-bold mb-3 border-b border-slate-200 pb-2">
                  የሲስተም መግቢያ ፈቃዶች (Access Permissions)
                </label>
                <div className="grid grid-cols-2 gap-3">
                  {availablePermissions.map((perm) => (
                    <label key={perm.id} className="flex items-center space-x-2 cursor-pointer hover:bg-slate-100 p-1.5 rounded">
                      <input 
                        type="checkbox" 
                        checked={newEmployee.permissions.includes(perm.id)}
                        onChange={() => handlePermissionToggle(perm.id)}
                        className="w-4 h-4 text-blue-600 rounded focus:ring-blue-500"
                      />
                      <span className="text-sm font-medium text-slate-700">{perm.label}</span>
                    </label>
                  ))}
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4 pt-2">
                <div>
                  <label className="block text-gray-700 text-sm font-medium mb-1">Salary (ደሞዝ)</label>
                  <input type="number" name="salary" required value={newEmployee.salary} onChange={handleChange} className="w-full px-3 py-2 border rounded-md focus:outline-none" />
                </div>
                <div>
                  <label className="block text-gray-700 text-sm font-medium mb-1">Status (ሁኔታ)</label>
                  <select name="status" value={newEmployee.status} onChange={handleChange} className="w-full px-3 py-2 border rounded-md bg-white focus:outline-none">
                    <option value="Active">Active (በስራ ላይ)</option>
                    <option value="Inactive">Inactive (ስራ ያቆመ)</option>
                  </select>
                </div>
              </div>

              <div className="flex justify-end space-x-2 pt-4 border-t">
                <button type="button" onClick={() => setShowModal(false)} className="px-4 py-2 bg-gray-300 rounded-md">ሰርዝ</button>
                <button type="submit" className="px-6 py-2 bg-blue-600 text-white font-bold rounded-md shadow-md">
                  {isEditing ? 'አስተካክል 💾' : 'መዝግብ 🚀'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-100 border-b">
                <th className="p-3 text-slate-700 font-bold text-sm">Full Name</th>
                <th className="p-3 text-slate-700 font-bold text-sm">Username</th>
                <th className="p-3 text-slate-700 font-bold text-sm">Role</th>
                <th className="p-3 text-slate-700 font-bold text-sm">Permissions (የተፈቀደላቸው)</th>
                <th className="p-3 text-slate-700 font-bold text-sm">Status</th>
                <th className="p-3 text-slate-700 font-bold text-sm text-center">Actions</th>
              </tr>
            </thead>
            <tbody>
              {employees.length === 0 ? (
                <tr><td colSpan="6" className="text-center p-6 text-gray-400">የተመዘገበ ሠራተኛ የለም</td></tr>
              ) : (
                employees.map((emp) => (
                  <tr key={emp.id} className="border-b hover:bg-slate-50">
                    <td className="p-3 font-semibold text-slate-800">{emp.full_name}</td>
                    <td className="p-3 text-sm font-bold text-blue-600">@{emp.username}</td>
                    <td className="p-3 text-sm font-medium text-slate-700">{emp.position}</td>
                    
                    {/* 🚀 የተፈቀደላቸውን ሞጁሎች የሚያሳየው ኮሎን */}
                    <td className="p-3 text-xs text-gray-600 font-medium">
                      {emp.permissions ? emp.permissions.split(',').map((p, i) => (
                        <span key={i} className="inline-block bg-gray-200 px-2 py-0.5 rounded m-0.5 uppercase">{p}</span>
                      )) : <span className="text-red-400">ፈቃድ የለውም</span>}
                    </td>

                    <td className="p-3">
                      <span className={`px-2 py-1 rounded text-xs font-bold ${(emp.status === 'Active' || emp.status === 'በስራ ላይ') ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
                        {(emp.status === 'Active' || emp.status === 'በስራ ላይ') ? 'Active' : 'Inactive'}
                      </span>
                    </td>
                    <td className="p-3 text-center">
                      <button onClick={() => openEditModal(emp)} className="px-3 py-1.5 bg-amber-100 text-amber-700 font-bold text-sm rounded">✏️ Edit</button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

export default EmployeesManager;