import React, { useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import "./Auth.css";
import PanasonicLogo from "../assets/Panasonic.png";


export default function Signup() {
  const [form, setForm] = useState({
    employee_id: "",
    name: "",
    phone: "",
    password: "",
    confirm_password: ""
  });

  const [error, setError] = useState("");
  const navigate = useNavigate();

  const handleChange = e => {
    setForm({ ...form, [e.target.name]: e.target.value });
    setError("");
  };

  const validate = () => {
    const phoneRegex = /^\d{10}$/;
    if (!phoneRegex.test(form.phone)) return "Phone number must be exactly 10 digits.";
    if (form.password !== form.confirm_password) return "Passwords do not match.";
    if (form.password.length < 6) return "Password must be at least 6 characters.";
    return null;
  };

  const handleSignup = async () => {
    const validationError = validate();
    if (validationError) {
      setError(validationError);
      return;
    }

    try {
      const res = await axios.post("https://pitchperfect-ai.onrender.com/signup",form,
  { withCredentials: true });

      alert(res.data.message);
      navigate("/login");
    } catch (e) {
      setError(e.response?.data?.message || "Signup failed.");
    }
  };

  return (
    <div className="landing-root">
          <nav className="navbar">
            <div className="navbar-left">
              <img src={PanasonicLogo} alt="Panasonic" className="navbar-logo" />
            </div>
            <span className="navbar-title">PitchPerfect.AI</span>
          </nav>
      
    <div className="auth-container">
      <h2>Sign Up</h2>
      <input name="employee_id" placeholder="Employee ID" onChange={handleChange} />
      <input name="name" placeholder="Name" onChange={handleChange} />
      <input name="phone" placeholder="Phone" onChange={handleChange} />
      <input type="password" name="password" placeholder="Password" onChange={handleChange} />
      <input type="password" name="confirm_password" placeholder="Confirm Password" onChange={handleChange} />
      <button onClick={handleSignup}>Signup</button>
      {error && <div className="error-message">{error}</div>}
      <div className="switch-link" onClick={() => navigate("/login")}>Already have an account? Login</div>
      <div className="back-home" onClick={() => navigate("/")}>← Back to Home</div>
    </div>
    </div>
  );
}
