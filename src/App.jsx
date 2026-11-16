
import {
  BrowserRouter,
  Routes,
  Route,
  Navigate,
  useLocation,
} from "react-router-dom";

import MobileBottomNav from "./components/MobileBottomNav";
import Properties from "./pages/Properties/features/Properties";
import PropertyDetails from "./pages/Properties/features/PropertyDetails";
import AddProperty from "./pages/Properties/features/AddProperty";
import { UserProvider, useUser } from "./context/UserContext";
import Login from "./pages/Login";
import Home from "./pages/Home/features/Home";
import RentStatusPage from "./pages/RentStatus/features/RentStatusPage";
import PaymentSettings from "./pages/Profile/features/PaymentSettings";
import Profile from "./pages/Profile/features/Profile";
import Tenants from "./pages/Tenants/features/Tenants";

import AppSkeleton from "./components/AppSkeleton";
import Welcome from "./pages/Welcome/features/Welcome";
import ServiceProviders from "./pages/Properties/features/ServiceProviders";
import DailyUtilities from "./pages/Properties/features/DailyUtilities";
import PropertyComplaints from "./pages/Properties/features/PropertyComplaints";


// Tenant imports
import {
  TenantProvider,
  useTenant,
} from "../tenant/src/context/TenantContext";
import TenantBottomNav from "../tenant/src/components/TenantBottomNav/TenantBottomNav.jsx";
import TenantLogin from "../tenant/src/pages/Login/features/TenantLogin";
import TenantWelcome from "../tenant/src/pages/Welcome/features/TenantWelcome";
import TenantOnboarding from "../tenant/src/pages/Onboarding/features/TenantOnboarding";
import TenantHome from "../tenant/src/pages/Home/features/TenantHome";
import TenantServices from "../tenant/src/pages/Services/features/Services";
import TenantComplaints from "../tenant/src/pages/Complaints/features/Complaints";
import RaiseComplaint from "../tenant/src/pages/Complaints/features/RaiseComplaint";
import NotificationBell from "../tenant/src/components/NotificationBell/NotificationBell.jsx";
import FlatDetails from "../tenant/src/pages/Home/components/FlatDetails";
import TenantProfile from "../tenant/src/pages/Profile/features/Profile";
import TenantPayments from "../tenant/src/pages/Payments/features/Payments";
import TenantHomeSkeleton from "../tenant/src/pages/Home/components/TenantHomeSkeleton";
import ServicesSkeleton from "../tenant/src/pages/Services/components/ServicesSkeleton";
import ComplaintsSkeleton from "../tenant/src/pages/Complaints/components/ComplaintsSkeleton";

function ProtectedRoute({ children }) {
  const { user, loading } = useUser();

  if (loading) return <AppSkeleton />;

  return user ? children : <Navigate to="/" replace />;
}

function ProtectedLoginRoute({ children }) {
  const { user, loading } = useUser();

  if (loading) return <AppSkeleton />;

  return user ? <Navigate to="/home" replace /> : children;
}

function RootRoute() {
  const { user, loading: ownerLoading } = useUser();
  const {
    isAuthenticated: tenantAuthenticated,
    loading: tenantLoading,
    onboardingCompleted,
  } = useTenant();

  if (ownerLoading || tenantLoading) {
    return <AppSkeleton />;
  }

  // 1. Owner is still logged in → go directly to Owner Home
  if (user) {
    return <Navigate to="/home" replace />;
  }

  // 2. Tenant is still logged in → go directly to Tenant Home (or onboarding if incomplete)
  if (tenantAuthenticated) {
    return (
      <Navigate
        to={onboardingCompleted ? "/tenant/home" : "/tenant/welcome"}
        replace
      />
    );
  }

  // 3. Neither is logged in → show Welcome screen
  return <Welcome />;
}

// Tenant protected route
function TenantRouteLoader() {
  const { pathname } = useLocation();

  if (pathname.startsWith("/tenant/services")) {
    return <ServicesSkeleton />;
  }

  if (pathname === "/tenant/complaints") {
    return (
      <main className="tenant-complaints-page">
        <header className="tenant-complaints-header">
          <div>
            <h1>Complaints</h1>
            <p>Report and track issues in your property.</p>
          </div>
        </header>
        <ComplaintsSkeleton />
      </main>
    );
  }

  if (pathname.startsWith("/tenant/home")) {
    return <TenantHomeSkeleton />;
  }

  // Seamless warm alabaster canvas (#FAF7F4) for secondary/sub-routes
  return (
    <main
      style={{
        minHeight: "100vh",
        maxWidth: "440px",
        margin: "0 auto",
        backgroundColor: "#FAF7F4",
      }}
    />
  );
}

// Tenant protected route
function TenantProtectedRoute({ children, requireOnboarding = true }) {
  const {
    isAuthenticated,
    loading,
    onboardingCompleted,
  } = useTenant();

  if (loading || (isAuthenticated && onboardingCompleted === null)) {
    return <TenantRouteLoader />;
  }

  if (!isAuthenticated) {
    return <Navigate to="/" replace />;
  }

  if (!onboardingCompleted && requireOnboarding) {
    return <Navigate to="/tenant/welcome" replace />;
  }

  if (onboardingCompleted && !requireOnboarding) {
    return <Navigate to="/tenant/home" replace />;
  }

  return children;
}

function TenantLoginRoute() {
  const { isAuthenticated, loading } = useTenant();

  if (loading) {
    return (
      <main
        style={{
          minHeight: "100vh",
          maxWidth: "440px",
          margin: "0 auto",
          backgroundColor: "#FAF7F4",
        }}
      />
    );
  }

  return isAuthenticated
    ? <Navigate to="/tenant/home" replace />
    : <TenantLogin />;
}

// Tenant application routes
function TenantRoutes() {
  return (
<Routes>
  <Route index element={<Navigate to="login" replace />} />

  <Route path="login" element={<TenantLoginRoute />} />

  <Route
    path="welcome"
    element={
      <TenantProtectedRoute requireOnboarding={false}>
        <TenantWelcome />
      </TenantProtectedRoute>
    }
  />

  <Route
    path="details"
    element={
      <TenantProtectedRoute requireOnboarding={false}>
       <TenantOnboarding />
      </TenantProtectedRoute>
    }
  />

  <Route
    path="home"
    element={
      <TenantProtectedRoute>
        <TenantHome />
      </TenantProtectedRoute>
    }
  />

<Route
  path="payments"
  element={
    <TenantProtectedRoute>
      <TenantPayments />
    </TenantProtectedRoute>
  }
/>

  <Route
    path="services"
    element={
      <TenantProtectedRoute>
         <TenantServices />
      </TenantProtectedRoute>
    }
  />

  <Route
    path="complaints"
    element={
      <TenantProtectedRoute>
        <TenantComplaints />
      </TenantProtectedRoute>
    }
  />

<Route
  path="complaints/raise"
  element={
    <TenantProtectedRoute>
      <RaiseComplaint />
    </TenantProtectedRoute>
  }
/>

<Route
  path="flat-details"
  element={
    <TenantProtectedRoute>
      <FlatDetails />
    </TenantProtectedRoute>
  }
/>

<Route
  path="profile"
  element={
    <TenantProtectedRoute>
      <TenantProfile />
    </TenantProtectedRoute>
  }
/>

</Routes>
  );
}


function TenantApp() {
  const location = useLocation();

  const showTenantNav = [
    "/tenant/home",
    "/tenant/payments",
    "/tenant/services",
    "/tenant/complaints",
    "/tenant/profile",
  ].includes(location.pathname);

  return (
    <>
      <div className="tenant-app-content">
        <TenantRoutes />
      </div>

      {showTenantNav && <TenantBottomNav />}
    </>
  );
}


// Owner application routes
function AppRoutes() {
  const { user } = useUser();
  const location = useLocation();

  const isTenantRoute = location.pathname.startsWith("/tenant/");

const showNav =
    user &&
    !isTenantRoute &&
    location.pathname !== "/" &&
    location.pathname !== "/login";

  return (
    <>
      <Routes>
<Route path="/" element={<RootRoute />} />

        <Route
          path="/login"
          element={
            <ProtectedLoginRoute>
              <Login />
            </ProtectedLoginRoute>
          }
        />

        <Route
          path="/home"
          element={
            <ProtectedRoute>
              <Home />
            </ProtectedRoute>
          }
        />

        <Route
          path="/properties"
          element={
            <ProtectedRoute>
              <Properties />
            </ProtectedRoute>
          }
        />

        <Route
          path="/properties/:propertyId"
          element={
            <ProtectedRoute>
              <PropertyDetails />
            </ProtectedRoute>
          }
        />

        <Route
          path="/tenants"
          element={
            <ProtectedRoute>
              <Tenants />
            </ProtectedRoute>
          }
        />

        

        <Route
          path="/payment-settings"
          element={
            <ProtectedRoute>
              <PaymentSettings />
            </ProtectedRoute>
          }
        />

        <Route
          path="/rent-status"
          element={
            <ProtectedRoute>
              <RentStatusPage />
            </ProtectedRoute>
          }
        />

        <Route
          path="/add-property"
          element={
            <ProtectedRoute>
              <AddProperty />
            </ProtectedRoute>
          }
        />

        <Route
          path="/profile"
          element={
            <ProtectedRoute>
              <Profile />
            </ProtectedRoute>
          }
        />

        <Route
  path="/properties/:propertyId/services"
  element={
    <ProtectedRoute>
      <ServiceProviders />
    </ProtectedRoute>
  }
/>

<Route
  path="/properties/:propertyId/utilities"
  element={
    <ProtectedRoute>
      <DailyUtilities />
    </ProtectedRoute>
  }
/>

<Route
  path="/properties/:propertyId/complaints"
  element={
    <ProtectedRoute>
      <PropertyComplaints />
    </ProtectedRoute>
  }
/>

        {/* Tenant application */}
        <Route path="/tenant/*" element={<TenantApp />} />

        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>

      {showNav && <MobileBottomNav />}
    </>
  );
}

function App() {
  return (
    <UserProvider>
      <TenantProvider>
        <BrowserRouter>
          <AppRoutes />
        </BrowserRouter>
      </TenantProvider>
    </UserProvider>
  );
}

export default App;
