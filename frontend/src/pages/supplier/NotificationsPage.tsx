import React, { useState, useEffect } from 'react';
import { Bell, Check, Clock, CheckCheck, ExternalLink } from 'lucide-react';
import { Link } from 'react-router-dom';
import { notificationsApi } from '../../services/api';
import { NotificationItem } from '../../types';
import { useLanguage } from '../../context/LanguageContext';

export const NotificationsPage: React.FC = () => {
  const { t } = useLanguage();
  const [notifications, setNotifications] = useState<NotificationItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const fetchNotifs = async () => {
    setIsLoading(true);
    try {
      const data = await notificationsApi.getNotifications();
      setNotifications(data);
    } catch (err) {
      console.error('Failed to load notifications:', err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchNotifs();
  }, []);

  const handleMarkRead = async (id: number) => {
    try {
      await notificationsApi.markRead(id);
      setNotifications((prev) =>
        prev.map((n) => (n.id === id ? { ...n, is_read: true } : n))
      );
    } catch (err) {
      console.error('Error marking read:', err);
    }
  };

  const handleMarkAllRead = async () => {
    try {
      await notificationsApi.markAllRead();
      setNotifications((prev) => prev.map((n) => ({ ...n, is_read: true })));
    } catch (err) {
      console.error('Error marking all read:', err);
    }
  };

  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-black text-[#18324B]">{t('notifications')}</h2>
          <p className="text-xs text-[#64748B]">Operational alerts, buyer matches, and transaction updates</p>
        </div>

        {notifications.some((n) => !n.is_read) && (
          <button
            onClick={handleMarkAllRead}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-[#CBD5E1] text-xs font-bold text-[#18324B] hover:bg-[#F8FAFC]"
          >
            <CheckCheck className="w-3.5 h-3.5 text-[#20A486]" />
            <span>Mark All Read</span>
          </button>
        )}
      </div>

      <div className="bg-white rounded-card border border-[#E2E8F0] shadow-card overflow-hidden">
        {isLoading ? (
          <div className="p-8 text-center text-xs text-[#64748B]">Loading notifications...</div>
        ) : notifications.length > 0 ? (
          <div className="divide-y divide-[#F1F5F9]">
            {notifications.map((n) => (
              <div
                key={n.id}
                className={`p-4 flex items-start justify-between gap-4 transition-colors ${
                  n.is_read ? 'bg-white' : 'bg-[#F0FDFA]'
                }`}
              >
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-bold text-[#18324B]">{n.title}</span>
                    {!n.is_read && (
                      <span className="w-2 h-2 rounded-full bg-[#20A486]" />
                    )}
                  </div>
                  <p className="text-xs text-[#486581]">{n.message}</p>
                  <span className="text-[10px] text-[#94A3B8] block">
                    {new Date(n.created_at).toLocaleString()}
                  </span>
                </div>

                <div className="flex items-center gap-2 flex-shrink-0">
                  {n.link && (
                    <Link
                      to={n.link}
                      className="text-xs font-semibold text-[#20A486] hover:underline flex items-center gap-1"
                    >
                      <span>View</span>
                      <ExternalLink className="w-3 h-3" />
                    </Link>
                  )}
                  {!n.is_read && (
                    <button
                      onClick={() => handleMarkRead(n.id)}
                      className="text-xs text-[#64748B] hover:text-[#18324B] p-1"
                      title="Mark as read"
                    >
                      <Check className="w-3.5 h-3.5" />
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="p-12 text-center text-xs text-[#64748B] space-y-2">
            <Bell className="w-10 h-10 text-[#94A3B8] mx-auto" />
            <h4 className="text-sm font-bold text-[#18324B]">All caught up</h4>
            <p>You have no pending trade or match notifications.</p>
          </div>
        )}
      </div>
    </div>
  );
};
