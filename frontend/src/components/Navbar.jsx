import React from "react";
import { NavLink } from "react-router-dom";
import "../css/Navbar.css";

const Navbar = () => {
  return (
    <nav className="navbar">
      <div className="logo">MyBoard</div>
      <div className="nav-buttons">
        <NavLink
          to="/dashboard"
          className={({ isActive }) =>
            `nav-btn ${isActive ? "active" : ""}`
          }
        >
          Dashboard
        </NavLink>
        <NavLink
          to="/profile"
          className={({ isActive }) =>
            `nav-btn ${isActive ? "active" : ""}`
          }
        >
          Profile
        </NavLink>
      </div>
    </nav>
  );
};

export default Navbar;
