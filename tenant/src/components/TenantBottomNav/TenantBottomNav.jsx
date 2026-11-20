import { NavLink, useLocation } from "react-router-dom";
import {
  LuHouse,
  LuIndianRupee,
  LuWrench,
  LuDroplet,
  LuMessageSquare,
  LuUserRound,
} from "react-icons/lu";
import { FEATURES } from "../../../../src/config/features";
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
  const { pathname } = useLocation();

  return (
    <nav className="tenant-bottom-nav" aria-label="Tenant navigation">
      {navItems.map(({ label, path, Icon }) => (
        <NavLink
          key={path}
          to={path}
          end={path === "/tenant/home"}
          replace={pathname === path}
          aria-label={label}
          className={({ isActive }) =>
            `tenant-bottom-nav-item ${isActive ? "active" : ""}`
          }
        >
          <span className="tenant-bottom-nav-icon" aria-hidden="true">
            <Icon size={18} />
          </span>

          <span className="tenant-bottom-nav-label">{label}</span>
        </NavLink>
      ))}
    </nav>
  );
}