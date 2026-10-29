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

function MobileBottomNav() {
  const { pathname } = useLocation();

  const activePath = pathname.startsWith("/properties/")
    ? "/properties"
    : pathname.startsWith("/tenants")
      ? "/tenants"
      : pathname === "/payment-settings" || pathname === "/profile"
        ? "/profile"
        : pathname === "/rent-status"
          ? "/rent-status"
          : pathname;

  return (
    <nav className="mobile-bottom-nav">
      {navItems.map(({ label, path, icon: Icon }) => (
        <NavLink
          key={path}
          to={path}
          className={
            activePath === path
              ? "mobile-nav-item active"
              : "mobile-nav-item"
          }
        >
          <Icon
            size={22}
            strokeWidth={activePath === path ? 2.4 : 1.8}
          />
          <span>{label}</span>
        </NavLink>
      ))}
    </nav>
  );
}

export default MobileBottomNav;