import { useContext, useEffect, useState } from "react";
import login from "../assets/arian-login.png";
import { ShopContext } from "../context/ShopContext";
import axios from "axios";
import { toast } from "react-toastify";
import { useGoogleLogin } from "@react-oauth/google";
import { FcGoogle } from "react-icons/fc";

const Login = () => {
  const [currState, setCurrState] = useState("Sign Up");
  const { token, setToken, navigate, backendUrl } = useContext(ShopContext);

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const onSubmitHandler = async (event) => {
    event.preventDefault();
    try {
      if (currState === "Sign Up") {
        const response = await axios.post(backendUrl + "/api/user/register", {
          name,
          email,
          password,
        });
        console.log(response);
        if (response.data.success) {
          setToken(response.data.token);
          localStorage.setItem("token", response.data.token);
        } else {
          toast.error(response.data.message);
        }
      } else {
        const response = await axios.post(backendUrl + "/api/user/login", {
          email,
          password,
        });
        if (response.data.success) {
          setToken(response.data.token);
          localStorage.setItem("token", response.data.token);
        } else {
          toast.error(response.data.message);
        }
      }
    } catch (error) {
      console.log(error);
      toast.error(error.message);
    }
  };

  // Handle Google Login
  const googleLogin = useGoogleLogin({
    onSuccess: async (response) => {
      try {
        const { data } = await axios.get(
          "https://www.googleapis.com/oauth2/v3/userinfo",
          {
            headers: { Authorization: `Bearer ${response.access_token}` },
          }
        );

        // Kirim data ke backend untuk verifikasi atau registrasi
        const loginResponse = await axios.post(
          backendUrl + "/api/user/login-google",
          {
            name: data.name,
            email: data.email,
            googleId: data.sub,
            avatar: data.picture,
          }
        );

        if (loginResponse.data.success) {
          setToken(loginResponse.data.token);
          localStorage.setItem("token", loginResponse.data.token);
          navigate("/");
        } else {
          toast.error(loginResponse.data.message);
        }
      } catch (error) {
        console.log(error);
        toast.error("Google Login Failed");
      }
    },
    onError: () => {
      toast.error("Google Login Failed");
    },
  });

  useEffect(() => {
    if (token) {
      navigate("/");
    }
  }, [token]);

  return (
    <div className="absolute top-0 left-0 h-full w-full z-50 bg-white">
      <div className="flex flex-col sm:flex-row h-full w-full">
        <div className="w-full sm:w-1/2 flex items-center justify-center p-4">
          <img
            src={login}
            alt="Login"
            className="w-full h-auto max-w-sm sm:max-w-full object-contain sm:object-cover"
          />
        </div>
        <div className="flexCenter w-full sm:w-1/2 text-[90%]">
          <form
            onSubmit={onSubmitHandler}
            className="flex flex-col items-center w-[90%] sm:max-w-md m-auto gap-y-5"
          >
            <div className="w-full mb-4">
              <h3 className="bold-36">{currState}</h3>
            </div>
            {currState === "Sign Up" && (
              <div className="w-full">
                <label htmlFor="name" className="medium-15">
                  Name
                </label>
                <input
                  onChange={(e) => setName(e.target.value)}
                  value={name}
                  type="text"
                  placeholder="Name"
                  className="w-full px-3 py-1.5 ring-1 ring-slate-900/5 rounded bg-primary mt-1"
                />
              </div>
            )}
            <div className="w-full">
              <label htmlFor="email" className="medium-15">
                Email
              </label>
              <input
                onChange={(e) => setEmail(e.target.value)}
                value={email}
                type="email"
                placeholder="Email"
                className="w-full px-3 py-1.5 ring-1 ring-slate-900/5 rounded bg-primary mt-1"
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
                className="w-full px-3 py-1.5 ring-1 ring-slate-900/5 rounded bg-primary mt-1"
              />
            </div>
            <button
              type="submit"
              className="btn-dark w-full mt-5 !py-[8px] !rounded"
            >
              {currState === "Sign Up" ? "Sign Up" : "Login"}
            </button>

            <button
              type="button"
              onClick={() => googleLogin()}
              className="flex items-center justify-center gap-2 btn-light w-full mt-3 !py-[8px] !rounded border border-gray-300 shadow-md hover:shadow-lg transition-all"
            >
              <FcGoogle className="text-xl" />
              <span>Login with Google</span>
            </button>

            <div className="w-full flex flex-col gap-y-3">
              {currState === "Login" ? (
                <>
                  <div className="underline medium-15">
                    Forgot your password?
                  </div>
                  <div className="underline medium-15">
                    Dont have an account?
                    <span
                      onClick={() => setCurrState("Sign Up")}
                      className="cursor-pointer pl-1"
                    >
                      Create account
                    </span>
                  </div>
                </>
              ) : (
                <div className="underline medium-15 cursor-pointer">
                  Already have an account?
                  <span
                    onClick={() => setCurrState("Login")}
                    className="cursor-pointer pl-1"
                  >
                    Login
                  </span>
                </div>
              )}
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default Login;
