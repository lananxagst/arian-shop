import { useContext, useEffect, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { ShopContext } from "../context/ShopContext";
import axios from "axios";
import { toast } from "react-toastify";
import Title from "../components/Title";
import Footer from "../components/Footer";

const PaymentSuccess = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { backend_url, token, setCartItems } = useContext(ShopContext);
  const [loading, setLoading] = useState(true);
  const [orderDetails, setOrderDetails] = useState(null);

  useEffect(() => {
    const updateOrderPaymentStatus = async () => {
      try {
        setLoading(true);
        // Get order_id from URL query parameters
        const params = new URLSearchParams(location.search);
        const orderId = params.get("order_id");

        if (!orderId) {
          toast.error("Order ID not found");
          navigate("/orders");
          return;
        }

        // Update order payment status
        const response = await axios.post(
          `${backend_url}/api/order/update-payment`,
          { orderId, paymentStatus: true },
          { headers: { token } }
        );

        if (response.data.success) {
          setOrderDetails(response.data.order);
          // Clear cart
          setCartItems({});
          toast.success("Payment successful!");
        } else {
          toast.error(response.data.message || "Failed to update payment status");
        }
      } catch (error) {
        console.error("Payment success error:", error);
        toast.error(error.message || "An error occurred");
      } finally {
        setLoading(false);
      }
    };

    if (token) {
      updateOrderPaymentStatus();
    } else {
      navigate("/login", { state: { returnTo: location.pathname + location.search } });
    }
  }, [token, location, navigate, setCartItems, backend_url]);

  return (
    <div>
      <div className="bg-primary min-h-[60vh] flex items-center justify-center">
        <div className="max-padd-container py-10">
          <div className="bg-white p-8 rounded-lg shadow-md max-w-2xl mx-auto">
            <div className="text-center mb-6">
              <div className="flex justify-center mb-4">
                <div className="bg-green-100 p-3 rounded-full">
                  <svg
                    className="w-12 h-12 text-green-500"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                    xmlns="http://www.w3.org/2000/svg"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth="2"
                      d="M5 13l4 4L19 7"
                    ></path>
                  </svg>
                </div>
              </div>
              <Title title1={"Payment"} title2={"Successful"} />
              <p className="text-gray-600 mt-2">
                Your order has been placed successfully!
              </p>
            </div>

            {loading ? (
              <div className="flex justify-center my-8">
                <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
              </div>
            ) : (
              orderDetails && (
                <div className="border-t border-gray-200 pt-4">
                  <div className="flex justify-between mb-2">
                    <span className="font-semibold">Order ID:</span>
                    <span className="text-gray-700">{orderDetails._id}</span>
                  </div>
                  <div className="flex justify-between mb-2">
                    <span className="font-semibold">Amount:</span>
                    <span className="text-gray-700">
                      ${orderDetails.amount.toFixed(2)}
                    </span>
                  </div>
                  <div className="flex justify-between mb-2">
                    <span className="font-semibold">Status:</span>
                    <span className="text-green-600">{orderDetails.status}</span>
                  </div>
                  <div className="flex justify-between mb-2">
                    <span className="font-semibold">Payment Method:</span>
                    <span className="text-gray-700">
                      {orderDetails.paymentMethod}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="font-semibold">Date:</span>
                    <span className="text-gray-700">
                      {new Date(orderDetails.date).toLocaleDateString()}
                    </span>
                  </div>
                </div>
              )
            )}

            <div className="mt-8 flex justify-center space-x-4">
              <button
                onClick={() => navigate("/orders")}
                className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600 transition"
              >
                View Orders
              </button>
              <button
                onClick={() => navigate("/")}
                className="bg-gray-200 text-gray-800 px-4 py-2 rounded hover:bg-gray-300 transition"
              >
                Continue Shopping
              </button>
            </div>
          </div>
        </div>
      </div>
      <Footer />
    </div>
  );
};

export default PaymentSuccess;
