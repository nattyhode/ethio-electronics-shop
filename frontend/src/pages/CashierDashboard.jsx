import { useState, useEffect } from 'react';
import axios from 'axios';

function CashierDashboard({ user, onLogout }) {
  const [orders, setOrders] = useState([]);

  // ለካሽር የተላኩ ጥያቄዎችን (Pending Orders) ከሰርቨር ማምጣት
  const fetchOrders = async () => {
    try {
      // 🚀 ሎካልሆስት ወደ ዳይናሚክ ዩአርኤል ተቀይሯል (ነጠላ ኮቴሽን ወደ ባክቲክ ተቀይሯል)
      const res = await axios.get(`${import.meta.env.VITE_API_URL}/sales-orders`);
      // PENDING የሆኑትን ብቻ ማጣራት
      const pendingOrders = res.data.filter(ord => ord.status === 'PENDING');
      setOrders(pendingOrders);
    } catch (error) {
      console.error('የሽያጭ ጥያቄዎችን ማምጣት አልተቻለም:', error);
    }
  };

  useEffect(() => {
    fetchOrders();
    // በየ 5 ሰከንዱ አዳዲስ ጥያቄዎች እንዳሉ በራሱ እንዲያይ ማድረግ ይቻላል
    const interval = setInterval(fetchOrders, 5000);
    return () => clearInterval(interval);
  }, []);

  // 💳 ክፍያ ተቀብሎ ሽያጩን ማጠናቀቅ እና ደረሰኝ መቁረጥ
  const handleCompleteSale = async (order) => {
    const confirmPayment = window.confirm(`ለደንበኛ ${order.customer_name} የተደረገውን የ ${order.total_amount} ብር ክፍያ ተቀብለዋል?`);
    if (!confirmPayment) return;

    try {
      // 🚀 እዚህም ሎካልሆስት ተቀይሯል (ባክቲክ በውስጡ ስለነበረው በጥንቃቄ ተስተካክሏል)
      await axios.put(`${import.meta.env.VITE_API_URL}/sales-orders/${order.id}`, {
        items: order.items
      });

      alert('ክፍያው ተረጋግጧል! 🧾 ሽያጩ ተጠናቆ ደረሰኝ ታትሟል።');
      fetchOrders(); // ሊስቱን ማደስ
    } catch (error) {
      alert('ሽያጩን ማጠናቀቅ አልተቻለም!');
      console.error(error);
    }
  };

  return (
    <div className="flex h-screen bg-gray-100 font-sans">
      
      {/* ዋናው የካሽር ስክሪን */}
      <div className="flex-1 flex flex-col h-full overflow-hidden bg-slate-50">
        
        {/* Header */}
        <div className="bg-white p-4 shadow-sm border-b flex justify-between items-center">
          <div>
            <h1 className="text-xl font-bold text-gray-800">የካሽር መቆጣጠሪያ (Cashier POS Desk)</h1>
            <p className="text-xs text-gray-500">ካሽር፡ <span className="font-bold text-blue-600">{user?.full_name}</span></p>
          </div>
          
          <button onClick={onLogout} className="bg-red-50 text-red-600 px-3 py-1.5 rounded-lg font-bold text-sm hover:bg-red-100">
            ውጣ (Logout)
          </button>
        </div>

        {/* Orders List */}
        <div className="flex-1 p-6 overflow-y-auto">
          <h2 className="text-lg font-bold text-gray-800 mb-4">📥 ከሻጮች የተላኩ የደንበኛ የዕቃ ጥያቄዎች ({orders.length})</h2>

          {orders.length === 0 ? (
            <div className="bg-white p-12 rounded-xl shadow-sm border text-center text-gray-400 mt-10">
              <p className="text-4xl mb-2">⏳</p>
              <p className="text-base font-medium">እስካሁን ከሻጮች የተላከ አዲስ የሽያጭ ጥያቄ የለም。</p>
              <p className="text-xs text-gray-400 mt-1">ሻጮች ዕቃዎችን መርጠው "ለካሽር ላክ" ሲሉ እዚህ ጋር ወዲያውኑ ይመጣል።</p>
            </div>
          ) : (
            <div className="grid grid-cols-2 gap-6">
              {orders.map(order => (
                <div key={order.id} className="bg-white rounded-xl shadow-md border border-blue-100 p-5 flex flex-col justify-between">
                  <div>
                    {/* የደንበኛ መረጃ */}
                    <div className="flex justify-between items-center border-b pb-3 mb-3">
                      <div>
                        <h3 className="font-bold text-gray-800 text-base">👤 {order.customer_name}</h3>
                        <p className="text-xs text-gray-500">ስልክ: {order.customer_phone || 'አልተሰጠም'}</p>
                      </div>
                      <span className="bg-amber-100 text-amber-800 px-2.5 py-1 rounded-full text-xs font-bold">
                        ⏳ ክፍያ የሚጠብቅ
                      </span>
                    </div>

                    {/* የተመረጡ ዕቃዎች ዝርዝር */}
                    <div className="space-y-2 mb-4 max-h-40 overflow-y-auto pr-1">
                      {order.items.map((item, idx) => (
                        <div key={idx} className="flex justify-between text-sm bg-slate-50 p-2 rounded border">
                          <span className="text-gray-700 font-medium">{item.title} ({item.quantity} ብዛት)</span>
                          <span className="font-bold text-slate-900">{item.selling_price * item.quantity} ብር</span>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* ጠቅላላ ዋጋ እና የክፍያ በተን */}
                  <div className="pt-3 border-t flex justify-between items-center">
                    <div>
                      <p className="text-xs text-gray-500">አጠቃላይ ዋጋ:</p>
                      <p className="text-lg font-bold text-green-600">{order.total_amount} ብር</p>
                    </div>

                    <button 
                      onClick={() => handleCompleteSale(order)}
                      className="bg-green-600 text-white font-bold px-5 py-2.5 rounded-xl hover:bg-green-700 shadow-sm transition-all text-sm"
                    >
                      💳 ክፍያ ተቀበል & ደረሰኝ ቆርጥ
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

      </div>

    </div>
  );
}

export default CashierDashboard;