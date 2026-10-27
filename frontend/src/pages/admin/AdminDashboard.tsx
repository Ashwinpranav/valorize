import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import {
  Users,
  Boxes,
  ShieldAlert,
  ArrowRightLeft,
  FileBarChart,
  ClipboardList,
  Sparkles,
  ArrowRight,
  TrendingUp,
} from 'lucide-react';
import { StatCard } from '../../components/StatCard';
import { StatusBadge } from '../../components/StatusBadge';
import { adminApi, reportsApi } from '../../services/api';
import { useAuth } from '../../context/AuthContext';
import { useLanguage } from '../../context/LanguageContext';

export const AdminDashboard: React.FC = () => {
  const { user } = useAuth();
  const { t } = useLanguage();

  const [overview, setOverview] = useState<any>(null);
  const [users, setUsers] = useState<any[]>([]);
  const [auditLogs, setAuditLogs] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchAdminData = async () => {
      setIsLoading(true);
      try {
        const [overviewData, usersData, auditData] = await Promise.all([
          reportsApi.getOverview(),
          adminApi.getUsers(),
          adminApi.getAuditLogs(10),
        ]);
        setOverview(overviewData);
        setUsers(usersData);
        setAuditLogs(auditData);
      } catch (err) {
        console.error('Failed to load admin overview:', err);
      } finally {
        setIsLoading(false);
      }
    };
    fetchAdminData();
  }, []);

  return (
    <div className="space-y-6">
      {/* Admin Welcome */}
      <div className="bg-gradient-to-r from-[#18324B] to-[#243B53] text-white rounded-card p-6 shadow-md flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <span className="text-xs font-bold text-[#20A486] uppercase tracking-wider">
            Supervisory Operations Portal
          </span>
          <h2 className="text-xl sm:text-2xl font-black mt-1">Platform Administrative Command</h2>
          <p className="text-xs text-[#BCCCDC] mt-1">
            System health, compliance auditing, user oversight, and circularity ledger monitoring
          </p>
        </div>

        <div className="flex items-center gap-2">
          <Link
            to="/app/admin/moderation"
            className="px-4 py-2 bg-[#20A486] hover:bg-[#17856C] text-white rounded-xl text-xs font-bold transition-all shadow-md flex items-center gap-1.5"
          >
            <ShieldAlert className="w-4 h-4" />
            <span>Moderation Queue</span>
          </Link>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          title="Platform User Entities"
          value={users.length}
          subtitle="Suppliers, Buyers, Recyclers"
          icon={Users}
          highlight={true}
        />
        <StatCard
          title="Registered Waste Lots"
          value={overview?.total_listings ?? 0}
          subtitle={`${overview?.active_listings ?? 0} Currently Available`}
          icon={Boxes}
        />
        <StatCard
          title="Completed Exchanges"
          value={overview?.completed_transactions ?? 0}
          subtitle="Verified settlements"
          icon={ArrowRightLeft}
          trend="+100% Verified"
          trendPositive={true}
        />
        <StatCard
          title="Total Diverted Waste"
          value={overview ? `${overview.total_material_exchanged_mt} MT` : '1.25 MT'}
          subtitle={`${overview?.total_co2_avoided_kg ?? 0} KG CO2e Avoided`}
          icon={TrendingUp}
        />
      </div>

      {/* Grid: Users Oversight & Live Audit Stream */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left: Registered Users Overview */}
        <div className="lg:col-span-7 bg-white rounded-card border border-[#E2E8F0] p-5 shadow-card space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-[#F1F5F9]">
            <div>
              <h3 className="text-sm font-bold text-[#18324B]">Recent Registered Enterprises</h3>
              <span className="text-[11px] text-[#64748B]">Active platform participants</span>
            </div>
            <Link
              to="/app/admin/users"
              className="text-xs font-semibold text-[#20A486] hover:underline flex items-center gap-1"
            >
              <span>Manage All</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>

          <div className="divide-y divide-[#F1F5F9]">
            {users.slice(0, 5).map((u) => (
              <div key={u.id} className="py-3 flex items-center justify-between gap-3 text-xs">
                <div>
                  <span className="font-bold text-[#18324B] block">{u.full_name}</span>
                  <span className="text-[11px] text-[#64748B]">
                    {u.company_name} • {u.email}
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="capitalize font-bold text-[10px] px-2 py-0.5 rounded-full bg-[#F1F5F9] text-[#18324B]">
                    {u.role}
                  </span>
                  <span
                    className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                      u.is_active ? 'bg-[#DCFCE7] text-[#15803D]' : 'bg-[#FEE2E2] text-[#B91C1C]'
                    }`}
                  >
                    {u.is_active ? 'Active' : 'Disabled'}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Right: Security & Operational Audit Log */}
        <div className="lg:col-span-5 bg-white rounded-card border border-[#E2E8F0] p-5 shadow-card space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-[#F1F5F9]">
            <div>
              <h3 className="text-sm font-bold text-[#18324B]">Live System Audit Trail</h3>
              <span className="text-[11px] text-[#64748B]">Immutable action telemetry</span>
            </div>
            <Link
              to="/app/admin/audit"
              className="text-xs font-semibold text-[#20A486] hover:underline flex items-center gap-1"
            >
              <span>Full Audit</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>

          <div className="space-y-3">
            {auditLogs.slice(0, 5).map((log) => (
              <div key={log.id} className="p-3 bg-[#F8FAFC] rounded-xl border border-[#E2E8F0] space-y-1">
                <div className="flex items-center justify-between text-[11px]">
                  <span className="font-bold text-[#18324B]">{log.action}</span>
                  <span className="text-[#94A3B8]">
                    {new Date(log.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                  </span>
                </div>
                <p className="text-xs text-[#486581] line-clamp-1">{log.details}</p>
                <span className="text-[10px] text-[#64748B] block">
                  By: {log.actor_name || 'System Representative'}
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};
