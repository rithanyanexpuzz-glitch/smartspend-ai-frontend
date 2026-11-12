import { useState, useEffect, useCallback } from 'react';
import { Plus, Trash2, Edit3, X } from 'lucide-react';
import { incomeAPI } from '../api';
import { formatINR, formatDate, currentMonth, CATEGORY_ICONS } from '../utils/helpers.js';
import toast from 'react-hot-toast';

const INCOME_CATEGORIES = ['Salary', 'Business', 'Freelance', 'Investment', 'Rental', 'Other'];
const INCOME_COLORS = { Salary: '#10b981', Business: '#388bfd', Freelance: '#fb8f44', Investment: '#a371f7', Rental: '#2ea043', Other: '#8b949e' };
const MONTHS_BACK = Array.from({ length: 12 }, (_, i) => {
    const d = new Date(); d.setMonth(d.getMonth() - i);
    const v = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`;
    return { value: v, label: d.toLocaleDateString('en-IN', { month: 'short', year: 'numeric' }) };
});

function IncomeModal({ open, onClose, onSaved, initial }) {
    const isEdit = !!initial;
    const [form, setForm] = useState({ description: '', amount: '', income_date: new Date().toISOString().slice(0, 10), category: 'Salary', is_recurring: false });
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        if (open) setForm({ description: '', amount: '', income_date: new Date().toISOString().slice(0, 10), category: 'Salary', is_recurring: false, ...(initial || {}) });
    }, [open, initial]);

    const handleSubmit = async e => {
        e.preventDefault();
        setLoading(true);
        try {
            const payload = { ...form, amount: parseFloat(form.amount) };
            if (isEdit) { await incomeAPI.update(initial.id, payload); toast.success('Income updated!'); }
            else { await incomeAPI.create(payload); toast.success('Income added!'); }
            onSaved(); onClose();
        } catch (err) { toast.error(err.response?.data?.error || 'Failed to save income'); }
        finally { setLoading(false); }
    };

    if (!open) return null;
    return (
        <div className="modal-backdrop" onClick={e => e.target === e.currentTarget && onClose()}>
            <div className="modal">
                <div className="modal-header">
                    <div className="modal-title">{isEdit ? 'Edit Income' : 'Add Income'}</div>
                    <button className="btn btn-ghost btn-icon" onClick={onClose}><X size={16} /></button>
                </div>
                <form onSubmit={handleSubmit}>
                    <div className="modal-body">
                        <div className="form-group">
                            <label className="label">Description *</label>
                            <input className="input" id="income-desc" placeholder="e.g. November Salary" value={form.description}
                                onChange={e => setForm(p => ({ ...p, description: e.target.value }))} required />
                        </div>
                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
                            <div className="form-group">
                                <label className="label">Amount (₹) *</label>
                                <input className="input" id="income-amount" type="number" step="0.01" min="0.01" placeholder="0.00" value={form.amount}
                                    onChange={e => setForm(p => ({ ...p, amount: e.target.value }))} required />
                            </div>
                            <div className="form-group">
                                <label className="label">Date *</label>
                                <input className="input" id="income-date" type="date" value={form.income_date}
                                    onChange={e => setForm(p => ({ ...p, income_date: e.target.value }))} required />
                            </div>
                        </div>
                        <div className="form-group">
                            <label className="label">Category</label>
                            <div className="select-arrow">
                                <select className="select" id="income-cat" value={form.category}
                                    onChange={e => setForm(p => ({ ...p, category: e.target.value }))}>
                                    {INCOME_CATEGORIES.map(c => <option key={c} value={c}>{CATEGORY_ICONS[c] || '📁'} {c}</option>)}
                                </select>
                            </div>
                        </div>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginTop: 4 }}>
                            <input type="checkbox" id="income-recurring" checked={form.is_recurring}
                                onChange={e => setForm(p => ({ ...p, is_recurring: e.target.checked }))} />
                            <label htmlFor="income-recurring" className="label" style={{ margin: 0, cursor: 'pointer' }}>Mark as recurring income</label>
                        </div>
                    </div>
                    <div className="modal-footer">
                        <button type="button" className="btn btn-secondary" onClick={onClose}>Cancel</button>
                        <button type="submit" id="income-submit" className="btn btn-primary" disabled={loading}>
                            {loading ? <span className="spinner" /> : (isEdit ? 'Save Changes' : 'Add Income')}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}

export default function IncomePage() {
    const [incomes, setIncomes] = useState([]);
    const [total, setTotal] = useState(0);
    const [loading, setLoading] = useState(true);
    const [modal, setModal] = useState({ open: false, income: null });
    const [month, setMonth] = useState(currentMonth());
    const [deleting, setDeleting] = useState(null);

    const load = useCallback(async () => {
        setLoading(true);
        try {
            const { data } = await incomeAPI.list({ month, per_page: 50 });
            setIncomes(data.incomes);
            setTotal(data.total);
        } catch { toast.error('Failed to load income'); }
        finally { setLoading(false); }
    }, [month]);

    useEffect(() => { load(); }, [load]);

    const handleDelete = async (id) => {
        if (!window.confirm('Delete this income record?')) return;
        try {
            await incomeAPI.delete(id);
            toast.success('Deleted');
            load();
        } catch { toast.error('Failed to delete'); }
    };

    const monthTotal = incomes.reduce((s, i) => s + parseFloat(i.amount), 0);

    return (
        <div>
            <div className="page-header">
                <div className="page-header-row">
                    <div>
                        <h1>Income</h1>
                        <p>{total} records · Total: {formatINR(monthTotal)}</p>
                    </div>
                    <div style={{ display: 'flex', gap: 10 }}>
                        <div className="select-arrow">
                            <select className="select" value={month} onChange={e => setMonth(e.target.value)} style={{ width: 160 }}>
                                {MONTHS_BACK.map(m => <option key={m.value} value={m.value}>{m.label}</option>)}
                            </select>
                        </div>
                        <button className="btn btn-primary" id="add-income-btn" onClick={() => setModal({ open: true, income: null })}>
                            <Plus size={16} /> Add Income
                        </button>
                    </div>
                </div>
            </div>

            {/* Summary Cards */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(150px, 1fr))', gap: 14, marginBottom: 20 }}>
                {INCOME_CATEGORIES.map(cat => {
                    const catTotal = incomes.filter(i => i.category === cat).reduce((s, i) => s + parseFloat(i.amount), 0);
                    if (!catTotal) return null;
                    return (
                        <div key={cat} className="card" style={{ padding: '14px 16px' }}>
                            <div style={{ fontSize: 20, marginBottom: 6 }}>{CATEGORY_ICONS[cat]}</div>
                            <div style={{ fontSize: 14, fontWeight: 700, color: INCOME_COLORS[cat] }}>{formatINR(catTotal)}</div>
                            <div style={{ fontSize: 11, color: 'var(--text-200)', marginTop: 2 }}>{cat}</div>
                        </div>
                    );
                })}
            </div>

            {/* Table */}
            <div className="card" style={{ padding: 0 }}>
                <div className="table-wrap">
                    {loading ? (
                        <div className="loading-overlay" style={{ minHeight: 200 }}>
                            <div className="spinner" /> Loading…
                        </div>
                    ) : incomes.length === 0 ? (
                        <div className="empty-state">
                            <div className="empty-state-icon">💰</div>
                            <h3>No income records</h3>
                            <p>Start tracking your income</p>
                            <button className="btn btn-primary btn-sm" style={{ marginTop: 12 }} onClick={() => setModal({ open: true, income: null })}>
                                <Plus size={14} /> Add Income
                            </button>
                        </div>
                    ) : (
                        <table>
                            <thead>
                                <tr>
                                    <th>Date</th>
                                    <th>Description</th>
                                    <th>Category</th>
                                    <th>Recurring</th>
                                    <th style={{ textAlign: 'right' }}>Amount</th>
                                    <th style={{ textAlign: 'center' }}>Actions</th>
                                </tr>
                            </thead>
                            <tbody>
                                {incomes.map(i => (
                                    <tr key={i.id}>
                                        <td style={{ color: 'var(--text-200)', fontSize: 12, whiteSpace: 'nowrap' }}>{formatDate(i.income_date)}</td>
                                        <td style={{ fontSize: 13.5, fontWeight: 500 }}>{i.description}</td>
                                        <td>
                                            <span className="cat-chip" style={{ background: `${INCOME_COLORS[i.category] || '#6b7280'}22`, color: INCOME_COLORS[i.category] || 'var(--text-200)' }}>
                                                {CATEGORY_ICONS[i.category] || '📁'} {i.category}
                                            </span>
                                        </td>
                                        <td>{i.is_recurring ? <span className="badge badge-blue">🔄 Recurring</span> : <span style={{ color: 'var(--text-300)', fontSize: 12 }}>—</span>}</td>
                                        <td style={{ textAlign: 'right' }}><span className="amount-income">{formatINR(i.amount)}</span></td>
                                        <td>
                                            <div style={{ display: 'flex', gap: 6, justifyContent: 'center' }}>
                                                <button className="btn btn-ghost btn-icon" title="Edit" id={`edit-income-${i.id}`}
                                                    onClick={() => setModal({ open: true, income: i })}><Edit3 size={14} /></button>
                                                <button className="btn btn-danger btn-icon" title="Delete" id={`del-income-${i.id}`}
                                                    onClick={() => handleDelete(i.id)}><Trash2 size={14} /></button>
                                            </div>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    )}
                </div>
            </div>

            <IncomeModal open={modal.open} onClose={() => setModal({ open: false, income: null })} onSaved={load} initial={modal.income} />
        </div>
    );
}
