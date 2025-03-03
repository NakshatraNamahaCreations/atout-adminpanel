import React from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import 'bootstrap/dist/css/bootstrap.min.css';
import Sidebar from "./Sidebar";
import Dashboard from "./Dashboard";
import ProductsPage from "./ProductsPage";
import Categories from "./Component/Categories";
import Inventory from "./Component/Inventory";
import OrdersPage from "./Component/OrdersPage ";
import Customer from "./Component/Customer";
import Marketing from "./Component/Marketing";
import Voucher from "./Component/Voucher";


function App() {
  return (
    <Router>
      <div className="app">
        <Sidebar />
        <div className="main-content">
          <Routes>
            <Route path="/" element={<Dashboard />} />
            <Route path="/products" element={<ProductsPage />} />  
            <Route path="/categories" element={<Categories />} /> 
            <Route path="/inventory" element={<Inventory />} /> 
            <Route path="/orders" element={<OrdersPage />} /> 
            <Route path="/customers" element={<Customer />} /> 
            <Route path="/marketing" element={<Marketing/>}/>
            <Route path="/voucher" element={<Voucher/>}/>
            {/* <Route path="/offers" element={<Offers/>}/> */}
          </Routes>
        </div>
      </div>
    </Router>
  );
}

export default App;
