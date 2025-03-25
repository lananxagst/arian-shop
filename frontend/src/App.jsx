import Header from "./components/Header";
import { Route, Routes, useLocation } from "react-router-dom";
import Home from "./pages/Home";
import Collection from "./pages/Collection";
import Blog from "./pages/Blog";
import Product from "./pages/Product";
import { ToastContainer } from "react-toastify";
import Cart from "./pages/Cart";
import PlaceOrder from "./pages/PlaceOrder";
import Login from "./pages/Login";
import Orders from "./pages/Orders";
import Verify from "./pages/Verify";
import WhatsAppButton from "./components/WhatsappButton";
import UserDetail from "./pages/UserDetail";
import EditProfile from "./pages/UpdateProfile";

const App = () => {
  const location = useLocation();
  return (
    <main className="overflow-hidden text-tertiary">
      <ToastContainer />
      <Header />
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/collection" element={<Collection />} />
        <Route path="/blog" element={<Blog />} />
        <Route path="/product/:productId" element={<Product />} />
        <Route path="/cart" element={<Cart />} />
        <Route path="/place-order" element={<PlaceOrder />} />
        <Route path="/login" element={<Login />} />
        <Route path="/orders" element={<Orders />} />
        <Route path="/user-detail" element={<UserDetail />} />
        <Route path="/update-profile" element={<EditProfile />} />
        <Route path="/verify" element={<Verify />} />
      </Routes>
      {location.pathname !== "/login" && <WhatsAppButton />}
    </main>
  );
};

export default App;
