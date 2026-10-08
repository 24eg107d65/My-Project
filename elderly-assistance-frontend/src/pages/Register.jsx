import { useState } from "react";
import { registerUser } from "../services/api";
import "./Register.css";

function Register() {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    password: "",
    role: "ELDERLY",
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
      console.log("Sending registration data:", formData);

      const data = await registerUser(formData);

      console.log("Registration response:", data);

      // Save login information
      if (data.token) {
        localStorage.setItem("token", data.token);
      }

      if (data.userId) {
        localStorage.setItem("userId", data.userId);
      }

      if (data.name) {
        localStorage.setItem("name", data.name);
      }

      if (data.email) {
        localStorage.setItem("email", data.email);
      }

      if (data.role) {
        localStorage.setItem("role", data.role);
      }

      setMessage("Registration successful! Redirecting...");

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
          window.location.href = "/login";
        }
      }, 1000);

    } catch (error) {
      console.error("FULL REGISTRATION ERROR:", error);

      // Backend responded with an error
      if (error.response) {
        console.log("Backend status:", error.response.status);
        console.log("Backend response:", error.response.data);

        if (typeof error.response.data === "string") {
          setMessage(
            `Backend error: ${error.response.status} - ${error.response.data}`
          );
        } else if (error.response.data?.message) {
          setMessage(
            `Backend error: ${error.response.status} - ${error.response.data.message}`
          );
        } else {
          setMessage(
            `Backend error: ${error.response.status}. Check the browser Console.`
          );
        }

      // Request was sent but browser did not receive a response
      } else if (error.request) {
        console.log("Request was sent but no response was received.");
        console.log("Request:", error.request);

        setMessage(
          "Browser could not receive a response from Spring Boot. Open F12 → Console to see the exact error."
        );

      // Axios/setup error
      } else {
        console.log("Axios error:", error.message);

        setMessage(`Request error: ${error.message}`);
      }

    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="register-page">

      <div className="register-container">

        {/* Left Section */}
        <div className="register-left">

          <div className="register-logo">
            Care<span>Connect</span>
          </div>

          <h1>Join CareConnect</h1>

          <p>
            Create an account and become part of a caring community
            supporting elderly people with everyday needs.
          </p>

          <div className="register-features">

            <div className="feature-item">
              <div className="feature-icon">❤️</div>
              <div>
                <h3>Make a Difference</h3>
                <p>Help elderly people with essential daily tasks.</p>
              </div>
            </div>

            <div className="feature-item">
              <div className="feature-icon">🤝</div>
              <div>
                <h3>Trusted Community</h3>
                <p>Connect with verified volunteers and families.</p>
              </div>
            </div>

            <div className="feature-item">
              <div className="feature-icon">🛡️</div>
              <div>
                <h3>Safe & Secure</h3>
                <p>Your information is protected by our secure platform.</p>
              </div>
            </div>

          </div>

        </div>

        {/* Right Section */}
        <div className="register-right">

          <div className="register-card">

            <h2>Create Account</h2>

            <p className="register-subtitle">
              Fill in your details to get started
            </p>

            <form onSubmit={handleSubmit}>

              {/* Name */}
              <div className="form-group">
                <label>Full Name</label>

                <input
                  type="text"
                  name="name"
                  placeholder="Enter your full name"
                  value={formData.name}
                  onChange={handleChange}
                  required
                />
              </div>

              {/* Email */}
              <div className="form-group">
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

              {/* Phone */}
              <div className="form-group">
                <label>Phone Number</label>

                <input
                  type="tel"
                  name="phone"
                  placeholder="Enter your phone number"
                  value={formData.phone}
                  onChange={handleChange}
                  required
                />
              </div>

              {/* Password */}
              <div className="form-group">
                <label>Password</label>

                <input
                  type="password"
                  name="password"
                  placeholder="Create a password"
                  value={formData.password}
                  onChange={handleChange}
                  required
                  minLength="6"
                />
              </div>

              {/* Role */}
              <div className="form-group">
                <label>Register As</label>

                <select
                  name="role"
                  value={formData.role}
                  onChange={handleChange}
                  required
                >
                  <option value="ELDERLY">Elderly</option>
                  <option value="VOLUNTEER">Volunteer</option>
                  <option value="FAMILY">Family Member</option>
                </select>
              </div>

              {/* Message */}
              {message && (
                <div
                  className={
                    message.toLowerCase().includes("successful")
                      ? "success-message"
                      : "error-message"
                  }
                >
                  {message}
                </div>
              )}

              {/* Submit */}
              <button
                type="submit"
                className="register-button"
                disabled={loading}
              >
                {loading ? "Creating Account..." : "Create Account"}
              </button>

            </form>

            <div className="login-link">
              Already have an account?{" "}
              <span onClick={() => (window.location.href = "/login")}>
                Login
              </span>
            </div>

          </div>

        </div>

      </div>

    </div>
  );
}

export default Register;