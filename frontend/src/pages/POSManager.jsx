import { useState, useEffect } from 'react';
import axios from 'axios';

function POSManager() {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchCode, setSearchCode] = useState('');
  
  const [editingOrder, setEditingOrder] = useState(null);
  
  // 🚀 አዲሱ ስቴት፡ የትኛውን ገፅ እናሳይ? (PENDING ወይስ COMPLETED)
  const [activeTab, setActiveTab] = useState('PENDING');

  const fetchOrders = async () => {
    try {
      const res = await axios.get(`${import.meta.env.VITE_API_URL}/sales-orders`);
      setOrders(res.data);
      setLoading(false);
    } catch (error) {
      console.error('ትዕዛዞችን ማምጣት አልተቻለም:', error);
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOrders();
    const interval = setInterval(fetchOrders, 10000); 
    return () => clearInterval(interval);
  }, []);

  const openOrder = (orderToOpen) => {
    // 🚀 አሁን የተጠናቀቁትንም መክፈት እና ማየት ይቻላል (ለማረጋገጫ)
    setEditingOrder(JSON.parse(JSON.stringify(orderToOpen))); 
  };

  const handleSearch = (e) => {
    e.preventDefault();
    if (!searchCode) return;
    const foundOrder = orders.find(o => o.short_code && o.short_code.toUpperCase() === searchCode.toUpperCase());
    
    if (foundOrder) {
      openOrder(foundOrder);
    } else {
      alert('ይህ ኮድ ያለው ትዕዛዝ አልተገኘም! (ኮዱን በትክክል ያስገቡ)');
    }
  };

  const getExtraDetails = () => {
    if (!editingOrder || !editingOrder.extra_details) return null;
    return typeof editingOrder.extra_details === 'string' 
      ? JSON.parse(editingOrder.extra_details) 
      : editingOrder.extra_details;
  };

  const updateOrderItemQuantity = (itemId, amount) => {
    // የተጠናቀቀ ከሆነ ብዛት መጨመር/መቀነስ አይቻልም
    if (!editingOrder || editingOrder.status === 'COMPLETED') return;
    
    const updatedItems = editingOrder.items.map(item => {
      if (item.id === itemId) {
        const newQuantity = item.quantity + amount;
        return newQuantity > 0 ? { ...item, quantity: newQuantity } : null;
      }
      return item;
    }).filter(Boolean);

    const newTotal = updatedItems.reduce((sum, item) => sum + (item.price * item.quantity), 0);
    
    const extra = getExtraDetails();
    const tax = newTotal * 0.15;
    const delivery = extra?.delivery_requested ? 200 : 0;
    
    setEditingOrder({
      ...editingOrder,
      items: updatedItems,
      total_amount: newTotal + tax + delivery
    });
  };

  const completeOrder = async () => {
    if (window.confirm('ይህን ሽያጭ አረጋግጠው ማጠናቀቅ ይፈልጋሉ? \n(ይህ እርምጃ ከክምችት ላይ ዕቃ ይቀንሳል)')) {
      try {
        const res = await axios.get(`${import.meta.env.VITE_API_URL}/sales-orders`);
        alert('✅ ሽያጩ በተሳካ ሁኔታ ተጠናቋል!');
        setEditingOrder(null);
        setSearchCode('');
        fetchOrders();
      } catch (error) {
        alert('ስህተት ተፈጥሯል!');
      }
    }
  };

  if (loading) return <div className="text-center p-10 font-bold text-gray-500">መረጃ በመጫን ላይ ነው... ⏳</div>;

  // 🚀 ትዕዛዞችን ለየብቻ ማጣራት
  const pendingOrders = orders.filter(o => o.status === 'PENDING');
  const completedOrders = orders.filter(o => o.status === 'COMPLETED');
  
  // የትኛው ይታይ?
  const displayedOrders = activeTab === 'PENDING' ? pendingOrders : completedOrders;
  const extraDetails = getExtraDetails(); 

  return (
    <div className="space-y-6 animate-fade-in-up pb-10">
      
      <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
        <div className="flex flex-col md:flex-row justify-between items-center gap-4">
          <div>
            <h2 className="text-2xl font-black text-slate-900">💰 የካሺር መቆጣጠሪያ (POS)</h2>
            <p className="text-sm text-gray-500 mt-1">የደንበኛ ኮድ በማስገባት ትዕዛዞችን ያጠናቅቁ</p>
          </div>
          
          <form onSubmit={handleSearch} className="flex w-full md:w-auto">
            <input 
              type="text" 
              value={searchCode}
              onChange={(e) => setSearchCode(e.target.value)}
              placeholder="የደንበኛ ኮድ (ምሳሌ: A7B9X)" 
              className="px-4 py-3 border-2 border-gray-200 rounded-l-xl focus:outline-none focus:border-amber-400 font-bold uppercase w-full md:w-64"
            />
            <button type="submit" className="bg-slate-900 hover:bg-slate-800 text-amber-400 px-6 font-black rounded-r-xl transition-colors">
              ፈልግ 🔍
            </button>
          </form>
        </div>
      </div>

      {editingOrder && (
        <div className="bg-white border-2 border-amber-400 rounded-2xl shadow-xl overflow-hidden animate-fade-in-up">
          <div className="bg-amber-50 p-4 border-b border-amber-200 flex justify-between items-center">
            <div>
              <span className={`text-xs font-bold uppercase tracking-widest block mb-1 ${editingOrder.status === 'COMPLETED' ? 'text-green-600' : 'text-amber-600'}`}>
                {editingOrder.status === 'COMPLETED' ? '✅ የተጠናቀቀ ሽያጭ ማረጋገጫ' : 'አሁን እየተስተናገደ ያለ ትዕዛዝ'}
              </span>
              <h3 className="text-xl font-black text-slate-900">👤 {editingOrder.customer_name} <span className="text-sm font-medium text-gray-500 ml-2">(📞 {editingOrder.customer_phone})</span></h3>
            </div>
            <button onClick={() => setEditingOrder(null)} className="text-gray-400 hover:text-red-500 font-bold text-xl">✕ ዝጋ</button>
          </div>

          <div className="p-6 grid grid-cols-1 md:grid-cols-2 gap-8">
            
            <div>
              <h4 className="font-bold text-gray-800 mb-4 border-b pb-2">የተዘዙ ዕቃዎች</h4>
              <div className="space-y-3 max-h-64 overflow-y-auto pr-2">
                {editingOrder.items.map(item => (
                  <div key={item.id} className="flex justify-between items-center bg-gray-50 p-3 rounded-lg border border-gray-200">
                    <div className="flex-1 pr-4">
                      <p className="text-sm font-bold text-slate-800 line-clamp-1">{item.title}</p>
                      <p className="text-xs text-gray-500 mt-1">{item.price.toLocaleString()} ብር/አንዱ</p>
                    </div>
                    
                    {/* 🚀 የተጠናቀቀ ከሆነ የመቀነሻ/መጨመሪያ ቁልፉ ይጠፋል */}
                    {editingOrder.status === 'PENDING' ? (
                      <div className="flex items-center border border-gray-300 rounded-md bg-white">
                        <button onClick={() => updateOrderItemQuantity(item.id, -1)} className="px-3 py-1 font-bold text-red-500 hover:bg-gray-100">-</button>
                        <span className="px-3 py-1 font-black bg-gray-50 border-x border-gray-300">{item.quantity}</span>
                        <button onClick={() => updateOrderItemQuantity(item.id, 1)} className="px-3 py-1 font-bold text-green-600 hover:bg-gray-100">+</button>
                      </div>
                    ) : (
                      <div className="font-black text-slate-900 px-3 py-1 bg-gray-200 rounded">
                        {item.quantity} ፍሬ
                      </div>
                    )}
                  </div>
                ))}
              </div>
              
              <div className="mt-6 bg-slate-900 p-4 rounded-xl text-white flex justify-between items-center shadow-md">
                <span className="font-medium text-gray-300">አጠቃላይ ክፍያ:</span>
                <span className="font-black text-2xl text-amber-400">{editingOrder.total_amount?.toLocaleString()} ብር</span>
              </div>
              
              {/* 🚀 የተጠናቀቀ ከሆነ ማጠናቀቂያ በተን ይጠፋና አረንጓዴ ማረጋገጫ ይመጣል */}
              {editingOrder.status === 'PENDING' ? (
                <button onClick={completeOrder} className="w-full mt-4 bg-green-600 hover:bg-green-700 text-white font-black py-4 rounded-xl shadow-lg transition-transform active:scale-95 text-lg">
                  ✅ ክፍያ ተቀብያለሁ (ሽያጭ አጠናቅ)
                </button>
              ) : (
                <div className="w-full mt-4 bg-green-100 text-green-800 font-black py-4 rounded-xl text-center text-lg border border-green-200">
                  ✅ ይህ ሽያጭ ከዚህ በፊት ተጠናቋል
                </div>
              )}
            </div>

            <div className="border-l border-gray-100 md:pl-8">
              <h4 className="font-bold text-gray-800 mb-4 border-b pb-2">የደንበኛው ዝርዝር መረጃ</h4>
              
              {editingOrder.payment_screenshot ? (
                <div className="mb-6">
                  <span className="inline-block bg-green-100 text-green-800 text-xs font-bold px-2 py-1 rounded mb-2">📸 የክፍያ ስክሪንሾት</span>
                  <div className="w-full h-48 border-2 border-gray-200 rounded-xl overflow-hidden bg-gray-50 flex items-center justify-center">
                    <a href={editingOrder.payment_screenshot} target="_blank" rel="noreferrer" title="ስክሪንሾቱን በሰፊው ለማየት ይጫኑ">
                      <img src={editingOrder.payment_screenshot} alt="Payment Proof" className="max-h-full max-w-full object-contain hover:scale-105 transition-transform" />
                    </a>
                  </div>
                </div>
              ) : (
                <div className="mb-6 bg-gray-50 p-4 rounded-xl border border-gray-200 text-center">
                  <p className="text-sm font-bold text-gray-500">ይህ ደንበኛ ስክሪንሾት የለውም (ሱቅ መጥቶ የከፈለ ነው)</p>
                </div>
              )}

              {extraDetails && (
                <div className="text-sm space-y-2 text-gray-600">
                  {extraDetails.delivery_requested && (
                    <p className="bg-blue-50 text-blue-800 p-2 rounded border border-blue-100 font-medium">
                      🚚 <b>ማድረሻ አድራሻ:</b> {extraDetails.delivery_address}
                    </p>
                  )}
                  {extraDetails.order_notes && (
                    <p><b>ማስታወሻ:</b> {extraDetails.order_notes}</p>
                  )}
                </div>
              )}
            </div>

          </div>
        </div>
      )}

      {/* 🚀 የትዕዛዞች ዝርዝር እና መምረጫ (Tabs) */}
      {!editingOrder && (
        <div className="mt-8">
          
          <div className="flex border-b border-gray-200 mb-6">
            <button 
              onClick={() => setActiveTab('PENDING')}
              className={`px-6 py-3 font-black text-sm transition-all ${activeTab === 'PENDING' ? 'border-b-4 border-amber-400 text-slate-900' : 'text-gray-400 hover:text-gray-600'}`}
            >
              አዳዲስ ትዕዛዞች <span className="bg-amber-100 text-amber-800 px-2 py-0.5 rounded-full ml-1 text-xs">{pendingOrders.length}</span>
            </button>
            <button 
              onClick={() => setActiveTab('COMPLETED')}
              className={`px-6 py-3 font-black text-sm transition-all ${activeTab === 'COMPLETED' ? 'border-b-4 border-green-500 text-green-700' : 'text-gray-400 hover:text-gray-600'}`}
            >
              የተጠናቀቁ ሽያጮች <span className="bg-green-100 text-green-800 px-2 py-0.5 rounded-full ml-1 text-xs">{completedOrders.length}</span>
            </button>
          </div>
          
          {displayedOrders.length === 0 ? (
            <div className="text-center py-10 bg-white rounded-xl border border-gray-100 shadow-sm">
              <span className="text-4xl opacity-50">📭</span>
              <p className="text-gray-500 font-bold mt-2">በዚህ ምድብ ምንም መረጃ የለም</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {displayedOrders.map(order => (
                <div key={order.id} className={`bg-white p-4 rounded-xl border-l-4 shadow-sm transition-colors ${order.status === 'COMPLETED' ? 'border-green-500 hover:bg-green-50' : 'border-amber-400 hover:bg-amber-50'}`}>
                  <div className="flex justify-between items-start mb-2">
                    <h4 className="font-bold text-slate-800">{order.customer_name}</h4>
                    <span className="text-xs font-black bg-gray-100 text-gray-600 px-2 py-1 rounded uppercase tracking-widest">{order.short_code}</span>
                  </div>
                  <p className="text-xs text-gray-500 mb-3">📞 {order.customer_phone}</p>
                  <div className="flex justify-between items-center">
                    <span className="font-black text-slate-900">{order.total_amount?.toLocaleString()} ብር</span>
                    <button 
                      onClick={() => openOrder(order)} 
                      className={`text-xs font-bold px-3 py-1.5 rounded transition-colors cursor-pointer ${order.status === 'COMPLETED' ? 'bg-green-100 text-green-800 hover:bg-green-200' : 'bg-amber-100 text-amber-800 hover:bg-amber-200'}`}
                    >
                      {order.status === 'COMPLETED' ? 'ዝርዝር እይ ➔' : 'ክፈት ➔'}
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

    </div>
  );
}

export default POSManager;