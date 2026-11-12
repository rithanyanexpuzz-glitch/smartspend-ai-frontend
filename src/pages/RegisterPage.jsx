import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Mail, Lock, User, Eye, EyeOff, UserPlus } from 'lucide-react';
import { authAPI } from '../api';
import { useAuth } from '../context/AuthContext.jsx';
import toast from 'react-hot-toast';

export default function RegisterPage() {
    const { setAuth } = useAuth();
    const navigate = useNavigate();
    const [form, setForm] = useState({ full_name: '', email: '', password: '', confirm: '' });
    const [showPw, setShowPw] = useState(false);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');

    const handleChange = e => setForm(p => ({ ...p, [e.target.name]: e.target.value }));

    const handleSubmit = async e => {
        e.preventDefault();
        setError('');
        if (form.password !== form.confirm) { setError('Passwords do not match.'); return; }
        if (form.password.length < 8) { setError('Password must be at least 8 characters.'); return; }
        setLoading(true);
        try {
            const { data } = await authAPI.register({ full_name: form.full_name, email: form.email, password: form.password });
            setAuth(data.user, data.access_token, data.refresh_token);
            toast.success('Account created! Welcome to SmartSpend AI!');
            navigate('/dashboard');
        } catch (err) {
            setError(err.response?.data?.error || 'Registration failed.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="auth-page">
            <div className="auth-card">
                <div className="auth-brand">
                    <div className="auth-brand-logo">💰</div>
                    <h1>Create Account</h1>
                    <p>Start your financial intelligence journey</p>
                </div>

                {error && (
                    <div style={{ background: 'rgba(248,81,73,0.1)', border: '1px solid rgba(248,81,73,0.3)', borderRadius: 8, padding: '10px 14px', marginBottom: 16, color: 'var(--red-400)', fontSize: 13 }}>
                        {error}
                    </div>
                )}

                <form onSubmit={handleSubmit}>
                    <div className="form-group">
                        <label className="label">Full Name</label>
                        <div className="input-wrap">
                            <User size={15} className="input-icon" />
                            <input className="input has-icon" type="text" name="full_name" id="reg-name" placeholder="Jane Smith" value={form.full_name} onChange={handleChange} required />
                        </div>
                    </div>
                    <div className="form-group">
                        <label className="label">Email</label>
                        <div className="input-wrap">
                            <Mail size={15} className="input-icon" />
                            <input className="input has-icon" type="email" name="email" id="reg-email" placeholder="you@example.com" value={form.email} onChange={handleChange} required />
                        </div>
                    </div>
                    <div className="form-group">
                        <label className="label">Password</label>
                        <div className="input-wrap" style={{ position: 'relative' }}>
                            <Lock size={15} className="input-icon" />
                            <input className="input has-icon" type={showPw ? 'text' : 'password'} name="password" id="reg-password" placeholder="Min. 8 characters" value={form.password} onChange={handleChange} required style={{ paddingRight: 40 }} />
                            <button type="button" onClick={() => setShowPw(p => !p)} style={{ position: 'absolute', right: 12, top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-300)' }}>
                                {showPw ? <EyeOff size={15} /> : <Eye size={15} />}
                            </button>
                        </div>
                    </div>
                    <div className="form-group">
                        <label className="label">Confirm Password</label>
                        <div className="input-wrap">
                            <Lock size={15} className="input-icon" />
                            <input className="input has-icon" type="password" name="confirm" id="reg-confirm" placeholder="Repeat password" value={form.confirm} onChange={handleChange} required />
                        </div>
                    </div>
                    <button type="submit" id="reg-submit" className="btn btn-primary btn-lg" style={{ width: '100%', marginTop: 6 }} disabled={loading}>
                        {loading ? <span className="spinner" /> : <><UserPlus size={16} /> Create Account</>}
                    </button>
                </form>

                <div className="auth-footer">
                    Already have an account? <Link to="/login">Sign in</Link>
                </div>
            </div>
        </div>
    );
}
