import React from "react";
import { useNavigate } from "react-router-dom";
import "./NavBar.css";
import PanasonicLogo from "panasonic-ui\src\assets\Panasonic.png"; // Ensure this path is correct

export default function NavBar() {
  const navigate = useNavigate();

  const handleLogout = async () => {
    await fetch("http://localhost:5000/logout", {
      method: "POST",
      credentials: "include",
    });
    navigate("/");
  };

  return (
    <nav className="navbar">
      <div className="navbar-left">
        <img src={PanasonicLogo} alt="Panasonic" className="navbar-logo" />
        <span className="navbar-title">PitchPerfect.AI</span>
      </div>
      <button className="logout-button" onClick={handleLogout}>
        Logout
      </button>
    </nav>
  );
}
