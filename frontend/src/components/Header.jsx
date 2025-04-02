import { useContext, useEffect, useState } from "react";
import { Link } from "react-router-dom";
import axios from "axios";
import Navbar from "./Navbar";
import { FaBars, FaBarsStaggered } from "react-icons/fa6";
import { TbUserCircle } from "react-icons/tb";
import { RiUserLine } from "react-icons/ri";
import { ShopContext } from "../context/ShopContext";
import { FaCartShopping } from "react-icons/fa6";
import { toast } from "react-toastify";

const Header = () => {
  const [menuOpened, setMenuOpened] = useState(false);
  const { getCartCount, navigate, token, setToken } = useContext(ShopContext);
  const [user, setUser] = useState(null);

  const toggleMenu = () => setMenuOpened((prev) => !prev);

  const logout = () => {
    localStorage.removeItem("token");
    setToken("");
    setUser(null);
    toast.success("Logged out successfully!");
    navigate("/login");
  };

  useEffect(() => {
    const fetchUser = async () => {
      if (token) {
        try {
          const res = await axios.get("http://localhost:4000/api/user/me", {
            headers: { Authorization: `Bearer ${token}` },
          });

          if (res.data.success) {
            setUser(res.data.user);
          }
        } catch (error) {
          console.error("Gagal mengambil data user", error);
        }
      }
    };

    fetchUser();
  }, [token]);

  return (
    <header className="max-padd-container w-full mb-2">
      <div className="flexBetween py-3">
        {/* LOGO  */}
        <Link to={"/"} className="flex flex-1 bold-24 xl:bold-28">
          Arian Shop
        </Link>
        {/* NAVBAR */}
        <div className="flex-1">
          <Navbar
            containerStyles={`${
              menuOpened
                ? "flex items-start flex-col gap-y-8 fixed top-16 right-6  p-5 bg-white rounded-xl shadow-md w-52 ring-1 ring-slate-900/5 z-50"
                : "hidden xl:flex gap-x-5 xl:gap-x-7 medium-15 bg-primary ring-1 ring-slate-900/5 rounded-full p-1"
            }`}
            onClick={() => setMenuOpened(false)}
          />
        </div>
        {/* BUTTONS */}
        <div className="flex-1 flex items-center justify-end gap-x-2 xs:gap-x-8">
          {/* MENU TOGGLE */}
          <>
            {menuOpened ? (
              <FaBarsStaggered
                onClick={toggleMenu}
                className="xl:hidden cursor-pointer text-xl"
              />
            ) : (
              <FaBars
                onClick={toggleMenu}
                className="xl:hidden cursor-pointer text-xl"
              />
            )}
          </>
          {/* CART */}
          <Link to={"/cart"} className="flex relative">
            <div className="relative flex items-center gap-2 ring-1 ring-slate-900 rounded-full px-4 py-2 bold-18">
              <FaCartShopping className="text-lg" />
              <span>Cart</span>
              <span className="bg-secondary text-white text-[12px] font-semibold absolute -top-2 -right-2 flex items-center justify-center w-5 h-5 rounded-full shadow-md">
                {getCartCount()}
              </span>
            </div>
          </Link>
          {/* USER PROFILE */}
          <div className="group relative">
            <div>
              {token ? (
                <div
                  className="cursor-pointer"
                  onClick={() => navigate("/user-detail")}
                >
                  {user?.avatar ? (
                    <img
                      src={
                        user.avatar.startsWith("http")
                          ? user.avatar
                          : `http://localhost:4000${user.avatar}`
                      }
                      alt="User Avatar"
                      className="w-10 h-10 rounded-full border-2 border-gray-300 object-cover"
                      referrerPolicy="no-referrer"
                    />
                  ) : (
                    <TbUserCircle className="text-[36px]" />
                  )}
                </div>
              ) : (
                <button
                  onClick={() => navigate("/login")}
                  className="btn-dark flexCenter gap-x-2"
                >
                  Login
                  <RiUserLine className="text-xl" />
                </button>
              )}
            </div>

            {/* DROPDOWN */}
            {token && (
              <ul className="bg-white p-2 w-32 ring-1 ring-slate-900/5 rounded absolute right-0 top-7 hidden group-hover:flex flex-col medium-14 shadow-md z-50">
                <li
                  onClick={() => navigate("/user-detail")}
                  className="p-2 text-tertiary rounded-md hover:bg-primary cursor-pointer"
                >
                  Profile
                </li>
                <li
                  onClick={() => navigate("/orders")}
                  className="p-2 text-tertiary rounded-md hover:bg-primary cursor-pointer"
                >
                  Orders
                </li>
                <li
                  onClick={logout}
                  className="p-2 text-tertiary rounded-md hover:bg-primary cursor-pointer"
                >
                  Logout
                </li>
              </ul>
            )}
          </div>
        </div>
      </div>
    </header>
  );
};

export default Header;
