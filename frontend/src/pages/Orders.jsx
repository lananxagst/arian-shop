import { useContext, useEffect, useState, useCallback } from "react";
import { ShopContext } from "../context/ShopContext";
import axios from "axios";
import Title from "../components/Title";
import Footer from "../components/Footer";
import { FaImage } from "react-icons/fa";

const Orders = () => {
  const { backend_url, token, currency } = useContext(ShopContext);
  const [orderData, setOrderData] = useState([]);
  const [showEvidenceModal, setShowEvidenceModal] = useState(false);
  const [selectedEvidence, setSelectedEvidence] = useState(null);
  const [showTrackingModal, setShowTrackingModal] = useState(false);
  const [selectedOrderStatus, setSelectedOrderStatus] = useState(null);

  // Format order price without multiplying by 1000 again
  const formatOrderPrice = (price) => {
    if (typeof price !== 'number') return "N/A";
    return price.toLocaleString('id-ID').replace(',', '.');
  };

  const loadOrderData = useCallback(async () => {
    try {
      if (!token) {
        return null;
      }
      const response = await axios.post(
        backend_url + "/api/order/userorders",
        {},
        { headers: { token } }
      );
      if (response.data.success) {
        let allOrdersItem = [];
        response.data.orders.map((order) => {
          order.items.map((item) => {
            item["status"] = order.status;
            item["payment"] = order.payment;
            item["paymentMethod"] = order.paymentMethod;
            item["date"] = order.date;
            item["deliveryEvidence"] = order.deliveryEvidence;
            allOrdersItem.push(item);
            return item; // Return to fix map callback
          });
          return order; // Return to fix map callback
        });
        setOrderData(allOrdersItem.reverse());
      }
    } catch (error) {
      console.log("Error loading orders:", error);
    }
  }, [token, backend_url]);

  const handleViewEvidence = (evidence) => {
    setSelectedEvidence(evidence);
    setShowEvidenceModal(true);
  };

  const handleTrackOrder = (status) => {
    setSelectedOrderStatus(status);
    setShowTrackingModal(true);
  };

  // Helper function to determine if a URL is absolute (starts with http:// or https://)
  const isAbsoluteUrl = (url) => {
    return url && (url.startsWith('http://') || url.startsWith('https://'));
  };

  // Function to get the correct image URL
  const getImageUrl = (evidenceUrl) => {
    if (isAbsoluteUrl(evidenceUrl)) {
      return evidenceUrl; // It's already a complete URL (Cloudinary)
    }
    return backend_url + evidenceUrl; // It's a relative URL, prepend backend URL
  };

  // Get status description based on order status
  const getStatusDescription = (status) => {
    switch (status) {
      case "Order Placed":
        return "Your order has been received and is being processed. Our team is preparing your items for shipment.";
      case "Packing":
        return "Your items are currently being packed with care. We're making sure everything is secure for shipping.";
      case "Shipped":
        return "Great news! Your order has been shipped and is on its way to you. It's currently in transit with our shipping partner.";
      case "Out for Delivery":
        return "Your package is out for delivery today! The delivery person is on their way to your address.";
      case "Delivered":
        return "Your order has been successfully delivered to the address you provided. We hope you enjoy your purchase!";
      default:
        return "Status information is not available at the moment.";
    }
  };

  // Setup polling for order updates
  useEffect(() => {
    // Initial load
    loadOrderData();
    
    // Setup polling every 30 seconds
    const interval = setInterval(() => {
      loadOrderData();
    }, 30000); // 30 seconds
    
    // Cleanup function
    return () => {
      clearInterval(interval);
    };
  }, [loadOrderData, token]); // Fix the React Hook useEffect dependency array warning

  return (
    <div>
      <div className="bg-primary mb-16">
        {/* CONTAINER */}
        <div className="max-padd-container py-10">
          <Title title1={"Order"} title2={"List"} title1Styles={"h3"} titleStyles={'pb-4'}/>
          {orderData.map((item, i) => (
            <div key={i} className="bg-white p-2 mt-3 rounded-lg">
              <div className="text-gray-700 flex flex-col gap-4">
                <div className="flex gap-x-3 w-full">
                  {/* IMAGE */}
                  <div className="flex gap-6">
                    <img
                      src={item.image[0]}
                      alt="orderImg"
                      className="sm:w-[99px] rounded-lg aspect-square object-cover"
                    />
                  </div>
                  {/* ORDER INFO */}
                  <div className="block w-full">
                    <h5 className="h5 capitalize line-clamp-1">{item.name}</h5>
                    <div className="flexBetween flex-wrap">
                      <div>
                        <div className="flex items-center gap-x-2 sm:gap-x-3">
                          <div className="flexCenter gap-x-2">
                            <h5 className="medium-14">Price:</h5>
                            <p>
                              {currency}
                              {formatOrderPrice(item.price)}
                            </p>
                          </div>
                          <div className="flexCenter gap-x-2">
                            <h5 className="medium-14">Quantity:</h5>
                            <p>{item.quantity}</p>
                          </div>
                          <div className="flexCenter gap-x-2">
                            <h5 className="medium-14">Color:</h5>
                            <p>{item.color}</p>
                          </div>
                        </div>
                        <div className="flex items-center gap-x-2">
                          <h5 className="medium-14">Date:</h5>
                          <p>{new Date(item.date).toDateString()}</p>
                        </div>
                        <div className="flex items-center gap-x-2">
                          <h5 className="medium-14">Payment:</h5>
                          <p>{item.paymentMethod}</p>
                        </div>
                        
                        {/* Delivery Evidence */}
                        {item.status === "Delivered" && item.deliveryEvidence && (
                          <div className="flex items-center gap-x-2 mt-1">
                            <button 
                              onClick={() => handleViewEvidence(item.deliveryEvidence)}
                              className="text-blue-500 flex items-center gap-1 text-sm"
                            >
                              <FaImage /> View Delivery Evidence
                            </button>
                          </div>
                        )}
                      </div>
                      {/* STATUS & BUTTON */}
                      <div className="flex gap-3">
                        <div className="flex items-center gap-2">
                          <p className={`min-w-2 h-2 rounded-full ${
                            item.status === "Delivered" ? "bg-green-500" : 
                            item.status === "Order Placed" ? "bg-blue-500" :
                            item.status === "Shipped" ? "bg-yellow-500" :
                            item.status === "Out for Delivery" ? "bg-orange-500" :
                            "bg-gray-500"
                          }`}></p>
                          <p>{item.status}</p>
                        </div>
                        <button 
                          onClick={() => handleTrackOrder(item.status)} 
                          className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded"
                        >
                          Track Order
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Custom Modal for Evidence */}
      {showEvidenceModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-lg p-6 max-w-md w-full">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-medium">Delivery Evidence</h3>
              <button 
                onClick={() => setShowEvidenceModal(false)}
                className="text-gray-500 hover:text-gray-700"
              >
                ✕
              </button>
            </div>
            <div className="mb-4 border rounded-lg overflow-hidden">
              {selectedEvidence && (
                <img 
                  src={getImageUrl(selectedEvidence)} 
                  alt="Delivery Evidence" 
                  className="w-full h-auto"
                />
              )}
            </div>
            <div className="flex justify-end">
              <button 
                className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded"
                onClick={() => setShowEvidenceModal(false)}
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Simple Order Tracking Modal */}
      {showTrackingModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-lg p-6 max-w-md w-full">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-medium">Order Status: {selectedOrderStatus}</h3>
              <button 
                onClick={() => setShowTrackingModal(false)}
                className="text-gray-500 hover:text-gray-700"
              >
                ✕
              </button>
            </div>
            <div className="mb-6">
              <p className="text-gray-700">{getStatusDescription(selectedOrderStatus)}</p>
            </div>
            <div className="flex justify-end">
              <button 
                className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded"
                onClick={() => setShowTrackingModal(false)}
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      <Footer />
    </div>
  );
};

export default Orders;
