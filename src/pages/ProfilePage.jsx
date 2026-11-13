import { useState, useEffect } from 'react';
import {
    User, Mail, Lock, Eye, EyeOff, Save, Shield, CreditCard,
    CheckCircle, Bell, Phone, MessageCircle, BellOff, BellRing
} from 'lucide-react';
import { authAPI } from '../api';
import { useAuth } from '../context/AuthContext.jsx';
import toast from 'react-hot-toast';

const CURRENCIES = ['INR', 'USD', 'EUR', 'GBP'];

function getInitials(name = '') {
    return name.split(' ').map(n => n[0]).join('').slice(0, 2).toUpperCase() || 'U';
}

// Toggle switch component
function Toggle({ checked, onChange, label, description, icon: Icon, color = 'var(--emerald-500)' }) {
    return (
        <div
            onClick={() => onChange(!checked)}
            style={{
                display: 'flex', alignItems: 'center', gap: 14,
                padding: '14px 16px', borderRadius: 10,
                background: checked ? 'rgba(16,185,129,0.07)' : 'var(--bg-750)',
                border: `1px solid ${checked ? 'rgba(16,185,129,0.3)' : 'var(--border-light)'}`,
                cursor: 'pointer', transition: 'all 0.2s', userSelect: 'none',
            }}
        >
            {Icon && (
                <div style={{
                    width: 36, height: 36, borderRadius: 8,
                    background: checked ? 'rgba(16,185,129,0.15)' : 'var(--bg-800)',
                    display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0,
                }}>
                    <Icon size={16} color={checked ? 'var(--emerald-400)' : 'var(--text-300)'} />
                </div>
            )}
            <div style={{ flex: 1 }}>
                <div style={{ fontSize: 13.5, fontWeight: 600, color: 'var(--text-100)' }}>{label}</div>
                {description && <div style={{ fontSize: 11.5, color: 'var(--text-300)', marginTop: 2 }}>{description}</div>}
            </div>
            {/* Pill toggle */}
            <div style={{
                width: 42, height: 23, borderRadius: 12, flexShrink: 0,
                background: checked ? color : 'var(--bg-600)',
                position: 'relative', transition: 'background 0.25s',
            }}>
                <div style={{
                    position: 'absolute', top: 3, left: checked ? 21 : 3,
                    width: 17, height: 17, borderRadius: '50%', background: '#fff',
                    transition: 'left 0.25s', boxShadow: '0 1px 4px rgba(0,0,0,0.3)',
                }} />
            </div>
        </div>
    );
}

export default function ProfilePage() {
    const { user, refreshUser } = useAuth();

    const [profile, setProfile] = useState({
        full_name: '', email: '', currency: 'INR', phone: '',
    });
    const [notifSettings, setNotifSettings] = useState({
        notify_email: true,
        notify_whatsapp: false,
        whatsapp_number: '',
    });
    const [pwForm, setPwForm] = useState({ current_password: '', new_password: '', confirm_password: '' });
    const [showCurrent, setShowCurrent] = useState(false);
    const [showNew, setShowNew] = useState(false);
    const [loadingProfile, setLoadingProfile] = useState(false);
    const [loadingNotif, setLoadingNotif] = useState(false);
    const [loadingPw, setLoadingPw] = useState(false);
    const [profileSaved, setProfileSaved] = useState(false);
    const [notifSaved, setNotifSaved] = useState(false);

    useEffect(() => {
        if (user) {
            setProfile({
                full_name: user.full_name || '',
                email: user.email || '',
                currency: user.currency || 'INR',
                phone: user.phone || '',
            });
            setNotifSettings({
                notify_email: user.notify_email !== false,
                notify_whatsapp: !!user.notify_whatsapp,
                whatsapp_number: user.whatsapp_number || '',
            });
        }
    }, [user]);

    const handleProfileChange = e => setProfile(p => ({ ...p, [e.target.name]: e.target.value }));
    const handlePwChange = e => setPwForm(p => ({ ...p, [e.target.name]: e.target.value }));
    const handleNotifChange = (key, val) => setNotifSettings(p => ({ ...p, [key]: val }));

    const handleProfileSubmit = async e => {
        e.preventDefault();
        if (!profile.full_name.trim()) { toast.error('Full name cannot be empty.'); return; }
        setLoadingProfile(true);
        setProfileSaved(false);
        try {
            await authAPI.updateProfile({
                full_name: profile.full_name.trim(),
                currency: profile.currency,
                phone: profile.phone.trim() || null,
            });
            await refreshUser();
            setProfileSaved(true);
            toast.success('Profile updated!');
            setTimeout(() => setProfileSaved(false), 3000);
        } catch (err) {
            toast.error(err.response?.data?.error || 'Failed to update profile.');
        } finally {
            setLoadingProfile(false);
        }
    };

    const handleNotifSubmit = async e => {
        e.preventDefault();
        if (notifSettings.notify_whatsapp && !notifSettings.whatsapp_number.trim()) {
            toast.error('Please enter your WhatsApp number to enable WhatsApp alerts.');
            return;
        }
        setLoadingNotif(true);
        setNotifSaved(false);
        try {
            await authAPI.updateProfile({
                notify_email: notifSettings.notify_email,
                notify_whatsapp: notifSettings.notify_whatsapp,
                whatsapp_number: notifSettings.whatsapp_number.trim() || null,
            });
            await refreshUser();
            setNotifSaved(true);
            toast.success('Notification settings saved!');
            setTimeout(() => setNotifSaved(false), 3000);
        } catch (err) {
            toast.error(err.response?.data?.error || 'Failed to save notification settings.');
        } finally {
            setLoadingNotif(false);
        }
    };

    const handlePasswordSubmit = async e => {
        e.preventDefault();
        if (pwForm.new_password !== pwForm.confirm_password) { toast.error('Passwords do not match.'); return; }
        if (pwForm.new_password.length < 8) { toast.error('Password must be at least 8 characters.'); return; }
        setLoadingPw(true);
        try {
            await authAPI.changePassword({ current_password: pwForm.current_password, new_password: pwForm.new_password });
            toast.success('Password changed!');
            setPwForm({ current_password: '', new_password: '', confirm_password: '' });
        } catch (err) {
            toast.error(err.response?.data?.error || 'Failed to change password.');
        } finally {
            setLoadingPw(false);
        }
    };

    const memberSince = user?.created_at
        ? new Date(user.created_at).toLocaleDateString('en-IN', { day: 'numeric', month: 'long', year: 'numeric' })
        : '—';

    const activeChannels = [
        notifSettings.notify_email && 'Email',
        notifSettings.notify_whatsapp && 'WhatsApp',
    ].filter(Boolean).join(' + ') || 'None';

    return (
        <div>
            {/* Header */}
            <div className="page-header">
                <div className="page-header-row">
                    <div>
                        <h1>Profile & Settings</h1>
                        <p>Manage your account, preferences & budget alert channels</p>
                    </div>
                </div>
            </div>

            {/* Avatar Card */}
            <div className="card" style={{ marginBottom: 20 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 20, flexWrap: 'wrap' }}>
                    <div style={{
                        width: 72, height: 72, borderRadius: '50%', flexShrink: 0,
                        background: 'linear-gradient(135deg, var(--emerald-500), var(--blue-500))',
                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                        fontSize: 26, fontWeight: 700, color: 'white',
                        boxShadow: '0 0 24px var(--accent-glow)',
                    }}>
                        {getInitials(user?.full_name)}
                    </div>
                    <div style={{ flex: 1 }}>
                        <div style={{ fontSize: 20, fontWeight: 800, color: 'var(--text-50)', letterSpacing: '-0.02em' }}>
                            {user?.full_name || '—'}
                        </div>
                        <div style={{ fontSize: 13, color: 'var(--text-200)', marginTop: 2 }}>{user?.email || '—'}</div>
                        <div style={{ display: 'flex', gap: 10, marginTop: 10, flexWrap: 'wrap' }}>
                            <span className="badge badge-green"><CheckCircle size={10} /> Active Account</span>
                            <span className="badge badge-blue"><CreditCard size={10} /> {user?.currency || 'INR'}</span>
                            <span className="badge badge-gray" style={{ fontSize: 10.5 }}>Member since {memberSince}</span>
                            <span className="badge" style={{
                                background: activeChannels !== 'None' ? 'rgba(16,185,129,0.12)' : 'rgba(100,100,100,0.12)',
                                color: activeChannels !== 'None' ? 'var(--emerald-400)' : 'var(--text-300)',
                                border: '1px solid',
                                borderColor: activeChannels !== 'None' ? 'rgba(16,185,129,0.3)' : 'var(--border-light)',
                                fontSize: 10.5,
                            }}>
                                <Bell size={10} /> Alerts: {activeChannels}
                            </span>
                        </div>
                    </div>
                </div>
            </div>

            <div className="section-grid" style={{ marginBottom: 20 }}>
                {/* Personal Info */}
                <div className="card">
                    <div className="card-header">
                        <div>
                            <div className="card-title" style={{ display: 'flex', alignItems: 'center', gap: 7 }}>
                                <User size={15} color="var(--emerald-400)" /> Personal Information
                            </div>
                            <div className="card-subtitle">Update your name, currency and phone</div>
                        </div>
                    </div>
                    <form onSubmit={handleProfileSubmit}>
                        <div className="form-group">
                            <label className="label">Full Name</label>
                            <div className="input-wrap">
                                <User size={15} className="input-icon" />
                                <input className="input has-icon" type="text" name="full_name"
                                    placeholder="Your full name" value={profile.full_name}
                                    onChange={handleProfileChange} required />
                            </div>
                        </div>
                        <div className="form-group">
                            <label className="label">Email Address</label>
                            <div className="input-wrap">
                                <Mail size={15} className="input-icon" />
                                <input className="input has-icon" type="email" value={profile.email}
                                    disabled style={{ opacity: 0.5, cursor: 'not-allowed' }} />
                            </div>
                            <div style={{ fontSize: 11, color: 'var(--text-300)', marginTop: 5 }}>
                                Email cannot be changed for security reasons.
                            </div>
                        </div>
                        <div className="form-group">
                            <label className="label">Phone Number (optional)</label>
                            <div className="input-wrap">
                                <Phone size={15} className="input-icon" />
                                <input className="input has-icon" type="tel" name="phone"
                                    placeholder="+91 98765 43210" value={profile.phone}
                                    maxLength={14}
                                    onChange={handleProfileChange} />
                            </div>
                        </div>
                        <div className="form-group" style={{ marginBottom: 20 }}>
                            <label className="label">Preferred Currency</label>
                            <div className="select-arrow">
                                <select className="select" name="currency" value={profile.currency} onChange={handleProfileChange}>
                                    {CURRENCIES.map(c => <option key={c} value={c}>{c}</option>)}
                                </select>
                            </div>
                        </div>
                        <button type="submit" className="btn btn-primary" style={{ width: '100%' }} disabled={loadingProfile}>
                            {loadingProfile ? <span className="spinner" /> : profileSaved
                                ? <><CheckCircle size={15} /> Saved!</>
                                : <><Save size={15} /> Save Profile</>}
                        </button>
                    </form>
                </div>

                {/* Change Password */}
                <div className="card">
                    <div className="card-header">
                        <div>
                            <div className="card-title" style={{ display: 'flex', alignItems: 'center', gap: 7 }}>
                                <Shield size={15} color="var(--blue-400)" /> Change Password
                            </div>
                            <div className="card-subtitle">Keep your account secure</div>
                        </div>
                    </div>
                    <form onSubmit={handlePasswordSubmit}>
                        <div className="form-group">
                            <label className="label">Current Password</label>
                            <div className="input-wrap" style={{ position: 'relative' }}>
                                <Lock size={15} className="input-icon" />
                                <input className="input has-icon" type={showCurrent ? 'text' : 'password'}
                                    name="current_password" placeholder="Your current password"
                                    value={pwForm.current_password} onChange={handlePwChange}
                                    required style={{ paddingRight: 40 }} />
                                <button type="button" onClick={() => setShowCurrent(p => !p)}
                                    style={{ position: 'absolute', right: 12, top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-300)' }}>
                                    {showCurrent ? <EyeOff size={15} /> : <Eye size={15} />}
                                </button>
                            </div>
                        </div>
                        <div className="form-group">
                            <label className="label">New Password</label>
                            <div className="input-wrap" style={{ position: 'relative' }}>
                                <Lock size={15} className="input-icon" />
                                <input className="input has-icon" type={showNew ? 'text' : 'password'}
                                    name="new_password" placeholder="Min. 8 chars, 1 uppercase, 1 digit"
                                    value={pwForm.new_password} onChange={handlePwChange}
                                    required style={{ paddingRight: 40 }} />
                                <button type="button" onClick={() => setShowNew(p => !p)}
                                    style={{ position: 'absolute', right: 12, top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-300)' }}>
                                    {showNew ? <EyeOff size={15} /> : <Eye size={15} />}
                                </button>
                            </div>
                        </div>
                        <div className="form-group" style={{ marginBottom: 20 }}>
                            <label className="label">Confirm New Password</label>
                            <div className="input-wrap">
                                <Lock size={15} className="input-icon" />
                                <input className="input has-icon" type="password" name="confirm_password"
                                    placeholder="Repeat new password" value={pwForm.confirm_password}
                                    onChange={handlePwChange} required />
                            </div>
                            {pwForm.confirm_password && pwForm.new_password !== pwForm.confirm_password && (
                                <div className="error-text" style={{ marginTop: 5 }}>Passwords do not match.</div>
                            )}
                        </div>
                        {pwForm.new_password && (
                            <div style={{ marginBottom: 16, padding: '10px 12px', background: 'var(--bg-750)', borderRadius: 8, fontSize: 11.5, display: 'flex', flexDirection: 'column', gap: 4 }}>
                                {[
                                    { label: 'At least 8 characters', ok: pwForm.new_password.length >= 8 },
                                    { label: 'One uppercase letter', ok: /[A-Z]/.test(pwForm.new_password) },
                                    { label: 'One digit', ok: /[0-9]/.test(pwForm.new_password) },
                                ].map(({ label, ok }) => (
                                    <div key={label} style={{ color: ok ? 'var(--emerald-400)' : 'var(--text-300)', display: 'flex', alignItems: 'center', gap: 6 }}>
                                        <span>{ok ? '✓' : '○'}</span> {label}
                                    </div>
                                ))}
                            </div>
                        )}
                        <button type="submit" className="btn btn-primary" style={{ width: '100%' }}
                            disabled={loadingPw || (pwForm.confirm_password && pwForm.new_password !== pwForm.confirm_password)}>
                            {loadingPw ? <span className="spinner" /> : <><Shield size={15} /> Update Password</>}
                        </button>
                    </form>
                </div>
            </div>

            {/* ── NOTIFICATION SETTINGS ─────────────────────────── */}
            <div className="card" style={{ marginBottom: 20 }}>
                <div className="card-header">
                    <div>
                        <div className="card-title" style={{ display: 'flex', alignItems: 'center', gap: 7 }}>
                            <BellRing size={15} color="var(--emerald-400)" /> Budget Alert Notifications
                        </div>
                        <div className="card-subtitle">
                            Get instant alerts when you hit 50%, 80%, or 100% of your budget limit
                        </div>
                    </div>
                </div>

                {/* Info banner */}
                <div style={{
                    padding: '12px 16px', borderRadius: 8, marginBottom: 20,
                    background: 'rgba(16,185,129,0.07)', border: '1px solid rgba(16,185,129,0.2)',
                    display: 'flex', gap: 10, alignItems: 'flex-start',
                }}>
                    <Bell size={15} color="var(--emerald-400)" style={{ flexShrink: 0, marginTop: 1 }} />
                    <div style={{ fontSize: 12.5, color: 'var(--text-200)', lineHeight: 1.6 }}>
                        Alerts fire automatically when any expense pushes a budget past
                        <strong style={{ color: 'var(--blue-400)' }}> 50%</strong>,
                        <strong style={{ color: 'var(--amber-400)' }}> 80%</strong>, or
                        <strong style={{ color: 'var(--red-400)' }}> 100%</strong> of its monthly limit.
                        You can enable/disable each budget's alerts on the Budgets page.
                    </div>
                </div>

                <form onSubmit={handleNotifSubmit}>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: 10, marginBottom: 20 }}>
                        {/* Email toggle */}
                        <Toggle
                            checked={notifSettings.notify_email}
                            onChange={v => handleNotifChange('notify_email', v)}
                            icon={Mail}
                            label="Email Alerts"
                            description={`Sends a styled HTML alert to ${user?.email || 'your email'}`}
                        />

                        {/* WhatsApp toggle */}
                        <Toggle
                            checked={notifSettings.notify_whatsapp}
                            onChange={v => handleNotifChange('notify_whatsapp', v)}
                            icon={MessageCircle}
                            label="WhatsApp Alerts"
                            description="Sends a WhatsApp message via Twilio to your mobile number"
                        />
                    </div>

                    {/* WhatsApp number input — shown when enabled */}
                    {notifSettings.notify_whatsapp && (
                        <div className="form-group" style={{ marginBottom: 20 }}>
                            <label className="label">
                                <MessageCircle size={12} style={{ marginRight: 5 }} />
                                WhatsApp Number (Indian Mobile: 10 Digits or +91)
                            </label>
                            <div className="input-wrap">
                                <Phone size={15} className="input-icon" />
                                <input
                                    className="input has-icon"
                                    type="tel"
                                    name="whatsapp_number"
                                    placeholder="+91 98765 43210 or 9876543210"
                                    value={notifSettings.whatsapp_number}
                                    maxLength={14}
                                    onChange={e => handleNotifChange('whatsapp_number', e.target.value)}
                                />
                            </div>
                            <div style={{ fontSize: 11, color: 'var(--text-300)', marginTop: 5 }}>
                                🇮🇳 Indian Mobile Number: +91 தானாகவே இணைக்கப்பட்டு WhatsApp alert அனுப்பப்படும்.
                            </div>
                        </div>
                    )}

                    {/* Setup guide */}
                    <div style={{
                        padding: '14px 16px', borderRadius: 8, marginBottom: 20,
                        background: 'var(--bg-750)', border: '1px solid var(--border-light)',
                    }}>
                        <div style={{ fontSize: 12, fontWeight: 600, color: 'var(--text-200)', marginBottom: 10, letterSpacing: '0.05em', textTransform: 'uppercase' }}>
                            🔧 Setup Guide
                        </div>
                        <div style={{ display: 'grid', gap: 12 }}>
                            {/* Email setup */}
                            <div>
                                <div style={{ fontSize: 12.5, fontWeight: 600, color: 'var(--blue-400)', marginBottom: 4 }}>📧 Email Setup (Gmail)</div>
                                <ol style={{ fontSize: 11.5, color: 'var(--text-300)', margin: 0, paddingLeft: 18, lineHeight: 1.8 }}>
                                    <li>Enable 2-Factor Auth on your Gmail</li>
                                    <li>Go to <strong style={{ color: 'var(--text-100)' }}>myaccount.google.com/apppasswords</strong></li>
                                    <li>Generate an App Password for "Mail"</li>
                                    <li>Add to <code style={{ background: 'var(--bg-800)', padding: '1px 5px', borderRadius: 3 }}>backend/.env</code>: <br />
                                        <code style={{ fontSize: 10.5 }}>MAIL_USERNAME=you@gmail.com</code><br />
                                        <code style={{ fontSize: 10.5 }}>MAIL_PASSWORD=xxxx-xxxx-xxxx-xxxx</code>
                                    </li>
                                </ol>
                            </div>
                            {/* WhatsApp setup */}
                            <div>
                                <div style={{ fontSize: 12.5, fontWeight: 600, color: 'var(--emerald-400)', marginBottom: 4 }}>💬 WhatsApp Setup (Twilio)</div>
                                <ol style={{ fontSize: 11.5, color: 'var(--text-300)', margin: 0, paddingLeft: 18, lineHeight: 1.8 }}>
                                    <li>Sign up at <strong style={{ color: 'var(--text-100)' }}>twilio.com</strong> (free trial)</li>
                                    <li>Get Account SID &amp; Auth Token from Console</li>
                                    <li>On WhatsApp, send <code style={{ background: 'var(--bg-800)', padding: '1px 5px', borderRadius: 3 }}>join &lt;sandbox-code&gt;</code> to <strong>+1 415 523 8886</strong></li>
                                    <li>Add to <code style={{ background: 'var(--bg-800)', padding: '1px 5px', borderRadius: 3 }}>backend/.env</code>:<br />
                                        <code style={{ fontSize: 10.5 }}>TWILIO_ACCOUNT_SID=ACxxxx...</code><br />
                                        <code style={{ fontSize: 10.5 }}>TWILIO_AUTH_TOKEN=your_token</code>
                                    </li>
                                </ol>
                            </div>
                        </div>
                    </div>

                    <button type="submit" className="btn btn-primary" style={{ width: '100%' }} disabled={loadingNotif}>
                        {loadingNotif ? <span className="spinner" />
                            : notifSaved
                                ? <><CheckCircle size={15} /> Saved!</>
                                : <><Bell size={15} /> Save Notification Settings</>}
                    </button>
                </form>
            </div>

            {/* Account Details */}
            <div className="card">
                <div className="card-header">
                    <div className="card-title">Account Details</div>
                </div>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))', gap: 16 }}>
                    {[
                        { label: 'Account Role', value: user?.role ? user.role.charAt(0).toUpperCase() + user.role.slice(1) : '—' },
                        { label: 'Currency', value: user?.currency || 'INR' },
                        { label: 'Member Since', value: memberSince },
                        { label: 'Account Status', value: user?.is_active !== false ? '✅ Active' : '❌ Inactive' },
                        { label: 'Email Alerts', value: notifSettings.notify_email ? '✅ Enabled' : '❌ Off' },
                        { label: 'WhatsApp Alerts', value: notifSettings.notify_whatsapp ? '✅ Enabled' : '❌ Off' },
                    ].map(({ label, value }) => (
                        <div key={label} style={{ padding: '12px 14px', background: 'var(--bg-750)', borderRadius: 10, border: '1px solid var(--border-light)' }}>
                            <div style={{ fontSize: 11, color: 'var(--text-300)', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: 4 }}>{label}</div>
                            <div style={{ fontSize: 14, fontWeight: 600, color: 'var(--text-100)' }}>{value}</div>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
}
