import { useState, useEffect, useCallback, useRef } from "react";
import axios from "axios";
import { backend_url, currency } from "../App";
import { toast } from "react-toastify";
import { TfiPackage } from "react-icons/tfi";
import PropTypes from 'prop-types';
import { FaUpload, FaImage, FaSearch, FaTrash } from 'react-icons/fa';

const Orders = ({ token }) => {
  const [orders, setOrders] = useState([]);
  const [filteredOrders, setFilteredOrders] = useState([]);
  const [isUpdating, setIsUpdating] = useState(false);
  const [selectedImage, setSelectedImage] = useState(null);
  const [previewUrl, setPreviewUrl] = useState(null);
  const [currentOrderId, setCurrentOrderId] = useState(null);
  const [isOpen, setIsOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [confirmDelete, setConfirmDelete] = useState(null);
  const fileInputRef = useRef(null);

  const fetchAllOrders = useCallback(async () => {
    if (!token) {
      return null;
    }
    try {
      const response = await axios.post(
        backend_url + "/api/order/list",
        {},
        { headers: { token } }
      );
      if (response.data.success) {
        const ordersData = response.data.orders.reverse();
        setOrders(ordersData);
        setFilteredOrders(applySearch(ordersData, searchTerm));
      } else {
        toast.error(response.data.message);
      }
    } catch (error) {
      console.error("Error fetching orders:", error);
      // Don't show toast for network errors to avoid spamming the user during polling
      if (!error.message.includes("Network Error")) {
        toast.error(error.response?.data?.message || "An error occurred while fetching orders");
      }
    }
  }, [token, searchTerm]);

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setSelectedImage(file);
      // Create a preview URL
      const fileReader = new FileReader();
      fileReader.onload = () => {
        setPreviewUrl(fileReader.result);
      };
      fileReader.readAsDataURL(file);
      setIsOpen(true);
    }
  };

  const statusHandler = async (event, orderId) => {
    if (isUpdating) return;
    
    const newStatus = event.target.value;
    
    // If status is being changed to "Delivered", prompt for evidence upload
    if (newStatus === "Delivered") {
      setCurrentOrderId(orderId);
      // Reset any previous uploads
      setSelectedImage(null);
      setPreviewUrl(null);
      // Trigger file input click
      if (fileInputRef.current) {
        fileInputRef.current.click();
      }
      return; // Don't proceed with the update yet
    }
    
    try {
      setIsUpdating(true);
      
      // Make the API call
      const response = await axios.post(
        backend_url + "/api/order/status",
        { orderId, status: newStatus },
        { headers: { token } }
      );
      
      if (response.data.success) {
        toast.success("Order status updated successfully");
        // Reload the page after a short delay to show the toast
        setTimeout(() => {
          window.location.reload();
        }, 1000);
      } else {
        toast.error(response.data.message || "Failed to update order status");
      }
    } catch (error) {
      console.error("Status update error:", error);
      toast.error(error.response?.data?.message || "An error occurred while updating order status");
    } finally {
      setIsUpdating(false);
    }
  };

  const uploadEvidenceAndUpdateStatus = async () => {
    if (!selectedImage || !currentOrderId) {
      toast.error("Please select an image for delivery evidence");
      return;
    }

    try {
      setIsUpdating(true);
      
      // Create form data for file upload
      const formData = new FormData();
      formData.append("orderId", currentOrderId);
      formData.append("status", "Delivered");
      formData.append("deliveryEvidence", selectedImage);
      
      const response = await axios.post(
        backend_url + "/api/order/status",
        formData,
        { 
          headers: { 
            token,
            "Content-Type": "multipart/form-data"
          } 
        }
      );
      
      if (response.data.success) {
        toast.success("Order marked as delivered with evidence");
        
        // Reset upload state
        setSelectedImage(null);
        setPreviewUrl(null);
        setCurrentOrderId(null);
        setIsOpen(false);
        
        // Reload the page after a short delay to show the toast
        setTimeout(() => {
          window.location.reload();
        }, 1000);
      } else {
        toast.error(response.data.message || "Failed to update order status");
      }
    } catch (error) {
      console.error("Upload error:", error);
      toast.error(error.response?.data?.message || "An error occurred while updating order status");
    } finally {
      setIsUpdating(false);
    }
  };

  const cancelUpload = () => {
    setSelectedImage(null);
    setPreviewUrl(null);
    setCurrentOrderId(null);
    setIsOpen(false);
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

  // Search functionality
  const handleSearch = (e) => {
    const term = e.target.value;
    setSearchTerm(term);
    setFilteredOrders(applySearch(orders, term));
  };

  const applySearch = (ordersArray, term) => {
    if (!term.trim()) return ordersArray;
    
    return ordersArray.filter(order => {
      // Search by order ID
      if (order._id.toLowerCase().includes(term.toLowerCase())) return true;
      
      // Search by customer name
      const customerName = `${order.address.firstName} ${order.address.lastName}`.toLowerCase();
      if (customerName.includes(term.toLowerCase())) return true;
      
      // Search by address
      const address = `${order.address.street} ${order.address.city} ${order.address.state} ${order.address.country}`.toLowerCase();
      if (address.includes(term.toLowerCase())) return true;
      
      // Search by phone
      if (order.address.phone.includes(term)) return true;
      
      // Search by status
      if (order.status.toLowerCase().includes(term.toLowerCase())) return true;
      
      // Search by product names
      return order.items.some(item => 
        item.name.toLowerCase().includes(term.toLowerCase())
      );
    });
  };

  // Delete order functionality
  const handleDeleteClick = (orderId) => {
    setConfirmDelete(orderId);
  };

  const confirmDeleteOrder = async () => {
    if (!confirmDelete) return;
    
    try {
      setIsUpdating(true);
      
      const response = await axios.post(
        backend_url + "/api/order/delete",
        { orderId: confirmDelete },
        { headers: { token } }
      );
      
      if (response.data.success) {
        toast.success("Order deleted successfully");
        // Reload the page after a short delay to show the toast
        setTimeout(() => {
          window.location.reload();
        }, 1000);
      } else {
        toast.error(response.data.message || "Failed to delete order");
      }
    } catch (error) {
      console.error("Delete error:", error);
      toast.error(error.response?.data?.message || "An error occurred while deleting the order");
    } finally {
      setIsUpdating(false);
      setConfirmDelete(null);
    }
  };

  const cancelDelete = () => {
    setConfirmDelete(null);
  };

  // Set up polling and initial data load
  useEffect(() => {
    // Initial load
    fetchAllOrders();
    
    // Poll for updates every 10 seconds
    const interval = setInterval(() => {
      fetchAllOrders();
    }, 10000);
    
    return () => clearInterval(interval);
  }, [fetchAllOrders]);

  return (
    <div className="px-2 sm:px-8 sm:mt-14">
      {/* Search bar */}
      <div className="mb-6 relative">
        <div className="flex items-center border border-gray-300 rounded-lg overflow-hidden">
          <div className="px-3 py-2 bg-gray-100">
            <FaSearch className="text-gray-500" />
          </div>
          <input
            type="text"
            placeholder="Search orders by name, address, status..."
            className="w-full p-2 outline-none"
            value={searchTerm}
            onChange={handleSearch}
          />
        </div>
      </div>

      {/* Hidden file input */}
      <input 
        type="file" 
        ref={fileInputRef} 
        style={{ display: 'none' }} 
        accept="image/*"
        onChange={handleImageChange}
      />

      {/* Image upload modal - Tailwind CSS */}
      {isOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-lg p-6 max-w-md w-full">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-medium">Upload Delivery Evidence</h3>
              <button 
                onClick={cancelUpload}
                className="text-gray-500 hover:text-gray-700"
              >
                ✕
              </button>
            </div>
            <div className="mb-4 border rounded-lg overflow-hidden">
              <img src={previewUrl} alt="Delivery Evidence Preview" className="w-full h-auto" />
            </div>
            <div className="flex justify-end gap-3">
              <button 
                onClick={cancelUpload}
                className="px-4 py-2 bg-gray-200 rounded-lg"
                disabled={isUpdating}
              >
                Cancel
              </button>
              <button 
                onClick={uploadEvidenceAndUpdateStatus}
                className="px-4 py-2 bg-green-500 text-white rounded-lg flex items-center gap-2"
                disabled={isUpdating}
              >
                {isUpdating ? 'Uploading...' : (
                  <>
                    <FaUpload /> Upload & Mark as Delivered
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Confirm Delete Modal */}
      {confirmDelete && (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-lg p-6 max-w-md w-full">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-medium">Confirm Delete</h3>
              <button 
                onClick={cancelDelete}
                className="text-gray-500 hover:text-gray-700"
              >
                ✕
              </button>
            </div>
            <p className="mb-6">Are you sure you want to delete this order? This action cannot be undone.</p>
            <div className="flex justify-end gap-3">
              <button 
                onClick={cancelDelete}
                className="px-4 py-2 bg-gray-200 rounded-lg"
                disabled={isUpdating}
              >
                Cancel
              </button>
              <button 
                onClick={confirmDeleteOrder}
                className="px-4 py-2 bg-red-500 text-white rounded-lg flex items-center gap-2"
                disabled={isUpdating}
              >
                {isUpdating ? 'Deleting...' : 'Delete Order'}
              </button>
            </div>
          </div>
        </div>
      )}

      <div className="flex flex-col gap-4">
        {filteredOrders.map((order) => (
          <div
            key={order._id}
            className="grid grid-cols-1 sm:grid-cols-[0.5fr_2fr_1fr] lg:grid-cols-[0.5fr_2fr_1fr_0.5fr_1fr] gap-4 items-start p-3 text-gray-700 bg-white rounded-lg"
          >
            <div className="flexCenter">
              <TfiPackage className="text-3xl text-secondary" />
            </div>
            <div>
              <div className="flex items-start gap-1">
                <div className="medium-14">Items:</div>
                <div className="flex flex-col relative top-0.5">
                  {order.items.map((item, index) => {
                    if (index === order.items.length - 1) {
                      return (
                        <p key={index}>
                          {item.name} x {item.quantity}{" "}
                          <span>{`"${item.color}"`}</span>
                        </p>
                      );
                    } else {
                      return (
                        <p key={index}>
                          {item.name} x {item.quantity}{" "}
                          <span>{`"${item.color}"`}</span> ,
                        </p>
                      );
                    }
                  })}
                </div>
              </div>
              <p className="medium-14">
                <span className="text-tertiary">Name: </span>
                {order.address.firstName + " " + order.address.lastName}
              </p>
              <p className="medium-14">
                <span className="text-tertiary">Address: </span>
                <span>{order.address.street + ", "}</span>
                <span>
                  {order.address.city +
                    ", " +
                    order.address.state +
                    ", " +
                    order.address.country +
                    ", " +
                    order.address.zipcode}
                </span>
              </p>
              <p>{order.address.phone}</p>
              
              {/* Show delivery evidence if available */}
              {order.deliveryEvidence && (
                <div className="mt-2">
                  <a 
                    href={getImageUrl(order.deliveryEvidence)} 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="text-blue-500 flex items-center gap-1 text-sm"
                  >
                    <FaImage /> View Delivery Evidence
                  </a>
                </div>
              )}
            </div>
            <div>
              <p className="text-sm">Total: {order.items.length}</p>
              <p className="mt-3">Method: {order.paymentMethod}</p>
              <p>Payment: {order.payment ? "Done" : "Pending"}</p>
              <p>Date: {new Date(order.date).toLocaleDateString()}</p>
            </div>
            <p className="text-sm font-semibold">
              {currency}
              {order.amount}
            </p>
            <div className="flex flex-col gap-2">
              <select
                onChange={(event) => statusHandler(event, order._id)}
                value={order.status}
                className="text-xs font-semibold p-1 ring-1 ring-slate-900/5 rounded max-w-36 bg-primary"
                disabled={isUpdating || (currentOrderId && previewUrl)}
              >
                <option value="Order Placed">Order Placed</option>
                <option value="Packing">Packing</option>
                <option value="Shipped">Shipped</option>
                <option value="Out for Delivery">Out for Delivery</option>
                <option value="Delivered">Delivered</option>
              </select>
              
              {/* Delete button */}
              <button
                onClick={() => handleDeleteClick(order._id)}
                className="flex items-center justify-center gap-1 text-xs text-white bg-red-500 hover:bg-red-600 p-1 rounded"
                disabled={isUpdating}
              >
                <FaTrash /> Delete
              </button>
            </div>
          </div>
        ))}
        
        {filteredOrders.length === 0 && (
          <div className="text-center p-8 bg-white rounded-lg">
            {searchTerm ? (
              <p>No orders found matching &quot;{searchTerm}&quot;</p>
            ) : (
              <p>No orders found</p>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

Orders.propTypes = {
  token: PropTypes.string.isRequired
};

export default Orders;
