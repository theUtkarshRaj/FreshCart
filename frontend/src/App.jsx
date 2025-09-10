import React from "react";
import { Route, Routes } from "react-router-dom";
import Home from "./pages/Home";
import Items from "./pages/Items";
import Myorder from "./pages/Myorder";
import Contact from "./pages/Contact";
import { CartProvider } from "./CartContent";
import { AuthProvider } from './context/AuthContext'
import Login from './pages/Login'
import Signup from './pages/Signup'
import Cart from './pages/Cart'
import Checkout from './pages/Checkout'
import AdminProducts from './pages/AdminProducts'
import ProtectedRoute from './components/ProtectedRoute'

const App = () => {
  return (
    <div>
      <AuthProvider>
        <CartProvider>
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/items" element={<Items />} />
            <Route path="/myorders" element={<Myorder />} />
            <Route path="/contact" element={<Contact />} />
            <Route path="/login" element={<Login />} />
            <Route path="/signup" element={<Signup />} />
            <Route path="/cart" element={<Cart />} />
            <Route path="/checkout" element={<Checkout />} />
            <Route path="/admin/products" element={<ProtectedRoute requireAdmin><AdminProducts /></ProtectedRoute>} />
          </Routes>
        </CartProvider>
      </AuthProvider>
    </div>
  );
};
export default App;
