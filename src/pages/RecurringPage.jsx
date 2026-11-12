import { useState, useEffect, useCallback } from 'react';
import { Repeat, Plus, Pencil, Trash2, Play, Calendar, AlertTriangle, CheckCircle, X } from 'lucide-react';
import { recurringAPI } from '../api';
import { formatINR, formatDate, CATEGORY_COLORS, CATEGORY_ICONS, EXPENSE_CATEGORIES } from '../utils/helpers.js';
import toast from 'react-hot-toast';

const FREQUENCIES = [
    { value: 'weekly', label: 'Weekly' },
    { value: 'monthly', label: 'Monthly' },
    { value: 'quarterly', label: 'Quarterly' },
    { value: 'yearly', label: 'Yearly' },
];

const EMPTY_FORM = {
    description: '', amount: '', category_name: 'Bills', frequency: 'monthly',
    start_date: new Date().toISOString().split('T')[0], end_date: '', auto_add: false,
};

function FrequencyBadge({ freq }) {
    const colors = { weekly: 'var(--blue-400)', monthly: 'var(--emerald-400)', quarterly: 'var(--purple-400)', yearly: 'var(--orange-400)' };
    return (
        <span className="badge" style={{ background: `${colors[freq] || 'var(--text-300)'}22`, color: colors[freq] || 'var(--text-200)', fontSize: 10.5, fontWeight: 600 }}>
            <Repeat size={10} /> {freq}
        </span>
    );
}

function StatusBadge({ item }) {
    if (!item.is_active) return <span className="badge badge-gray">Inactive</span>;
    if (item.is_due) return <span className="badge badge-orange"><AlertTriangle size={10} /> Due</span>;
    return <span className="badge badge-green"><CheckCircle size={10} /> Active</span>;
}

export default function RecurringPage() {
    const [items, setItems] = useState([]);
    const [upcoming, setUpcoming] = useState([]);
    const [loading, setLoading] = useState(true);
    const [showModal, setShowModal] = useState(false);
    const [editing, setEditing] = useState(null);
    const [form, setForm] = useState(EMPTY_FORM);
    const [saving, setSaving] = useState(false);
    const [processing, setProcessing] = useState(null);

    const loadData = useCallback(async () => {
        setLoading(true);
        try {
            const [recRes, upRes] = await Promise.all([recurringAPI.list(), recurringAPI.upcoming()]);
            setItems(recRes.data.recurring || []);
            setUpcoming(upRes.data.upcoming || []);
        } catch {
            toast.error('Failed to load recurring expenses.');
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => { loadData(); }, [loadData]);

    const openCreate = () => { setEditing(null); setForm(EMPTY_FORM); setShowModal(true); };
    const openEdit = (item) => {
        setEditing(item);
        setForm({
            description: item.description, amount: item.amount, category_name: item.category_name,
            frequency: item.frequency, start_date: item.start_date || '', end_date: item.end_date || '',
            auto_add: item.auto_add,
        });
        setShowModal(true);
    };

    const handleChange = e => {
        const { name, value, type, checked } = e.target;
        setForm(p => ({ ...p, [name]: type === 'checkbox' ? checked : value }));
    };

    const handleSubmit = async e => {
        e.preventDefault();
        if (!form.description.trim()) { toast.error('Description is required.'); return; }
        if (!form.amount || parseFloat(form.amount) <= 0) { toast.error('Enter a valid amount.'); return; }
        if (!form.start_date) { toast.error('Start date is required.'); return; }

        setSaving(true);
        try {
            const payload = { ...form, amount: parseFloat(form.amount), end_date: form.end_date || null };
            if (editing) {
                await recurringAPI.update(editing.id, payload);
                toast.success('Recurring expense updated!');
            } else {
                await recurringAPI.create(payload);
                toast.success('Recurring expense created!');
            }
            setShowModal(false);
            loadData();
        } catch (err) {
            toast.error(err.response?.data?.error || 'Failed to save.');
        } finally {
            setSaving(false);
        }
    };

    const handleDelete = async (id) => {
        if (!confirm('Delete this recurring expense?')) return;
        try {
            await recurringAPI.delete(id);
            toast.success('Deleted.');
            loadData();
        } catch {
            toast.error('Failed to delete.');
        }
    };

    const handleProcess = async (id) => {
        setProcessing(id);
        try {
            await recurringAPI.process(id);
            toast.success('Expense created from recurring item!');
            loadData();
        } catch (err) {
            toast.error(err.response?.data?.error || 'Failed to process.');
        } finally {
            setProcessing(null);
        }
    };

    return (
        <div>
            {/* Header */}
            <div className="page-header">
                <div className="page-header-row">
                    <div>
                        <h1>Recurring Expenses</h1>
                        <p>Manage your subscriptions and recurring payments</p>
                    </div>
                    <button className="btn btn-primary" id="add-recurring-btn" onClick={openCreate}>
                        <Plus size={15} /> Add Recurring
                    </button>
                </div>
            </div>

            {/* Upcoming Payments Alert */}
            {upcoming.length > 0 && (
                <div className="card" style={{ marginBottom: 20, borderLeft: '3px solid var(--orange-400)', background: 'var(--bg-750)' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 12 }}>
                        <AlertTriangle size={16} color="var(--orange-400)" />
                        <span style={{ fontSize: 13, fontWeight: 700, color: 'var(--text-50)' }}>
                            {upcoming.length} payment{upcoming.length !== 1 ? 's' : ''} due within 7 days
                        </span>
                    </div>
                    <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap' }}>
                        {upcoming.map(u => (
                            <div key={u.id} style={{
                                padding: '8px 12px', background: 'var(--bg-700)', borderRadius: 8,
                                border: '1px solid var(--border-light)', fontSize: 12, display: 'flex', alignItems: 'center', gap: 10,
                            }}>
                                <span>{CATEGORY_ICONS[u.category_name] || '📁'}</span>
                                <div>
                                    <div style={{ fontWeight: 600, color: 'var(--text-100)' }}>{u.description}</div>
                                    <div style={{ color: 'var(--text-300)', fontSize: 11 }}>
                                        {formatINR(u.amount)} · Due {formatDate(u.next_due_date)}
                                    </div>
                                </div>
                                <button
                                    className="btn btn-primary btn-sm"
                                    style={{ marginLeft: 6, padding: '4px 8px', fontSize: 11 }}
                                    onClick={() => handleProcess(u.id)}
                                    disabled={processing === u.id}
                                >
                                    {processing === u.id ? <span className="spinner" style={{ width: 12, height: 12, borderWidth: 2 }} /> : <Play size={11} />}
                                    Process
                                </button>
                            </div>
                        ))}
                    </div>
                </div>
            )}

            {/* Items List */}
            {loading ? (
                <div className="loading-overlay" style={{ minHeight: 300 }}>
                    <div className="spinner spinner-lg" />
                    <span>Loading recurring expenses…</span>
                </div>
            ) : items.length === 0 ? (
                <div className="empty-state">
                    <div className="empty-state-icon">🔁</div>
                    <h3>No recurring expenses yet</h3>
                    <p>Set up subscriptions and regular payments to track them automatically</p>
                    <button className="btn btn-primary" onClick={openCreate}>
                        <Plus size={15} /> Create First Recurring Expense
                    </button>
                </div>
            ) : (
                <div style={{ overflowX: 'auto' }}>
                    <table>
                        <thead>
                            <tr>
                                <th>Description</th>
                                <th>Category</th>
                                <th style={{ textAlign: 'right' }}>Amount</th>
                                <th>Frequency</th>
                                <th>Next Due</th>
                                <th>Status</th>
                                <th style={{ textAlign: 'center' }}>Auto</th>
                                <th style={{ textAlign: 'right' }}>Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            {items.map(item => (
                                <tr key={item.id}>
                                    <td>
                                        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                                            <span style={{
                                                width: 32, height: 32, borderRadius: 8, flexShrink: 0,
                                                display: 'flex', alignItems: 'center', justifyContent: 'center',
                                                background: `${CATEGORY_COLORS[item.category_name] || '#6b7280'}18`, fontSize: 14,
                                            }}>
                                                {CATEGORY_ICONS[item.category_name] || '📁'}
                                            </span>
                                            <span style={{ fontWeight: 600, color: 'var(--text-100)', fontSize: 13 }}>{item.description}</span>
                                        </div>
                                    </td>
                                    <td><span className="badge badge-blue" style={{ fontSize: 10.5 }}>{item.category_name}</span></td>
                                    <td style={{ textAlign: 'right', fontWeight: 600, fontFamily: 'var(--font-mono)', fontSize: 13 }}>{formatINR(item.amount)}</td>
                                    <td><FrequencyBadge freq={item.frequency} /></td>
                                    <td style={{ fontSize: 12, color: 'var(--text-200)' }}>
                                        {item.next_due_date ? (
                                            <div style={{ display: 'flex', alignItems: 'center', gap: 5 }}>
                                                <Calendar size={12} />
                                                {formatDate(item.next_due_date)}
                                            </div>
                                        ) : '—'}
                                    </td>
                                    <td><StatusBadge item={item} /></td>
                                    <td style={{ textAlign: 'center' }}>
                                        {item.auto_add ? <CheckCircle size={14} color="var(--emerald-400)" /> : <span style={{ color: 'var(--text-400)' }}>—</span>}
                                    </td>
                                    <td>
                                        <div style={{ display: 'flex', gap: 6, justifyContent: 'flex-end' }}>
                                            {item.is_due && (
                                                <button
                                                    className="btn btn-primary btn-sm btn-icon"
                                                    title="Process Now"
                                                    id={`process-${item.id}`}
                                                    onClick={() => handleProcess(item.id)}
                                                    disabled={processing === item.id}
                                                >
                                                    {processing === item.id ? <span className="spinner" style={{ width: 13, height: 13, borderWidth: 2 }} /> : <Play size={13} />}
                                                </button>
                                            )}
                                            <button className="btn btn-ghost btn-sm btn-icon" title="Edit" onClick={() => openEdit(item)}>
                                                <Pencil size={13} />
                                            </button>
                                            <button className="btn btn-ghost btn-sm btn-icon" title="Delete" onClick={() => handleDelete(item.id)} style={{ color: 'var(--red-400)' }}>
                                                <Trash2 size={13} />
                                            </button>
                                        </div>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            )}

            {/* Create / Edit Modal */}
            {showModal && (
                <div className="modal-backdrop" onClick={() => setShowModal(false)}>
                    <div className="modal" onClick={e => e.stopPropagation()}>
                        <div className="modal-header">
                            <div className="modal-title">{editing ? 'Edit' : 'New'} Recurring Expense</div>
                            <button className="btn btn-ghost btn-sm btn-icon" onClick={() => setShowModal(false)}><X size={16} /></button>
                        </div>
                        <form onSubmit={handleSubmit}>
                            <div className="form-group">
                                <label className="label">Description</label>
                                <input className="input" id="recurring-desc" name="description" value={form.description} onChange={handleChange} placeholder="e.g. Netflix Subscription" required />
                            </div>

                            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14 }}>
                                <div className="form-group">
                                    <label className="label">Amount (₹)</label>
                                    <input className="input" id="recurring-amount" name="amount" type="number" step="0.01" min="0.01" value={form.amount} onChange={handleChange} placeholder="0.00" required />
                                </div>
                                <div className="form-group">
                                    <label className="label">Category</label>
                                    <div className="select-arrow">
                                        <select className="select" id="recurring-category" name="category_name" value={form.category_name} onChange={handleChange}>
                                            {EXPENSE_CATEGORIES.map(c => <option key={c} value={c}>{CATEGORY_ICONS[c] || '📁'} {c}</option>)}
                                        </select>
                                    </div>
                                </div>
                            </div>

                            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14 }}>
                                <div className="form-group">
                                    <label className="label">Frequency</label>
                                    <div className="select-arrow">
                                        <select className="select" id="recurring-freq" name="frequency" value={form.frequency} onChange={handleChange}>
                                            {FREQUENCIES.map(f => <option key={f.value} value={f.value}>{f.label}</option>)}
                                        </select>
                                    </div>
                                </div>
                                <div className="form-group">
                                    <label className="label">Start Date</label>
                                    <input className="input" id="recurring-start" name="start_date" type="date" value={form.start_date} onChange={handleChange} required />
                                </div>
                            </div>

                            <div className="form-group">
                                <label className="label">End Date (optional)</label>
                                <input className="input" id="recurring-end" name="end_date" type="date" value={form.end_date} onChange={handleChange} />
                            </div>

                            <div className="form-group" style={{ marginBottom: 20 }}>
                                <label style={{ display: 'flex', alignItems: 'center', gap: 8, cursor: 'pointer', fontSize: 13, color: 'var(--text-200)' }}>
                                    <input type="checkbox" name="auto_add" checked={form.auto_add} onChange={handleChange} style={{ width: 16, height: 16, accentColor: 'var(--emerald-500)' }} />
                                    Auto-add expense when due
                                </label>
                            </div>

                            <div style={{ display: 'flex', gap: 10, justifyContent: 'flex-end' }}>
                                <button type="button" className="btn btn-secondary" onClick={() => setShowModal(false)}>Cancel</button>
                                <button type="submit" className="btn btn-primary" id="recurring-save-btn" disabled={saving}>
                                    {saving ? <span className="spinner" style={{ width: 14, height: 14, borderWidth: 2 }} /> : editing ? 'Update' : 'Create'}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {/* Summary Stats */}
            {items.length > 0 && (
                <div className="stat-grid" style={{ marginTop: 24 }}>
                    <div className="stat-card green">
                        <div className="stat-value">{items.filter(i => i.is_active).length}</div>
                        <div className="stat-label">Active</div>
                    </div>
                    <div className="stat-card orange">
                        <div className="stat-value">{items.filter(i => i.is_due).length}</div>
                        <div className="stat-label">Due Now</div>
                    </div>
                    <div className="stat-card blue">
                        <div className="stat-value">
                            {formatINR(items.filter(i => i.is_active).reduce((s, i) => {
                                const mult = { weekly: 4.33, monthly: 1, quarterly: 1 / 3, yearly: 1 / 12 };
                                return s + i.amount * (mult[i.frequency] || 1);
                            }, 0))}
                        </div>
                        <div className="stat-label">Est. Monthly Cost</div>
                    </div>
                    <div className="stat-card red">
                        <div className="stat-value">
                            {formatINR(items.filter(i => i.is_active).reduce((s, i) => {
                                const mult = { weekly: 52, monthly: 12, quarterly: 4, yearly: 1 };
                                return s + i.amount * (mult[i.frequency] || 12);
                            }, 0))}
                        </div>
                        <div className="stat-label">Est. Yearly Cost</div>
                    </div>
                </div>
            )}
        </div>
    );
}
