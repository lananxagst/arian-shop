import { useContext, useState, useEffect, useCallback } from "react";
import Title from "../components/Title";
import CartTotal from "../components/CartTotal";
import Footer from "../components/Footer";
import { ShopContext } from "../context/ShopContext";
import axios from "axios";
import { toast } from "react-toastify";
import { useLocation } from "react-router-dom";

const PlaceOrder = () => {
  const [method, setMethod] = useState("cod");
  const {
    navigate,
    products,
    delivery_charges,
    cartItems,
    setCartItems,
    getCartAmount,
    token,
    backend_url,
  } = useContext(ShopContext);
  const location = useLocation();
  const directCheckout = location.state?.directCheckout || false;
  const directCheckoutProductId = location.state?.productId;
  const directCheckoutColor = location.state?.color;

  // Function to explicitly fetch cart data from the server
  const fetchCartData = useCallback(async () => {
    try {
      console.log("PlaceOrder: Fetching cart data with token:", token);
      const response = await axios.post(
        backend_url + "/api/cart/get",
        {},
        { headers: { token } }
      );
      
      console.log("PlaceOrder: Cart data response:", response.data);
      
      if (response.data.success) {
        setCartItems(response.data.cartData);
        console.log("PlaceOrder: Updated cart items:", response.data.cartData);
      } else {
        console.error("PlaceOrder: Failed to fetch cart data:", response.data.message);
      }
    } catch (error) {
      console.error("PlaceOrder: Error fetching cart data:", error);
    }
  }, [token, setCartItems, backend_url]);

  // Redirect to login if not authenticated
  useEffect(() => {
    if (!token) {
      toast.info("Please login to continue with checkout");
      navigate("/login", { state: { returnTo: "/place-order", directCheckout, productId: directCheckoutProductId, color: directCheckoutColor } });
    } else {
      // Explicitly fetch cart data when component mounts and user is logged in
      fetchCartData();
    }
  }, [token, navigate, fetchCartData, directCheckout, directCheckoutProductId, directCheckoutColor]);

  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    email: "",
    street: "",
    city: "",
    state: "",
    zipcode: "",
    country: "",
    phone: "",
  });

  const onChangeHandler = (event) => {
    const name = event.target.name;
    const value = event.target.value;

    setFormData((data) => ({ ...data, [name]: value }));
  };

  const onSubmitHandler = async (e) => {
    e.preventDefault();
    try {
      let orderItems = [];

      if (directCheckout && directCheckoutProductId && directCheckoutColor) {
        // For direct checkout, only include the specific product
        const itemInfo = structuredClone(
          products.find((product) => product._id === directCheckoutProductId)
        );
        if (itemInfo) {
          itemInfo.color = directCheckoutColor;
          itemInfo.quantity = 1; // Set quantity to 1 for direct checkout
          // Multiply the price by 1000 to match what's displayed on the frontend
          itemInfo.price = itemInfo.price * 1000;
          orderItems.push(itemInfo);
        }
      } else {
        // Regular checkout with all cart items
        for (const items in cartItems) {
          for (const item in cartItems[items]) {
            if (cartItems[items][item] > 0) {
              const itemInfo = structuredClone(
                products.find((product) => product._id === items)
              );
              if (itemInfo) {
                itemInfo.color = item;
                itemInfo.quantity = cartItems[items][item];
                // Multiply the price by 1000 to match what's displayed on the frontend
                itemInfo.price = itemInfo.price * 1000;
                orderItems.push(itemInfo);
              }
            }
          }
        }
      }

      // Calculate total amount
      let totalAmount = 0;
      if (directCheckout && orderItems.length === 1) {
        // For direct checkout, calculate the amount for just this item
        // Price is already multiplied by 1000 above
        totalAmount = orderItems[0].price + (delivery_charges * 1000);
      } else {
        // Regular checkout, use the cart total
        // getCartAmount returns the original price, so multiply by 1000
        totalAmount = (getCartAmount() * 1000) + (delivery_charges * 1000);
      }

      let orderData = {
        userId: token,
        address: formData,
        items: orderItems,
        amount: totalAmount,
      };

      switch (method) {
        // API CALL FOR COD
        case "cod": {
          const response = await axios.post(
            backend_url + "/api/order/place",
            orderData,
            { headers: { token } }
          );
          if (response.data.success) {
            // Only clear the cart if it's not a direct checkout
            if (!directCheckout) {
              setCartItems({});
            } else {
              // For direct checkout, we might want to remove just that item from cart
              // But since it was a direct checkout, we'll leave the cart as is
            }
            navigate("/orders");
          } else {
            toast.error(response.data.message);
          }
          break;
        }
        // API CALL FOR STRIPE
        case "stripe": {
          const responseStripe = await axios.post(
            backend_url + "/api/order/stripe",
            orderData,
            { headers: { token } }
          );
          if (responseStripe.data.success) {
            const { session_url } = responseStripe.data;
            window.location.replace(session_url);
          } else {
            toast.error(responseStripe.data.message);
          }
          break;
        }

        default:
          break;
      }
    } catch (error) {
      toast.error(error.message);
    }
  };

  return (
    <div>
      <div className="bg-primary mb-16">
        {/* CONTAINER */}
        <form onSubmit={onSubmitHandler} className="max-padd-container py-10">
          <div className="flex flex-col xl:flex-row gap-20 xl:gap-28">
            {/* LEFT SIDE */}
            <div className="flex-1 flex flex-col gap-3 text-[95%]">
              <Title title1={"Delivery"} title2={"Information"} />
              <div className="flex gap-3">
                <input
                  onChange={onChangeHandler}
                  value={formData.firstName}
                  name="firstName"
                  type="text"
                  placeholder="First Name"
                  className="ring-1 ring-slate-900/15 p-1 pl-3 rounded-sm bg-white outline-none w-1/2"
                  required
                />
                <input
                  onChange={onChangeHandler}
                  value={formData.lastName}
                  name="lastName"
                  type="text"
                  placeholder="Last Name"
                  className="ring-1 ring-slate-900/15 p-1 pl-3 rounded-sm bg-white outline-none w-1/2"
                  required
                />
              </div>
              <input
                onChange={onChangeHandler}
                value={formData.email}
                name="email"
                type="text"
                placeholder="Email Address"
                className="ring-1 ring-slate-900/15 p-1 pl-3 rounded-sm bg-white outline-none"
                required
              />
              <input
                onChange={onChangeHandler}
                value={formData.phone}
                name="phone"
                type="text"
                placeholder="Phone Number"
                className="ring-1 ring-slate-900/15 p-1 pl-3 rounded-sm bg-white outline-none"
                required
              />
              <input
                onChange={onChangeHandler}
                value={formData.street}
                name="street"
                type="text"
                placeholder="Street"
                className="ring-1 ring-slate-900/15 p-1 pl-3 rounded-sm bg-white outline-none"
                required
              />
              <div className="flex gap-3">
                <input
                  onChange={onChangeHandler}
                  value={formData.city}
                  name="city"
                  type="text"
                  placeholder="City"
                  className="ring-1 ring-slate-900/15 p-1 pl-3 rounded-sm bg-white outline-none w-1/2"
                  required
                />
                <input
                  onChange={onChangeHandler}
                  value={formData.state}
                  name="state"
                  type="text"
                  placeholder="State"
                  className="ring-1 ring-slate-900/15 p-1 pl-3 rounded-sm bg-white outline-none w-1/2"
                  required
                />
              </div>
              <div className="flex gap-3">
                <input
                  onChange={onChangeHandler}
                  value={formData.zipcode}
                  name="zipcode"
                  type="text"
                  placeholder="Zip Code"
                  className="ring-1 ring-slate-900/15 p-1 pl-3 rounded-sm bg-white outline-none w-1/2"
                  required
                />
                <input
                  onChange={onChangeHandler}
                  value={formData.country}
                  name="country"
                  type="text"
                  placeholder="Country"
                  className="ring-1 ring-slate-900/15 p-1 pl-3 rounded-sm bg-white outline-none w-1/2"
                  required
                />
              </div>
            </div>

            {/* RIGHT SIDE */}
            <div className="flex flex-1 flex-col">
              <CartTotal />
              {/* PAYMENT METHOD */}
              <div className="my-6">
                <h3 className="bold-20 mb-5">
                  Payment <span>Method</span>
                </h3>
                <div className="flex gap-3">
                  <div
                    onClick={() => setMethod("stripe")}
                    className={`${
                      method === "stripe" ? "btn-dark" : "btn-white"
                    } !py-1 text-xs cursor-pointer`}
                  >
                    Stripe
                  </div>
                  <div
                    onClick={() => setMethod("cod")}
                    className={`${
                      method === "cod" ? "btn-dark" : "btn-white"
                    } !py-1 text-xs cursor-pointer`}
                  >
                    Cash on Delivery
                  </div>
                </div>
              </div>
              <div>
                <button type="submit" className="btn-secondary">
                  Place Order
                </button>
              </div>
            </div>
          </div>
        </form>
      </div>

      <Footer />
    </div>
  );
};

export default PlaceOrder;
