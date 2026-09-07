import { useState } from 'react';
import axios from 'axios';

function Login({ onLogin }) {
  const [credentials, setCredentials] = useState({ username: '', password: '' });
  const [error, setError] = useState('');

  const handleChange = (e) => {
    setCredentials({ ...credentials, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    try {
      const res = await axios.post(${import.meta.env.VITE_API_URL}/login, credentials);
      // ሎጊን ሲሳካ የሠራተኛውን መረጃ ወደ ዋናው አፕ እንልካለን
      onLogin(res.data.user);
    } catch (err) {
      setError(err.response?.data?.error || 'ወደ ሲስተሙ መግባት አልተቻለም');
    }
  };

  return (
    <div className="flex items-center justify-center h-screen bg-slate-900">
      <div className="bg-white p-8 rounded-xl shadow-2xl w-96">
        <div className="text-center mb-6">
          <h1 className="text-2xl font-bold text-gray-800">የኤሌክትሮኒክስ ሲስተም</h1>
          <p className="text-sm text-gray-500 mt-1">እባክዎ መግቢያዎን ያስገቡ</p>
        </div>

        {error && <div className="bg-red-100 text-red-700 p-3 rounded mb-4 text-sm font-bold text-center">{error}</div>}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-gray-700 text-sm font-medium mb-1">ዩዘርኔም (Username)</label>
            <input type="text" name="username" required value={credentials.username} onChange={handleChange} className="w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 bg-slate-50" />
          </div>
          
          <div>
            <label className="block text-gray-700 text-sm font-medium mb-1">የይለፍ ቃል (Password)</label>
            <input type="password" name="password" required value={credentials.password} onChange={handleChange} className="w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 bg-slate-50" />
          </div>

          <button type="submit" className="w-full bg-blue-600 text-white font-bold py-2.5 rounded-md hover:bg-blue-700 transition-colors mt-2">
            ግባ (Login) 🚀
          </button>
        </form>
      </div>
    </div>
  );
}

export default Login;