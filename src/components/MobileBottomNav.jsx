import { createPortal } from "react-dom";
import { NavLink, useLocation } from "react-router-dom";
import {
  LuHouse,
  LuBuilding2,
  LuUsers,
  LuUserRound,
  LuChartNoAxesColumn,
} from "react-icons/lu";
import "./MobileBottomNav.css";

const navItems = [
  { label: "Home", path: "/home", icon: LuHouse },
  { label: "Properties", path: "/properties", icon: LuBuilding2 },
  {
    label: "Rent Status",
    path: "/rent-status",
    icon: LuChartNoAxesColumn,
  },
  { label: "Tenants", path: "/tenants", icon: LuUsers },
  { label: "Profile", path: "/profile", icon: LuUserRound },
];

function resolveActivePath(pathname = "") {
  if (pathname === "/properties" || pathname.startsWith("/properties/")) {
    return "/properties";
  }
  if (pathname === "/tenants" || pathname.startsWith("/tenants/")) {
    return "/tenants";
  }
  if (
    pathname === "/profile" ||
    pathname.startsWith("/profile/") ||
    pathname === "/payment-settings"
  ) {
    return "/profile";
  }
  if (pathname === "/rent-status" || pathname.startsWith("/rent-status/")) {
    return "/rent-status";
  }
  return pathname;
}

function MobileBottomNav() {
  const { pathname } = useLocation();
  const activePath = resolveActivePath(pathname);

  if (typeof document === "undefined" || !document.body) {
    return null;
  }

  return createPortal(
    <nav className="mobile-bottom-nav" aria-label="Primary navigation">
      {navItems.map(({ label, path, icon: Icon }) => {
        const isActive = activePath === path;

        return (
          <NavLink
            key={path}
            to={path}
            aria-current={isActive ? "page" : undefined}
            className={
              isActive ? "mobile-nav-item active" : "mobile-nav-item"
            }
          >
            <Icon
              size={22}
              strokeWidth={isActive ? 2.4 : 1.8}
              aria-hidden="true"
            />
            <span>{label}</span>
          </NavLink>
        );
      })}
    </nav>,
    document.body
  );
}

export default MobileBottomNav;