
import {
  BrowserRouter,
  Routes,
  Route,
  Navigate, useLocation
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
import TenantDetails from "./pages/Tenants/features/TenantDetails";

function ProtectedRoute({ children }) {
  const { user, loading } = useUser();

  if (loading) {
    return <p>Loading Nest Pay...</p>;
  }

  return user ? children : <Navigate to="/login" replace />;
}

function ProtectedLoginRoute({ children }) {
  const { user, loading } = useUser();

  if (loading) {
    return <p>Loading Nest Pay...</p>;
  }

  return user ? <Navigate to="/home" replace /> : children;
}

function AppRoutes() {
  const { user } = useUser();
  const location = useLocation();

  const showNav = user && location.pathname !== "/login";
  return (
   <>
      <Routes>
        <Route
          path="/"
          element={<Navigate to="/home" replace />}
        />

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
  path="/tenants/:tenantId"
  element={
    <ProtectedRoute>
      <TenantDetails />
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
          path="*"
          element={<Navigate to="/" replace />}
        />
      </Routes>
       {showNav && <MobileBottomNav />}
</>
  );
}

function App() {
  return (
    <UserProvider>
      <BrowserRouter>
        <AppRoutes />
      </BrowserRouter>
    </UserProvider>
  );
}

export default App;
