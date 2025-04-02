import { useContext, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { ShopContext } from "../context/ShopContext";
import { toast } from "react-toastify";
import Title from "../components/Title";
import Footer from "../components/Footer";

const PaymentCancel = () => {
  const navigate = useNavigate();
  const { token } = useContext(ShopContext);

  useEffect(() => {
    // Show toast message when component mounts
    toast.info("Payment was cancelled. Your order has not been processed.");
    
    // Redirect to login if not authenticated
    if (!token) {
      navigate("/login", { state: { returnTo: "/cart" } });
    }
  }, [token, navigate]);

  return (
    <div>
      <div className="bg-primary min-h-[60vh] flex items-center justify-center">
        <div className="max-padd-container py-10">
          <div className="bg-white p-8 rounded-lg shadow-md max-w-2xl mx-auto">
            <div className="text-center mb-6">
              <div className="flex justify-center mb-4">
                <div className="bg-red-100 p-3 rounded-full">
                  <svg
                    className="w-12 h-12 text-red-500"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                    xmlns="http://www.w3.org/2000/svg"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth="2"
                      d="M6 18L18 6M6 6l12 12"
                    ></path>
                  </svg>
                </div>
              </div>
              <Title title1={"Payment"} title2={"Cancelled"} />
              <p className="text-gray-600 mt-2">
                Your payment was cancelled and your order has not been processed.
              </p>
            </div>

            <div className="mt-8 flex justify-center space-x-4">
              <button
                onClick={() => navigate("/cart")}
                className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600 transition"
              >
                Return to Cart
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

export default PaymentCancel;
