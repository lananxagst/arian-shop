import { useState, useEffect, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import axios from "axios";
import PropTypes from 'prop-types';
import { ShopContext } from "./ShopContext";
import { backend_url, currency as currencySymbol, delivery_charges as deliveryFee } from "../config";

const ShopContextProvider = ({ children }) => {
  const [search, setSearch] = useState("");
  const [products, setProducts] = useState([]);
  const [cartItems, setCartItems] = useState({});
  const [wishlist, setWishlist] = useState([]);
  const [token, setToken] = useState("");
  const [isCartSyncing, setIsCartSyncing] = useState(false);
  // Using backend_url from config.js instead of environment variable
  const navigate = useNavigate();
  const currency = currencySymbol;
  const delivery_charges = deliveryFee;

  // ADDING ITEMS TO CART
  const addToCart = async (itemId, color) => {
    if (!color) {
      toast.error("Please Select the color first");
      return;
    }

    let cartData = structuredClone(cartItems);
    if (cartData[itemId]) {
      if (cartData[itemId][color]) {
        cartData[itemId][color] += 1;
      } else {
        cartData[itemId][color] = 1;
      }
    } else {
      cartData[itemId] = {};
      cartData[itemId][color] = 1;
    }
    setCartItems(cartData);
    
    // Get product name for the success message
    const product = products.find(p => p._id === itemId);
    const productName = product ? product.name : "Product";
    
    // Save cart to localStorage for non-logged in users
    if (!token) {
      localStorage.setItem('guestCart', JSON.stringify(cartData));
      console.log("Saved to guest cart:", cartData);
      toast.success(`${productName} added to cart`);
    } else {
      try {
        console.log("Adding to server cart with token:", token);
        const response = await axios.post(
          backend_url + "/api/cart/add",
          { itemId, color },
          { headers: { token } }
        );
        console.log("Server response:", response.data);
        
        if (response.data.success) {
          toast.success(`${productName} added to cart`);
        }
      } catch (error) {
        console.log(error);
        toast.error(error.message);
      }
    }
  };

  // GETING TOTAL CART COUNT
  const getCartCount = () => {
    let totalCount = 0;
    for (const items in cartItems) {
      for (const item in cartItems[items]) {
        try {
          if (cartItems[items][item] > 0) {
            totalCount += cartItems[items][item];
          }
        } catch (error) {
          console.log(error);
        }
      }
    }
    return totalCount;
  };

  // UPDATING THE QUANTITY OF CART ITEMS
  const updateQuantity = async (itemId, color, quantity) => {
    let cartData = structuredClone(cartItems);
    cartData[itemId][color] = quantity;
    setCartItems(cartData);

    // Save cart to localStorage for non-logged in users
    if (!token) {
      localStorage.setItem('guestCart', JSON.stringify(cartData));
      console.log("Updated guest cart:", cartData);
    } else {
      try {
        console.log("Updating server cart with token:", token);
        const response = await axios.post(
          backend_url + "/api/cart/update",
          { itemId, color, quantity },
          { headers: { token } }
        );
        console.log("Server response:", response.data);
      } catch (error) {
        console.log(error);
        toast.error(error.message);
      }
    }
  };

  // GETTING TOTAL CART AMOUNT
  const getCartAmount = () => {
    let totalAmount = 0;
    for (const items in cartItems) {
      let itemInfo = products.find((product) => product._id === items);
      for (const item in cartItems[items]) {
        try {
          if (cartItems[items][item] > 0) {
            totalAmount += itemInfo.price * cartItems[items][item];
          }
        } catch (error) {
          console.log(error);
        }
      }
    }
    return totalAmount;
  };

  // FORMAT PRICE IN IDR FORMAT (e.g., 103.000)
  const formatPrice = (price) => {
    if (typeof price !== 'number') return "N/A";
    // Multiply by 1000 to convert to Indonesian Rupiah
    const priceInIDR = price * 1000;
    return priceInIDR.toLocaleString('id-ID').replace(',', '.');
  };

  // GETTING USER WISHLIST
  const getWishlist = useCallback(async () => {
    try {
      console.log("Fetching wishlist with token:", token);
      const response = await axios.get(backend_url + "/api/user/wishlist", {
        headers: { Authorization: `Bearer ${token}` },
      });
      console.log("Wishlist response:", response.data);
      if (response.data.success) {
        setWishlist(response.data.wishlist);
        console.log("Wishlist set to:", response.data.wishlist);
      }
    } catch (error) {
      console.error("Error fetching wishlist:", error);
    }
  }, [token]);

  // ADDING ITEMS TO WISHLIST
  const toggleWishlist = async (productId) => {
    try {
      // Check if product is already in wishlist
      if (wishlist.includes(productId)) {
        toast.info("This product is already in your wishlist");
        return;
      }
      
      const response = await axios.post(
        backend_url + "/api/user/wishlist/toggle",
        { productId },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      if (response.data.success) {
        setWishlist(response.data.wishlist);
        toast.success("Added to wishlist");
      }
    } catch (error) {
      console.error("Error updating wishlist:", error);
      toast.error("Failed to update wishlist");
    }
  };

  // ADD TO WISHLIST - Only adds, never removes
  const addToWishlist = async (productId) => {
    try {
      // Check if product is already in wishlist
      if (wishlist.includes(productId)) {
        toast.info("This product is already in your wishlist");
        return;
      }
      
      const response = await axios.post(
        backend_url + "/api/user/wishlist/toggle",
        { productId },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      if (response.data.success) {
        setWishlist(response.data.wishlist);
        toast.success("Added to wishlist");
      }
    } catch (error) {
      console.error("Error adding to wishlist:", error);
      toast.error("Failed to add to wishlist");
    }
  };

  // REMOVE FROM WISHLIST
  const removeFromWishlist = async (productId) => {
    try {
      console.log("Removing from wishlist:", productId);
      console.log("Current wishlist before removal:", wishlist);
      
      const response = await axios.post(
        backend_url + "/api/user/wishlist/remove",
        { productId },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      
      console.log("Wishlist removal response:", response.data);
      
      if (response.data.success) {
        // Update the wishlist state with the new wishlist from the server
        setWishlist(response.data.wishlist);
        console.log("Updated wishlist after removal:", response.data.wishlist);
        toast.success("Removed from wishlist");
        
        // Force a re-fetch of the wishlist to ensure it's up to date
        getWishlist();
      } else {
        console.error("Failed to remove from wishlist:", response.data);
        toast.error("Failed to remove from wishlist");
      }
    } catch (error) {
      console.error("Error removing from wishlist:", error);
      toast.error("Failed to remove from wishlist");
    }
  };

  const isInWishlist = (productId) => {
    return wishlist.includes(productId);
  };

  const getProductData = useCallback(async () => {
    try {
      const response = await axios.get(backend_url + "/api/product/list");
      if (response.data.success) {
        setProducts(response.data.products);
      } else {
        toast.error(response.data.message);
      }
    } catch (error) {
      console.log(error);
      toast.error(error.message);
    }
  }, []);

  // GETTING USER CART
  const getUserCart = useCallback(async () => {
    try {
      if (!token) {
        console.log("No token available, skipping getUserCart");
        return;
      }
      
      console.log("Getting user cart with token:", token);
      const response = await axios.post(
        backend_url + "/api/cart/get",
        {},
        { headers: { token } }
      );
      console.log("Get cart response:", response.data);
      if (response.data.success) {
        setCartItems(response.data.cartData);
        return response.data.cartData;
      }
      return null;
    } catch (error) {
      console.log("Error getting user cart:", error);
      toast.error("Failed to get your cart");
      return null;
    }
  }, [token]);

  // SYNC GUEST CART WITH USER CART AFTER LOGIN
  const syncGuestCartWithUserCart = useCallback(async () => {
    if (isCartSyncing) {
      console.log("Cart sync already in progress, skipping");
      return;
    }
    
    try {
      setIsCartSyncing(true);
      console.log("Starting cart sync process");
      
      const guestCartString = localStorage.getItem('guestCart');
      if (!guestCartString) {
        console.log("No guest cart found in localStorage");
        setIsCartSyncing(false);
        return;
      }
      
      const guestCart = JSON.parse(guestCartString);
      if (Object.keys(guestCart).length === 0) {
        console.log("Guest cart is empty");
        setIsCartSyncing(false);
        return;
      }
      
      console.log("Syncing guest cart with token:", token);
      console.log("Guest cart data:", guestCart);
      
      // Instead of clearing the server cart first, let's add items one by one
      // This way we preserve any items already in the user's cart
      
      // For each item in guest cart, add to user cart
      const updatePromises = [];
      for (const itemId in guestCart) {
        for (const color in guestCart[itemId]) {
          const quantity = guestCart[itemId][color];
          if (quantity > 0) {
            console.log(`Adding item to server: ${itemId}, color: ${color}, quantity: ${quantity}`);
            // Use addToCart endpoint instead of update to properly handle existing items
            const updatePromise = axios.post(
              backend_url + "/api/cart/add",
              { itemId, color, quantity: quantity },
              { headers: { token } }
            );
            updatePromises.push(updatePromise);
          }
        }
      }
      
      // Wait for all updates to complete
      await Promise.all(updatePromises);
      console.log("All items added to server cart");
      
      // Clear guest cart after syncing
      localStorage.removeItem('guestCart');
      console.log("Cleared guest cart from localStorage");
      
      // Get updated cart from server
      const updatedCart = await getUserCart();
      console.log("Updated cart from server:", updatedCart);
      
      if (updatedCart) {
        toast.success("Your cart has been restored");
      }
    } catch (error) {
      console.error("Failed to sync cart:", error);
      toast.error("Failed to sync your cart");
    } finally {
      setIsCartSyncing(false);
    }
  }, [token, getUserCart, isCartSyncing]);

  // CLEAR CART
  const clearCart = async () => {
    try {
      if (token) {
        await axios.post(
          backend_url + "/api/cart/clear",
          {},
          { headers: { token } }
        );
      } else {
        localStorage.removeItem('guestCart');
      }
      setCartItems({});
      toast.success("Cart cleared successfully");
    } catch (error) {
      console.log(error);
      toast.error("Failed to clear cart");
    }
  };

  // Initialize cart and products
  useEffect(() => {
    // Fetch products regardless of login status
    getProductData();
    
    // Check for token in localStorage
    const storedToken = localStorage.getItem("token");
    if (storedToken && !token) {
      console.log("Setting token from localStorage:", storedToken);
      setToken(storedToken);
      return; // Exit early, the next effect run will handle cart loading
    }
    
    // Load guest cart from localStorage if not logged in
    if (!token) {
      const guestCartString = localStorage.getItem('guestCart');
      if (guestCartString) {
        try {
          const guestCart = JSON.parse(guestCartString);
          console.log("Loaded guest cart:", guestCart);
          setCartItems(guestCart);
        } catch (err) {
          console.error("Error parsing guest cart:", err);
          localStorage.removeItem('guestCart');
        }
      }
    }
  }, [getProductData, token]);
  
  // Handle user-specific data when token changes
  useEffect(() => {
    if (token) {
      console.log("User is logged in with token:", token);
      // Only fetch user-specific data when logged in
      getUserCart();
      getWishlist();
      
      // Sync guest cart with user cart if available
      const hasGuestCart = localStorage.getItem('guestCart');
      if (hasGuestCart) {
        console.log("Found guest cart, syncing...");
        syncGuestCartWithUserCart();
      }
    }
  }, [token, getUserCart, getWishlist, syncGuestCartWithUserCart]);

  const value = {
    navigate,
    products,
    search,
    setSearch,
    currency,
    delivery_charges,
    cartItems,
    setCartItems,
    addToCart,
    getCartCount,
    updateQuantity,
    getCartAmount,
    token,
    setToken,
    backend_url,
    wishlist,
    toggleWishlist,
    addToWishlist,
    removeFromWishlist,
    isInWishlist,
    clearCart,
    formatPrice,
  };

  return (
    <ShopContext.Provider value={value}>{children}</ShopContext.Provider>
  );
};

ShopContextProvider.propTypes = {
  children: PropTypes.node.isRequired
};

export default ShopContextProvider;
