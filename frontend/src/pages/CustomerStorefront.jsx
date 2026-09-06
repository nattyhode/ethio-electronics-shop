import { useState, useEffect } from 'react';
import axios from 'axios';

function CustomerStorefront() {
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('ALL');
  
  const [cart, setCart] = useState([]);
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [isCheckout, setIsCheckout] = useState(false);

  // 🚀 አዳዲስ ስቴቶች
  const [paymentScreenshot, setPaymentScreenshot] = useState(null);
  const [orderSuccessData, setOrderSuccessData] = useState(null); // የተሳካ ትዕዛዝ ኮድ ለማሳየት

  const [customerInfo, setCustomerInfo] = useState({
    name: '', phone: '', needsDelivery: false, address: '', notes: ''
  });

  useEffect(() => {
    fetchData();
    const savedCart = localStorage.getItem('ethioElectronicsCart');
    if (savedCart) setCart(JSON.parse(savedCart));
  }, []);

  useEffect(() => {
    localStorage.setItem('ethioElectronicsCart', JSON.stringify(cart));
  }, [cart]);

  const fetchData = async () => {
    try {
      const prodRes = await axios.get(`${import.meta.env.VITE_API_URL}/products`);
      const catRes = await axios.get(`${import.meta.env.VITE_API_URL}/categories`);
      setProducts(prodRes.data);
      setCategories(catRes.data);
    } catch (error) {
      console.error('መረጃ ማምጣት አልተቻለም:', error);
    }
  };

  const addToCart = (product) => {
    const existingItem = cart.find(item => item.id === product.id);
    if (existingItem) setCart(cart.map(item => item.id === product.id ? { ...item, quantity: item.quantity + 1 } : item));
    else setCart([...cart, { ...product, quantity: 1 }]);
  };

  const updateQuantity = (id, amount) => {
    setCart(cart.map(item => {
      if (item.id === id) {
        const newQuantity = item.quantity + amount;
        return newQuantity > 0 ? { ...item, quantity: newQuantity } : null;
      }
      return item;
    }).filter(Boolean));
  };

  const removeFromCart = (id) => setCart(cart.filter(item => item.id !== id));

  const subtotal = cart.reduce((total, item) => total + (item.selling_price * item.quantity), 0);
  const totalItemsCount = cart.reduce((count, item) => count + item.quantity, 0);
  const taxRate = 0.15;
  const taxAmount = subtotal * taxRate;
  const deliveryFee = customerInfo.needsDelivery ? 200 : 0; 
  const grandTotal = subtotal + taxAmount + deliveryFee;

  // 🚀 የ Checkout አሰራር (FormData ለፎቶ እና Short Code) - ከ Render Backend ጋር የተገናኘ
  const handleCheckoutSubmit = async (e) => {
    e.preventDefault();
    if (cart.length === 0) return alert('ቅርጫትዎ ባዶ ነው!');
    if (customerInfo.needsDelivery && !paymentScreenshot) return alert('እባክዎ የክፍያዎን ስክሪንሾት ያስገቡ!');

    // አጭር ኮድ ማመንጨት (ምሳሌ፡ 8A3K9)
    const shortCode = Math.random().toString(36).substring(2, 7).toUpperCase();
    
    const formData = new FormData();
    formData.append('customer_name', customerInfo.name);
    formData.append('customer_phone', customerInfo.phone);
    formData.append('short_code', shortCode);
    formData.append('status', 'PENDING');
    formData.append('total_amount', grandTotal);
    formData.append('items', JSON.stringify(cart.map(item => ({ id: item.id, title: item.title, quantity: item.quantity, price: item.selling_price }))));
    formData.append('extra_details', JSON.stringify({
      delivery_requested: customerInfo.needsDelivery,
      delivery_address: customerInfo.address,
      order_notes: customerInfo.notes
    }));

    if (customerInfo.needsDelivery && paymentScreenshot) {
      formData.append('payment_screenshot', paymentScreenshot);
    }

    try {
      await axios.post(`${import.meta.env.VITE_API_URL}/sales-orders`, formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });
      
      // ሲሳካ ኮዱን ለደንበኛው እናሳያለን
      setOrderSuccessData({ shortCode, isDelivery: customerInfo.needsDelivery });
      
      setCart([]); setPaymentScreenshot(null);
      setCustomerInfo({ name: '', phone: '', needsDelivery: false, address: '', notes: '' });
      localStorage.removeItem('ethioElectronicsCart'); 
    } catch (error) {
      console.error('Checkout error:', error);
      alert('ስህተት ተፈጥሯል! እባክዎ እንደገና ይሞክሩ።');
    }
  };

  const filteredProducts = products.filter(product => {
    const matchesSearch = product.title.toLowerCase().includes(searchQuery.toLowerCase()) || 
                          (product.brand && product.brand.toLowerCase().includes(searchQuery.toLowerCase()));
    const matchesCategory = selectedCategory === 'ALL' || product.category_id.toString() === selectedCategory.toString();
    return matchesSearch && matchesCategory;
  });

  return (
    <div className="min-h-screen bg-slate-50 font-sans relative pb-20 md:pb-0">
      
      {/* 🚀 የትዕዛዝ ማረጋገጫ (Success Modal) */}
      {orderSuccessData && (
        <div className="fixed inset-0 bg-black/80 z-[100] flex items-center justify-center p-4 backdrop-blur-sm">
          <div className="bg-white p-8 rounded-3xl max-w-sm w-full text-center shadow-2xl animate-fade-in-up">
            <div className="w-20 h-20 bg-green-100 text-green-600 rounded-full flex items-center justify-center mx-auto mb-4 text-4xl">🎉</div>
            <h2 className="text-2xl font-black text-gray-800 mb-2">ትዕዛዝዎ ተልኳል!</h2>
            
            {orderSuccessData.isDelivery ? (
              <p className="text-gray-600 mb-6 font-medium">የክፍያ ማረጋገጫዎ ደርሶናል! አድራሻዎ ድረስ በፍጥነት እናደርሳለን።</p>
            ) : (
              <div className="bg-amber-50 p-4 rounded-xl border border-amber-200 mb-6">
                <p className="text-sm text-gray-600 mb-2 font-bold">የእርስዎ ትዕዛዝ መለያ ኮድ፡</p>
                <div className="text-4xl font-black text-slate-900 tracking-widest">{orderSuccessData.shortCode}</div>
                <p className="text-xs text-amber-700 mt-2 font-bold uppercase">ይህንን ኮድ ይዘው ሱቅ ይምጡ!</p>
              </div>
            )}
            
            <button onClick={() => { setOrderSuccessData(null); setIsCheckout(false); setIsCartOpen(false); }} className="w-full bg-slate-900 text-white font-black py-3 rounded-xl">ጨርሻለሁ (Close)</button>
          </div>
        </div>
      )}

      {/* Header */}
      <header className="bg-slate-900 text-white sticky top-0 z-40 shadow-xl">
        <div className="max-w-7xl mx-auto px-4 py-3 flex flex-wrap justify-between items-center gap-y-3">
          <div className="text-xl md:text-2xl font-black text-amber-400 cursor-pointer flex items-center space-x-2">
            <span className="text-2xl md:text-3xl">⚡</span>
            <span className="tracking-tighter">ኢትዮ-ኤሌክትሮኒክስ</span>
          </div>
          <div className="hidden md:flex flex-1 max-w-xl mx-8 relative">
            <input type="text" value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} placeholder="ዕቃ ይፈልጉ..." className="w-full py-2.5 px-5 rounded-full text-gray-900 focus:outline-none focus:ring-4 focus:ring-amber-400/50 shadow-inner bg-gray-100 text-sm" />
          </div>
          <div className="relative cursor-pointer flex items-center bg-slate-800 px-3 py-1.5 md:px-4 md:py-2 rounded-full border border-slate-700 hover:border-amber-400" onClick={() => setIsCartOpen(true)}>
            <span className="text-xl md:text-2xl">🛒</span>
            {totalItemsCount > 0 && <span className="absolute -top-1.5 -right-1.5 bg-amber-400 text-slate-900 font-black text-[10px] w-5 h-5 rounded-full flex items-center justify-center border-2 border-slate-900 animate-bounce">{totalItemsCount}</span>}
            <span className="ml-2 font-bold hidden sm:block text-sm">
              <span className="block text-[10px] text-gray-400 font-normal uppercase tracking-widest leading-none">ድምር</span>
              <span className="text-amber-400 leading-none">{grandTotal.toLocaleString()} ብር</span>
            </span>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-2 md:px-4 py-4 md:py-8 flex flex-col md:flex-row gap-4 md:gap-8">
        <aside className="w-full md:w-56 flex-shrink-0">
          <div className="bg-white md:rounded-2xl shadow-sm border-b md:border border-gray-100 p-2 md:p-4 sticky top-[104px] md:top-28 z-30">
            <h3 className="font-black text-gray-800 border-b-2 border-amber-400 pb-2 mb-3 uppercase tracking-widest text-xs hidden md:block">ምድቦች</h3>
            <ul className="flex md:flex-col overflow-x-auto gap-2 md:gap-1 pb-2 md:pb-0 scrollbar-hide">
              <li className="flex-shrink-0"><button onClick={() => setSelectedCategory('ALL')} className={`w-full px-4 py-2 rounded-full md:rounded-xl text-xs md:text-sm font-bold ${selectedCategory === 'ALL' ? 'bg-slate-900 text-white' : 'bg-gray-100 text-gray-600'}`}>ሁሉም</button></li>
              {categories.map((cat) => (
                <li key={cat.id} className="flex-shrink-0"><button onClick={() => setSelectedCategory(cat.id)} className={`w-full px-4 py-2 rounded-full md:rounded-xl text-xs md:text-sm font-bold ${selectedCategory === cat.id ? 'bg-slate-900 text-white' : 'bg-gray-100 text-gray-600'}`}>{cat.name}</button></li>
              ))}
            </ul>
          </div>
        </aside>

        <main className="flex-1">
          <div className="grid grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3 md:gap-6 px-1 md:px-0">
            {filteredProducts.map((product) => {
              const totalStock = (product.stock_main_store || 0) + (product.stock_warehouse_1 || 0);
              const isOutOfStock = totalStock === 0;
              return (
                <div key={product.id} className="bg-white rounded-2xl md:rounded-3xl border border-gray-100 hover:border-amber-200 overflow-hidden hover:shadow-xl transition-all duration-300 flex flex-col group relative">
                  <div className="h-32 md:h-52 w-full bg-gradient-to-b from-gray-50 to-gray-100 relative flex items-center justify-center p-3">
                    {product.image_url ? <img src={product.image_url} alt="" className="max-h-full max-w-full object-contain group-hover:scale-110 transition-transform" /> : <span className="text-[10px] uppercase text-gray-300">No Img</span>}
                    {isOutOfStock && <div className="absolute top-2 right-2 bg-red-500 text-white text-[9px] font-black px-2 py-1 rounded-full uppercase">አልቋል</div>}
                    {!isOutOfStock && (
                      <button onClick={() => addToCart(product)} className="absolute bottom-2 right-2 md:bottom-4 md:right-4 bg-slate-900 hover:bg-amber-400 text-white hover:text-slate-900 w-8 h-8 md:w-12 md:h-12 rounded-full flex items-center justify-center shadow-md transform opacity-100 md:opacity-0 md:group-hover:opacity-100 transition-all z-10"><span className="text-sm md:text-xl">🛒</span></button>
                    )}
                  </div>
                  <div className="p-3 md:p-5 flex flex-col flex-1 bg-white">
                    <p className="text-[9px] md:text-[10px] text-gray-400 font-bold mb-1 uppercase tracking-widest">{product.brand || 'General'}</p>
                    <h3 className="text-[12px] md:text-[15px] font-bold text-gray-800 line-clamp-2 md:truncate mb-2">{product.title}</h3>
                    <div className="mt-auto pt-2 flex justify-between items-end border-t border-gray-50">
                      <span className="text-sm md:text-lg font-black text-slate-900">{product.selling_price ? product.selling_price.toLocaleString() : '---'} <span className="text-[9px] text-gray-500">ብር</span></span>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </main>
      </div>

      {/* Cart & Checkout Drawer */}
      {isCartOpen && <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 transition-all duration-300" onClick={() => setIsCartOpen(false)}></div>}
      <div className={`fixed top-0 right-0 h-full w-full sm:w-[450px] bg-white shadow-2xl z-50 transform transition-transform duration-300 ease-in-out flex flex-col ${isCartOpen ? 'translate-x-0' : 'translate-x-full'}`}>
        <div className="bg-slate-900 text-white p-4 flex justify-between items-center shrink-0">
          <h2 className="text-lg font-black flex items-center"><span className="text-xl mr-3">🛒</span> ቅርጫት</h2>
          <button onClick={() => setIsCartOpen(false)} className="text-gray-400 hover:text-white font-bold text-2xl">✕</button>
        </div>

        <div className="flex-1 overflow-y-auto p-3 bg-gray-50">
          {cart.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-full text-gray-400"><span className="text-6xl mb-6 opacity-20">🛍️</span><p className="font-bold">ባዶ ነው</p></div>
          ) : (
            <div className="space-y-3">
              {cart.map((item) => (
                <div key={item.id} className="bg-white p-2.5 rounded-2xl shadow-sm border border-gray-100 flex gap-3 relative group">
                  <button onClick={() => removeFromCart(item.id)} className="absolute -top-2 -right-2 bg-red-100 text-red-600 rounded-full w-6 h-6 flex items-center justify-center font-bold text-xs shadow-sm z-10">✕</button>
                  <div className="w-16 h-16 bg-gray-50 rounded-xl border flex-shrink-0 flex items-center justify-center overflow-hidden">
                    {item.image_url ? <img src={item.image_url} alt="" className="max-w-full max-h-full" /> : <span className="text-[9px] text-gray-400">No Img</span>}
                  </div>
                  <div className="flex-1 flex flex-col justify-between py-1">
                    <h4 className="text-[12px] font-bold text-gray-800 line-clamp-2 pr-4">{item.title}</h4>
                    <div className="flex justify-between items-end mt-1">
                      <span className="font-black text-blue-600 text-[13px]">{(item.selling_price * item.quantity).toLocaleString()} ብር</span>
                      <div className="flex items-center border border-gray-200 rounded-lg bg-white h-7">
                        <button onClick={() => updateQuantity(item.id, -1)} className="px-2.5 py-1 font-bold">-</button>
                        <span className="px-2 py-1 text-xs font-black bg-gray-50 border-x">{item.quantity}</span>
                        <button onClick={() => updateQuantity(item.id, 1)} className="px-2.5 py-1 font-bold">+</button>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {cart.length > 0 && (
          <div className="bg-white border-t p-4 shrink-0">
            {!isCheckout ? (
              <>
                <div className="bg-gray-50 p-3 rounded-xl mb-3 space-y-2 text-xs border border-gray-100">
                  <div className="flex justify-between font-medium"><span>ድምር:</span> <span>{subtotal.toLocaleString()} ብር</span></div>
                  <div className="flex justify-between font-medium"><span>ታክስ (15%):</span> <span>{taxAmount.toLocaleString()} ብር</span></div>
                  <div className="flex justify-between border-t pt-2 mt-1 text-base"><span className="font-black">ጠቅላላ:</span> <span className="font-black text-amber-500">{grandTotal.toLocaleString()} ብር</span></div>
                </div>
                <button onClick={() => setIsCheckout(true)} className="w-full bg-slate-900 text-white font-black py-3 rounded-xl">ወደ ክፍያ ➔</button>
              </>
            ) : (
              <form onSubmit={handleCheckoutSubmit} className="space-y-3 max-h-[60vh] overflow-y-auto pr-1 custom-scrollbar">
                <div className="flex justify-between items-center mb-1 pb-2 border-b sticky top-0 bg-white z-10">
                  <span className="font-black text-sm">መረጃዎን ያስገቡ</span>
                  <button type="button" onClick={() => setIsCheckout(false)} className="text-xs bg-gray-100 px-2 py-1 rounded-full font-bold">⬅ ተመለስ</button>
                </div>
                
                <div className="grid grid-cols-2 gap-2">
                  <div><label className="block text-[10px] font-bold text-gray-500 uppercase">ስም *</label><input type="text" required value={customerInfo.name} onChange={e => setCustomerInfo({...customerInfo, name: e.target.value})} className="w-full px-3 py-2 border rounded-lg text-xs" /></div>
                  <div><label className="block text-[10px] font-bold text-gray-500 uppercase">ስልክ *</label><input type="tel" required value={customerInfo.phone} onChange={e => setCustomerInfo({...customerInfo, phone: e.target.value})} className="w-full px-3 py-2 border rounded-lg text-xs" /></div>
                </div>

                <div className="bg-blue-50 p-3 rounded-xl border border-blue-100">
                  <div className="flex items-center space-x-2">
                    <input type="checkbox" id="delivery" checked={customerInfo.needsDelivery} onChange={e => setCustomerInfo({...customerInfo, needsDelivery: e.target.checked})} className="w-4 h-4 rounded cursor-pointer" />
                    <label htmlFor="delivery" className="text-xs font-bold text-slate-900 cursor-pointer">በሞባይል ከፍዬ በዕቃ ማድረሻ (Delivery) እፈልጋለሁ</label>
                  </div>
                  
                  {customerInfo.needsDelivery && (
                    <div className="mt-3 space-y-3 animate-fade-in-up">
                      <div>
                        <label className="block text-[10px] font-bold text-gray-500 uppercase mb-1">አድራሻ *</label>
                        <textarea required value={customerInfo.address} onChange={e => setCustomerInfo({...customerInfo, address: e.target.value})} className="w-full px-3 py-2 border rounded-lg text-xs" rows="2"></textarea>
                        <p className="text-[10px] text-blue-600 mt-1 font-black">+ 200 ብር ማድረሻ</p>
                      </div>
                      <div className="p-3 bg-white border border-blue-200 rounded-lg border-dashed">
                        <label className="block text-[10px] font-bold text-slate-800 uppercase mb-1">የክፍያ ማረጋገጫ (Screenshot) ያስገቡ *</label>
                        <input type="file" accept="image/*" required onChange={(e) => setPaymentScreenshot(e.target.files[0])} className="w-full text-xs text-gray-500 file:mr-3 file:py-1.5 file:px-3 file:rounded-full file:border-0 file:text-[10px] file:font-bold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"/>
                      </div>
                    </div>
                  )}
                </div>

                <div className="pt-2">
                  <button type="submit" className="w-full bg-slate-900 text-amber-400 font-black text-sm py-3 rounded-xl flex flex-col items-center">
                    <span className="mb-1">ትዕዛዙን ላክ</span>
                    <span className="text-[9px] text-white uppercase">ጠቅላላ: {grandTotal.toLocaleString()} ብር</span>
                  </button>
                </div>
              </form>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

export default CustomerStorefront;