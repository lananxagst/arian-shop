import { useEffect, useState } from "react";
import axios from "axios";
import Footer from "../components/Footer";
import { Link } from "react-router-dom";

const UserDetail = () => {
  const [user, setUser] = useState(null);
  const [orders, setOrders] = useState([]);

  useEffect(() => {
    const fetchUserData = async () => {
      try {
        const token = localStorage.getItem("token");
        const res = await axios.get("http://localhost:4000/api/user/me", {
          headers: { Authorization: `Bearer ${token}` },
        });
        if (res.data.success) {
          setUser(res.data.user);
          setOrders(res.data.orders || []);
        }
      } catch (error) {
        console.error("Error fetching user details", error);
      }
    };

    fetchUserData();
  }, []);

  if (!user)
    return <p className="text-gray-600 text-center mt-10">Loading...</p>;
  console.log("User state in frontend:", user);

  return (
    <div className="flex flex-col min-h-screen">
      <div className="flex flex-col lg:flex-row items-start justify-center flex-grow bg-gray-100 text-gray-900 p-12">
        {/* Profile Section */}
        <div className="bg-white p-4 rounded-lg shadow-lg w-full lg:w-1/3 ">
          <div className="flex flex-col items-center">
            <img
              src={
                user.avatar
                  ? user.avatar.startsWith("http") // Jika URL, gunakan langsung
                    ? user.avatar
                    : `http://localhost:4000${user.avatar}` // Jika path lokal, tambahkan domain backend
                  : `https://ui-avatars.com/api/?name=${encodeURIComponent(
                      user.name
                    )}&background=000&color=fff&size=128` // Jika tidak ada avatar, gunakan default
              }
              alt="User Avatar"
              className="w-32 h-32 rounded-full border-4 border-gray-300 object-cover"
              referrerPolicy="no-referrer"
            />

            <h1 className="text-2xl font-bold mt-4">{user.name}</h1>
            <p className="text-gray-500">{user.bio || "No bio available"}</p>
            <div className="mt-4 flex gap-2">
              <Link to={"/edit-profile"}>
                <button className="bg-gray-700 text-white px-4 py-2 rounded-lg hover:bg-gray-900 transition">
                  Edit Profile
                </button>
              </Link>
            </div>
          </div>
        </div>

        {/* User Info & Orders Section */}
        <div className="w-full lg:w-2/3 lg:ml-6 mt-6 lg:mt-0">
          <div className="bg-white p-6 rounded-lg shadow-lg">
            <h2 className="text-xl font-semibold mb-4">User Information</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <p>
                <span className="font-semibold">Email:</span> {user.email}
              </p>
              <p>
                <span className="font-semibold">Phone:</span>{" "}
                {user.phone || "N/A"}
              </p>
              <p>
                <span className="font-semibold">Address:</span>{" "}
                {user.address || "Not provided"}
              </p>
            </div>
          </div>

          {/* Order History */}
          <div className="bg-white p-6 rounded-lg shadow-lg mt-7">
            <h2 className="text-xl font-semibold mb-4">Completed Orders</h2>
            {orders.length > 0 ? (
              <ul className="divide-y divide-gray-300">
                {orders.map((order) => (
                  <li key={order.id} className="py-2">
                    <p>
                      <span className="font-semibold">Order ID:</span>{" "}
                      {order.id}
                    </p>
                    <p>
                      <span className="font-semibold">Total:</span> $
                      {order.total}
                    </p>
                    <p>
                      <span className="font-semibold">Date:</span>{" "}
                      {new Date(order.date).toLocaleDateString()}
                    </p>
                  </li>
                ))}
              </ul>
            ) : (
              <p className="text-gray-500">No completed orders found.</p>
            )}
          </div>
        </div>
      </div>
      <Footer />
    </div>
  );
};

export default UserDetail;
