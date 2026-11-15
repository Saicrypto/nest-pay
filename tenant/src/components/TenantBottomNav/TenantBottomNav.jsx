import { NavLink } from "react-router-dom";
import {
  LuHouse,
  LuIndianRupee,
  LuWrench,
  LuMessageSquare,
  LuUserRound,
} from "react-icons/lu";
import "./TenantBottomNav.css";

const navItems = [
  {
    label: "Home",
    path: "/tenant/home",
    Icon: LuHouse,
  },
  {
    label: "Payments",
    path: "/tenant/payments",
    Icon: LuIndianRupee,
  },
  {
    label: "Services",
    path: "/tenant/services",
    Icon: LuWrench,
  },
  {
    label: "Complaints",
    path: "/tenant/complaints",
    Icon: LuMessageSquare,
  },
  {
    label: "Profile",
    path: "/tenant/profile",
    Icon: LuUserRound,
  },
];

export default function TenantBottomNav() {
  return (
    <nav className="tenant-bottom-nav" aria-label="Tenant navigation">
      {navItems.map(({ label, path, Icon }) => (
        <NavLink
          key={path}
          to={path}
          end={path === "/tenant/home"}
          aria-label={label}
          className={({ isActive }) =>
            `tenant-bottom-nav-item ${isActive ? "active" : ""}`
          }
        >
          <span className="tenant-bottom-nav-icon">
            <Icon size={18} />
          </span>

          <span className="tenant-bottom-nav-label">{label}</span>
        </NavLink>
      ))}
    </nav>
  );
}