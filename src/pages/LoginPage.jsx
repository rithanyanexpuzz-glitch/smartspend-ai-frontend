import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Mail, Lock, Eye, EyeOff, LogIn } from 'lucide-react';
import { authAPI } from '../api';
import { useAuth } from '../context/AuthContext.jsx';
import toast from 'react-hot-toast';

export default function LoginPage() {
    const { setAuth } = useAuth();
    const navigate = useNavigate();
    const [form, setForm] = useState({ email: '', password: '' });
    const [showPw, setShowPw] = useState(false);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');

    const handleChange = e => setForm(p => ({ ...p, [e.target.name]: e.target.value }));

    const handleSubmit = async e => {
        e.preventDefault();
        setError('');
        setLoading(true);
        try {
            const { data } = await authAPI.login(form);
            setAuth(data.user, data.access_token, data.refresh_token);
            toast.success(`Welcome back, ${data.user.full_name}!`);
            navigate('/dashboard');
        } catch (err) {
            setError(err.response?.data?.error || 'Login failed. Please try again.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="auth-page">
            <div className="auth-card">
                <div className="auth-brand">
                    <div className="auth-brand-logo">💰</div>
                    <h1>SmartSpend AI</h1>
                    <p>Sign in to your financial dashboard</p>
                </div>

                {error && (
                    <div style={{ background: 'rgba(248,81,73,0.1)', border: '1px solid rgba(248,81,73,0.3)', borderRadius: 8, padding: '10px 14px', marginBottom: 16, color: 'var(--red-400)', fontSize: 13 }}>
                        {error}
                    </div>
                )}

                <form onSubmit={handleSubmit}>
                    <div className="form-group">
                        <label className="label">Email</label>
                        <div className="input-wrap">
                            <Mail size={15} className="input-icon" />
                            <input
                                className="input has-icon"
                                type="email" name="email" id="login-email"
                                placeholder="you@example.com"
                                value={form.email} onChange={handleChange} required
                            />
                        </div>
                    </div>
                    <div className="form-group">
                        <label className="label">Password</label>
                        <div className="input-wrap" style={{ position: 'relative' }}>
                            <Lock size={15} className="input-icon" />
                            <input
                                className="input has-icon"
                                type={showPw ? 'text' : 'password'} name="password" id="login-password"
                                placeholder="Your password"
                                value={form.password} onChange={handleChange} required
                                style={{ paddingRight: 40 }}
                            />
                            <button type="button" onClick={() => setShowPw(p => !p)}
                                style={{ position: 'absolute', right: 12, top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-300)' }}>
                                {showPw ? <EyeOff size={15} /> : <Eye size={15} />}
                            </button>
                        </div>
                    </div>

                    <button type="submit" id="login-submit" className="btn btn-primary btn-lg" style={{ width: '100%', marginTop: 6 }} disabled={loading}>
                        {loading ? <span className="spinner" /> : <><LogIn size={16} /> Sign In</>}
                    </button>
                </form>

                <div className="auth-footer">
                    Don't have an account? <Link to="/register">Create one</Link>
                </div>
            </div>
        </div>
    );
}
