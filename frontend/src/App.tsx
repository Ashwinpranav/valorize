import React from 'react';
import { Routes, Route, Navigate, useLocation } from 'react-router-dom';
import { useAuth } from './context/AuthContext';
import { AppLayout } from './components/AppLayout';

// Public Pages
import { LandingPage } from './pages/public/LandingPage';
import { MarketplacePage } from './pages/public/MarketplacePage';
import { ListingDetailPage } from './pages/public/ListingDetailPage';
import { HowItWorksPage } from './pages/public/HowItWorksPage';
import { AboutPage } from './pages/public/AboutPage';
import { LoginPage } from './pages/public/LoginPage';
import { RegisterPage } from './pages/public/RegisterPage';
import { ForgotPasswordPage } from './pages/public/ForgotPasswordPage';
import { ResetPasswordPage } from './pages/public/ResetPasswordPage';
import { PrivacyPage } from './pages/public/PrivacyPage';
import { TermsPage } from './pages/public/TermsPage';
import { NotFoundPage } from './pages/public/NotFoundPage';

// Supplier Pages
import { SupplierDashboard } from './pages/supplier/SupplierDashboard';
import { MyListingsPage } from './pages/supplier/MyListingsPage';
import { AddListingPage } from './pages/supplier/AddListingPage';
import { EditListingPage } from './pages/supplier/EditListingPage';
import { SupplierMatchesPage } from './pages/supplier/SupplierMatchesPage';
import { ExchangeMapPage } from './pages/supplier/ExchangeMapPage';
import { EnquiriesPage } from './pages/supplier/EnquiriesPage';
import { EnquiryDetailPage } from './pages/supplier/EnquiryDetailPage';
import { TransactionsPage } from './pages/supplier/TransactionsPage';
import { TransactionDetailPage } from './pages/supplier/TransactionDetailPage';
import { ImpactReportsPage } from './pages/supplier/ImpactReportsPage';
import { NotificationsPage } from './pages/supplier/NotificationsPage';
import { CompanyProfilePage } from './pages/supplier/CompanyProfilePage';
import { AccountSettingsPage } from './pages/supplier/AccountSettingsPage';
import { HelpPage } from './pages/supplier/HelpPage';

// Buyer Pages
import { BuyerDashboard } from './pages/buyer/BuyerDashboard';
import FindMaterialsPage from './pages/buyer/FindMaterialsPage';
import { SavedListingsPage } from './pages/buyer/SavedListingsPage';
import { BuyerRequirementsPage } from './pages/buyer/BuyerRequirementsPage';
import BuyerImpactPage from './pages/buyer/BuyerImpactPage';

// Partner Pages
import PartnerDashboard from './pages/partner/PartnerDashboard';
import PartnerMaterialsPage from './pages/partner/PartnerMaterialsPage';

// Admin Pages
import { AdminDashboard } from './pages/admin/AdminDashboard';
import AdminUsersPage from './pages/admin/AdminUsersPage';
import AdminListingsPage from './pages/admin/AdminListingsPage';
import AdminModerationPage from './pages/admin/AdminModerationPage';
import AdminCategoriesPage from './pages/admin/AdminCategoriesPage';
import AdminExchangesPage from './pages/admin/AdminExchangesPage';
import AdminReportsPage from './pages/admin/AdminReportsPage';
import AdminAuditPage from './pages/admin/AdminAuditPage';
import AdminSettingsPage from './pages/admin/AdminSettingsPage';

interface ProtectedRouteProps {
  children: React.ReactNode;
  allowedRoles?: string[];
}

function ProtectedRoute({ children, allowedRoles }: ProtectedRouteProps) {
  const { user, isLoading } = useAuth();
  const location = useLocation();

  if (isLoading) {
    return (
      <div className="min-h-screen bg-[#F5F7FA] flex items-center justify-center">
        <div className="flex flex-col items-center gap-3">
          <div className="w-8 h-8 border-2 border-[#20A486] border-t-transparent rounded-full animate-spin"></div>
          <span className="text-xs font-semibold text-[#18324B]">Authenticating session...</span>
        </div>
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  if (allowedRoles && !allowedRoles.includes(user.role)) {
    switch (user.role) {
      case 'admin':
        return <Navigate to="/app/admin/dashboard" replace />;
      case 'buyer':
        return <Navigate to="/app/buyer/dashboard" replace />;
      case 'partner':
        return <Navigate to="/app/partner/dashboard" replace />;
      default:
        return <Navigate to="/app/supplier/dashboard" replace />;
    }
  }

  return <>{children}</>;
}

export default function App() {
  return (
    <Routes>
      {/* Public Routes */}
      <Route path="/" element={<LandingPage />} />
      <Route path="/marketplace" element={<MarketplacePage />} />
      <Route path="/marketplace/:listingId" element={<ListingDetailPage />} />
      <Route path="/how-it-works" element={<HowItWorksPage />} />
      <Route path="/about" element={<AboutPage />} />
      <Route path="/login" element={<LoginPage />} />
      <Route path="/register" element={<RegisterPage />} />
      <Route path="/forgot-password" element={<ForgotPasswordPage />} />
      <Route path="/reset-password" element={<ResetPasswordPage />} />
      <Route path="/privacy" element={<PrivacyPage />} />
      <Route path="/terms" element={<TermsPage />} />

      {/* Authenticated Application Routes (Protected with AppLayout) */}
      <Route
        path="/app"
        element={
          <ProtectedRoute>
            <AppLayout />
          </ProtectedRoute>
        }
      >
        {/* Supplier Routes */}
        <Route path="supplier/dashboard" element={<SupplierDashboard />} />
        <Route path="supplier/listings" element={<MyListingsPage />} />
        <Route path="supplier/listings/new" element={<AddListingPage />} />
        <Route path="supplier/listings/:listingId/edit" element={<EditListingPage />} />
        <Route path="supplier/matches" element={<SupplierMatchesPage />} />

        {/* Shared Workflows across roles */}
        <Route path="exchange-map" element={<ExchangeMapPage />} />
        <Route path="enquiries" element={<EnquiriesPage />} />
        <Route path="enquiries/:enquiryId" element={<EnquiryDetailPage />} />
        <Route path="transactions" element={<TransactionsPage />} />
        <Route path="transactions/:transactionId" element={<TransactionDetailPage />} />
        <Route path="impact" element={<ImpactReportsPage />} />
        <Route path="notifications" element={<NotificationsPage />} />
        <Route path="settings/company" element={<CompanyProfilePage />} />
        <Route path="settings/account" element={<AccountSettingsPage />} />
        <Route path="help" element={<HelpPage />} />

        {/* Buyer Routes */}
        <Route
          path="buyer/dashboard"
          element={
            <ProtectedRoute allowedRoles={['buyer', 'admin']}>
              <BuyerDashboard />
            </ProtectedRoute>
          }
        />
        <Route
          path="buyer/materials"
          element={
            <ProtectedRoute allowedRoles={['buyer', 'admin']}>
              <FindMaterialsPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="buyer/saved"
          element={
            <ProtectedRoute allowedRoles={['buyer', 'admin']}>
              <SavedListingsPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="buyer/requirements"
          element={
            <ProtectedRoute allowedRoles={['buyer', 'admin']}>
              <BuyerRequirementsPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="buyer/enquiries"
          element={
            <ProtectedRoute allowedRoles={['buyer', 'admin']}>
              <EnquiriesPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="buyer/transactions"
          element={
            <ProtectedRoute allowedRoles={['buyer', 'admin']}>
              <TransactionsPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="buyer/impact"
          element={
            <ProtectedRoute allowedRoles={['buyer', 'admin']}>
              <BuyerImpactPage />
            </ProtectedRoute>
          }
        />

        {/* Partner Routes */}
        <Route
          path="partner/dashboard"
          element={
            <ProtectedRoute allowedRoles={['partner', 'admin']}>
              <PartnerDashboard />
            </ProtectedRoute>
          }
        />
        <Route
          path="partner/materials"
          element={
            <ProtectedRoute allowedRoles={['partner', 'admin']}>
              <PartnerMaterialsPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="partner/enquiries"
          element={
            <ProtectedRoute allowedRoles={['partner', 'admin']}>
              <EnquiriesPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="partner/transactions"
          element={
            <ProtectedRoute allowedRoles={['partner', 'admin']}>
              <TransactionsPage />
            </ProtectedRoute>
          }
        />

        {/* Admin Routes */}
        <Route
          path="admin/dashboard"
          element={
            <ProtectedRoute allowedRoles={['admin']}>
              <AdminDashboard />
            </ProtectedRoute>
          }
        />
        <Route
          path="admin/users"
          element={
            <ProtectedRoute allowedRoles={['admin']}>
              <AdminUsersPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="admin/listings"
          element={
            <ProtectedRoute allowedRoles={['admin']}>
              <AdminListingsPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="admin/moderation"
          element={
            <ProtectedRoute allowedRoles={['admin']}>
              <AdminModerationPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="admin/categories"
          element={
            <ProtectedRoute allowedRoles={['admin']}>
              <AdminCategoriesPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="admin/exchanges"
          element={
            <ProtectedRoute allowedRoles={['admin']}>
              <AdminExchangesPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="admin/reports"
          element={
            <ProtectedRoute allowedRoles={['admin']}>
              <AdminReportsPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="admin/audit"
          element={
            <ProtectedRoute allowedRoles={['admin']}>
              <AdminAuditPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="admin/settings"
          element={
            <ProtectedRoute allowedRoles={['admin']}>
              <AdminSettingsPage />
            </ProtectedRoute>
          }
        />
      </Route>

      {/* Catch-all Not Found Route */}
      <Route path="*" element={<NotFoundPage />} />
    </Routes>
  );
}

