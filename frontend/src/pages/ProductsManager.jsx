import { useState, useEffect, useRef } from 'react';
import axios from 'axios';

function ProductsManager({ user }) {
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  
  const [brands, setBrands] = useState(['D-Link', 'Vention', 'Schneider', 'Belden', 'Hikvision', 'Dahua', 'CP Plus', 'Uniview', 'Legrand', 'Simens']);
  const [colorsList, setColorsList] = useState(['Golden', 'Silver', 'Black', 'White', 'Grey', 'Bronze']);

  const [showProductModal, setShowProductModal] = useState(false);
  const [showStockModal, setShowStockModal] = useState(false); 

  const [showNewCategoryInput, setShowNewCategoryInput] = useState(false);
  const [inlineCategoryName, setInlineCategoryName] = useState('');

  const [showNewBrandInput, setShowNewBrandInput] = useState(false);
  const [newBrandName, setNewBrandName] = useState('');

  const [showNewColorInput, setShowNewColorInput] = useState(false);
  const [newColorName, setNewColorName] = useState('');

  const [showColorDropdown, setShowColorDropdown] = useState(false);
  const dropdownRef = useRef(null);

  const [filterCategory, setFilterCategory] = useState('ALL');

  const [isEditing, setIsEditing] = useState(false);
  const [editingId, setEditingId] = useState(null);

  const [imageFile, setImageFile] = useState(null);

  const [newProduct, setNewProduct] = useState({
    title: '', category_id: '', brand: '', colors: [], specs: '', image_url: '', stock_main_store: 0, stock_warehouse_1: 0, cost_price: '', selling_price: ''
  });

  const [stockEntry, setStockEntry] = useState({
    quantity: '', location: 'stock_main_store', currentProduct: null, cost_price: '', selling_price: ''
  });

  const isAdminOrManager = user?.position === 'አድሚን (Admin)' || user?.position === 'ማናጀር (Manager)' || user?.role_code === 'admin' || user?.role_code === 'manager';

  const fetchData = async () => {
    try {
      // 🚀 ሎካልሆስት ወደ ዳይናሚክ ዩአርኤል ተቀይሯል
      const prodRes = await axios.get(`${import.meta.env.VITE_API_URL}/products`);
      setProducts(prodRes.data);
      const catRes = await axios.get(`${import.meta.env.VITE_API_URL}/categories`);
      setCategories(catRes.data);
    } catch (error) {
      console.error('መረጃዎችን ማምጣት አልተቻለም:', error);
    }
  };

  useEffect(() => {
    fetchData();
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) setShowColorDropdown(false);
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleProductChange = (e) => {
    const { name, value } = e.target;
    if (name === 'category_id' && value === 'ADD_NEW_CATEGORY') return setShowNewCategoryInput(true);
    if (name === 'brand' && value === 'ADD_NEW_BRAND') return setShowNewBrandInput(true);
    setNewProduct({ ...newProduct, [name]: value });
  };

  const handleAddInlineCategory = async () => {
    const trimmedName = inlineCategoryName.trim();
    if (trimmedName === '') return;
    try {
      // 🚀 ሎካልሆስት ወደ ዳይናሚክ ዩአርኤል ተቀይሯል
      const res = await axios.post(`${import.meta.env.VITE_API_URL}/categories`, { name: trimmedName });
      const catRes = await axios.get(`${import.meta.env.VITE_API_URL}/categories`);
      setCategories(catRes.data);
      const targetCat = catRes.data.find(c => c.name.toLowerCase() === trimmedName.toLowerCase());
      if (targetCat) setNewProduct(prev => ({ ...prev, category_id: targetCat.id }));
      else if (res.data?.data?.[0]) setNewProduct(prev => ({ ...prev, category_id: res.data.data[0].id }));
      setInlineCategoryName('');
      setShowNewCategoryInput(false);
    } catch (error) {
      alert('ስህተት ተፈጥሯል!');
    }
  };

  const handleAddNewBrand = () => {
    if (newBrandName.trim() !== '') {
      if (!brands.includes(newBrandName)) setBrands([...brands, newBrandName]);
      setNewProduct({ ...newProduct, brand: newBrandName });
      setNewBrandName('');
      setShowNewBrandInput(false);
    }
  };

  const handleAddNewColor = () => {
    if (newColorName.trim() !== '') {
      if (!colorsList.includes(newColorName)) setColorsList([...colorsList, newColorName]);
      setNewProduct({ ...newProduct, colors: [...newProduct.colors, newColorName] });
      setNewColorName('');
      setShowNewColorInput(false);
    }
  };

  const handleColorSelect = (colorName) => {
    if (colorName === 'ADD_NEW_COLOR') {
      setShowNewColorInput(true);
      setShowColorDropdown(false);
      return;
    }
    let updatedColors = [...newProduct.colors];
    if (updatedColors.includes(colorName)) updatedColors = updatedColors.filter(c => c !== colorName);
    else updatedColors.push(colorName);
    setNewProduct({ ...newProduct, colors: updatedColors });
  };

  // 🚀 የካታጎሪ ስምን አብሮ የሚልከው አዲሱ የ Product Submit ፋንክሽን
  const handleProductSubmit = async (e) => {
    e.preventDefault();
    try {
      const formData = new FormData();
      formData.append('title', newProduct.title);
      formData.append('category_id', newProduct.category_id);
      
      // የካታጎሪውን ስም ፈልጎ ማውጣት (ለፎልደር ስም እንዲጠቅመን)
      const selectedCat = categories.find(c => c.id.toString() === newProduct.category_id.toString());
      formData.append('category_name', selectedCat ? selectedCat.name : 'Others');
      
      formData.append('brand', newProduct.brand);
      formData.append('color', newProduct.colors.join(', '));
      formData.append('specs', newProduct.specs);
      formData.append('stock_main_store', newProduct.stock_main_store);
      formData.append('stock_warehouse_1', newProduct.stock_warehouse_1);
      formData.append('cost_price', newProduct.cost_price);
      formData.append('selling_price', newProduct.selling_price);

      if (imageFile) {
        formData.append('image', imageFile);
      }

      if (isEditing) {
        // 🚀 ሎካልሆስት ወደ ዳይናሚክ ዩአርኤል ተቀይሯል
        await axios.put(`${import.meta.env.VITE_API_URL}/products/${editingId}`, formData, {
          headers: { 'Content-Type': 'multipart/form-data' }
        });
        alert('በተሳካ ሁኔታ ተስተካክሏል! ✏️');
      } else {
        // 🚀 ሎካልሆስት ወደ ዳይናሚክ ዩአርኤል ተቀይሯል
        await axios.post(`${import.meta.env.VITE_API_URL}/products`, formData, {
          headers: { 'Content-Type': 'multipart/form-data' }
        });
        alert('ዕቃው ከነ ፎቶው በተሳካ ሁኔታ ተመዝግቧል! 🚀');
      }

      setNewProduct({ title: '', category_id: '', brand: '', colors: [], specs: '', image_url: '', stock_main_store: 0, stock_warehouse_1: 0, cost_price: '', selling_price: '' });
      setImageFile(null);
      setIsEditing(false);
      setEditingId(null);
      setShowProductModal(false);
      fetchData();
    } catch (error) {
      alert('ስህተት ተፈጥሯል!');
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm('ይህንን ዕቃ በእርግጥ ማጥፋት ትፈልጋለህ?')) {
      try {
        // 🚀 ሎካልሆስት ወደ ዳይናሚክ ዩአርኤል ተቀይሯል
        await axios.delete(`${import.meta.env.VITE_API_URL}/products/${id}`);
        alert('ዕቃው በተሳካ ሁኔታ ተሰርዟል! 🗑️');
        fetchData();
      } catch (error) {
        alert('ዕቃውን ማጥፋት አልተቻለም!');
      }
    }
  };

  const openEditModal = (product) => {
    setNewProduct({
      ...product,
      colors: product.color && product.color !== '' ? product.color.split(', ') : [],
      cost_price: product.cost_price || '',
      selling_price: product.selling_price || ''
    });
    setImageFile(null);
    setIsEditing(true);
    setEditingId(product.id);
    setShowProductModal(true);
  };

  const openAddProductModal = () => {
    setNewProduct({ title: '', category_id: '', brand: '', colors: [], specs: '', image_url: '', stock_main_store: 0, stock_warehouse_1: 0, cost_price: '', selling_price: '' });
    setImageFile(null);
    setIsEditing(false);
    setEditingId(null);
    setShowProductModal(true);
  };

  const openStockModal = (product) => {
    setStockEntry({ 
      quantity: '', location: 'stock_main_store', currentProduct: product, cost_price: product.cost_price || '', selling_price: product.selling_price || ''
    });
    setShowStockModal(true);
  };

  const handleStockSubmit = async (e) => {
    e.preventDefault();
    if (!stockEntry.currentProduct) return;
    const loc = stockEntry.location; 
    const addedQty = parseInt(stockEntry.quantity) || 0;
    const currentQty = parseInt(stockEntry.currentProduct[loc]) || 0;
    const newTotal = currentQty + addedQty;

    const updatedProduct = {
      ...stockEntry.currentProduct,
      [loc]: newTotal,
      cost_price: stockEntry.cost_price !== '' ? parseFloat(stockEntry.cost_price) : stockEntry.currentProduct.cost_price,
      selling_price: stockEntry.selling_price !== '' ? parseFloat(stockEntry.selling_price) : stockEntry.currentProduct.selling_price
    };

    try {
      // 🚀 ሎካልሆስት ወደ ዳይናሚክ ዩአርኤል ተቀይሯል
      await axios.put(`${import.meta.env.VITE_API_URL}/products/${stockEntry.currentProduct.id}`, updatedProduct);
      alert(`አዲስ ዕቃ ወደ ${loc === 'stock_main_store' ? 'ዋና ሱቅ' : 'መጋዘን 1'} ገቢ ሆኗል! 📦`);
      setShowStockModal(false);
      fetchData();
    } catch (error) {
      alert('ስህተት ተፈጥሯል!');
    }
  };

  const filteredProducts = filterCategory === 'ALL' 
    ? products : products.filter(item => item.category_id.toString() === filterCategory);

  return (
    <div className="space-y-8">
      <div className="flex justify-between items-center bg-white p-4 rounded-xl shadow-sm border border-gray-100">
        <div>
          <h2 className="text-lg font-bold text-gray-800">የዕቃ ማስተዳደሪያ</h2>
          <p className="text-sm text-gray-500">ዕቃዎችን እና ክምችት ተቆጣጠር</p>
        </div>
        
        {isAdminOrManager && (
          <button onClick={openAddProductModal} className="bg-blue-600 text-white font-medium px-4 py-2 rounded-lg hover:bg-blue-700 shadow-sm">
            + አዲስ ዕቃ መዝግብ 🚀
          </button>
        )}
      </div>

      {/* Product Modal */}
      {showProductModal && isAdminOrManager && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white p-6 rounded-xl shadow-xl w-[550px] max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center mb-4 border-b pb-3">
              <h3 className="text-lg font-bold text-gray-800">{isEditing ? 'የዕቃ መረጃ ማስተካከያ (Edit)' : 'አዲስ ዕቃ መመዝገቢያ ፎርም'}</h3>
              <button onClick={() => setShowProductModal(false)} className="text-gray-400 hover:text-gray-600 font-bold text-xl">✕</button>
            </div>

            <form onSubmit={handleProductSubmit} className="space-y-4">
              <div>
                <label className="block text-gray-700 text-sm font-medium mb-1">ምድብ (Category) ምረጥ</label>
                <select name="category_id" value={newProduct.category_id} onChange={handleProductChange} required={!showNewCategoryInput} className="w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white">
                  <option value="">-- ምድብ ይምረጡ --</option>
                  {categories.map((cat) => <option key={cat.id} value={cat.id}>{cat.name}</option>)}
                  <option value="ADD_NEW_CATEGORY" className="text-blue-600 font-bold bg-blue-50">+ አዲስ ምድብ ጨምር...</option>
                </select>
              </div>

              {showNewCategoryInput && (
                <div className="flex space-x-2 bg-blue-50 p-3 rounded-md border border-blue-200">
                  <input type="text" value={inlineCategoryName} onChange={(e) => setInlineCategoryName(e.target.value)} placeholder="የአዲሱን ምድብ ስም ጽፈው Enter ይጫኑ..." className="flex-1 px-3 py-1.5 border rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white" />
                  <button type="button" onClick={handleAddInlineCategory} className="px-4 py-1.5 bg-blue-600 text-white text-sm font-bold rounded-md hover:bg-blue-700">አስገባ</button>
                </div>
              )}

              <div>
                <label className="block text-gray-700 text-sm font-medium mb-1">የዕቃው ስም</label>
                <input type="text" name="title" value={newProduct.title} onChange={handleProductChange} required className="w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500" />
              </div>

              <div>
                <label className="block text-gray-700 text-sm font-medium mb-1">ብራንድ (Brand)</label>
                <select name="brand" value={newProduct.brand} onChange={handleProductChange} className="w-full px-3 py-2 border rounded-md bg-white focus:outline-none focus:ring-2 focus:ring-blue-500">
                  <option value="">-- ብራንድ ይምረጡ --</option>
                  {brands.map((b, index) => <option key={index} value={b}>{b}</option>)}
                  <option value="ADD_NEW_BRAND" className="text-blue-600 font-bold bg-blue-50">+ አዲስ ብራንድ ጨምር...</option>
                </select>
              </div>

              {showNewBrandInput && (
                <div className="flex space-x-2 bg-blue-50 p-3 rounded-md border border-blue-200">
                  <input type="text" value={newBrandName} onChange={(e) => setNewBrandName(e.target.value)} placeholder="ብራንድ ጽፈው Enter ይጫኑ..." className="flex-1 px-3 py-1.5 border rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white" />
                  <button type="button" onClick={handleAddNewBrand} className="px-4 py-1.5 bg-blue-600 text-white text-sm font-bold rounded-md hover:bg-blue-700">አስገባ</button>
                </div>
              )}

              <div className="relative" ref={dropdownRef}>
                <label className="block text-gray-700 text-sm font-medium mb-1">ቀለማት (Colors)</label>
                <div onClick={() => setShowColorDropdown(!showColorDropdown)} className="w-full px-3 py-2 border rounded-md bg-white cursor-pointer flex justify-between items-center text-sm focus:outline-none focus:ring-2 focus:ring-blue-500">
                  <span className={newProduct.colors.length === 0 ? "text-gray-400" : "text-gray-800 font-medium"}>
                    {newProduct.colors.length === 0 ? "-- ቀለማት ይምረጡ --" : newProduct.colors.join(', ')}
                  </span>
                  <span>▼</span>
                </div>
                {showColorDropdown && (
                  <div className="absolute z-10 w-full mt-1 bg-white border rounded-md shadow-lg p-2 space-y-1 max-h-60 overflow-y-auto">
                    {colorsList.map((col, idx) => (
                      <div key={idx} onClick={() => handleColorSelect(col)} className="flex items-center space-x-2 px-3 py-2 rounded cursor-pointer text-sm hover:bg-gray-100">
                        <input type="checkbox" checked={newProduct.colors.includes(col)} readOnly className="rounded text-blue-600 w-4 h-4" />
                        <span>{col}</span>
                      </div>
                    ))}
                    <div onClick={() => handleColorSelect('ADD_NEW_COLOR')} className="px-3 py-2 rounded cursor-pointer text-sm text-blue-600 font-bold bg-blue-50 hover:bg-blue-100">+ አዲስ ቀለም ጨምር...</div>
                  </div>
                )}
              </div>

              {showNewColorInput && (
                <div className="flex space-x-2 bg-blue-50 p-3 rounded-md border border-blue-200 mt-2">
                  <input type="text" value={newColorName} onChange={(e) => setNewColorName(e.target.value)} placeholder="ቀለም ጽፈው Enter ይጫኑ..." className="flex-1 px-3 py-1.5 border rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white" />
                  <button type="button" onClick={handleAddNewColor} className="px-4 py-1.5 bg-blue-600 text-white text-sm font-bold rounded-md hover:bg-blue-700">አስገባ</button>
                </div>
              )}

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-gray-700 text-sm font-medium mb-1">የግዢ ዋጋ (Cost Price)</label>
                  <input type="number" name="cost_price" value={newProduct.cost_price} onChange={handleProductChange} className="w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500" />
                </div>
                <div>
                  <label className="block text-gray-700 text-sm font-medium mb-1">የመሸጫ ዋጋ (Selling Price)</label>
                  <input type="number" name="selling_price" value={newProduct.selling_price} onChange={handleProductChange} className="w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500" />
                </div>
              </div>

              <div>
                <label className="block text-gray-700 text-sm font-medium mb-1">ስፔስፊኬሽን (Specs)</label>
                <input type="text" name="specs" value={newProduct.specs} onChange={handleProductChange} className="w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500" />
              </div>

              <div>
                <label className="block text-gray-700 text-sm font-medium mb-1">የዕቃው ፎቶ (Image)</label>
                <input 
                  type="file" 
                  accept="image/*" 
                  onChange={(e) => setImageFile(e.target.files[0])} 
                  className="w-full px-3 py-2 border rounded-md bg-white text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" 
                />
                {isEditing && newProduct.image_url && !imageFile && (
                  <p className="text-xs text-gray-500 mt-1 italic">አሁን ያለው ፎቶ محفوظة ነው (ለመቀየር አዲስ ይምረጡ)</p>
                )}
                {imageFile && (
                  <p className="text-xs text-green-600 mt-1 font-bold">✓ አዲስ ፎቶ ተመርጧል: {imageFile.name}</p>
                )}
              </div>

              <div className="flex justify-end space-x-2 pt-4 border-t">
                <button type="button" onClick={() => setShowProductModal(false)} className="px-4 py-2 bg-gray-300 rounded-md">ሰርዝ</button>
                <button type="submit" className="px-6 py-2 bg-blue-600 text-white font-bold rounded-md shadow-md">
                  {isEditing ? 'አስተካክል (Update)' : 'ዕቃውን መዝግብ 🚀'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Stock In Modal */}
      {showStockModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white p-6 rounded-xl shadow-lg w-96">
            <h3 className="text-lg font-bold text-gray-800 mb-2">ገቢ ዕቃ መመዝገቢያ 📦</h3>
            <p className="text-sm text-gray-600 mb-4 font-medium">የዕቃው ስም: <span className="text-blue-600">{stockEntry.currentProduct?.title}</span></p>
            
            <form onSubmit={handleStockSubmit} className="space-y-4">
              <div>
                <label className="block text-gray-700 text-sm font-medium mb-1">ገቢ የሆነው ብዛት</label>
                <input type="number" required value={stockEntry.quantity} onChange={(e) => setStockEntry({...stockEntry, quantity: e.target.value})} placeholder="ለምሳሌ፡ 50" className="w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-lg font-bold" />
              </div>
              <div>
                <label className="block text-gray-700 text-sm font-medium mb-1">ወደ የትኛው መጋዘን ገባ?</label>
                <select value={stockEntry.location} onChange={(e) => setStockEntry({...stockEntry, location: e.target.value})} className="w-full px-3 py-2 border rounded-md bg-white focus:outline-none focus:ring-2 focus:ring-blue-500">
                  <option value="stock_main_store">ዋና ሱቅ (Main Store)</option>
                  <option value="stock_warehouse_1">መጋዘን 1 (Warehouse 1)</option>
                </select>
              </div>
              
              {isAdminOrManager && (
                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <label className="block text-gray-700 text-xs font-medium mb-1">ግዢ ዋጋ</label>
                    <input type="number" value={stockEntry.cost_price} onChange={(e) => setStockEntry({...stockEntry, cost_price: e.target.value})} className="w-full px-2 py-1.5 border rounded-md text-sm" />
                  </div>
                  <div>
                    <label className="block text-gray-700 text-xs font-medium mb-1">መሸጫ ዋጋ</label>
                    <input type="number" value={stockEntry.selling_price} onChange={(e) => setStockEntry({...stockEntry, selling_price: e.target.value})} className="w-full px-2 py-1.5 border rounded-md text-sm" />
                  </div>
                </div>
              )}

              <div className="flex justify-end space-x-2 pt-2">
                <button type="button" onClick={() => setShowStockModal(false)} className="px-4 py-2 bg-gray-300 rounded-md">ሰርዝ</button>
                <button type="submit" className="px-4 py-2 bg-green-600 text-white font-bold rounded-md hover:bg-green-700">ገቢ አድርግ</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Products Table */}
      <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-lg font-bold text-gray-800">የዕቃዎች እና ክምችት ዝርዝር</h2>
          <div className="flex items-center space-x-2">
            <label className="text-sm text-gray-600 font-medium">በምድብ አጣራ፡</label>
            <select value={filterCategory} onChange={(e) => setFilterCategory(e.target.value)} className="px-3 py-1.5 border rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500">
              <option value="ALL">-- ሁሉም ምድቦች --</option>
              {categories.map((cat) => <option key={cat.id} value={cat.id}>{cat.name}</option>)}
            </select>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse min-w-[1050px]">
            <thead>
              <tr className="bg-slate-100 border-b">
                <th className="p-3 text-slate-700 font-bold text-sm w-16">ፎቶ</th>
                <th className="p-3 text-slate-700 font-bold text-sm">የዕቃው ስም</th>
                <th className="p-3 text-slate-700 font-bold text-sm">ምድብ</th>
                
                {isAdminOrManager && <th className="p-3 text-slate-700 font-bold text-sm">የግዢ ዋጋ</th>}
                
                <th className="p-3 text-slate-700 font-bold text-sm">መሸጫ ዋጋ</th>
                <th className="p-3 text-slate-700 font-bold text-sm">ስፔስፊኬሽን (Specs)</th>
                <th className="p-3 text-slate-700 font-bold text-sm text-center">አጠቃላይ ክምችት</th>
                <th className="p-3 text-slate-700 font-bold text-sm text-center min-w-[200px]">ድርጊት (Actions)</th>
              </tr>
            </thead>
            <tbody>
              {filteredProducts.length === 0 ? (
                <tr>
                  <td colSpan="8" className="text-center p-6 text-gray-400 italic">በዚህ ምድብ ውስጥ የተመዘገበ ዕቃ የለም</td>
                </tr>
              ) : (
                filteredProducts.map((item) => {
                  const catObj = categories.find(c => c.id === item.category_id);
                  const totalStock = (item.stock_main_store || 0) + (item.stock_warehouse_1 || 0);

                  return (
                    <tr key={item.id} className="border-b hover:bg-slate-50 transition-colors">
                      <td className="p-3">
                        {item.image_url ? (
                          <img src={item.image_url} alt={item.title} className="w-12 h-12 object-cover rounded-lg border shadow-xs" />
                        ) : (
                          <div className="w-12 h-12 bg-slate-200 rounded-lg flex items-center justify-center text-[10px] text-slate-500">ፎቶ የለም</div>
                        )}
                      </td>
                      <td className="p-3 font-semibold text-slate-800">
                        {item.title} <br/>
                        <span className="text-xs text-gray-500 font-normal">{item.brand}</span>
                      </td>
                      <td className="p-3">
                        <span className="bg-blue-100 text-blue-800 px-2 py-1 rounded text-xs font-bold">{catObj ? catObj.name : '-'}</span>
                      </td>
                      
                      {isAdminOrManager && (
                        <td className="p-3 text-sm font-medium text-slate-600">{item.cost_price ? `${item.cost_price} ብር` : '-'}</td>
                      )}
                      
                      <td className="p-3 text-sm font-bold text-green-600">{item.selling_price ? `${item.selling_price} ብር` : '-'}</td>
                      <td className="p-3 text-sm text-slate-600">{item.specs || '-'}</td>
                      <td className="p-3 text-center">
                        <div className="relative group inline-block cursor-pointer">
                          <span className="font-bold text-slate-700 text-lg bg-indigo-50 px-3 py-1 rounded-full border border-indigo-100">
                            {totalStock}
                          </span>
                          <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 hidden group-hover:block bg-gray-900 text-white text-xs rounded-lg py-3 px-4 w-56 z-[100] shadow-2xl border border-gray-700">
                            <div className="font-bold text-amber-400 mb-2 border-b border-gray-700 pb-1 text-left">የክምችት ዝርዝር (Locations):</div>
                            <div className="flex justify-between mb-1">
                              <span className="text-gray-300">ዋና ሱቅ:</span>
                              <span className="font-bold text-blue-300">{item.stock_main_store || 0}</span>
                            </div>
                            <div className="flex justify-between mb-3 pb-2 border-b border-gray-700">
                              <span className="text-gray-300">መጋዘን 1:</span>
                              <span className="font-bold text-green-300">{item.stock_warehouse_1 || 0}</span>
                            </div>
                            <div className="font-bold text-amber-400 mb-1 text-left">ቀለማት (Colors):</div>
                            <div className="text-gray-200 text-left whitespace-normal">{item.color ? item.color : <span className="text-gray-500 italic">አልተመረጠም</span>}</div>
                            <div className="absolute top-full left-1/2 transform -translate-x-1/2 border-4 border-transparent border-t-gray-900"></div>
                          </div>
                        </div>
                      </td>
                      
                      <td className="p-3 text-center whitespace-nowrap">
                        <div className="flex items-center justify-center gap-2">
                          <button onClick={() => openStockModal(item)} className="px-3 py-1 bg-green-100 text-green-700 font-bold text-xs rounded hover:bg-green-200" title="ገቢ አድርግ">
                            📦 ገቢ
                          </button>
                          
                          {isAdminOrManager && (
                            <>
                              <button onClick={() => openEditModal(item)} className="px-3 py-1 bg-amber-100 text-amber-700 font-bold text-xs rounded hover:bg-amber-200" title="አስተካክል">
                                ✏️ Edit
                              </button>
                              <button onClick={() => handleDelete(item.id)} className="px-3 py-1 bg-red-100 text-red-700 font-bold text-xs rounded hover:bg-red-200" title="አጥፋ">
                                🗑️ Delete
                              </button>
                            </>
                          )}
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

export default ProductsManager;