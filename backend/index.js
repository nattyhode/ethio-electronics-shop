import express from 'express';
import cors from 'cors';
import { createClient } from '@supabase/supabase-js';
import multer from 'multer';

// 1. ሰርቨሩ (app) ይፈጠራል
const app = express();
app.use(cors());
app.use(express.json());

// 2. ከዳታቤዝ (Supabase) ጋር መገናኛ
const supabaseUrl = 'https://yumwedmimpyrruehmchp.supabase.co';
const supabaseKey = 'sb_publishable_Prydm3AXZnQsJn42rFLnuQ_QuytArzu';
const supabase = createClient(supabaseUrl, supabaseKey);

// 3. የ MULTER ማዋቀሪያ (ለ Cloud Storage)
const storage = multer.memoryStorage();
const upload = multer({ storage: storage });

// ==========================================
// 1. የካታጎሪ (Categories) ራውቶች
// ==========================================
app.get('/api/categories', async (req, res) => {
  try {
    const { data, error } = await supabase.from('categories').select('*');
    if (error) throw error;
    res.json(data);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.post('/api/categories', async (req, res) => {
  try {
    const { name } = req.body;
    const { data, error } = await supabase.from('categories').insert([{ name }]).select();
    if (error) throw error;
    res.status(201).json({ data });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// ==========================================
// 2. የዕቃዎች (Products) ራውቶች
// ==========================================
app.get('/api/products', async (req, res) => {
  try {
    const { data, error } = await supabase.from('products').select('*').order('id', { ascending: false });
    if (error) throw error;
    res.json(data);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.post('/api/products', upload.single('image'), async (req, res) => {
  try {
    const { title, category_id, brand, color, specs, stock_main_store, stock_warehouse_1, cost_price, selling_price } = req.body;
    
    let image_url = '';

    if (req.file) {
      const fileName = `products/${Date.now()}-${req.file.originalname.replace(/\s+/g, '-')}`;
      const { data: uploadData, error: uploadError } = await supabase.storage
        .from('ethio-shop') 
        .upload(fileName, req.file.buffer, { contentType: req.file.mimetype });

      if (uploadError) throw uploadError;

      const { data: publicUrlData } = supabase.storage.from('ethio-shop').getPublicUrl(fileName);
      image_url = publicUrlData.publicUrl;
    }

    const productData = {
      title, category_id, brand, color, specs,
      stock_main_store: stock_main_store ? Number(stock_main_store) : 0,
      stock_warehouse_1: stock_warehouse_1 ? Number(stock_warehouse_1) : 0,
      cost_price: cost_price ? Number(cost_price) : 0,
      selling_price: selling_price ? Number(selling_price) : 0,
      image_url
    };

    const { data, error } = await supabase.from('products').insert([productData]).select();
    if (error) throw error;
    res.status(201).json({ message: "Product created successfully", data });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.put('/api/products/:id', upload.single('image'), async (req, res) => {
  try {
    const { id } = req.params;
    const { title, category_id, brand, color, specs, stock_main_store, stock_warehouse_1, cost_price, selling_price } = req.body;
    
    let updateData = {
      title, category_id, brand, color, specs,
      stock_main_store: stock_main_store ? Number(stock_main_store) : undefined,
      stock_warehouse_1: stock_warehouse_1 ? Number(stock_warehouse_1) : undefined,
      cost_price: cost_price ? Number(cost_price) : undefined,
      selling_price: selling_price ? Number(selling_price) : undefined,
    };

    if (req.file) {
      const fileName = `products/${Date.now()}-${req.file.originalname.replace(/\s+/g, '-')}`;
      const { error: uploadError } = await supabase.storage.from('ethio-shop').upload(fileName, req.file.buffer, { contentType: req.file.mimetype });
      if (uploadError) throw uploadError;

      const { data: publicUrlData } = supabase.storage.from('ethio-shop').getPublicUrl(fileName);
      updateData.image_url = publicUrlData.publicUrl;
    }

    const { data, error } = await supabase.from('products').update(updateData).eq('id', id).select();
    if (error) throw error;
    res.json({ message: "Product updated successfully", data });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.delete('/api/products/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const { error } = await supabase.from('products').delete().eq('id', id);
    if (error) throw error;
    res.json({ message: "Product deleted successfully" });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// ==========================================
// 3. የሠራተኞች (Employees) ራውቶች
// ==========================================
app.get('/api/employees', async (req, res) => {
  try {
    const { data, error } = await supabase.from('employees').select('*').order('id', { ascending: false });
    if (error) throw error;
    res.json(data);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.post('/api/employees', async (req, res) => {
  try {
    const { full_name, phone, position, role_code, salary, status, username, password, permissions } = req.body;
    const { data, error } = await supabase.from('employees').insert([{ full_name, phone, position, role_code, salary, status, username, password, permissions }]).select();
    if (error) throw error;
    res.status(201).json({ message: "ሠራተኛው ተመዝግቧል!", data });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.put('/api/employees/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const updateData = req.body;
    const { data, error } = await supabase.from('employees').update(updateData).eq('id', id).select();
    if (error) throw error;
    res.json({ message: "የሠራተኛው መረጃ ተስተካክሏል", data });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// ==========================================
// 4. የሎጊን (Login) ራውት
// ==========================================
app.post('/api/login', async (req, res) => {
  try {
    const { username, password } = req.body;
    const { data, error } = await supabase
      .from('employees')
      .select('*')
      .eq('username', username)
      .eq('password', password)
      .single();

    if (error || !data) {
      return res.status(401).json({ error: 'የተሳሳተ ዩዘርኔም ወይም የይለፍ ቃል!' });
    }
    
    res.json({ message: 'Login successful', user: data });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// ==========================================
// 5. የሽያጭ እና ትዕዛዝ ራውቶች (Sales Orders) - ሙሉ በሙሉ የተካተተ
// ==========================================
app.post('/api/sales-orders', upload.single('payment_screenshot'), async (req, res) => {
  try {
    const { customer_name, customer_phone, total_amount, status, short_code, extra_details } = req.body;
    const items = JSON.parse(req.body.items);
    const parsedExtraDetails = JSON.parse(extra_details);

    let payment_screenshot = null;

    if (req.file && req.file.buffer) {
      const fileName = `screenshots/${Date.now()}-${req.file.originalname.replace(/\s+/g, '-')}`;
      const { error: uploadError } = await supabase.storage
        .from('ethio-shop')
        .upload(fileName, req.file.buffer, { contentType: req.file.mimetype });

      if (uploadError) throw uploadError;

      const { data: publicUrlData } = supabase.storage.from('ethio-shop').getPublicUrl(fileName);
      payment_screenshot = publicUrlData.publicUrl;
    }

    const orderData = {
      customer_name, 
      customer_phone, 
      items, 
      total_amount: Number(total_amount), 
      status, 
      short_code: short_code || null,
      payment_screenshot, 
      extra_details: parsedExtraDetails
    };

    const { data, error } = await supabase.from('sales_orders').insert([orderData]).select();
    if (error) throw error;
    
    res.status(201).json({ message: "ጥያቄው በተሳካ ሁኔታ ተልኳል!", data });
  } catch (error) {
    console.error("🔴 Server Error:", error.message);
    res.status(500).json({ error: error.message });
  }
});

app.get('/api/sales-orders', async (req, res) => {
  try {
    const { data, error } = await supabase.from('sales_orders').select('*').order('id', { ascending: false });
    if (error) throw error;
    res.json(data);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.put('/api/sales-orders/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const { items, total_amount } = req.body;

    for (const item of items) {
      const { data: prodData } = await supabase.from('products').select('stock_main_store').eq('id', item.id).single();
      if (prodData) {
        const newStock = (prodData.stock_main_store || 0) - item.quantity;
        await supabase.from('products').update({ stock_main_store: newStock }).eq('id', item.id);
      }
    }

    const { data, error } = await supabase.from('sales_orders').update({ 
      status: 'COMPLETED', items: items, total_amount: total_amount 
    }).eq('id', id).select();
    
    if (error) throw error;
    res.json({ message: "ሽያጩ በተሳካ ሁኔታ ተጠናቀቀ!", data });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

const PORT = 5000;
app.listen(PORT, () => {
  console.log(`✅ Server is running on port ${PORT}`);
});