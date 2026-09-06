import { useState, useEffect } from 'react';
import axios from 'axios';

function SalesDashboard({ user, onLogout }) {
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [cart, setCart] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('ALL');

  const [customerName, setCustomerName] = useState('');
  const [customerPhone, setCustomerPhone] = useState('');

  const fetchData = async () => {
    try {
      const prodRes = await axios.get('http://localhost:5000/api/products');
      setProducts(prodRes.data);
      const catRes = await axios.get('http://localhost:5000/api/categories');
      setCategories(catRes.data);
    } catch (error) {
      console.error('መረጃዎችን ማምጣት አልተቻለም:', error);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const addToCart = (product) => {
    if (product.stock_main_store <= 0) {
      alert('ይህ ዕቃ በዋናው ሱቅ ውስጥ የለም!');
      return;
    }

    const existingItem = cart.find(item => item.id === product.id);
    if (existingItem) {
      if (existingItem.quantity >= product.stock_main_store) {
        alert('ከዚህ በላይ በክምችት የለም!');
        return;
      }
      setCart(cart.map(item => item.id === product.id ? { ...item, quantity: item.quantity + 1 } : item));
    } else {
      setCart([...cart, { ...product, quantity: 1 }]);
    }
  };

  const removeFromCart = (id) => {
    setCart(cart.filter(item => item.id !== id));
  };

  const totalAmount = cart.reduce((sum, item) => sum + (item.selling_price * item.quantity), 0);

  // 🚀 ለካሽር ጥያቄ መላኪያ (Send to Cashier)
  const handleSendToCashier = async () => {
    if (cart.length === 0) {
      alert('ጋሪው ባዶ ነው!');
      return;
    }
    if (!customerName.trim()) {
      alert('እባክዎ የደንበኛውን ስም ያስገቡ!');
      return;
    }

    try {
      await axios.post('http://localhost:5000/api/sales-orders', {
        customer_name: customerName,
        customer_phone: customerPhone,
        items: cart,
        total_amount: totalAmount,
        status: 'PENDING'
      });

      alert('የዕቃ ዝርዝሩ ለካሽር በተሳካ ሁኔታ ተልኳል! 🧾');
      setCart([]);
      setCustomerName('');
      setCustomerPhone('');
    } catch (error) {
      alert('ለካሽር መላክ አልተቻለም!');
      console.error(error);
    }
  };

  const filteredProducts = products.filter(item => {
    const matchesSearch = item.title.toLowerCase().includes(searchTerm.toLowerCase()) || 
                          (item.brand && item.brand.toLowerCase().includes(searchTerm.toLowerCase()));
    const matchesCat = selectedCategory === 'ALL' || item.category_id.toString() === selectedCategory;
    return matchesSearch && matchesCat;
  });

  return (
    <div className="flex h-screen bg-gray-100 font-sans">
      {/* የግራ በኩል፡ ዕቃዎች ማሳያ */}
      <div className="flex-1 flex flex-col h-full overflow-hidden border-r bg-slate-50">
        <div className="bg-white p-4 shadow-sm border-b flex justify-between items-center">
          <div>
            <h1 className="text-xl font-bold text-gray-800">የሽያጭ ሻጭ ቆጣሪ (Sales Counter)</h1>
            <p className="text-xs text-gray-500">ሻጭ፡ <span className="font-bold text-blue-600">{user?.full_name}</span></p>
          </div>
          <button onClick={onLogout} className="bg-red-50 text-red-600 px-3 py-1.5 rounded-lg font-bold text-sm hover:bg-red-100">ውጣ</button>
        </div>

        <div className="p-4 bg-white border-b flex gap-4 items-center">
          <input 
            type="text" 
            placeholder="ዕቃ ወይም ብራንድ ይፈልጉ..." 
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="flex-1 px-4 py-2 border rounded-lg text-sm focus:outline-none"
          />
          <select value={selectedCategory} onChange={(e) => setSelectedCategory(e.target.value)} className="px-4 py-2 border rounded-lg bg-white text-sm">
            <option value="ALL">ሁሉም ምድቦች</option>
            {categories.map(cat => <option key={cat.id} value={cat.id}>{cat.name}</option>)}
          </select>
        </div>

        <div className="flex-1 p-4 overflow-y-auto grid grid-cols-3 gap-4">
          {filteredProducts.map(product => (
            <div key={product.id} onClick={() => addToCart(product)} className="bg-white p-3 rounded-xl border shadow-xs hover:shadow-md cursor-pointer transition-all flex flex-col justify-between group">
              <div>
                {product.image_url ? (
                  <img src={product.image_url} alt={product.title} className="w-full h-28 object-cover rounded-lg mb-2" />
                ) : (
                  <div className="w-full h-28 bg-gray-200 rounded-lg flex items-center justify-center text-xs text-gray-400 mb-2">ፎቶ የለም</div>
                )}
                <h3 className="font-bold text-gray-800 text-sm group-hover:text-blue-600">{product.title}</h3>
                <p className="text-xs text-gray-500">{product.brand}</p>
              </div>
              <div className="mt-3 pt-2 border-t flex justify-between items-center">
                <span className="font-bold text-green-600 text-sm">{product.selling_price} ብር</span>
                <span className="text-xs px-2 py-0.5 rounded font-bold bg-blue-50 text-blue-700">ሱቅ: {product.stock_main_store || 0}</span>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* የቀኝ በኩል፡ የደንበኛ መረጃ እና ለካሽር መላኪያ */}
      <div className="w-[400px] bg-white flex flex-col h-full shadow-lg">
        <div className="p-4 bg-slate-900 text-white font-bold text-base">🛒 የተመረጡ ዕቃዎች ጋሪ</div>

        <div className="p-4 border-b space-y-3 bg-blue-50">
          <h4 className="font-bold text-xs text-blue-800 uppercase">የደንበኛ መረጃ</h4>
          <input 
            type="text" 
            placeholder="የደንበኛ ሙሉ ስም *" 
            value={customerName}
            onChange={(e) => setCustomerName(e.target.value)}
            className="w-full px-3 py-2 border rounded-lg text-sm bg-white focus:outline-none"
          />
          <input 
            type="text" 
            placeholder="የደንበኛ ስልክ ቁጥር" 
            value={customerPhone}
            onChange={(e) => setCustomerPhone(e.target.value)}
            className="w-full px-3 py-2 border rounded-lg text-sm bg-white focus:outline-none"
          />
        </div>

        <div className="flex-1 overflow-y-auto p-4 space-y-3">
          {cart.length === 0 ? (
            <div className="text-center text-gray-400 mt-20">
              <p className="text-3xl mb-2">🛒</p>
              <p className="text-sm">እባክዎ ለደንበኛው የሚሆኑ ዕቃዎችን ይምረጡ።</p>
            </div>
          ) : (
            cart.map(item => (
              <div key={item.id} className="flex justify-between items-center bg-slate-50 p-3 rounded-lg border">
                <div className="flex-1">
                  <h4 className="font-bold text-sm text-gray-800">{item.title}</h4>
                  <p className="text-xs text-gray-500">{item.selling_price} ብር × {item.quantity}</p>
                </div>
                <div className="flex items-center space-x-2">
                  <span className="font-bold text-green-600 text-sm">{item.selling_price * item.quantity} ብር</span>
                  <button onClick={() => removeFromCart(item.id)} className="text-red-500 font-bold px-2 py-1 text-xs bg-red-50 rounded">✕</button>
                </div>
              </div>
            ))
          )}
        </div>

        <div className="p-4 bg-gray-50 border-t space-y-3">
          <div className="flex justify-between text-base font-bold text-gray-800">
            <span>አጠቃላይ ድምር:</span>
            <span className="text-green-600 text-xl">{totalAmount} ብር</span>
          </div>

          <button 
            onClick={handleSendToCashier}
            disabled={cart.length === 0}
            className={`w-full py-3 rounded-xl font-bold text-white shadow-md transition-all ${cart.length === 0 ? 'bg-gray-400 cursor-not-allowed' : 'bg-blue-600 hover:bg-blue-700'}`}
          >
            📤 ለካሽር ላክ (Send to Cashier)
          </button>
        </div>
      </div>
    </div>
  );
}

export default SalesDashboard;