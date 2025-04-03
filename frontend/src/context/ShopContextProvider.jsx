import { useState, useEffect, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import api from "../utils/api";
import PropTypes from 'prop-types';
import { ShopContext } from "./ShopContext";

const ShopContextProvider = ({ children }) => {
  const [search, setSearch] = useState("");
  const [products, setProducts] = useState([]);
  const [cartItems, setCartItems] = useState({});
  const [wishlist, setWishlist] = useState([]);
  const [token, setToken] = useState("");
  const [isCartSyncing, setIsCartSyncing] = useState(false);
  // Add a refreshTrigger state to force re-fetching data
  const [refreshTrigger, setRefreshTrigger] = useState(0);
  const navigate = useNavigate();
  const currency = "IDR";
  const delivery_charges = 10;

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
        const response = await api.post(
          "/api/cart/add",
          { itemId, color }
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
        const response = await api.post(
          "/api/cart/update",
          { itemId, quantity, color }
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
      if (!token) {
        console.log("No token, skipping getWishlist");
        return;
      }
      
      // Try to get cached wishlist from localStorage first
      const cachedWishlist = localStorage.getItem('userWishlist');
      if (cachedWishlist) {
        console.log("Using cached wishlist from localStorage");
        try {
          const parsedWishlist = JSON.parse(cachedWishlist);
          setWishlist(parsedWishlist);
        } catch (parseError) {
          console.error("Error parsing cached wishlist:", parseError);
        }
      }
      
      // Try both endpoints for compatibility
      console.log("Getting wishlist with token:", token);
      let response;
      try {
        response = await api.get("/api/user/wishlist/get");
      } catch (firstError) {
        console.log("First wishlist endpoint failed, trying alternative:", firstError);
        try {
          response = await api.get("/api/user/wishlist");
        } catch (secondError) {
          console.error("All wishlist endpoints failed:", secondError);
          // If we have cached data, don't show an error toast
          if (!cachedWishlist) {
            toast.error("Could not load wishlist. Using cached data if available.");
          }
          return;
        }
      }
      
      console.log("Get wishlist response:", response.data);
      
      if (response.data.success) {
        // Create a new array to ensure React detects the change
        const newWishlist = [...response.data.wishlist];
        setWishlist(newWishlist);
        
        // Store in localStorage for quick access
        localStorage.setItem('userWishlist', JSON.stringify(newWishlist));
        localStorage.setItem('wishlistLastUpdated', Date.now());
      }
    } catch (error) {
      console.log("Wishlist fetch error:", error);
      // Don't show error toast if we already have cached data
      const cachedWishlist = localStorage.getItem('userWishlist');
      if (!cachedWishlist) {
        toast.error("Could not load wishlist. Using cached data if available.");
      }
    }
    // refreshTrigger is intentionally not included in the dependency array
    // It's used in the refreshUserData function to trigger this function
  }, [token]); // Remove refreshTrigger from dependencies

  // ADDING ITEMS TO WISHLIST
  const toggleWishlist = async (productId) => {
    try {
      // Check if product is already in wishlist
      if (wishlist.includes(productId)) {
        toast.info("This product is already in your wishlist");
        return;
      }
      
      const response = await api.post(
        "/api/user/wishlist/toggle",
        { productId }
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
      
      const response = await api.post(
        "/api/user/wishlist/toggle",
        { productId }
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
      
      const response = await api.post(
        "/api/user/wishlist/remove",
        { productId }
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
      const response = await api.get("/api/product/list");
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
        console.log("No token, skipping getUserCart");
        return;
      }
      
      // Try to get cached cart from localStorage first
      const cachedCart = localStorage.getItem('userCart');
      if (cachedCart) {
        console.log("Using cached cart from localStorage");
        try {
          const parsedCart = JSON.parse(cachedCart);
          setCartItems(parsedCart);
        } catch (parseError) {
          console.error("Error parsing cached cart:", parseError);
        }
      }
      
      console.log("Getting user cart with token:", token);
      const response = await api.post(
        "/api/cart/get",
        {}
      );
      console.log("Get cart response:", response.data);
      if (response.data.success) {
        // Create a new object to ensure React detects the change
        const newCartData = JSON.parse(JSON.stringify(response.data.cartData));
        setCartItems(newCartData);
        
        // Store in localStorage for quick access
        localStorage.setItem('userCart', JSON.stringify(newCartData));
        localStorage.setItem('cartLastUpdated', Date.now());
      }
    } catch (error) {
      console.log("Cart fetch error:", error);
      // Don't show error toast if we already have cached data
      const cachedCart = localStorage.getItem('userCart');
      if (!cachedCart) {
        toast.error("Could not load cart. Using cached data if available.");
      }
    }
    // refreshTrigger is intentionally not included in the dependency array
    // It's used in the refreshUserData function to trigger this function
  }, [token]); // Remove refreshTrigger from dependencies

  // SYNC GUEST CART TO SERVER AFTER LOGIN
  const syncGuestCartToServer = useCallback(async () => {
    try {
      if (!token) {
        console.log("No token, skipping syncGuestCartToServer");
        return;
      }
      
      // Get guest cart from localStorage
      const guestCartString = localStorage.getItem('guestCart');
      if (!guestCartString) {
        console.log("No guest cart found");
        return;
      }
      
      const guestCart = JSON.parse(guestCartString);
      console.log("Guest cart found:", guestCart);
      
      // Check if guest cart is empty
      if (Object.keys(guestCart).length === 0) {
        console.log("Guest cart is empty");
        return;
      }
      
      setIsCartSyncing(true);
      toast.info("Syncing your cart...");
      
      // For each item in guest cart, add to user cart
      const updatePromises = [];
      for (const key in guestCart) {
        for (const item in guestCart[key]) {
          const quantity = guestCart[key][item];
          if (quantity > 0) {
            console.log(`Adding item to server: ${key}, color: ${item}, quantity: ${quantity}`);
            // Use addToCart endpoint instead of update to properly handle existing items
            const updatePromise = api.post(
              "/api/cart/add",
              { itemId: key, color: item, quantity: quantity }
            );
            updatePromises.push(updatePromise);
          }
        }
      }
      
      await Promise.all(updatePromises);
      console.log("All items synced to server");
      
      // Clear guest cart
      localStorage.removeItem('guestCart');
      
      // Refresh cart from server
      await getUserCart();
      
      setIsCartSyncing(false);
      toast.success("Your cart has been synced!");
      
    } catch (error) {
      console.error("Error syncing guest cart:", error);
      toast.error("Failed to sync your cart");
      setIsCartSyncing(false);
    }
  }, [token, getUserCart]);

  // CLEAR CART
  const clearCart = async () => {
    try {
      if (token) {
        await api.post(
          "/api/cart/clear",
          {}
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
    if (storedToken) {
      setToken(storedToken);
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
        syncGuestCartToServer();
      }
    }
  }, [token, getUserCart, getWishlist, syncGuestCartToServer]);

  // Add a function to refresh all user data
  const refreshUserData = useCallback(() => {
    if (token) {
      // Increment the refresh trigger to force re-fetching
      setRefreshTrigger(prev => prev + 1);
      
      // Add error handling for data fetching
      try {
        getUserCart();
      } catch (error) {
        console.error("Error refreshing cart:", error);
      }
      
      try {
        getWishlist();
      } catch (error) {
        console.error("Error refreshing wishlist:", error);
      }
      
      // Set a flag in localStorage to indicate data is being refreshed
      localStorage.setItem('dataRefreshing', 'true');
      localStorage.setItem('lastRefreshTime', Date.now());
    }
  }, [token, getUserCart, getWishlist]);

  // Set up a listener for route changes to refresh data
  useEffect(() => {
    const handleRouteChange = () => {
      console.log('Route changed, refreshing data');
      // Only refresh if we haven't refreshed in the last 2 seconds
      const lastRefresh = localStorage.getItem('lastRefreshTime');
      if (!lastRefresh || (Date.now() - parseInt(lastRefresh)) > 2000) {
        refreshUserData();
      }
    };
    
    // Listen for navigation events
    window.addEventListener('popstate', handleRouteChange);
    
    return () => {
      window.removeEventListener('popstate', handleRouteChange);
    };
  }, [refreshUserData]);

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
    wishlist,
    toggleWishlist,
    addToWishlist,
    removeFromWishlist,
    isInWishlist,
    clearCart,
    formatPrice,
    refreshUserData,
    isCartSyncing,
    refreshTrigger,
    setRefreshTrigger
  };

  return (
    <ShopContext.Provider value={value}>{children}</ShopContext.Provider>
  );
};

ShopContextProvider.propTypes = {
  children: PropTypes.node.isRequired
};

export default ShopContextProvider;
