import { Link, useNavigate } from 'react-router-dom';
import {
    Sparkles, ShieldCheck, Zap, Brain, PiggyBank, Users,
    ArrowRight, CheckCircle, BarChart3, Smartphone, BellRing, Lock
} from 'lucide-react';

export default function LandingPage() {
    const navigate = useNavigate();

    return (
        <div style={{ minHeight: '100vh', background: 'var(--bg-950)', color: 'var(--text-100)', overflowX: 'hidden' }}>
            {/* Top Navigation */}
            <header style={{
                maxWidth: 1200, margin: '0 auto', padding: '20px 24px',
                display: 'flex', justifyContent: 'space-between', alignItems: 'center',
                borderBottom: '1px solid var(--border-light)'
            }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                    <div style={{
                        width: 38, height: 38, borderRadius: 10,
                        background: 'linear-gradient(135deg, var(--emerald-500), var(--blue-500))',
                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                        fontSize: 20
                    }}>
                        💰
                    </div>
                    <div>
                        <div style={{ fontSize: 18, fontWeight: 800, color: '#fff', letterSpacing: '-0.02em' }}>SmartSpend AI</div>
                        <div style={{ fontSize: 10, color: 'var(--emerald-400)', fontWeight: 700, letterSpacing: '0.08em' }}>INTELLIGENT FINANCE SAAS</div>
                    </div>
                </div>

                <div style={{ display: 'flex', gap: 12, alignItems: 'center' }}>
                    <Link to="/login" className="btn btn-ghost" style={{ fontSize: 14 }}>
                        Sign In
                    </Link>
                    <Link to="/register" className="btn btn-primary" style={{ fontSize: 14 }}>
                        Get Started Free <ArrowRight size={14} />
                    </Link>
                </div>
            </header>

            {/* Hero Section */}
            <section style={{ maxWidth: 1000, margin: '60px auto 40px', padding: '0 24px', textAlign: 'center' }}>
                <div style={{
                    display: 'inline-flex', alignItems: 'center', gap: 8,
                    padding: '6px 14px', borderRadius: 20,
                    background: 'rgba(16, 185, 129, 0.1)', border: '1px solid rgba(16, 185, 129, 0.3)',
                    color: 'var(--emerald-400)', fontSize: 12.5, fontWeight: 600, marginBottom: 24
                }}>
                    <Sparkles size={14} /> Powered by Scikit-Learn Machine Learning &amp; AI
                </div>

                <h1 style={{
                    fontSize: 'clamp(36px, 6vw, 60px)', fontWeight: 900,
                    lineHeight: 1.15, color: '#fff', letterSpacing: '-0.03em', marginBottom: 20
                }}>
                    Master Your Money with <br />
                    <span style={{
                        background: 'linear-gradient(135deg, var(--emerald-400), var(--blue-400))',
                        WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent'
                    }}>
                        AI-Powered Intelligence
                    </span>
                </h1>

                <p style={{
                    fontSize: 18, color: 'var(--text-200)', maxWidth: 680, margin: '0 auto 36px',
                    lineHeight: 1.6
                }}>
                    Stop wondering where your salary goes. SmartSpend AI auto-categorizes expenses from your bank SMS,
                    sends instant WhatsApp &amp; Email budget alerts, tracks savings goals, and splits bills with friends.
                </p>

                <div style={{ display: 'flex', gap: 14, justifyContent: 'center', flexWrap: 'wrap' }}>
                    <button
                        className="btn btn-primary btn-lg"
                        style={{ fontSize: 16, padding: '14px 32px' }}
                        onClick={() => navigate('/login')}
                    >
                        ⚡ Try 1-Click Live Demo
                    </button>
                    <button
                        className="btn btn-secondary btn-lg"
                        style={{ fontSize: 16, padding: '14px 28px' }}
                        onClick={() => navigate('/register')}
                    >
                        Create Free Account
                    </button>
                </div>

                <div style={{ display: 'flex', gap: 24, justifyContent: 'center', marginTop: 30, fontSize: 12.5, color: 'var(--text-300)' }}>
                    <span>✓ Built for Indian Rupee (₹)</span>
                    <span>✓ WhatsApp &amp; Email Alerts</span>
                    <span>✓ Installable PWA Mobile App</span>
                </div>
            </section>

            {/* Features Grid */}
            <section style={{ maxWidth: 1100, margin: '40px auto 80px', padding: '0 24px' }}>
                <div style={{ textAlign: 'center', marginBottom: 40 }}>
                    <h2 style={{ fontSize: 28, fontWeight: 800, color: '#fff' }}>Everything You Need in One Personal Finance App</h2>
                    <p style={{ color: 'var(--text-300)', fontSize: 14, marginTop: 6 }}>Modern financial management designed for smart savers</p>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: 24 }}>
                    {[
                        {
                            icon: Brain,
                            color: 'var(--emerald-400)',
                            title: 'ML Expense Auto-Categorizer',
                            desc: 'Naive Bayes + TF-IDF classifies your daily spending instantly with up to 90% confidence.',
                        },
                        {
                            icon: Zap,
                            color: 'var(--amber-400)',
                            title: 'SMS & UPI Auto-Fill',
                            desc: 'Paste bank debits (GPay, PhonePe, Paytm, HDFC) and SmartSpend extracts amount, vendor & category automatically.',
                        },
                        {
                            icon: BellRing,
                            color: 'var(--blue-400)',
                            title: 'Email & WhatsApp Threshold Alerts',
                            desc: 'Get notified on your phone whenever you hit 50%, 80%, or 100% of your category limits.',
                        },
                        {
                            icon: PiggyBank,
                            color: 'var(--purple-400)',
                            title: 'Savings Goals Tracker',
                            desc: 'Set targets for your dream bike, vacation, or emergency fund with progress bars and deposits.',
                        },
                        {
                            icon: Users,
                            color: 'var(--red-400)',
                            title: 'Splitwise-Style Bill Splitting',
                            desc: 'Split restaurant bills or trip cabs with friends and track who has paid and what you are owed.',
                        },
                        {
                            icon: Smartphone,
                            color: 'var(--emerald-400)',
                            title: 'Installable Mobile PWA',
                            desc: 'Add to your Android or iPhone home screen with one tap for a native app experience.',
                        },
                    ].map((f, i) => (
                        <div
                            key={i}
                            className="card"
                            style={{
                                padding: 24,
                                background: 'var(--bg-800)',
                                border: '1px solid var(--border-light)',
                                borderRadius: 12
                            }}
                        >
                            <div style={{
                                width: 42, height: 42, borderRadius: 10,
                                background: 'var(--bg-750)', display: 'flex', alignItems: 'center', justifyContent: 'center',
                                marginBottom: 16
                            }}>
                                <f.icon size={22} color={f.color} />
                            </div>
                            <h3 style={{ fontSize: 17, fontWeight: 700, color: '#fff', marginBottom: 8 }}>{f.title}</h3>
                            <p style={{ fontSize: 13.5, color: 'var(--text-300)', lineHeight: 1.6 }}>{f.desc}</p>
                        </div>
                    ))}
                </div>
            </section>

            {/* CTA Banner */}
            <section style={{
                maxWidth: 900, margin: '0 auto 80px', padding: '40px 30px',
                background: 'linear-gradient(135deg, rgba(16, 185, 129, 0.15), rgba(56, 139, 253, 0.15))',
                border: '1px solid rgba(16, 185, 129, 0.3)', borderRadius: 16, textAlign: 'center'
            }}>
                <h2 style={{ fontSize: 28, fontWeight: 800, color: '#fff', marginBottom: 12 }}>
                    Ready to Take Control of Your Financial Future?
                </h2>
                <p style={{ fontSize: 15, color: 'var(--text-200)', maxWidth: 540, margin: '0 auto 24px' }}>
                    Join hundreds of users budgeting smarter today. Free to get started with complete privacy.
                </p>
                <button
                    className="btn btn-primary btn-lg"
                    style={{ fontSize: 16, padding: '14px 36px' }}
                    onClick={() => navigate('/login')}
                >
                    Launch SmartSpend AI Dashboard 🚀
                </button>
            </section>

            {/* Footer */}
            <footer style={{ borderTop: '1px solid var(--border-light)', padding: '24px', textAlign: 'center', color: 'var(--text-400)', fontSize: 13 }}>
                SmartSpend AI • Production-Ready SaaS Application • Built with React, Flask &amp; MySQL
            </footer>
        </div>
    );
}
