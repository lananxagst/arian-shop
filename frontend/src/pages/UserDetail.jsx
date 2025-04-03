import { useEffect, useState, useContext } from "react";
import api from "../utils/api";
import { getImageUrl } from "../utils/imageHelper";
import Footer from "../components/Footer";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { ShopContext } from "../context/ShopContext";
import { FaTrash } from "react-icons/fa";

const UserDetail = () => {
  const { 
    cartItems, 
    products, 
    wishlist, 
    currency, 
    token, 
    clearCart, 
    removeFromWishlist, 
    formatPrice, 
    userData, 
    getUserProfile 
  } = useContext(ShopContext);
  
  const [activeTab, setActiveTab] = useState("account");
  const [orderData, setOrderData] = useState([]);
  const [isWishlistEmpty, setIsWishlistEmpty] = useState(true);
  const [isLoading, setIsLoading] = useState(true);
  const navigate = useNavigate();
  const location = useLocation();
  
  // Check if we're coming from a profile update with force refresh
  const forceRefresh = location.state?.forceRefresh;

  // Check if wishlist is empty whenever it changes
  useEffect(() => {
    if (wishlist && Array.isArray(wishlist)) {
      setIsWishlistEmpty(wishlist.length === 0);
    }
  }, [wishlist]);

  const getProfileImage = () => {
    if (!userData) return '';
    
    console.log('Getting profile image for user:', userData.name);
    console.log('Avatar value:', userData.avatar);
    
    // Force refresh the component when avatar changes
    // Add a timestamp to the URL to prevent caching
    const timestamp = new Date().getTime();
    
    // Check localStorage for a recently updated avatar
    const lastAvatarUpdate = localStorage.getItem('avatar_updated');
    const cloudinaryUrl = localStorage.getItem('cloudinary_avatar_url');
    
    // If we have a recently updated Cloudinary URL in localStorage, use it
    if (cloudinaryUrl && lastAvatarUpdate && (Date.now() - parseInt(lastAvatarUpdate) < 60000)) {
      console.log('Using recently updated Cloudinary URL from localStorage:', cloudinaryUrl);
      return `${cloudinaryUrl}?t=${timestamp}`;
    }
    
    if (userData.avatar) {
      // If it's a Cloudinary URL, use it directly with a cache-busting parameter
      if (userData.avatar.includes('cloudinary.com')) {
        const url = `${userData.avatar}?t=${timestamp}`;
        console.log('Using Cloudinary image URL from user data:', url);
        return url;
      }
      
      // Log the type of avatar value
      console.log('Avatar type:', typeof userData.avatar);
      
      // Otherwise use the image helper
      const imageUrl = getImageUrl(userData.avatar, userData.name);
      console.log('Image URL after helper:', imageUrl);
      return imageUrl;
    }
    
    // Fallback to UI Avatars
    console.log('No avatar found, using fallback');
    return `https://ui-avatars.com/api/?name=${encodeURIComponent(
      userData?.name || 'User'
    )}&background=6D28D9&color=ffffff&size=128`;
  };

  const handleCheckout = () => {
    navigate('/place-order');
  };

  useEffect(() => {
    const refreshUserData = () => {
      try {
        setIsLoading(true);
        if (!token) {
          setIsLoading(false);
          return;
        }
        
        // Use the context function to refresh user data
        getUserProfile();
        setIsLoading(false);
      } catch (error) {
        console.error("Error refreshing user details", error);
        setIsLoading(false);
      }
    };

    const loadOrderData = async () => {
      try {
        setIsLoading(true);
        if (!token) {
          setIsLoading(false);
          return;
        }
        
        const response = await api.post(
          '/api/order/userorders',
          {}
        );
        
        if (response.data.success) {
          let allOrdersItem = [];
          response.data.orders.map((order) => {
            order.items.map((item) => {
              item["status"] = order.status;
              item["payment"] = order.payment;
              item["paymentMethod"] = order.paymentMethod;
              item["date"] = order.date;
              allOrdersItem.push(item);
            });
          });
          setOrderData(allOrdersItem.reverse());
        }
        setIsLoading(false);
      } catch (error) {
        console.error("Error fetching orders:", error);
        setIsLoading(false);
      }
    };

    if (token) {
      refreshUserData();
      loadOrderData();
    }
  }, [token, forceRefresh, getUserProfile]);

  if (isLoading)
    return <p className="text-gray-30 text-center mt-10">Loading...</p>;

  if (!userData)
    return <p className="text-gray-30 text-center mt-10">User not found.</p>;

  return (
    <div className="flex flex-col min-h-screen bg-primary">
      <div className="container mx-auto px-4 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-[300px_1fr] gap-8">
          {/* Left Sidebar - Profile Info */}
          <div className="bg-white rounded-xl shadow-lg p-6">
            <div className="flex flex-col items-center">
              <div className="relative w-24 h-24 rounded-full overflow-hidden bg-gray-200 mb-2">
                <img
                  src={getProfileImage()}
                  alt={userData.name}
                  className="w-full h-full object-cover"
                />
                <div className="absolute bottom-0 right-0 bg-green-500 rounded-full p-1">
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    className="h-4 w-4 text-white"
                    viewBox="0 0 20 20"
                    fill="currentColor"
                  >
                    <path
                      fillRule="evenodd"
                      d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                      clipRule="evenodd"
                    />
                  </svg>
                </div>
              </div>
              <h2 className="text-lg font-semibold">{userData.name}</h2>
              <p className="text-gray-500 text-sm">{userData.bio || ""}</p>
              <div className="w-full mt-6 space-y-2">
                <button 
                  onClick={() => setActiveTab("account")}
                  className={`w-full py-2 px-4 rounded-lg transition-colors ${
                    activeTab === "account" 
                      ? "bg-gray-900 text-white" 
                      : "bg-gray-100 text-gray-600 hover:bg-gray-200"
                  }`}
                >
                  Account
                </button>
                <button 
                  onClick={() => setActiveTab("wishlist")}
                  className={`w-full py-2 px-4 rounded-lg transition-colors ${
                    activeTab === "wishlist" 
                      ? "bg-gray-900 text-white" 
                      : "bg-gray-100 text-gray-600 hover:bg-gray-200"
                  }`}
                >
                  Wish List
                </button>
                <button 
                  onClick={() => setActiveTab("orders")}
                  className={`w-full py-2 px-4 rounded-lg transition-colors ${
                    activeTab === "orders" 
                      ? "bg-gray-900 text-white" 
                      : "bg-gray-100 text-gray-600 hover:bg-gray-200"
                  }`}
                >
                  Orders
                </button>
                <button 
                  onClick={() => setActiveTab("cart")}
                  className={`w-full py-2 px-4 rounded-lg transition-colors ${
                    activeTab === "cart" 
                      ? "bg-gray-900 text-white" 
                      : "bg-gray-100 text-gray-600 hover:bg-gray-200"
                  }`}
                >
                  Shopping Cart
                </button>
              </div>
            </div>
          </div>

          {/* Right Content Area */}
          <div className="bg-white rounded-xl shadow-lg p-6">
            {activeTab === "account" ? (
              <div className="space-y-6">
                <h2 className="text-2xl font-semibold mb-6 text-secondary">Account Information</h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-30 mb-2">Name</label>
                    <input
                      type="text"
                      value={userData.name || ""}
                      readOnly
                      className="w-full px-4 py-2 border border-gray-10 rounded-lg bg-primary"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-30 mb-2">Email</label>
                    <input
                      type="email"
                      value={userData.email || ""}
                      readOnly
                      className="w-full px-4 py-2 border border-gray-10 rounded-lg bg-primary"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-30 mb-2">Phone</label>
                    <input
                      type="text"
                      value={userData.phone || "Not provided"}
                      readOnly
                      className="w-full px-4 py-2 border border-gray-10 rounded-lg bg-primary"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-30 mb-2">Address</label>
                    <input
                      type="text"
                      value={userData.address || "Not provided"}
                      readOnly
                      className="w-full px-4 py-2 border border-gray-10 rounded-lg bg-primary"
                    />
                  </div>
                </div>
                <div className="flex justify-end mt-6">
                  <Link
                    to="/update-profile"
                    className="px-6 py-2 bg-gray-900 text-white rounded-lg hover:bg-gray-800 transition-colors"
                  >
                    Edit Profile
                  </Link>
                </div>
              </div>
            ) : activeTab === "wishlist" ? (
              <div>
                <h2 className="text-2xl font-semibold mb-6 text-secondary">Wish List</h2>
                {isLoading ? (
                  <p className="text-gray-30 text-center mt-10">Loading...</p>
                ) : !isWishlistEmpty ? (
                  <div className="flex-1 overflow-y-auto max-h-[400px] mb-6 pr-2 custom-scrollbar">
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                      {wishlist.map((productId) => {
                        console.log("Rendering product ID:", productId);
                        const product = products.find((p) => p._id === productId);
                        if (!product) {
                          console.log("Product not found for ID:", productId);
                          return null;
                        }
                        
                        console.log("Found product:", product.name);
                        return (
                          <div key={product._id} className="bg-white p-4 rounded-lg shadow">
                            <Link to={`/product/${product._id}`} className="block">
                              <img
                                src={product.image[0]}
                                alt={product.name}
                                className="w-full h-48 object-cover rounded-lg mb-2"
                              />
                              <h3 className="font-medium text-lg">{product.name}</h3>
                              <p className="text-gray-600">{currency} {formatPrice(product.price)}</p>
                            </Link>
                            <div className="mt-2 flex justify-end">
                              <button 
                                onClick={() => {
                                  console.log("Remove button clicked for:", product._id);
                                  removeFromWishlist(product._id);
                                }}
                                className="text-red-500 hover:text-red-700 transition-colors p-2"
                                title="Remove from wishlist"
                              >
                                <FaTrash />
                              </button>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                ) : (
                  <div className="text-center py-12">
                    <p className="text-gray-30 text-lg">Your wishlist is empty.</p>
                    <Link to="/collection" className="inline-block mt-4 px-6 py-2 bg-secondary text-white rounded-lg hover:bg-tertiary transition-colors">
                      Continue Shopping
                    </Link>
                  </div>
                )}
              </div>
            ) : activeTab === "cart" ? (
              <div>
                <h2 className="text-2xl font-semibold mb-6 text-secondary">Shopping Cart</h2>
                {cartItems && Object.keys(cartItems).length > 0 ? (
                  <div className="flex flex-col h-full">
                    <div className="flex-1 overflow-y-auto max-h-[400px] mb-6 pr-2 custom-scrollbar">
                      <ul className="divide-y divide-gray-10 space-y-4">
                        {Object.entries(cartItems).map(([itemId, colors]) => 
                          Object.entries(colors).map(([color, quantity]) => {
                            const product = products.find(p => p._id === itemId);
                            if (!product) return null;
                            
                            return (
                              <li key={`${itemId}-${color}`} className="py-4 px-2 hover:bg-primary rounded-lg transition-colors">
                                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                                  <div className="flex-grow space-y-2">
                                    <h3 className="text-lg font-medium text-secondary">
                                      {product.name}
                                    </h3>
                                    <div className="flex flex-wrap gap-x-6 gap-y-2 text-sm text-gray-30">
                                      <p>
                                        <span className="font-medium">Color:</span>{" "}
                                        <span className="capitalize">{color}</span>
                                      </p>
                                      <p>
                                        <span className="font-medium">Quantity:</span>{" "}
                                        {quantity}
                                      </p>
                                      <p>
                                        <span className="font-medium">Price:</span>{" "}
                                        {currency} {formatPrice(product.price)}
                                      </p>
                                    </div>
                                  </div>
                                  <div className="text-right">
                                    <p className="text-lg font-semibold text-secondary">
                                      {currency} {formatPrice(product.price * quantity)}
                                    </p>
                                  </div>
                                </div>
                              </li>
                            );
                          })
                        )}
                      </ul>
                    </div>
                    <div className="flex justify-between items-center mt-auto pt-4 border-t border-gray-10">
                      <button 
                        onClick={clearCart}
                        className="px-4 py-2 bg-red-500 text-white rounded-md hover:bg-red-600 transition-colors"
                      >
                        Clear Cart
                      </button>
                      <button
                        onClick={handleCheckout}
                        className="px-6 py-2 bg-secondary text-white rounded-md hover:bg-secondary/90 transition-colors"
                      >
                        Checkout
                      </button>
                    </div>
                  </div>
                ) : (
                  <div className="text-center py-12">
                    <p className="text-gray-30 text-lg">Your cart is empty.</p>
                    <Link to="/collection" className="inline-block mt-4 px-6 py-2 bg-secondary text-white rounded-lg hover:bg-tertiary transition-colors">
                      Continue Shopping
                    </Link>
                  </div>
                )}
              </div>
            ) : activeTab === "orders" ? (
              <div className="bg-white rounded-xl shadow-lg p-6">
                <h2 className="text-2xl font-semibold mb-6 text-secondary">Order History</h2>
                {isLoading ? (
                  <p className="text-gray-30 text-center mt-10">Loading...</p>
                ) : (
                  <div className="flex-1 overflow-y-auto max-h-[400px] mb-6 pr-2 custom-scrollbar">
                    {orderData.map((item, index, ) => (
                      <div key={index} className="bg-primary p-4 rounded-lg">
                        <div className="flex items-center justify-between mb-2">
                          <div>
                            <h3 className="text-lg font-medium text-secondary">{item.name}</h3>
                            <p className="text-sm text-gray-600">
                              Color: {item.color} | Quantity: {item.quantity}
                            </p>
                          </div>
                          <div className="text-right">
                            <p className="text-lg font-semibold text-secondary">{currency} {item.price.toLocaleString('id-ID').replace(',', '.')}</p>
                            <p className="text-sm text-gray-600">{new Date(item.date).toLocaleDateString()}</p>
                          </div>
                        </div>
                        <div className="flex justify-between items-center text-sm">
                          <span className={`px-3 py-1 rounded-full ${
                            item.status.toLowerCase() === "pending" ? "bg-yellow-100 text-yellow-800" :
                            item.status.toLowerCase() === "completed" ? "bg-green-100 text-green-800" :
                            "bg-gray-100 text-gray-800"
                          }`}>
                            {item.status}
                          </span>
                          <span className="text-gray-600">
                            Payment: {item.paymentMethod}
                          </span>
                        </div>
                      </div>
                    ))}
                    {orderData.length === 0 && (
                      <p className="text-gray-500 text-center py-12">No orders found.</p>
                    )}
                  </div>
                )}
              </div>
            ) : null}
          </div>
        </div>
      </div>
      <Footer />
    </div>
  );
};

export default UserDetail;
