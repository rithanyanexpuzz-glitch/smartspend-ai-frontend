import { useState, useEffect, useCallback } from 'react';
import { Plus, Trash2, Edit3, X, Search, Brain, CheckCircle } from 'lucide-react';
import { expensesAPI } from '../api';
import { formatINR, formatDate, currentMonth, CATEGORY_COLORS, CATEGORY_ICONS } from '../utils/helpers.js';
import toast from 'react-hot-toast';

const EXPENSE_CATEGORIES = ['Food', 'Transport', 'Shopping', 'Bills', 'Healthcare', 'Entertainment', 'Education', 'Rent', 'Insurance', 'Uncategorized'];
const MONTHS_BACK = Array.from({ length: 12 }, (_, i) => {
    const d = new Date(); d.setMonth(d.getMonth() - i);
    const v = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`;
    const lbl = d.toLocaleDateString('en-IN', { month: 'short', year: 'numeric' });
    return { value: v, label: lbl };
});

function ExpenseModal({ open, onClose, onSaved, initial }) {
    const isEdit = !!initial;
    const [form, setForm] = useState({
        description: '', amount: '', expense_date: new Date().toISOString().slice(0, 10),
        category_name: 'Auto-detect', notes: '',
        ...(initial || {})
    });
    const [loading, setLoading] = useState(false);
    const [predicting, setPredicting] = useState(false);
    const [prediction, setPrediction] = useState(null);

    useEffect(() => {
        if (open) {
            setForm({
                description: '', amount: '', expense_date: new Date().toISOString().slice(0, 10),
                category_name: 'Auto-detect', notes: '',
                ...(initial || {})
            });
            setPrediction(null);
        }
    }, [open, initial]);

    const handlePredict = async () => {
        if (!form.description.trim()) return;
        setPredicting(true);
        try {
            const { data } = await expensesAPI.predict(form.description);
            setPrediction(data);
        } catch { /* ignore */ }
        finally { setPredicting(false); }
    };

    const handleSubmit = async e => {
        e.preventDefault();
        setLoading(true);
        try {
            const payload = { ...form, amount: parseFloat(form.amount) };
            if (isEdit) {
                await expensesAPI.update(initial.id, payload);
                toast.success('Expense updated!');
            } else {
                const { data } = await expensesAPI.create(payload);
                toast.success('Expense added!');
                if (data.budget_alert === 'over budget') toast.error('⚠️ You exceeded your budget!');
                else if (data.budget_alert === 'near limit') toast('📊 Budget near limit (80%)', { icon: '⚠️' });
            }
            onSaved();
            onClose();
        } catch (err) {
            toast.error(err.response?.data?.error || 'Failed to save expense');
        } finally { setLoading(false); }
    };

    if (!open) return null;
    return (
        <div className="modal-backdrop" onClick={e => e.target === e.currentTarget && onClose()}>
            <div className="modal">
                <div className="modal-header">
                    <div className="modal-title">{isEdit ? 'Edit Expense' : 'Add Expense'}</div>
                    <button className="btn btn-ghost btn-icon" onClick={onClose} id="expense-modal-close"><X size={16} /></button>
                </div>
                <form onSubmit={handleSubmit}>
                    <div className="modal-body">
                        <div className="form-group">
                            <label className="label">Description *</label>
                            <div style={{ display: 'flex', gap: 8 }}>
                                <input className="input" id="exp-description" placeholder="e.g. Grocery shopping at BigBazaar" value={form.description}
                                    onChange={e => setForm(p => ({ ...p, description: e.target.value }))} required style={{ flex: 1 }} />
                                <button type="button" className="btn btn-secondary btn-sm" onClick={handlePredict} disabled={predicting || !form.description.trim()} title="AI predict category" id="exp-predict-btn">
                                    {predicting ? <span className="spinner" style={{ width: 14, height: 14, borderWidth: 2 }} /> : <Brain size={14} />}
                                </button>
                            </div>
                            {prediction && (
                                <div style={{ marginTop: 8, display: 'flex', gap: 8, flexWrap: 'wrap' }}>
                                    {[{ label: '🧠 TF-IDF', cat: prediction.tfidf_nb?.category, conf: prediction.tfidf_nb?.confidence },
                                    { label: '📖 Keyword', cat: prediction.keyword?.category, conf: prediction.keyword?.confidence }
                                    ].map(({ label, cat, conf }) => cat ? (
                                        <button key={label} type="button" className="btn btn-secondary btn-sm" style={{ fontSize: 11 }}
                                            onClick={() => setForm(p => ({ ...p, category_name: cat }))} id={`pred-${cat}`}>
                                            <CheckCircle size={11} /> {label}: {cat} ({(conf * 100).toFixed(0)}%)
                                        </button>
                                    ) : null)}
                                </div>
                            )}
                        </div>
                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
                            <div className="form-group">
                                <label className="label">Amount (₹) *</label>
                                <input className="input" id="exp-amount" type="number" step="0.01" min="0.01" placeholder="0.00" value={form.amount}
                                    onChange={e => setForm(p => ({ ...p, amount: e.target.value }))} required />
                            </div>
                            <div className="form-group">
                                <label className="label">Date *</label>
                                <input className="input" id="exp-date" type="date" value={form.expense_date}
                                    onChange={e => setForm(p => ({ ...p, expense_date: e.target.value }))} required />
                            </div>
                        </div>
                        <div className="form-group">
                            <label className="label">Category</label>
                            <div className="select-arrow">
                                <select className="select" id="exp-category" value={form.category_name}
                                    onChange={e => setForm(p => ({ ...p, category_name: e.target.value }))}>
                                    <option value="Auto-detect">🤖 Auto-detect (AI)</option>
                                    {EXPENSE_CATEGORIES.map(c => <option key={c} value={c}>{CATEGORY_ICONS[c] || '📁'} {c}</option>)}
                                </select>
                            </div>
                        </div>
                        <div className="form-group" style={{ marginBottom: 0 }}>
                            <label className="label">Notes</label>
                            <textarea className="textarea" id="exp-notes" placeholder="Optional notes…" value={form.notes || ''}
                                onChange={e => setForm(p => ({ ...p, notes: e.target.value }))} style={{ minHeight: 60 }} />
                        </div>
                    </div>
                    <div className="modal-footer">
                        <button type="button" className="btn btn-secondary" onClick={onClose}>Cancel</button>
                        <button type="submit" id="exp-submit" className="btn btn-primary" disabled={loading}>
                            {loading ? <span className="spinner" /> : (isEdit ? 'Save Changes' : 'Add Expense')}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}

function DeleteConfirm({ open, onClose, onConfirm, expense }) {
    if (!open) return null;
    return (
        <div className="modal-backdrop" onClick={e => e.target === e.currentTarget && onClose()}>
            <div className="modal" style={{ maxWidth: 380 }}>
                <div className="modal-header"><div className="modal-title">Delete Expense</div></div>
                <div className="modal-body">
                    <p style={{ fontSize: 14, color: 'var(--text-200)' }}>
                        Are you sure you want to delete <strong style={{ color: 'var(--text-50)' }}>"{expense?.description}"</strong>? This action cannot be undone.
                    </p>
                </div>
                <div className="modal-footer">
                    <button className="btn btn-secondary" onClick={onClose}>Cancel</button>
                    <button className="btn btn-danger" id="confirm-delete-expense" onClick={onConfirm}>Delete</button>
                </div>
            </div>
        </div>
    );
}

export default function ExpensesPage() {
    const [expenses, setExpenses] = useState([]);
    const [total, setTotal] = useState(0);
    const [loading, setLoading] = useState(true);
    const [modal, setModal] = useState({ open: false, expense: null });
    const [deleteModal, setDeleteModal] = useState({ open: false, expense: null });
    const [filters, setFilters] = useState({ month: currentMonth(), category: '', search: '' });
    const [page, setPage] = useState(1);
    const [pages, setPages] = useState(1);

    const load = useCallback(async () => {
        setLoading(true);
        try {
            const params = { page, per_page: 20, ...filters };
            if (!params.category) delete params.category;
            if (!params.search) delete params.search;
            const { data } = await expensesAPI.list(params);
            setExpenses(data.expenses);
            setTotal(data.total);
            setPages(data.pages);
        } catch { toast.error('Failed to load expenses'); }
        finally { setLoading(false); }
    }, [filters, page]);

    useEffect(() => { load(); }, [load]);

    const handleDelete = async () => {
        try {
            await expensesAPI.delete(deleteModal.expense.id);
            toast.success('Expense deleted');
            setDeleteModal({ open: false, expense: null });
            load();
        } catch { toast.error('Failed to delete expense'); }
    };

    return (
        <div>
            <div className="page-header">
                <div className="page-header-row">
                    <div>
                        <h1>Expenses</h1>
                        <p>{total} records found</p>
                    </div>
                    <button className="btn btn-primary" id="add-expense-btn" onClick={() => setModal({ open: true, expense: null })}>
                        <Plus size={16} /> Add Expense
                    </button>
                </div>
            </div>

            {/* Filters */}
            <div className="card" style={{ marginBottom: 20, padding: '14px 20px' }}>
                <div className="filters-bar">
                    <div style={{ position: 'relative', flex: '1 1 200px' }}>
                        <Search size={14} style={{ position: 'absolute', left: 10, top: '50%', transform: 'translateY(-50%)', color: 'var(--text-300)' }} />
                        <input className="input" id="expense-search" placeholder="Search expenses…" value={filters.search}
                            onChange={e => { setFilters(p => ({ ...p, search: e.target.value })); setPage(1); }}
                            style={{ paddingLeft: 32 }} />
                    </div>
                    <div className="select-arrow" style={{ flex: '0 0 160px' }}>
                        <select className="select" id="expense-month-filter" value={filters.month}
                            onChange={e => { setFilters(p => ({ ...p, month: e.target.value })); setPage(1); }}>
                            {MONTHS_BACK.map(m => <option key={m.value} value={m.value}>{m.label}</option>)}
                        </select>
                    </div>
                    <div className="select-arrow" style={{ flex: '0 0 160px' }}>
                        <select className="select" id="expense-cat-filter" value={filters.category}
                            onChange={e => { setFilters(p => ({ ...p, category: e.target.value })); setPage(1); }}>
                            <option value="">All Categories</option>
                            {EXPENSE_CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
                        </select>
                    </div>
                    {(filters.search || filters.category) && (
                        <button className="btn btn-ghost btn-sm" onClick={() => { setFilters(p => ({ ...p, search: '', category: '' })); setPage(1); }}>
                            <X size={13} /> Clear
                        </button>
                    )}
                </div>
            </div>

            {/* Table */}
            <div className="card" style={{ padding: 0 }}>
                <div className="table-wrap">
                    {loading ? (
                        <div className="loading-overlay" style={{ minHeight: 200 }}>
                            <div className="spinner" /> Loading…
                        </div>
                    ) : expenses.length === 0 ? (
                        <div className="empty-state">
                            <div className="empty-state-icon">💳</div>
                            <h3>No expenses found</h3>
                            <p>Add your first expense or adjust filters</p>
                            <button className="btn btn-primary btn-sm" style={{ marginTop: 12 }} onClick={() => setModal({ open: true, expense: null })}>
                                <Plus size={14} /> Add Expense
                            </button>
                        </div>
                    ) : (
                        <table>
                            <thead>
                                <tr>
                                    <th>Date</th>
                                    <th>Description</th>
                                    <th>Category</th>
                                    <th style={{ textAlign: 'right' }}>Amount</th>
                                    <th>AI Prediction</th>
                                    <th style={{ textAlign: 'center' }}>Actions</th>
                                </tr>
                            </thead>
                            <tbody>
                                {expenses.map(e => (
                                    <tr key={e.id}>
                                        <td style={{ color: 'var(--text-200)', fontSize: 12, whiteSpace: 'nowrap' }}>{formatDate(e.expense_date)}</td>
                                        <td>
                                            <div style={{ fontSize: 13.5, fontWeight: 500 }}>{e.description}</div>
                                            {e.notes && <div style={{ fontSize: 11, color: 'var(--text-300)', marginTop: 2 }}>{e.notes.slice(0, 50)}</div>}
                                        </td>
                                        <td>
                                            <span className="cat-chip" style={{ background: `${CATEGORY_COLORS[e.category_name]}22`, color: CATEGORY_COLORS[e.category_name] || 'var(--text-200)' }}>
                                                {CATEGORY_ICONS[e.category_name] || '📁'} {e.category_name}
                                            </span>
                                        </td>
                                        <td style={{ textAlign: 'right' }}><span className="amount-expense">{formatINR(e.amount)}</span></td>
                                        <td>
                                            {e.predicted_category && (
                                                <div style={{ fontSize: 11 }}>
                                                    <span style={{ color: e.user_corrected ? 'var(--yellow-400)' : 'var(--emerald-400)' }}>
                                                        {e.user_corrected ? '✏️ Corrected' : '🤖 ' + e.predicted_category}
                                                    </span>
                                                    {e.prediction_confidence && (
                                                        <span style={{ color: 'var(--text-300)', marginLeft: 4 }}>
                                                            {(e.prediction_confidence * 100).toFixed(0)}%
                                                        </span>
                                                    )}
                                                </div>
                                            )}
                                        </td>
                                        <td>
                                            <div style={{ display: 'flex', gap: 6, justifyContent: 'center' }}>
                                                <button className="btn btn-ghost btn-icon" title="Edit" id={`edit-expense-${e.id}`}
                                                    onClick={() => setModal({ open: true, expense: e })}>
                                                    <Edit3 size={14} />
                                                </button>
                                                <button className="btn btn-danger btn-icon" title="Delete" id={`del-expense-${e.id}`}
                                                    onClick={() => setDeleteModal({ open: true, expense: e })}>
                                                    <Trash2 size={14} />
                                                </button>
                                            </div>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    )}
                </div>

                {/* Pagination */}
                {pages > 1 && (
                    <div style={{ display: 'flex', gap: 8, justifyContent: 'center', padding: '14px 20px', borderTop: '1px solid var(--border-light)' }}>
                        {Array.from({ length: pages }, (_, i) => i + 1).map(p => (
                            <button key={p} className={`btn btn-sm ${p === page ? 'btn-primary' : 'btn-secondary'}`} onClick={() => setPage(p)}>{p}</button>
                        ))}
                    </div>
                )}
            </div>

            <ExpenseModal open={modal.open} onClose={() => setModal({ open: false, expense: null })} onSaved={load} initial={modal.expense} />
            <DeleteConfirm open={deleteModal.open} onClose={() => setDeleteModal({ open: false, expense: null })} onConfirm={handleDelete} expense={deleteModal.expense} />
        </div>
    );
}
