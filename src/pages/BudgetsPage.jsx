import { useState, useEffect, useCallback } from 'react';
import { Plus, Trash2, Edit3, X, Target } from 'lucide-react';
import { budgetsAPI } from '../api';
import { formatINR, currentMonth, CATEGORY_COLORS, CATEGORY_ICONS, progressColor, alertClass } from '../utils/helpers.js';
import toast from 'react-hot-toast';

const EXPENSE_CATEGORIES = ['Food', 'Transport', 'Shopping', 'Bills', 'Healthcare', 'Entertainment', 'Education', 'Rent', 'Insurance', 'Uncategorized'];
const MONTHS_BACK = Array.from({ length: 6 }, (_, i) => {
    const d = new Date(); d.setMonth(d.getMonth() - i);
    const v = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`;
    return { value: v, label: d.toLocaleDateString('en-IN', { month: 'short', year: 'numeric' }) };
});

function BudgetModal({ open, onClose, onSaved, initial }) {
    const isEdit = !!initial;
    const [form, setForm] = useState({
        category_name: 'Food', monthly_limit: '', weekly_limit: '',
        alert_50: true, alert_80: true, alert_100: true
    });
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        if (open) setForm({ category_name: 'Food', monthly_limit: '', weekly_limit: '', alert_50: true, alert_80: true, alert_100: true, ...(initial || {}) });
    }, [open, initial]);

    const handleSubmit = async e => {
        e.preventDefault();
        setLoading(true);
        try {
            const payload = {
                ...form,
                monthly_limit: parseFloat(form.monthly_limit),
                weekly_limit: form.weekly_limit ? parseFloat(form.weekly_limit) : null,
            };
            await budgetsAPI.createOrUpdate(payload);
            toast.success(isEdit ? 'Budget updated!' : 'Budget set!');
            onSaved(); onClose();
        } catch (err) { toast.error(err.response?.data?.error || 'Failed to save budget'); }
        finally { setLoading(false); }
    };

    if (!open) return null;
    return (
        <div className="modal-backdrop" onClick={e => e.target === e.currentTarget && onClose()}>
            <div className="modal">
                <div className="modal-header">
                    <div className="modal-title">{isEdit ? 'Edit Budget' : 'Set Budget'}</div>
                    <button className="btn btn-ghost btn-icon" onClick={onClose}><X size={16} /></button>
                </div>
                <form onSubmit={handleSubmit}>
                    <div className="modal-body">
                        <div className="form-group">
                            <label className="label">Category *</label>
                            <div className="select-arrow">
                                <select className="select" id="budget-cat" value={form.category_name}
                                    onChange={e => setForm(p => ({ ...p, category_name: e.target.value }))}>
                                    {EXPENSE_CATEGORIES.map(c => <option key={c} value={c}>{CATEGORY_ICONS[c] || '📁'} {c}</option>)}
                                </select>
                            </div>
                        </div>
                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
                            <div className="form-group">
                                <label className="label">Monthly Limit (₹) *</label>
                                <input className="input" id="budget-monthly" type="number" step="0.01" min="1" placeholder="5000.00" value={form.monthly_limit}
                                    onChange={e => setForm(p => ({ ...p, monthly_limit: e.target.value }))} required />
                            </div>
                            <div className="form-group">
                                <label className="label">Weekly Limit (₹) <span style={{ color: 'var(--text-300)' }}>optional</span></label>
                                <input className="input" id="budget-weekly" type="number" step="0.01" min="0" placeholder="1200.00" value={form.weekly_limit || ''}
                                    onChange={e => setForm(p => ({ ...p, weekly_limit: e.target.value }))} />
                            </div>
                        </div>
                        <div>
                            <label className="label">Alert Notifications</label>
                            <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                                {[
                                    { key: 'alert_50', label: '50% — Halfway alert', color: 'var(--yellow-400)' },
                                    { key: 'alert_80', label: '80% — Near limit warning', color: 'var(--orange-400)' },
                                    { key: 'alert_100', label: '100% — Over budget alert', color: 'var(--red-400)' },
                                ].map(({ key, label, color }) => (
                                    <label key={key} style={{ display: 'flex', alignItems: 'center', gap: 8, cursor: 'pointer' }}>
                                        <input type="checkbox" id={`budget-${key}`} checked={form[key]}
                                            onChange={e => setForm(p => ({ ...p, [key]: e.target.checked }))} />
                                        <span style={{ fontSize: 13, color }}>{label}</span>
                                    </label>
                                ))}
                            </div>
                        </div>
                    </div>
                    <div className="modal-footer">
                        <button type="button" className="btn btn-secondary" onClick={onClose}>Cancel</button>
                        <button type="submit" id="budget-submit" className="btn btn-primary" disabled={loading}>
                            {loading ? <span className="spinner" /> : 'Save Budget'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}

export default function BudgetsPage() {
    const [budgets, setBudgets] = useState([]);
    const [loading, setLoading] = useState(true);
    const [modal, setModal] = useState({ open: false, budget: null });
    const [month, setMonth] = useState(currentMonth());

    const load = useCallback(async () => {
        setLoading(true);
        try {
            const { data } = await budgetsAPI.list(month);
            setBudgets(data.budgets);
        } catch { toast.error('Failed to load budgets'); }
        finally { setLoading(false); }
    }, [month]);

    useEffect(() => { load(); }, [load]);

    const handleDelete = async (id) => {
        if (!window.confirm('Delete this budget?')) return;
        try { await budgetsAPI.delete(id); toast.success('Budget deleted'); load(); }
        catch { toast.error('Failed to delete'); }
    };

    return (
        <div>
            <div className="page-header">
                <div className="page-header-row">
                    <div>
                        <h1>Budgets</h1>
                        <p>Set and monitor monthly spending limits</p>
                    </div>
                    <div style={{ display: 'flex', gap: 10 }}>
                        <div className="select-arrow">
                            <select className="select" value={month} onChange={e => setMonth(e.target.value)} style={{ width: 160 }}>
                                {MONTHS_BACK.map(m => <option key={m.value} value={m.value}>{m.label}</option>)}
                            </select>
                        </div>
                        <button className="btn btn-primary" id="add-budget-btn" onClick={() => setModal({ open: true, budget: null })}>
                            <Plus size={16} /> Set Budget
                        </button>
                    </div>
                </div>
            </div>

            {loading ? (
                <div className="loading-overlay"><div className="spinner spinner-lg" /></div>
            ) : budgets.length === 0 ? (
                <div className="card">
                    <div className="empty-state">
                        <div className="empty-state-icon"><Target size={48} strokeWidth={1} /></div>
                        <h3>No budgets configured</h3>
                        <p>Set spending limits to stay on track and receive smart alerts</p>
                        <button className="btn btn-primary" style={{ marginTop: 16 }} onClick={() => setModal({ open: true, budget: null })}>
                            <Plus size={16} /> Create Your First Budget
                        </button>
                    </div>
                </div>
            ) : (
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))', gap: 16 }}>
                    {budgets.map(b => {
                        const pct = Math.min(b.percentage, 100);
                        const barColor = progressColor(b.percentage);
                        return (
                            <div key={b.id} className="card">
                                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 16 }}>
                                    <div style={{ display: 'flex', gap: 10, alignItems: 'center' }}>
                                        <div style={{ width: 42, height: 42, borderRadius: 10, background: `${CATEGORY_COLORS[b.category_name] || '#6b7280'}22`, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 20 }}>
                                            {CATEGORY_ICONS[b.category_name] || '📁'}
                                        </div>
                                        <div>
                                            <div style={{ fontWeight: 700, fontSize: 14, color: 'var(--text-50)' }}>{b.category_name}</div>
                                            {b.alert && (
                                                <span className={`badge ${alertClass(b.alert)}`} style={{ marginTop: 3 }}>
                                                    {b.alert === 'over budget' ? '🔴 Over Budget'
                                                        : b.alert === 'near limit' ? '🟠 Near Limit'
                                                            : '🟡 Halfway'}
                                                </span>
                                            )}
                                        </div>
                                    </div>
                                    <div style={{ display: 'flex', gap: 4 }}>
                                        <button className="btn btn-ghost btn-icon" id={`edit-budget-${b.id}`} onClick={() => setModal({ open: true, budget: { ...b, monthly_limit: b.limit } })}><Edit3 size={13} /></button>
                                        <button className="btn btn-danger btn-icon" id={`del-budget-${b.id}`} onClick={() => handleDelete(b.id)}><Trash2 size={13} /></button>
                                    </div>
                                </div>

                                <div style={{ marginBottom: 10 }}>
                                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 6, fontSize: 13 }}>
                                        <span style={{ color: 'var(--text-200)' }}>Spent</span>
                                        <span style={{ fontWeight: 600 }}>
                                            <span style={{ color: barColor === 'red' ? 'var(--red-400)' : 'var(--text-100)' }}>{formatINR(b.spent)}</span>
                                            <span style={{ color: 'var(--text-300)' }}> / {formatINR(b.limit)}</span>
                                        </span>
                                    </div>
                                    <div className="progress-bar">
                                        <div className={`progress-fill ${barColor}`} style={{ width: `${pct}%` }} />
                                    </div>
                                    <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: 6, fontSize: 11, color: 'var(--text-300)' }}>
                                        <span>{b.percentage.toFixed(1)}% used</span>
                                        <span>{formatINR(b.remaining)} remaining</span>
                                    </div>
                                </div>

                                {b.weekly_limit && (
                                    <div style={{ padding: '8px 10px', background: 'var(--bg-750)', borderRadius: 7, fontSize: 12, color: 'var(--text-200)' }}>
                                        Weekly limit: <strong style={{ color: 'var(--text-100)' }}>{formatINR(b.weekly_limit)}</strong>
                                    </div>
                                )}
                            </div>
                        );
                    })}
                </div>
            )}

            <BudgetModal open={modal.open} onClose={() => setModal({ open: false, budget: null })} onSaved={load} initial={modal.budget} />
        </div>
    );
}
