import { useState, useEffect, useCallback, useRef } from 'react';
import { Outlet, NavLink, useNavigate, useLocation } from 'react-router-dom';
import {
    LayoutDashboard, CreditCard, TrendingUp, Target, Lightbulb,
    FileText, User, LogOut, ChevronRight, Menu, X, Brain,
    Repeat, Bell, Check, CheckCheck, Trash2
} from 'lucide-react';
import { useAuth } from '../context/AuthContext.jsx';
import { notificationsAPI } from '../api';
import toast from 'react-hot-toast';

const NAV_ITEMS = [
    { path: '/dashboard', icon: LayoutDashboard, label: 'Dashboard' },
    { path: '/expenses', icon: CreditCard, label: 'Expenses' },
    { path: '/income', icon: TrendingUp, label: 'Income' },
    { path: '/budgets', icon: Target, label: 'Budgets' },
    { path: '/recurring', icon: Repeat, label: 'Recurring' },
    { path: '/insights', icon: Lightbulb, label: 'AI Insights' },
    { path: '/reports', icon: FileText, label: 'Reports' },
];

function getInitials(name = '') {
    return name.split(' ').map(n => n[0]).join('').slice(0, 2).toUpperCase() || 'U';
}

const NOTIF_TYPE_STYLE = {
    info: { icon: '💡', bg: 'var(--blue-400)' },
    warning: { icon: '⚠️', bg: 'var(--yellow-400)' },
    alert: { icon: '🚨', bg: 'var(--red-400)' },
    success: { icon: '✅', bg: 'var(--emerald-400)' },
};

export default function Layout() {
    const { user, logout } = useAuth();
    const navigate = useNavigate();
    const location = useLocation();
    const [mobileOpen, setMobileOpen] = useState(false);

    // ── Notifications state ──────────────────────────────
    const [notifications, setNotifications] = useState([]);
    const [unreadCount, setUnreadCount] = useState(0);
    const [bellOpen, setBellOpen] = useState(false);
    const bellRef = useRef(null);

    const loadNotifications = useCallback(async () => {
        try {
            const { data } = await notificationsAPI.list(30);
            setNotifications(data.notifications || []);
            setUnreadCount(data.unread_count || 0);
        } catch {
            // silent — don't toast on every interval fail
        }
    }, []);

    useEffect(() => {
        loadNotifications();
        const interval = setInterval(loadNotifications, 60000); // refresh every 60s
        return () => clearInterval(interval);
    }, [loadNotifications]);

    // Close dropdown when clicking outside
    useEffect(() => {
        const handler = e => {
            if (bellRef.current && !bellRef.current.contains(e.target)) setBellOpen(false);
        };
        document.addEventListener('mousedown', handler);
        return () => document.removeEventListener('mousedown', handler);
    }, []);

    const handleMarkRead = async (id) => {
        try {
            await notificationsAPI.markRead(id);
            setNotifications(prev => prev.map(n => n.id === id ? { ...n, is_read: true } : n));
            setUnreadCount(prev => Math.max(0, prev - 1));
        } catch { /* ignore */ }
    };

    const handleMarkAllRead = async () => {
        try {
            await notificationsAPI.markAllRead();
            setNotifications(prev => prev.map(n => ({ ...n, is_read: true })));
            setUnreadCount(0);
        } catch { toast.error('Failed to mark all as read.'); }
    };

    const handleDeleteNotif = async (id) => {
        try {
            await notificationsAPI.delete(id);
            const removed = notifications.find(n => n.id === id);
            setNotifications(prev => prev.filter(n => n.id !== id));
            if (removed && !removed.is_read) setUnreadCount(prev => Math.max(0, prev - 1));
        } catch { /* ignore */ }
    };

    const handleClearAll = async () => {
        try {
            await notificationsAPI.clearAll();
            setNotifications([]);
            setUnreadCount(0);
        } catch { toast.error('Failed to clear notifications.'); }
    };

    // ── end notifications ────────────────────────────────

    const handleLogout = () => {
        logout();
        toast.success('Logged out successfully');
        navigate('/login');
    };

    const pageTitle = NAV_ITEMS.find(n => location.pathname.startsWith(n.path))?.label
        || (location.pathname === '/profile' ? 'Profile' : '');

    return (
        <div className="app-shell">
            {/* Sidebar */}
            <aside className={`sidebar ${mobileOpen ? 'open' : ''}`}>
                <div className="sidebar-logo">
                    <div className="sidebar-logo-icon">💰</div>
                    <div className="sidebar-logo-text">
                        <span className="name">SmartSpend AI</span>
                        <span className="tagline">INTELLIGENT FINANCE</span>
                    </div>
                </div>

                <nav className="sidebar-nav">
                    <span className="nav-section-label">Main Menu</span>
                    {NAV_ITEMS.map(({ path, icon: Icon, label }) => (
                        <NavLink
                            key={path}
                            to={path}
                            className={({ isActive }) => `nav-item${isActive ? ' active' : ''}`}
                            onClick={() => setMobileOpen(false)}
                        >
                            <Icon className="icon" size={16} />
                            {label}
                        </NavLink>
                    ))}

                    <span className="nav-section-label" style={{ marginTop: 8 }}>Account</span>
                    <NavLink
                        to="/profile"
                        className={({ isActive }) => `nav-item${isActive ? ' active' : ''}`}
                        onClick={() => setMobileOpen(false)}
                    >
                        <User className="icon" size={16} />
                        Profile
                    </NavLink>

                    <button className="nav-item" onClick={handleLogout} style={{ width: '100%', background: 'none', textAlign: 'left', color: 'var(--red-400)' }}>
                        <LogOut className="icon" size={16} />
                        Sign Out
                    </button>
                </nav>

                <div className="sidebar-footer">
                    <div className="user-card" onClick={() => navigate('/profile')}>
                        <div className="user-avatar">{getInitials(user?.full_name)}</div>
                        <div className="user-info">
                            <div className="name">{user?.full_name || 'User'}</div>
                            <div className="email">{user?.email || ''}</div>
                        </div>
                        <ChevronRight size={14} color="var(--text-300)" />
                    </div>
                </div>
            </aside>

            {/* Mobile overlay */}
            {mobileOpen && (
                <div
                    style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.6)', zIndex: 99, backdropFilter: 'blur(2px)' }}
                    onClick={() => setMobileOpen(false)}
                />
            )}

            {/* Main content */}
            <div className="main-content">
                <header className="topbar">
                    <button
                        className="btn btn-ghost btn-icon"
                        style={{ display: 'none' }}
                        id="mobile-menu-btn"
                        onClick={() => setMobileOpen(!mobileOpen)}
                    >
                        {mobileOpen ? <X size={18} /> : <Menu size={18} />}
                    </button>
                    <style>{`@media(max-width:900px){#mobile-menu-btn{display:flex;}}`}</style>

                    <div style={{ flex: 1 }}>
                        <div className="topbar-title">{pageTitle}</div>
                    </div>

                    <div className="topbar-actions">
                        {/* Notification bell */}
                        <div ref={bellRef} style={{ position: 'relative' }}>
                            <button
                                className="btn btn-ghost btn-icon"
                                id="notification-bell"
                                onClick={() => { setBellOpen(prev => !prev); if (!bellOpen) loadNotifications(); }}
                                style={{ position: 'relative' }}
                            >
                                <Bell size={17} />
                                {unreadCount > 0 && (
                                    <span style={{
                                        position: 'absolute', top: 2, right: 2,
                                        width: 16, height: 16, borderRadius: '50%',
                                        background: 'var(--red-500)', color: 'white',
                                        fontSize: 9, fontWeight: 700, display: 'flex',
                                        alignItems: 'center', justifyContent: 'center',
                                        boxShadow: '0 0 6px var(--red-glow)',
                                    }}>
                                        {unreadCount > 9 ? '9+' : unreadCount}
                                    </span>
                                )}
                            </button>

                            {bellOpen && (
                                <div style={{
                                    position: 'absolute', top: 'calc(100% + 8px)', right: 0,
                                    width: 360, maxHeight: 440, overflowY: 'auto',
                                    background: 'var(--bg-800)', border: '1px solid var(--border)',
                                    borderRadius: 12, boxShadow: 'var(--shadow-xl)', zIndex: 200,
                                }}>
                                    {/* Header */}
                                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '12px 16px', borderBottom: '1px solid var(--border-light)' }}>
                                        <span style={{ fontWeight: 700, fontSize: 13.5, color: 'var(--text-50)' }}>Notifications</span>
                                        <div style={{ display: 'flex', gap: 6 }}>
                                            {unreadCount > 0 && (
                                                <button className="btn btn-ghost btn-sm" onClick={handleMarkAllRead} title="Mark all read" style={{ fontSize: 11, gap: 4 }}>
                                                    <CheckCheck size={12} /> Read All
                                                </button>
                                            )}
                                            {notifications.length > 0 && (
                                                <button className="btn btn-ghost btn-sm" onClick={handleClearAll} title="Clear all" style={{ fontSize: 11, gap: 4, color: 'var(--red-400)' }}>
                                                    <Trash2 size={12} /> Clear
                                                </button>
                                            )}
                                        </div>
                                    </div>

                                    {/* List */}
                                    {notifications.length === 0 ? (
                                        <div style={{ padding: '32px 16px', textAlign: 'center' }}>
                                            <div style={{ fontSize: 28, marginBottom: 8 }}>🔔</div>
                                            <p style={{ fontSize: 12, color: 'var(--text-300)' }}>No notifications yet</p>
                                        </div>
                                    ) : (
                                        notifications.map(n => {
                                            const meta = NOTIF_TYPE_STYLE[n.type] || NOTIF_TYPE_STYLE.info;
                                            return (
                                                <div
                                                    key={n.id}
                                                    style={{
                                                        padding: '10px 16px', borderBottom: '1px solid var(--border-light)',
                                                        display: 'flex', gap: 10, alignItems: 'flex-start',
                                                        background: n.is_read ? 'transparent' : 'rgba(16,185,129,0.04)',
                                                        cursor: 'pointer', transition: 'background var(--transition)',
                                                    }}
                                                    onClick={() => { if (!n.is_read) handleMarkRead(n.id); }}
                                                >
                                                    <span style={{ fontSize: 16, marginTop: 2 }}>{meta.icon}</span>
                                                    <div style={{ flex: 1, minWidth: 0 }}>
                                                        <div style={{ fontSize: 12.5, fontWeight: n.is_read ? 400 : 700, color: n.is_read ? 'var(--text-200)' : 'var(--text-50)', lineHeight: 1.3 }}>
                                                            {n.title}
                                                        </div>
                                                        <div style={{ fontSize: 11.5, color: 'var(--text-300)', marginTop: 2, lineHeight: 1.35 }}>{n.message}</div>
                                                        <div style={{ fontSize: 10, color: 'var(--text-400)', marginTop: 4 }}>
                                                            {n.created_at ? new Date(n.created_at).toLocaleString('en-IN', { day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' }) : ''}
                                                        </div>
                                                    </div>
                                                    <div style={{ display: 'flex', flexDirection: 'column', gap: 4, alignItems: 'center', flexShrink: 0 }}>
                                                        {!n.is_read && <div style={{ width: 7, height: 7, borderRadius: '50%', background: 'var(--emerald-400)' }} />}
                                                        <button
                                                            className="btn btn-ghost btn-sm btn-icon"
                                                            onClick={e => { e.stopPropagation(); handleDeleteNotif(n.id); }}
                                                            style={{ width: 22, height: 22, padding: 0, opacity: 0.5 }}
                                                            title="Dismiss"
                                                        >
                                                            <X size={11} />
                                                        </button>
                                                    </div>
                                                </div>
                                            );
                                        })
                                    )}
                                </div>
                            )}
                        </div>

                        <div style={{ display: 'flex', alignItems: 'center', gap: 6, color: 'var(--emerald-400)', fontSize: 12, fontWeight: 600 }}>
                            <Brain size={14} />
                            <span>AI Active</span>
                        </div>
                    </div>
                </header>

                <main className="page-body">
                    <Outlet />
                </main>
            </div>
        </div>
    );
}

