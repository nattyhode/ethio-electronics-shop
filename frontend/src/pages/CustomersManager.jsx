// ፋይል: CustomersManager.jsx
import { useState } from 'react';

function CustomersManager() {
  return (
    <div className="space-y-8">
      <div className="flex justify-between items-center bg-white p-4 rounded-xl shadow-sm border border-gray-100">
        <div>
          <h2 className="text-lg font-bold text-gray-800">የደንበኞች አስተዳደር</h2>
          <p className="text-sm text-gray-500">የደንበኞችን መረጃ፣ ታሪክ እና ክሬዲት (እዳ) ተቆጣጠር</p>
        </div>
        <button className="bg-green-600 text-white font-medium px-4 py-2 rounded-lg hover:bg-green-700 shadow-sm">
          + አዲስ ደንበኛ መዝግብ 🤝
        </button>
      </div>

      <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 text-center py-20">
        <h3 className="text-xl font-bold text-gray-400 mb-2">የደንበኞች ዝርዝር እዚህ ይመጣል</h3>
        <p className="text-gray-500">የደንበኞች ፎርም እና ዳታቤዝ በቅርቡ ይገናኛል...</p>
      </div>
    </div>
  );
}

export default CustomersManager;