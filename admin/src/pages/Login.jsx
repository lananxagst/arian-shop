import { useState } from "react";
import login from "../assets/logo_baru.png";
import axios from "axios";
import { backend_url } from "../App";
import { toast } from "react-toastify";
import PropTypes from 'prop-types';

const Login = ({ setToken }) => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);

  const onSubmitHandler = async (e) => {
    e.preventDefault(); // prevent reload
    setLoading(true);
    try {
      const response = await axios.post(`${backend_url}/api/user/admin`, {
        email,
        password,
      });

      if (response.data.success) {
        setToken(response.data.token);
        toast.success("Login successful!");
      } else {
        toast.error(response.data.message || "Login failed. Please try again.");
      }
    } catch (error) {
      console.error("Login error:", error);
      if (error.response) {
        toast.error(error.response.data.message || "Something went wrong!");
      } else {
        toast.error("Network error. Please check your connection.");
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="absolute top-0 left-0 h-full w-full z-50 bg-white flex flex-col sm:flex-row">
      {/* IMAGE SIDE */}
      <div className="w-full sm:w-1/2 flex items-center justify-center p-4">
        <img
          src={login}
          alt="Login"
          className="w-full h-auto max-w-sm sm:max-w-full object-contain sm:object-cover"
        />
      </div>

      {/* FORM SIDE */}
      <div className="flexCenter w-full sm:w-1/2 flex items-center justify-center">
        <form
          onSubmit={onSubmitHandler}
          className="flex flex-col items-center w-[90%] sm:max-w-md m-auto gap-y-5 text-gray-800"
        >
          <div className="w-full mb-4">
            <h3 className="bold-36">Login</h3>
          </div>
          <div className="w-full">
            <label htmlFor="email" className="medium-15">
              Email
            </label>
            <input
              onChange={(e) => setEmail(e.target.value)}
              value={email}
              type="email"
              placeholder="Email"
              className="w-full px-3 py-1.5 ring-1 ring-slate-900/10 rounded bg-primary mt-1"
              required
            />
          </div>
          <div className="w-full">
            <label htmlFor="password" className="medium-15">
              Password
            </label>
            <input
              onChange={(e) => setPassword(e.target.value)}
              value={password}
              type="password"
              placeholder="Password"
              className="w-full px-3 py-1.5 ring-1 ring-slate-900/10 rounded bg-primary mt-1"
              required
            />
          </div>
          <button
            type="submit"
            className="btn-dark w-full mt-5 !py-[9px]"
            disabled={loading}
          >
            {loading ? "Logging in..." : "Login"}
          </button>
        </form>
      </div>
    </div>
  );
};

Login.propTypes = {
  setToken: PropTypes.func.isRequired
};

export default Login;
