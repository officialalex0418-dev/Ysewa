import { Routes, Route, Navigate } from "react-router-dom";
import { AuthProvider } from "./lib/auth";
import HomePage from "./pages/customer/Home";
import BusesPage from "./pages/customer/Buses";
import ComingSoonPage from "./pages/customer/ComingSoon";
import SearchResultsPage from "./pages/customer/SearchResults";
import TripDetailsPage from "./pages/customer/TripDetails";
import CheckoutPage from "./pages/customer/Checkout";
import BookingSuccessPage from "./pages/customer/BookingSuccess";
import MyBookingsPage from "./pages/customer/MyBookings";
import LoginPage from "./pages/auth/Login";
import OtpPage from "./pages/auth/Otp";
import AdminDashboardPage from "./pages/super-admin/Dashboard";
import AdminOperatorsPage from "./pages/super-admin/Operators";
import AdminCustomersPage from "./pages/super-admin/Customers";
import AdminBookingsPage from "./pages/super-admin/Bookings";
import AdminCommissionsPage from "./pages/super-admin/Commissions";
import AdminEmployeesPage from "./pages/super-admin/Employees";
import AdminSettlementsPage from "./pages/super-admin/Settlements";
import AdminAuditLogsPage from "./pages/super-admin/AuditLogs";
import AdminSettingsPage from "./pages/super-admin/Settings";
import OperatorDashboardPage from "./pages/operator/Dashboard";
import OperatorFleetPage from "./pages/operator/Fleet";
import OperatorTripsPage from "./pages/operator/Trips";
import BookiePosPage from "./pages/bookie/Pos";
import TrackBusPage from "./pages/customer/TrackBus";

export default function App() {
  return (
    <AuthProvider>
      <Routes>
        {/* Customer */}
        <Route path="/" element={<HomePage />} />
        <Route path="/buses" element={<BusesPage />} />
        <Route path="/flights" element={<ComingSoonPage service="Flights" />} />
        <Route path="/rentals" element={<ComingSoonPage service="Rentals" />} />
        <Route path="/hotels" element={<ComingSoonPage service="Hotels" />} />
        <Route path="/tours" element={<ComingSoonPage service="Tours" />} />
        <Route path="/search" element={<SearchResultsPage />} />
        <Route path="/trip/:tripId" element={<TripDetailsPage />} />
        <Route path="/checkout/:bookingId" element={<CheckoutPage />} />
        <Route path="/payment/success" element={<BookingSuccessPage />} />
        <Route path="/payment/failure" element={<div className="p-12 text-center text-red-500">Payment failed. Please try again.</div>} />
        <Route path="/bookings" element={<MyBookingsPage />} />
        <Route path="/track/:tripId" element={<TrackBusPage />} />

        {/* Auth */}
        <Route path="/auth/login" element={<LoginPage />} />
        <Route path="/auth/otp" element={<OtpPage />} />

        {/* Super Admin */}
        <Route path="/admin" element={<Navigate to="/admin/dashboard" replace />} />
        <Route path="/admin/dashboard" element={<AdminDashboardPage />} />
        <Route path="/admin/operators" element={<AdminOperatorsPage />} />
        <Route path="/admin/customers" element={<AdminCustomersPage />} />
        <Route path="/admin/bookings" element={<AdminBookingsPage />} />
        <Route path="/admin/commissions" element={<AdminCommissionsPage />} />
        <Route path="/admin/employees" element={<AdminEmployeesPage />} />
        <Route path="/admin/settlements" element={<AdminSettlementsPage />} />
        <Route path="/admin/audit" element={<AdminAuditLogsPage />} />
        <Route path="/admin/settings" element={<AdminSettingsPage />} />

        {/* Operator */}
        <Route path="/operator" element={<Navigate to="/operator/dashboard" replace />} />
        <Route path="/operator/dashboard" element={<OperatorDashboardPage />} />
        <Route path="/operator/fleet" element={<OperatorFleetPage />} />
        <Route path="/operator/trips" element={<OperatorTripsPage />} />

        {/* Bookie POS */}
        <Route path="/bookie/pos" element={<BookiePosPage />} />

        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </AuthProvider>
  );
}
