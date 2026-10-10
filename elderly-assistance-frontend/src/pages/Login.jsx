import { useState } from "react";
import { loginUser } from "../services/api";
import "./Login.css";

function Login() {
  const [formData, setFormData] = useState({
    email: "",
    password: "",
  });

  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    setMessage("");
    setLoading(true);

    try {
      const data = await loginUser(formData);

      // Store login information
      localStorage.setItem("token", data.token);
      localStorage.setItem("userId", data.userId);
      localStorage.setItem("name", data.name);
      localStorage.setItem("email", data.email);
      localStorage.setItem("role", data.role);

      setMessage("Login successful! Redirecting...");

      // Redirect based on role
      setTimeout(() => {
        if (data.role === "ELDERLY") {
          window.location.href = "/elderly";
        } else if (data.role === "VOLUNTEER") {
          window.location.href = "/volunteer";
        } else if (data.role === "FAMILY") {
          window.location.href = "/family";
        } else if (data.role === "ADMIN") {
          window.location.href = "/admin";
        } else {
          window.location.href = "/";
        }
      }, 800);

    } catch (error) {
      console.error(error);

      if (error.response?.data?.message) {
        setMessage(error.response.data.message);
      } else {
        setMessage("Invalid email or password. Please try again.");
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="login-page">

      <div className="login-left">
        <div className="brand">
          <span>🌿</span> CareConnect
        </div>

        <div className="login-illustration">
          <div className="big-heart">❤️</div>
          <h1>Welcome Back</h1>
          <p>
            Continue making everyday life safer, easier, and more connected
            for our elderly community.
          </p>
        </div>

        <div className="login-help">
          <span>💚</span>
          <div>
            <strong>Care starts with connection.</strong>
            <p>Trusted people. Helpful community. Better care.</p>
          </div>
        </div>
      </div>

      <div className="login-right">

        <div className="login-card">

          <div className="mobile-brand">
            🌿 CareConnect
          </div>

          <div className="login-heading">
            <span className="small-title">WELCOME BACK</span>
            <h2>Sign in to your account</h2>
            <p>
              Enter your details to continue to CareConnect.
            </p>
          </div>

          <form onSubmit={handleSubmit}>

            <div className="input-group">
              <label>Email Address</label>
              <input
                type="email"
                name="email"
                placeholder="Enter your email"
                value={formData.email}
                onChange={handleChange}
                required
              />
            </div>

            <div className="input-group">
              <label>Password</label>
              <input
                type="password"
                name="password"
                placeholder="Enter your password"
                value={formData.password}
                onChange={handleChange}
                required
              />
            </div>

            <div className="login-options">
              <label className="remember">
                <input type="checkbox" />
                Remember me
              </label>

              <button
                type="button"
                className="forgot-password"
                onClick={() =>
                  alert("Password recovery can be added later.")
                }
              >
                Forgot password?
              </button>
            </div>

            <button
              type="submit"
              className="login-submit"
              disabled={loading}
            >
              {loading ? "Signing in..." : "Sign In →"}
            </button>

          </form>

          {message && (
            <div
              className={`login-message ${
                message.includes("successful")
                  ? "success"
                  : "error"
              }`}
            >
              {message}
            </div>
          )}

          <div className="register-link">
            Don't have an account?
            <button
              onClick={() => {
                window.location.href = "/register";
              }}
            >
              Create Account
            </button>
          </div>

          <div className="security-note">
            🔒 Your account information is protected.
          </div>

        </div>

      </div>
    </div>
  );
}

export default Login;