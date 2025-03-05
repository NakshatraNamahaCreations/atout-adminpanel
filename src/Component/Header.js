import React, { useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { FaUserCircle } from "react-icons/fa";

const Header = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const username = localStorage.getItem("username");
  const [showDropdown, setShowDropdown] = useState(false);

  // Hide Header on Login Page
  if (location.pathname === "/") return null;

  const handleLogout = () => {
    localStorage.removeItem("authToken");
    localStorage.removeItem("username");
    navigate("/");
  };

  return (
    <div className="d-flex justify-content-between align-items-center p-3 shadow-sm" style={{ backgroundColor: "#FEB1B1", color: "black" }}>
      <h4>Admin Panel</h4>

      {/* Profile Icon & Dropdown */}
      <div className="position-relative">
        <FaUserCircle
          size={35}
          className="me-2"
          style={{ cursor: "pointer" }}
          onClick={() => setShowDropdown(!showDropdown)}
        />
        
        {/* Dropdown Menu */}
        {showDropdown && (
          <div className="position-absolute end-0 mt-2 p-2 bg-white shadow rounded" style={{ width: "180px", textAlign: "center" }}>
            <p className="m-0 fw-bold text-dark">Hi, {username || "Your Account"}</p>
            <hr className="my-2" />
            <button onClick={handleLogout} className="btn btn-sm btn-danger w-100">
              Logout
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default Header;
