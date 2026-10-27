import React from 'react';
import { NavLink } from 'react-router-dom';
import {
  LayoutDashboard,
  PackagePlus,
  Boxes,
  Sparkles,
  MapPin,
  MessageSquare,
  ArrowRightLeft,
  FileBarChart,
  Bell,
  Building,
  Settings,
  HelpCircle,
  Users,
  ShieldAlert,
  ClipboardList,
  Compass,
  Bookmark,
  LogOut,
  ChevronLeft,
  ChevronRight,
  TrendingUp,
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useLanguage } from '../context/LanguageContext';

interface SidebarProps {
  collapsed: boolean;
  onToggle: () => void;
  mobileOpen: boolean;
  onCloseMobile: () => void;
}

export const Sidebar: React.FC<SidebarProps> = ({
  collapsed,
  onToggle,
  mobileOpen,
  onCloseMobile,
}) => {
  const { user, logout } = useAuth();
  const { t } = useLanguage();

  const role = user?.role || 'supplier';

  // Navigation schema filtered by role
  const getNavItems = () => {
    switch (role) {
      case 'buyer':
        return [
          { to: '/app/buyer/dashboard', label: t('dashboard'), icon: LayoutDashboard },
          { to: '/app/buyer/materials', label: t('findMaterials'), icon: Compass },
          { to: '/app/buyer/saved', label: t('savedListings'), icon: Bookmark },
          { to: '/app/buyer/requirements', label: t('buyerRequirements'), icon: ClipboardList },
          { to: '/app/exchange-map', label: t('exchangeMap'), icon: MapPin },
          { to: '/app/buyer/enquiries', label: t('enquiries'), icon: MessageSquare },
          { to: '/app/buyer/transactions', label: t('transactions'), icon: ArrowRightLeft },
          { to: '/app/buyer/impact', label: t('impactReports'), icon: FileBarChart },
          { to: '/app/notifications', label: t('notifications'), icon: Bell },
          { to: '/app/settings/company', label: t('companyProfile'), icon: Building },
          { to: '/app/settings/account', label: t('accountSettings'), icon: Settings },
          { to: '/app/help', label: t('helpSupport'), icon: HelpCircle },
        ];
      case 'partner':
        return [
          { to: '/app/partner/dashboard', label: t('dashboard'), icon: LayoutDashboard },
          { to: '/app/partner/materials', label: t('partnerDiscovery'), icon: Compass },
          { to: '/app/exchange-map', label: t('exchangeMap'), icon: MapPin },
          { to: '/app/partner/enquiries', label: t('enquiries'), icon: MessageSquare },
          { to: '/app/partner/transactions', label: t('transactions'), icon: ArrowRightLeft },
          { to: '/app/impact', label: t('impactReports'), icon: FileBarChart },
          { to: '/app/notifications', label: t('notifications'), icon: Bell },
          { to: '/app/settings/company', label: t('companyProfile'), icon: Building },
          { to: '/app/help', label: t('helpSupport'), icon: HelpCircle },
        ];
      case 'admin':
        return [
          { to: '/app/admin/dashboard', label: t('dashboard'), icon: LayoutDashboard },
          { to: '/app/admin/users', label: t('userManagement'), icon: Users },
          { to: '/app/admin/listings', label: t('listingManagement'), icon: Boxes },
          { to: '/app/admin/moderation', label: t('moderation'), icon: ShieldAlert },
          { to: '/app/admin/categories', label: t('categoryManagement'), icon: LayersIcon },
          { to: '/app/admin/exchanges', label: t('exchangeManagement'), icon: ArrowRightLeft },
          { to: '/app/admin/reports', label: t('platformAnalytics'), icon: FileBarChart },
          { to: '/app/admin/audit', label: t('auditLog'), icon: ClipboardList },
          { to: '/app/exchange-map', label: t('exchangeMap'), icon: MapPin },
          { to: '/app/admin/settings', label: t('adminSettings'), icon: Settings },
        ];
      case 'supplier':
      default:
        return [
          { to: '/app/supplier/dashboard', label: t('dashboard'), icon: LayoutDashboard },
          { to: '/app/supplier/listings', label: t('myListings'), icon: Boxes },
          { to: '/app/supplier/listings/new', label: t('addListing'), icon: PackagePlus },
          { to: '/app/supplier/matches', label: t('buyerMatches'), icon: Sparkles },
          { to: '/app/exchange-map', label: t('exchangeMap'), icon: MapPin },
          { to: '/app/enquiries', label: t('enquiries'), icon: MessageSquare },
          { to: '/app/transactions', label: t('transactions'), icon: ArrowRightLeft },
          { to: '/app/impact', label: t('impactReports'), icon: FileBarChart },
          { to: '/app/notifications', label: t('notifications'), icon: Bell },
          { to: '/app/settings/company', label: t('companyProfile'), icon: Building },
          { to: '/app/settings/account', label: t('accountSettings'), icon: Settings },
          { to: '/app/help', label: t('helpSupport'), icon: HelpCircle },
        ];
    }
  };

  function LayersIcon(props: any) {
    return <Boxes {...props} />;
  }

  const navItems = getNavItems();

  return (
    <>
      {/* Mobile Backdrop */}
      {mobileOpen && (
        <div
          onClick={onCloseMobile}
          className="fixed inset-0 z-40 bg-black/60 backdrop-blur-sm lg:hidden"
        />
      )}

      {/* Sidebar element */}
      <aside
        className={`fixed top-0 bottom-0 left-0 z-50 bg-[#18324B] text-white flex flex-col border-r border-[#243B53] transition-all duration-300 ${
          collapsed ? 'w-20' : 'w-64'
        } ${mobileOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}`}
      >
        {/* Brand header */}
        <div className="h-16 px-4 flex items-center justify-between border-b border-[#243B53]">
          <div className="flex items-center gap-3 overflow-hidden">
            <div className="w-9 h-9 rounded-lg bg-[#20A486] flex items-center justify-center flex-shrink-0 shadow-sm">
              <span className="font-extrabold text-white text-lg tracking-tighter">V</span>
            </div>
            {!collapsed && (
              <div className="flex flex-col">
                <span className="font-bold text-base tracking-tight text-white">Valorize</span>
                <span className="text-[10px] text-[#20A486] font-semibold tracking-wider uppercase">
                  {role} Desk
                </span>
              </div>
            )}
          </div>

          <button
            onClick={onToggle}
            className="hidden lg:flex w-7 h-7 rounded-md items-center justify-center text-[#9FB3C8] hover:text-white hover:bg-[#243B53] transition-colors"
          >
            {collapsed ? <ChevronRight className="w-4 h-4" /> : <ChevronLeft className="w-4 h-4" />}
          </button>
        </div>

        {/* Navigation list */}
        <div className="flex-1 overflow-y-auto py-3 px-3 space-y-1">
          {navItems.map((item) => {
            const Icon = item.icon;
            return (
              <NavLink
                key={item.to}
                to={item.to}
                onClick={onCloseMobile}
                className={({ isActive }) =>
                  `flex items-center gap-3 px-3 py-2.5 rounded-lg text-xs font-semibold transition-all group ${
                    isActive
                      ? 'bg-[#20A486] text-white shadow-sm'
                      : 'text-[#BCCCDC] hover:text-white hover:bg-[#243B53]'
                  }`
                }
                title={collapsed ? item.label : undefined}
              >
                <Icon className="w-4 h-4 flex-shrink-0" />
                {!collapsed && <span className="truncate">{item.label}</span>}
              </NavLink>
            );
          })}
        </div>

        {/* User profile footer */}
        <div className="p-3 border-t border-[#243B53] bg-[#0E1F30]">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2.5 overflow-hidden">
              <div className="w-8 h-8 rounded-full bg-[#20A486]/20 border border-[#20A486]/40 flex items-center justify-center text-xs font-bold text-[#20A486] flex-shrink-0">
                {user?.full_name ? user.full_name.charAt(0).toUpperCase() : 'U'}
              </div>
              {!collapsed && (
                <div className="flex flex-col truncate">
                  <span className="text-xs font-semibold text-white truncate">
                    {user?.full_name || 'User'}
                  </span>
                  <span className="text-[10px] text-[#829AB1] truncate">
                    {user?.company?.name || user?.email}
                  </span>
                </div>
              )}
            </div>

            <button
              onClick={logout}
              title="Sign Out"
              className="w-8 h-8 rounded-md flex items-center justify-center text-[#829AB1] hover:text-[#B91C1C] hover:bg-[#243B53] transition-colors"
            >
              <LogOut className="w-4 h-4" />
            </button>
          </div>
        </div>
      </aside>
    </>
  );
};

