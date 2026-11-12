import { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import {
    AreaChart, Area, BarChart, Bar,
    PieChart, Pie, Cell, Tooltip,
    ResponsiveContainer, XAxis, YAxis, CartesianGrid, Legend
} from 'recharts';
import { TrendingUp, TrendingDown, Wallet, PiggyBank, Plus, ArrowRight } from 'lucide-react';
import { dashboardAPI } from '../api';
import { formatINR, formatDate, formatMonth, currentMonth, CATEGORY_COLORS, CATEGORY_ICONS } from '../utils/helpers.js';
import toast from 'react-hot-toast';

const MONTHS_SHORT = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

function CustomTooltip({ active, payload, label }) {
    if (!active || !payload?.length) return null;
    return (
        <div style={{ background: 'var(--bg-750)', border: '1px solid var(--border)', borderRadius: 8, padding: '10px 14px', fontSize: 12 }}>
            <div style={{ color: 'var(--text-200)', marginBottom: 6 }}>{label}</div>
            {payload.map(p => (
                <div key={p.name} style={{ color: p.color, marginBottom: 2 }}>
                    {p.name}: <strong>{formatINR(p.value)}</strong>
                </div>
            ))}
        </div>
    );
}

function BudgetBar({ budget }) {
    const pct = Math.min(budget.percentage, 100);
    const color = pct >= 100 ? 'red' : pct >= 80 ? 'orange' : pct >= 50 ? 'yellow' : 'green';
    return (
        <div style={{ marginBottom: 14 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 6, alignItems: 'center' }}>
                <div style={{ display: 'flex', gap: 6, alignItems: 'center' }}>
                    <span style={{ fontSize: 13 }}>{CATEGORY_ICONS[budget.category_name] || '📁'}</span>
                    <span style={{ fontSize: 13, fontWeight: 500, color: 'var(--text-100)' }}>{budget.category_name}</span>
                    {budget.alert && <span className={`badge badge-${color === 'red' ? 'red' : color === 'orange' ? 'orange' : 'yellow'}`} style={{ fontSize: 10 }}>{budget.alert}</span>}
                </div>
                <span style={{ fontSize: 12, color: 'var(--text-200)' }}>{formatINR(budget.spent)} / {formatINR(budget.limit)}</span>
            </div>
            <div className="progress-bar">
                <div className={`progress-fill ${color}`} style={{ width: `${pct}%` }} />
            </div>
        </div>
    );
}

export default function DashboardPage() {
    const navigate = useNavigate();
    const [data, setData] = useState(null);
    const [loading, setLoading] = useState(true);
    const [month, setMonth] = useState(currentMonth());

    const load = useCallback(async () => {
        setLoading(true);
        try {
            const { data: d } = await dashboardAPI.get(month);
            setData(d);
        } catch (err) {
            toast.error('Failed to load dashboard');
        } finally {
            setLoading(false);
        }
    }, [month]);

    useEffect(() => { load(); }, [load]);

    if (loading) return (
        <div className="loading-overlay">
            <div className="spinner spinner-lg" />
            <span>Loading dashboard…</span>
        </div>
    );

    const summary = data?.summary || {};
    const trends = (data?.monthly_trends || []).map(t => ({
        ...t,
        label: MONTHS_SHORT[parseInt(t.month.split('-')[1]) - 1],
    }));
    const categories = data?.category_breakdown || [];
    const budgets = data?.budgets || [];
    const recent = data?.recent_transactions || [];

    return (
        <div>
            {/* Header */}
            <div className="page-header">
                <div className="page-header-row">
                    <div>
                        <h1>Financial Dashboard</h1>
                        <p>Overview for {formatMonth(month)}</p>
                    </div>
                    <div style={{ display: 'flex', gap: 10, alignItems: 'center' }}>
                        <div className="select-arrow">
                            <select className="select" value={month} onChange={e => setMonth(e.target.value)} style={{ width: 160 }}>
                                {Array.from({ length: 12 }, (_, i) => {
                                    const d = new Date(); d.setMonth(d.getMonth() - i);
                                    const v = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`;
                                    return <option key={v} value={v}>{MONTHS_SHORT[d.getMonth()]} {d.getFullYear()}</option>;
                                })}
                            </select>
                        </div>
                        <button className="btn btn-primary btn-sm" onClick={() => navigate('/expenses')} id="dash-add-expense">
                            <Plus size={14} /> Add Expense
                        </button>
                    </div>
                </div>
            </div>

            {/* Stat Cards */}
            <div className="stat-grid" style={{ marginBottom: 24 }}>
                <div className="stat-card green">
                    <div className="stat-icon green"><TrendingUp size={20} color="var(--emerald-400)" /></div>
                    <div className="stat-value">{formatINR(summary.total_income)}</div>
                    <div className="stat-label">Total Income</div>
                </div>
                <div className="stat-card red">
                    <div className="stat-icon red"><TrendingDown size={20} color="var(--red-400)" /></div>
                    <div className="stat-value">{formatINR(summary.total_expenses)}</div>
                    <div className="stat-label">Total Expenses</div>
                </div>
                <div className="stat-card blue">
                    <div className="stat-icon blue"><Wallet size={20} color="var(--blue-400)" /></div>
                    <div className="stat-value" style={{ color: summary.balance >= 0 ? 'var(--emerald-400)' : 'var(--red-400)' }}>
                        {formatINR(summary.balance)}
                    </div>
                    <div className="stat-label">Net Balance</div>
                </div>
                <div className="stat-card purple">
                    <div className="stat-icon purple"><PiggyBank size={20} color="var(--purple-400)" /></div>
                    <div className="stat-value">{summary.savings_rate?.toFixed(1) || '0.0'}%</div>
                    <div className="stat-label">Savings Rate</div>
                </div>
            </div>

            {/* Charts Row */}
            <div className="section-grid" style={{ marginBottom: 24 }}>
                {/* Income vs Expenses Trend */}
                <div className="card">
                    <div className="card-header">
                        <div>
                            <div className="card-title">Income vs Expenses</div>
                            <div className="card-subtitle">Last 6 months</div>
                        </div>
                    </div>
                    <div className="chart-container">
                        <ResponsiveContainer width="100%" height="100%">
                            <AreaChart data={trends} margin={{ top: 4, right: 4, left: -10, bottom: 0 }}>
                                <defs>
                                    <linearGradient id="incomeGrad" x1="0" y1="0" x2="0" y2="1">
                                        <stop offset="5%" stopColor="#10b981" stopOpacity={0.25} />
                                        <stop offset="95%" stopColor="#10b981" stopOpacity={0.02} />
                                    </linearGradient>
                                    <linearGradient id="expGrad" x1="0" y1="0" x2="0" y2="1">
                                        <stop offset="5%" stopColor="#f85149" stopOpacity={0.25} />
                                        <stop offset="95%" stopColor="#f85149" stopOpacity={0.02} />
                                    </linearGradient>
                                </defs>
                                <CartesianGrid strokeDasharray="3 3" stroke="rgba(48,54,61,0.5)" />
                                <XAxis dataKey="label" tick={{ fill: 'var(--text-300)', fontSize: 11 }} axisLine={false} tickLine={false} />
                                <YAxis tick={{ fill: 'var(--text-300)', fontSize: 11 }} axisLine={false} tickLine={false} tickFormatter={v => `₹${(v / 1000).toFixed(0)}k`} />
                                <Tooltip content={<CustomTooltip />} />
                                <Area type="monotone" dataKey="income" name="Income" stroke="#10b981" strokeWidth={2} fill="url(#incomeGrad)" />
                                <Area type="monotone" dataKey="expenses" name="Expenses" stroke="#f85149" strokeWidth={2} fill="url(#expGrad)" />
                            </AreaChart>
                        </ResponsiveContainer>
                    </div>
                </div>

                {/* Category Breakdown Pie */}
                <div className="card">
                    <div className="card-header">
                        <div>
                            <div className="card-title">Expense Breakdown</div>
                            <div className="card-subtitle">By category — {formatMonth(month)}</div>
                        </div>
                    </div>
                    {categories.length === 0 ? (
                        <div className="empty-state" style={{ padding: '32px 0' }}>
                            <div className="empty-state-icon">🥧</div>
                            <p>No expenses this month</p>
                        </div>
                    ) : (
                        <div style={{ display: 'flex', gap: 16, alignItems: 'center' }}>
                            <div style={{ width: 160, height: 160, flexShrink: 0 }}>
                                <ResponsiveContainer width="100%" height="100%">
                                    <PieChart>
                                        <Pie data={categories} dataKey="total" nameKey="category" cx="50%" cy="50%" innerRadius={45} outerRadius={75} paddingAngle={2}>
                                            {categories.map(c => (
                                                <Cell key={c.category} fill={CATEGORY_COLORS[c.category] || '#6b7280'} />
                                            ))}
                                        </Pie>
                                        <Tooltip formatter={(v) => formatINR(v)} />
                                    </PieChart>
                                </ResponsiveContainer>
                            </div>
                            <div style={{ flex: 1 }}>
                                {categories.slice(0, 6).map(c => (
                                    <div key={c.category} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 }}>
                                        <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
                                            <div style={{ width: 8, height: 8, borderRadius: '50%', background: CATEGORY_COLORS[c.category] || '#6b7280', flexShrink: 0 }} />
                                            <span style={{ fontSize: 12, color: 'var(--text-200)' }}>{c.category}</span>
                                        </div>
                                        <span style={{ fontSize: 12, fontWeight: 600, color: 'var(--text-100)', fontFamily: 'var(--font-mono)' }}>{formatINR(c.total)}</span>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}
                </div>
            </div>

            {/* Budget & Recent Transactions */}
            <div className="section-grid" style={{ marginBottom: 24 }}>
                {/* Budget Status */}
                <div className="card">
                    <div className="card-header">
                        <div>
                            <div className="card-title">Budget Status</div>
                            <div className="card-subtitle">{formatMonth(month)}</div>
                        </div>
                        <button className="btn btn-ghost btn-sm" onClick={() => navigate('/budgets')} id="dash-view-budgets">
                            View All <ArrowRight size={13} />
                        </button>
                    </div>
                    {budgets.length === 0 ? (
                        <div className="empty-state" style={{ padding: '24px 0' }}>
                            <div className="empty-state-icon">🎯</div>
                            <h3>No budgets set</h3>
                            <p>Set budgets to track spending</p>
                            <button className="btn btn-primary btn-sm" style={{ marginTop: 12 }} onClick={() => navigate('/budgets')}>
                                Set Budgets
                            </button>
                        </div>
                    ) : (
                        budgets.map(b => <BudgetBar key={b.id} budget={b} />)
                    )}
                </div>

                {/* Recent Transactions */}
                <div className="card">
                    <div className="card-header">
                        <div>
                            <div className="card-title">Recent Transactions</div>
                            <div className="card-subtitle">Latest activity</div>
                        </div>
                        <button className="btn btn-ghost btn-sm" onClick={() => navigate('/expenses')} id="dash-view-all">
                            View All <ArrowRight size={13} />
                        </button>
                    </div>
                    {recent.length === 0 ? (
                        <div className="empty-state" style={{ padding: '24px 0' }}>
                            <div className="empty-state-icon">💳</div>
                            <h3>No transactions yet</h3>
                            <p>Add your first expense or income</p>
                        </div>
                    ) : (
                        <div>
                            {recent.map(t => (
                                <div key={`${t.type}-${t.id}`} style={{
                                    display: 'flex', justifyContent: 'space-between', alignItems: 'center',
                                    padding: '10px 0', borderBottom: '1px solid var(--border-light)'
                                }}>
                                    <div style={{ display: 'flex', gap: 10, alignItems: 'center' }}>
                                        <div style={{
                                            width: 34, height: 34, borderRadius: 8, flexShrink: 0,
                                            background: t.type === 'income' ? 'rgba(16,185,129,0.12)' : 'rgba(248,81,73,0.1)',
                                            display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 15
                                        }}>
                                            {CATEGORY_ICONS[t.category] || (t.type === 'income' ? '💰' : '💸')}
                                        </div>
                                        <div>
                                            <div style={{ fontSize: 13, fontWeight: 500, color: 'var(--text-100)' }}>{t.description.length > 28 ? t.description.slice(0, 28) + '…' : t.description}</div>
                                            <div style={{ fontSize: 11, color: 'var(--text-300)' }}>{formatDate(t.date)} · {t.category}</div>
                                        </div>
                                    </div>
                                    <span className={t.type === 'income' ? 'amount-income' : 'amount-expense'} style={{ fontSize: 13 }}>
                                        {t.type === 'income' ? '+' : '-'}{formatINR(t.amount)}
                                    </span>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            </div>

            {/* Monthly Bar Chart */}
            {trends.length > 0 && (
                <div className="card">
                    <div className="card-header">
                        <div>
                            <div className="card-title">Monthly Spending Overview</div>
                            <div className="card-subtitle">6-month comparison bar chart</div>
                        </div>
                    </div>
                    <div className="chart-container-lg">
                        <ResponsiveContainer width="100%" height="100%">
                            <BarChart data={trends} margin={{ top: 4, right: 4, left: -10, bottom: 0 }}>
                                <CartesianGrid strokeDasharray="3 3" stroke="rgba(48,54,61,0.5)" vertical={false} />
                                <XAxis dataKey="label" tick={{ fill: 'var(--text-300)', fontSize: 11 }} axisLine={false} tickLine={false} />
                                <YAxis tick={{ fill: 'var(--text-300)', fontSize: 11 }} axisLine={false} tickLine={false} tickFormatter={v => `₹${(v / 1000).toFixed(0)}k`} />
                                <Tooltip content={<CustomTooltip />} />
                                <Legend wrapperStyle={{ fontSize: 12, color: 'var(--text-200)' }} />
                                <Bar dataKey="income" name="Income" fill="#10b981" radius={[4, 4, 0, 0]} maxBarSize={40} />
                                <Bar dataKey="expenses" name="Expenses" fill="#f85149" radius={[4, 4, 0, 0]} maxBarSize={40} />
                            </BarChart>
                        </ResponsiveContainer>
                    </div>
                </div>
            )}
        </div>
    );
}
