import React, { useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import "./Auth.css";
import PanasonicLogo from "../assets/Panasonic.png";

export default function Login() {
  const [employeeID, setEmployeeID] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const navigate = useNavigate();

  const handleLogin = async () => {
    try {
      const res = await axios.post("http://localhost:5000/login", {
        employee_id: employeeID,
        password,
      }, { withCredentials: true });

      if (res.data.status === "success") {
        navigate("/landing");
      }
    } catch (e) {
      setError(e.response?.data?.message || "Login failed.");
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
      <h2>Login</h2>
      <input placeholder="Employee ID" value={employeeID} onChange={(e) => setEmployeeID(e.target.value)} />
      <input type="password" placeholder="Password" value={password} onChange={(e) => setPassword(e.target.value)} />
      <button onClick={handleLogin}>Login</button>
      {error && <div className="error-message">{error}</div>}
      <div className="switch-link" onClick={() => navigate("/signup")}>Don't have an account? Signup</div>
      <div className="back-home" onClick={() => navigate("/")}>← Back to Home</div>
    </div>
    </div>
  );
}
