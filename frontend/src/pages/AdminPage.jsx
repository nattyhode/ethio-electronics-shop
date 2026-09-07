import { useState } from 'react';
import axios from 'axios';

function AdminPage() {
  const [product, setProduct] = useState({
    title: '',
    selling_price: '',
    stock_main_store: '',
    stock_warehouse_1: ''
  });

  const handleChange = (e) => {
    setProduct({ ...product, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      // 🚀 ሎካልሆስት ወደ ዳይናሚክ ዩአርኤል ተቀይሯል
      const response = await axios.post(`${import.meta.env.VITE_API_URL}/products`, product);
      alert('ዕቃው በተሳካ ሁኔታ ተመዝግቧል! 🚀');
      
      setProduct({ title: '', selling_price: '', stock_main_store: '', stock_warehouse_1: '' });
    } catch (error) {
      alert('ስህተት ተፈጥሯል! ዕቃው አልተመዘገበም።');
      console.error(error);
    }
  };

  return (
    <div className="p-8 max-w-lg mx-auto bg-white rounded-xl shadow-md mt-10">
      <h1 className="text-2xl font-bold text-gray-800 mb-6 text-center">አዲስ ዕቃ መመዝገቢያ</h1>
      
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-gray-700 font-medium mb-1">የዕቃው ስም</label>
          <input 
            type="text" 
            name="title" 
            value={product.title} 
            onChange={handleChange} 
            required 
            className="w-full px-4 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>

        <div>
          <label className="block text-gray-700 font-medium mb-1">የመሸጫ ዋጋ (በብር)</label>
          <input 
            type="number" 
            name="selling_price" 
            value={product.selling_price} 
            onChange={handleChange} 
            required 
            className="w-full px-4 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-gray-700 font-medium mb-1">ዋና ሱቅ ብዛት</label>
            <input 
              type="number" 
              name="stock_main_store" 
              value={product.stock_main_store} 
              onChange={handleChange} 
              className="w-full px-4 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
          <div>
            <label className="block text-gray-700 font-medium mb-1">መጋዘን 1 ብዛት</label>
            <input 
              type="number" 
              name="stock_warehouse_1" 
              value={product.stock_warehouse_1} 
              onChange={handleChange} 
              className="w-full px-4 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
        </div>

        <button 
          type="submit" 
          className="w-full bg-blue-600 text-white font-bold py-3 rounded-md hover:bg-blue-700 transition duration-300"
        >
          ዕቃውን መዝግብ
        </button>
      </form>
    </div>
  );
}

export default AdminPage;