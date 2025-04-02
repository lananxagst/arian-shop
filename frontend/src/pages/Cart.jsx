import { useContext, useEffect, useState, useCallback } from "react";
import { ShopContext } from "../context/ShopContext";
import Title from "../components/Title";
import { FaRegWindowClose } from "react-icons/fa";
import { FaMinus, FaPlus } from "react-icons/fa6";
import CartTotal from "../components/CartTotal";
import Footer from "../components/Footer";
import { toast } from "react-toastify";
import axios from "axios";

const Cart = () => {
  const {
    navigate,
    products,
    currency,
    cartItems,
    setCartItems,
    getCartCount,
    updateQuantity,
    token,
    backendUrl
  } = useContext(ShopContext);

  const [cartData, setCartData] = useState([]);
  const [quantities, setQuantities] = useState({});
  const [isLoading, setIsLoading] = useState(true);

  // Function to explicitly fetch cart data from the server
  const fetchCartData = useCallback(async () => {
    if (!token) return;
    
    try {
      console.log("Cart: Fetching cart data with token:", token);
      setIsLoading(true);
      
      const response = await axios.post(
        backendUrl + "/api/cart/get",
        {},
        { headers: { token } }
      );
      
      console.log("Cart: Cart data response:", response.data);
      
      if (response.data.success) {
        setCartItems(response.data.cartData);
        console.log("Cart: Updated cart items:", response.data.cartData);
        toast.success("Cart updated successfully");
      } else {
        console.error("Cart: Failed to fetch cart data:", response.data.message);
      }
    } catch (error) {
      console.error("Cart: Error fetching cart data:", error);
    } finally {
      setIsLoading(false);
    }
  }, [token, backendUrl, setCartItems]);

  // Process cart items into a format for display
  useEffect(() => {
    if (products.length > 0) {
      const tempData = [];
      const initialQuantities = {};
      for (const items in cartItems) {
        for (const item in cartItems[items]) {
          if (cartItems[items][item] > 0) {
            tempData.push({
              _id: items,
              color: item,
              quantity: cartItems[items][item],
              ...products.find((product) => product._id === items),
            });
            initialQuantities[`${items}-${item}`] = cartItems[items][item];
          }
        }
      }
      setCartData(tempData);
      setQuantities(initialQuantities);
      setIsLoading(false);
    }
  }, [products, cartItems]);

  // Fetch cart data when component mounts and token is available
  useEffect(() => {
    // Check if we came from login with a guest cart
    const fromLogin = sessionStorage.getItem('fromLogin');
    
    if (token && fromLogin) {
      console.log("Cart: Detected login with guest cart, fetching updated cart");
      fetchCartData();
      sessionStorage.removeItem('fromLogin');
    }
  }, [token, fetchCartData]);

  const handleQuantityChange = (id, color, newQuantity) => {
    if (newQuantity < 1) return;
    setQuantities((prev) => ({ ...prev, [`${id}-${color}`]: newQuantity }));
    // Update cart immediately when quantity changes
    updateQuantity(id, color, newQuantity);
  };

  const handleRemoveFromCart = (id, color) => {
    updateQuantity(id, color, 0);
  };

  const handleCheckout = () => {
    if (token) {
      navigate("/place-order");
    } else {
      toast.info("Please login to continue with checkout");
      navigate("/login", { state: { returnTo: "/place-order" } });
    }
  };

  return (
    <section>
      <div className="bg-primary mb-16">
        <div className="max-padd-container py-10">
          {/* TITLE */}
          <div className="flexStart gap-x-4">
            <Title title1={"Cart"} title2={"List"} title1Styles={"h3"} />
            <h5 className="medium-15 text-gray-30 relative bottom-1.5">
              ({getCartCount()} Items)
            </h5>
          </div>
          {/* CONTAINER */}
          <div className="mt-6">
            {isLoading ? (
              <div className="text-center py-10">Loading your cart...</div>
            ) : cartData.length === 0 ? (
              <div className="text-center py-10">
                <p className="mb-5">Your cart is empty</p>
                <button
                  onClick={() => navigate("/collection")}
                  className="btn-dark !py-2"
                >
                  Continue Shopping
                </button>
              </div>
            ) : (
              cartData.map((item, i) => {
                const key = `${item._id}-${item.color}`;
                return (
                  <div key={i} className="bg-white p-2 mb-3 rounded-lg">
                    <div className="flex items-center gap-x-3">
                      <div className="flex items-start gap-6">
                        <img
                          src={item.image[0]}
                          alt="productImg"
                          className="w-20 sm:w-18 rounded"
                        />
                      </div>
                      <div className="flex flex-col w-full">
                        <div className="flexBetween">
                          <h5 className="h5 !my-0 line-clamp-1">
                            {item.name}
                          </h5>
                          <FaRegWindowClose
                            onClick={() =>
                              handleRemoveFromCart(item._id, item.color)
                            }
                            className="cursor-pointer text-secondary"
                          />
                        </div>
                        <p className="bold-14 my-0.5">{item.color}</p>
                        <div className="flexBetween">
                          <div className="flex items-center ring-1 ring-slate-900/5 rounded-full overflow-hidden bg-primary">
                            <button
                              onClick={() =>
                                handleQuantityChange(
                                  item._id,
                                  item.color,
                                  quantities[key] - 1
                                )
                              }
                              className="p-1.5 bg-white text-secondary rounded-full shadow-md"
                            >
                              <FaMinus className="text-xs" />
                            </button>
                            <p className="px-2">{quantities[key]}</p>
                            <button
                              onClick={() =>
                                handleQuantityChange(
                                  item._id,
                                  item.color,
                                  quantities[key] + 1
                                )
                              }
                              className="p-1.5 bg-white text-secondary rounded-full shadow-md"
                            >
                              <FaPlus className="text-xs" />
                            </button>
                          </div>
                          <h4 className="h4">
                            {currency}
                            {item.price}
                          </h4>
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })
            )}
          </div>
          <div className="flex my-20">
            <div className="w-full sm:w-[450px]">
              <CartTotal />
              <button
                onClick={handleCheckout}
                className="btn-secondary mt-7"
              >
                Proceed to Checkout
              </button>
            </div>
          </div>
        </div>
      </div>

      <Footer />
    </section>
  );
};

export default Cart;
