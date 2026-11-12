import { useState, useEffect, useCallback } from 'react';
import { Brain, TrendingDown, TrendingUp, AlertTriangle, CheckCircle, RefreshCw, Activity } from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell } from 'recharts';
import { insightsAPI } from '../api';
import { formatINR, CATEGORY_COLORS, CATEGORY_ICONS } from '../utils/helpers.js';
import toast from 'react-hot-toast';

const INSIGHT_TYPE_MAP = {
    success: { icon: '✅', cls: 'success' },
    warning: { icon: '⚠️', cls: 'warning' },
    alert: { icon: '🚨', cls: 'alert' },
    info: { icon: '💡', cls: 'info' },
};

function InsightCard({ insight }) {
    const meta = INSIGHT_TYPE_MAP[insight.type] || INSIGHT_TYPE_MAP.info;
    return (
        <div className={`insight-card ${meta.cls}`} style={{ marginBottom: 10 }}>
            <div className="insight-icon">{meta.icon}</div>
            <div className="insight-body">
                <div className="insight-title">{insight.title}</div>
                <div className="insight-msg">{insight.message}</div>
            </div>
        </div>
    );
}

function ModelMetricBar({ label, value }) {
    const pct = Math.round(value * 100);
    const color = pct >= 80 ? 'var(--emerald-400)' : pct >= 60 ? 'var(--yellow-400)' : 'var(--red-400)';
    return (
        <div style={{ marginBottom: 12 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 5, fontSize: 12 }}>
                <span style={{ color: 'var(--text-200)' }}>{label}</span>
                <span style={{ fontWeight: 700, color, fontFamily: 'var(--font-mono)' }}>{pct}%</span>
            </div>
            <div className="progress-bar">
                <div
                    style={{
                        height: '100%', borderRadius: 100, width: `${pct}%`,
                        background: `linear-gradient(90deg, ${color}99, ${color})`,
                        transition: 'width 0.8s cubic-bezier(0.4,0,0.2,1)',
                    }}
                />
            </div>
        </div>
    );
}

export default function InsightsPage() {
    const [data, setData] = useState(null);
    const [models, setModels] = useState(null);
    const [loadingInsights, setLoadingInsights] = useState(true);
    const [loadingModels, setLoadingModels] = useState(false);

    const loadInsights = useCallback(async () => {
        setLoadingInsights(true);
        try {
            const { data: d } = await insightsAPI.get();
            setData(d);
        } catch {
            toast.error('Failed to load AI insights.');
        } finally {
            setLoadingInsights(false);
        }
    }, []);

    const loadModels = useCallback(async () => {
        setLoadingModels(true);
        try {
            const { data: d } = await insightsAPI.evaluateModels();
            setModels(d);
        } catch {
            toast.error('Failed to evaluate models.');
        } finally {
            setLoadingModels(false);
        }
    }, []);

    useEffect(() => {
        loadInsights();
        loadModels();
    }, [loadInsights, loadModels]);

    const insights = data?.insights || [];
    const summary = data?.summary || {};
    const topCategories = data?.top_categories || [];
    const categoryChartData = topCategories.map(c => ({
        name: c.category,
        total: parseFloat(c.total),
        fill: CATEGORY_COLORS[c.category] || '#6b7280',
    }));

    return (
        <div>
            {/* Header */}
            <div className="page-header">
                <div className="page-header-row">
                    <div>
                        <h1>AI Insights</h1>
                        <p>Machine-learning powered analysis of your spending patterns</p>
                    </div>
                    <button className="btn btn-secondary" id="insights-refresh-btn" onClick={loadInsights} disabled={loadingInsights}>
                        <RefreshCw size={14} style={{ animation: loadingInsights ? 'spin 0.7s linear infinite' : 'none' }} />
                        Refresh
                    </button>
                </div>
            </div>

            {/* Summary stat strip */}
            {!loadingInsights && summary && (
                <div className="stat-grid" style={{ marginBottom: 24 }}>
                    <div className="stat-card green">
                        <div className="stat-icon green"><TrendingUp size={20} color="var(--emerald-400)" /></div>
                        <div className="stat-value">{summary.savings_rate != null ? `${Number(summary.savings_rate).toFixed(1)}%` : '—'}</div>
                        <div className="stat-label">Savings Rate</div>
                        {summary.savings_rate != null && (
                            <div className={`stat-change ${summary.savings_rate >= 20 ? 'positive' : summary.savings_rate >= 10 ? 'neutral' : 'negative'}`}>
                                {summary.savings_rate >= 20 ? '🎉 Excellent' : summary.savings_rate >= 10 ? '👍 Good' : '⚠️ Low'}
                            </div>
                        )}
                    </div>
                    <div className="stat-card red">
                        <div className="stat-icon red"><TrendingDown size={20} color="var(--red-400)" /></div>
                        <div className="stat-value">{formatINR(summary.total_expenses)}</div>
                        <div className="stat-label">Total Expenses (Month)</div>
                    </div>
                    <div className="stat-card blue">
                        <div className="stat-icon blue"><Activity size={20} color="var(--blue-400)" /></div>
                        <div className="stat-value">{summary.expense_count ?? '—'}</div>
                        <div className="stat-label">Transactions</div>
                    </div>
                    <div className="stat-card orange">
                        <div className="stat-icon orange"><AlertTriangle size={20} color="var(--orange-400)" /></div>
                        <div className="stat-value">
                            {summary.spending_change != null
                                ? `${summary.spending_change >= 0 ? '+' : ''}${Number(summary.spending_change).toFixed(1)}%`
                                : '—'}
                        </div>
                        <div className="stat-label">vs Last Month</div>
                        {summary.spending_change != null && (
                            <div className={`stat-change ${summary.spending_change <= 0 ? 'positive' : 'negative'}`}>
                                {summary.spending_change <= 0 ? '↓ Spending down' : '↑ Spending up'}
                            </div>
                        )}
                    </div>
                </div>
            )}

            <div className="section-grid" style={{ marginBottom: 24 }}>
                {/* AI Insights Feed */}
                <div className="card">
                    <div className="card-header">
                        <div>
                            <div className="card-title" style={{ display: 'flex', alignItems: 'center', gap: 7 }}>
                                <Brain size={15} color="var(--emerald-400)" />
                                Smart Insights
                            </div>
                            <div className="card-subtitle">Personalised AI recommendations for this month</div>
                        </div>
                    </div>
                    {loadingInsights ? (
                        <div className="loading-overlay" style={{ minHeight: 200 }}>
                            <div className="spinner spinner-lg" />
                            <span>Analysing spending patterns…</span>
                        </div>
                    ) : insights.length === 0 ? (
                        <div className="empty-state" style={{ padding: '32px 0' }}>
                            <div className="empty-state-icon">🤖</div>
                            <h3>No insights yet</h3>
                            <p>Add more expenses to unlock AI spending insights</p>
                        </div>
                    ) : (
                        <div>{insights.map((ins, i) => <InsightCard key={i} insight={ins} />)}</div>
                    )}
                </div>

                {/* Top Spending Categories Chart */}
                <div className="card">
                    <div className="card-header">
                        <div>
                            <div className="card-title">Top Spending Categories</div>
                            <div className="card-subtitle">Where your money is going this month</div>
                        </div>
                    </div>
                    {loadingInsights ? (
                        <div className="loading-overlay" style={{ minHeight: 200 }}>
                            <div className="spinner" />
                        </div>
                    ) : topCategories.length === 0 ? (
                        <div className="empty-state" style={{ padding: '32px 0' }}>
                            <div className="empty-state-icon">📊</div>
                            <p>No expense data available</p>
                        </div>
                    ) : (
                        <>
                            <div className="chart-container">
                                <ResponsiveContainer width="100%" height="100%">
                                    <BarChart data={categoryChartData} layout="vertical" margin={{ top: 0, right: 8, left: 10, bottom: 0 }}>
                                        <CartesianGrid strokeDasharray="3 3" stroke="rgba(48,54,61,0.5)" horizontal={false} />
                                        <XAxis
                                            type="number"
                                            tick={{ fill: 'var(--text-300)', fontSize: 11 }}
                                            axisLine={false} tickLine={false}
                                            tickFormatter={v => `₹${(v / 1000).toFixed(0)}k`}
                                        />
                                        <YAxis
                                            type="category" dataKey="name"
                                            tick={{ fill: 'var(--text-200)', fontSize: 12 }}
                                            axisLine={false} tickLine={false} width={90}
                                        />
                                        <Tooltip
                                            formatter={v => [formatINR(v), 'Spent']}
                                            contentStyle={{ background: 'var(--bg-750)', border: '1px solid var(--border)', borderRadius: 8, fontSize: 12 }}
                                        />
                                        <Bar dataKey="total" radius={[0, 4, 4, 0]} maxBarSize={28}>
                                            {categoryChartData.map((entry, i) => (
                                                <Cell key={`cell-${i}`} fill={entry.fill} />
                                            ))}
                                        </Bar>
                                    </BarChart>
                                </ResponsiveContainer>
                            </div>
                            <div style={{ marginTop: 16 }}>
                                {topCategories.slice(0, 5).map((c, i) => (
                                    <div key={c.category} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '6px 0', borderBottom: i < Math.min(topCategories.length - 1, 4) ? '1px solid var(--border-light)' : 'none' }}>
                                        <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
                                            <span style={{ fontSize: 14 }}>{CATEGORY_ICONS[c.category] || '📁'}</span>
                                            <span style={{ fontSize: 13, color: 'var(--text-200)' }}>{c.category}</span>
                                        </div>
                                        <div style={{ textAlign: 'right' }}>
                                            <div style={{ fontSize: 13, fontWeight: 600, color: 'var(--text-100)', fontFamily: 'var(--font-mono)' }}>{formatINR(c.total)}</div>
                                            {c.count != null && <div style={{ fontSize: 11, color: 'var(--text-300)' }}>{c.count} transaction{c.count !== 1 ? 's' : ''}</div>}
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </>
                    )}
                </div>
            </div>

            {/* ML Model Evaluation */}
            <div className="card">
                <div className="card-header">
                    <div>
                        <div className="card-title" style={{ display: 'flex', alignItems: 'center', gap: 7 }}>
                            <CheckCircle size={15} color="var(--blue-400)" />
                            ML Model Performance
                        </div>
                        <div className="card-subtitle">Accuracy metrics of the AI categorisation engine (trained on 300 labelled expenses)</div>
                    </div>
                    <button className="btn btn-ghost btn-sm" id="models-refresh-btn" onClick={loadModels} disabled={loadingModels}>
                        <RefreshCw size={13} style={{ animation: loadingModels ? 'spin 0.7s linear infinite' : 'none' }} />
                        Evaluate
                    </button>
                </div>

                {loadingModels ? (
                    <div className="loading-overlay" style={{ minHeight: 120 }}>
                        <div className="spinner" />
                        <span>Running model evaluation…</span>
                    </div>
                ) : !models ? (
                    <div className="empty-state" style={{ padding: '24px 0' }}>
                        <div className="empty-state-icon">🧪</div>
                        <p>Click "Evaluate" to run model performance analysis</p>
                    </div>
                ) : (
                    <div className="section-grid">
                        {Object.entries(models).map(([key, m]) => (
                            <div key={key} style={{ padding: '16px', background: 'var(--bg-750)', borderRadius: 10, border: '1px solid var(--border-light)' }}>
                                <div style={{ fontWeight: 700, fontSize: 13.5, color: 'var(--text-50)', marginBottom: 14 }}>
                                    {key === 'tfidf_naive_bayes' ? '🧠 TF-IDF + Naïve Bayes' : key === 'keyword' ? '📖 Keyword Rule Classifier' : key}
                                </div>
                                {m.accuracy != null && <ModelMetricBar label="Accuracy" value={m.accuracy} />}
                                {m.precision != null && <ModelMetricBar label="Precision" value={m.precision} />}
                                {m.recall != null && <ModelMetricBar label="Recall" value={m.recall} />}
                                {m.f1_score != null && <ModelMetricBar label="F1 Score" value={m.f1_score} />}
                                {m.test_size != null && (
                                    <div style={{ fontSize: 11, color: 'var(--text-300)', marginTop: 10 }}>
                                        Evaluated on {m.test_size} test samples
                                    </div>
                                )}
                                {m.error && (
                                    <div style={{ fontSize: 12, color: 'var(--red-400)', marginTop: 8 }}>
                                        ⚠️ {m.error}
                                    </div>
                                )}
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
}
