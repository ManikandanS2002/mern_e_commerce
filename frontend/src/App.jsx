import React, { useEffect } from "react";
import { Routes, Route, Navigate } from "react-router-dom";
import HomePage from "./pages/HomePage";
import Login from "./pages/Login";
import SignUp from "./pages/SignUp";
import AdminPage from "./pages/AdminPage";
import CategoryPage from "./pages/CategoryPage";
import Navbar from "./components/Navbar";
import { Toaster } from "react-hot-toast";
import CartPages from "./pages/CartPages";
import { useCartStore } from "./Stores/useCartStore";
import { useUserStore } from "./Stores/useUserStore";
import PurchaseSuccessPage from "./pages/PurchaseSuccessPage";
import PurchaseCancelPage from "./pages/PurchaseCancelPage";



const App = () => {

  const {user,checkAuth} = useUserStore()
  const {getCartItems} = useCartStore()

  useEffect(() => {
    checkAuth();
  },[checkAuth])

  useEffect(() => {
    if (!user) return;
    getCartItems()
  },[getCartItems])

  return (
    <div className='min-h-screen bg-gray-900 text-white relative overflow-hidden'>
			{/* Background gradient */}
			<div className='absolute inset-0 overflow-hidden'>
				<div className='absolute inset-0'>
					<div className='absolute top-0 left-1/2 -translate-x-1/2 w-full h-full bg-[radial-gradient(ellipse_at_top,rgba(16,185,129,0.3)_0%,rgba(10,80,60,0.2)_45%,rgba(0,0,0,0.1)_100%)]' />
				</div>
			</div>

      <div className="relative z-50 pt-20">
        <Navbar />
          <Routes>
            <Route path="/" element={<HomePage />} />
            <Route path="/login" element={!user ? <Login /> : <Navigate to='/'/>} />
            <Route path="/signup" element={!user ? <SignUp /> : <Navigate to='/'/>} />
            <Route path="/secret-dashboard" element={user?.role === "admin" ? <AdminPage /> : <Navigate to='/login'/>} />
            <Route path="/category/:category" element={<CategoryPage />} />
            <Route path="/cart" element={!user ? <Navigate to='/login'/> : <CartPages /> } />
            <Route path="/purchase-success" element={!user ?  <PurchaseSuccessPage /> : <Navigate to='/login'/> } />
            <Route path="/purchase-cancel" element={!user ?  <PurchaseCancelPage /> : <Navigate to='/login'/> } />
          </Routes>
      </div>
      <Toaster/>
    </div>
  );
};

export default App;