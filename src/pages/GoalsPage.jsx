import { useState, useEffect } from 'react';
import { Target, Plus, CheckCircle, TrendingUp, Calendar, Trash2, Edit3, DollarSign, Sparkles } from 'lucide-react';
import { goalsAPI } from '../api';
import { formatINR } from '../utils/helpers.js';
import toast from 'react-hot-toast';

const GOAL_CATEGORIES = ['Vehicle', 'Electronics', 'Emergency Fund', 'Travel / Vacation', 'Education', 'Home', 'Investment', 'General'];
const GOAL_COLORS = ['#10b981', '#3b82f6', '#8b5cf6', '#ec4899', '#f59e0b', '#06b6d4'];

export default function GoalsPage() {
    const [goals, setGoals] = useState([]);
    const [loading, setLoading] = useState(true);
    const [modal, setModal] = useState({ open: false, goal: null });
    const [addModal, setAddModal] = useState({ open: false, goal: null, amount: '' });
    const [form, setForm] = useState({
        title: '',
        target_amount: '',
        saved_amount: '',
        target_date: '',
        category: 'General',
        color: '#10b981',
    });

    const fetchGoals = async () => {
        try {
            setLoading(true);
            const res = await goalsAPI.list();
            setGoals(res.data.goals || []);
        } catch {
            toast.error('Failed to load savings goals');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchGoals();
    }, []);

    const openCreateModal = () => {
        setForm({
            title: '',
            target_amount: '',
            saved_amount: '',
            target_date: '',
            category: 'General',
            color: '#10b981',
        });
        setModal({ open: true, goal: null });
    };

    const openEditModal = (goal) => {
        setForm({
            title: goal.title,
            target_amount: goal.target_amount,
            saved_amount: goal.saved_amount,
            target_date: goal.target_date || '',
            category: goal.category,
            color: goal.color || '#10b981',
        });
        setModal({ open: true, goal });
    };

    const handleSave = async (e) => {
        e.preventDefault();
        try {
            if (modal.goal) {
                await goalsAPI.update(modal.goal.id, form);
                toast.success('Goal updated successfully!');
            } else {
                await goalsAPI.create(form);
                toast.success('Savings Goal created! 🎯');
            }
            setModal({ open: false, goal: null });
            fetchGoals();
        } catch (err) {
            toast.error(err.response?.data?.error || 'Failed to save goal');
        }
    };

    const handleDelete = async (id) => {
        if (!window.confirm('Are you sure you want to delete this goal?')) return;
        try {
            await goalsAPI.delete(id);
            toast.success('Goal deleted');
            fetchGoals();
        } catch {
            toast.error('Failed to delete goal');
        }
    };

    const handleAddSavings = async (e) => {
        e.preventDefault();
        if (!addModal.amount || isNaN(addModal.amount) || Number(addModal.amount) <= 0) {
            toast.error('Enter a valid amount');
            return;
        }
        try {
            await goalsAPI.update(addModal.goal.id, { add_amount: Number(addModal.amount) });
            toast.success(`Added ₹${Number(addModal.amount).toLocaleString('en-IN')} to ${addModal.goal.title}! 🎉`);
            setAddModal({ open: false, goal: null, amount: '' });
            fetchGoals();
        } catch {
            toast.error('Failed to update savings');
        }
    };

    // Calculate aggregated stats
    const totalTarget = goals.reduce((acc, g) => acc + g.target_amount, 0);
    const totalSaved = goals.reduce((acc, g) => acc + g.saved_amount, 0);
    const overallPct = totalTarget > 0 ? Math.round((totalSaved / totalTarget) * 100) : 0;
    const completedGoals = goals.filter((g) => g.is_completed).length;

    return (
        <div>
            {/* Page Header */}
            <div className="page-header">
                <div className="page-header-row">
                    <div>
                        <h1>Savings Goals</h1>
                        <p>Set targets for your dream bike, vacation, emergency fund or gadgets</p>
                    </div>
                    <button className="btn btn-primary" onClick={openCreateModal}>
                        <Plus size={16} /> New Goal
                    </button>
                </div>
            </div>

            {/* Overview Stats Bar */}
            <div className="stats-grid" style={{ marginBottom: 24 }}>
                <div className="card stat-card">
                    <div className="stat-label">Total Saved Across Goals</div>
                    <div className="stat-value" style={{ color: 'var(--emerald-400)' }}>
                        {formatINR(totalSaved)}
                    </div>
                    <div className="stat-sub">Target: {formatINR(totalTarget)}</div>
                </div>
                <div className="card stat-card">
                    <div className="stat-label">Overall Progress</div>
                    <div className="stat-value" style={{ color: 'var(--blue-400)' }}>
                        {overallPct}%
                    </div>
                    <div className="stat-sub">{completedGoals} of {goals.length} Goals Achieved</div>
                </div>
                <div className="card stat-card">
                    <div className="stat-label">Active Goals</div>
                    <div className="stat-value">{goals.length - completedGoals}</div>
                    <div className="stat-sub">Keep saving consistently!</div>
                </div>
            </div>

            {/* Goals Grid */}
            {loading ? (
                <div style={{ textAlign: 'center', padding: '60px 0', color: 'var(--text-300)' }}>
                    <div className="spinner" style={{ margin: '0 auto 12px' }} />
                    Loading your savings goals...
                </div>
            ) : goals.length === 0 ? (
                <div className="card" style={{ textAlign: 'center', padding: '60px 20px' }}>
                    <Target size={48} color="var(--emerald-400)" style={{ margin: '0 auto 16px', opacity: 0.8 }} />
                    <h3 style={{ fontSize: 18, color: 'var(--text-100)', marginBottom: 8 }}>No Savings Goals Yet!</h3>
                    <p style={{ color: 'var(--text-300)', fontSize: 13.5, maxWidth: 450, margin: '0 auto 20px' }}>
                        Create your first goal to save for your dream bike, vacation, new phone, or an emergency fund.
                    </p>
                    <button className="btn btn-primary" onClick={openCreateModal}>
                        <Plus size={16} /> Create Your First Goal
                    </button>
                </div>
            ) : (
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))', gap: 20 }}>
                    {goals.map((g) => {
                        const isDone = g.is_completed || g.saved_amount >= g.target_amount;
                        return (
                            <div
                                key={g.id}
                                className="card"
                                style={{
                                    borderTop: `4px solid ${g.color || 'var(--emerald-500)'}`,
                                    position: 'relative',
                                    display: 'flex',
                                    flexDirection: 'column',
                                    justifyContent: 'space-between',
                                }}
                            >
                                <div>
                                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 12 }}>
                                        <div>
                                            <span className="badge" style={{ background: 'var(--bg-750)', fontSize: 11, marginBottom: 6 }}>
                                                {g.category}
                                            </span>
                                            <h3 style={{ fontSize: 17, fontWeight: 700, color: 'var(--text-50)', margin: '4px 0 2px' }}>
                                                {g.title}
                                            </h3>
                                            {g.target_date && (
                                                <div style={{ fontSize: 11.5, color: 'var(--text-300)', display: 'flex', alignItems: 'center', gap: 4, marginTop: 4 }}>
                                                    <Calendar size={12} /> Target: {new Date(g.target_date).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}
                                                </div>
                                            )}
                                        </div>

                                        <div style={{ display: 'flex', gap: 4 }}>
                                            <button className="btn btn-ghost btn-icon" onClick={() => openEditModal(g)}>
                                                <Edit3 size={14} />
                                            </button>
                                            <button className="btn btn-danger btn-icon" onClick={() => handleDelete(g.id)}>
                                                <Trash2 size={14} />
                                            </button>
                                        </div>
                                    </div>

                                    {/* Amount Details */}
                                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', margin: '14px 0 8px' }}>
                                        <div>
                                            <div style={{ fontSize: 11, color: 'var(--text-300)', textTransform: 'uppercase' }}>Saved</div>
                                            <div style={{ fontSize: 20, fontWeight: 800, color: g.color || 'var(--emerald-400)' }}>
                                                {formatINR(g.saved_amount)}
                                            </div>
                                        </div>
                                        <div style={{ textAlign: 'right' }}>
                                            <div style={{ fontSize: 11, color: 'var(--text-300)', textTransform: 'uppercase' }}>Target</div>
                                            <div style={{ fontSize: 15, fontWeight: 600, color: 'var(--text-200)' }}>
                                                {formatINR(g.target_amount)}
                                            </div>
                                        </div>
                                    </div>

                                    {/* Progress Bar */}
                                    <div style={{ background: 'var(--bg-800)', borderRadius: 6, height: 9, overflow: 'hidden', margin: '8px 0 10px' }}>
                                        <div
                                            style={{
                                                width: `${Math.min(100, g.percentage)}%`,
                                                background: isDone ? 'var(--emerald-500)' : g.color || 'var(--emerald-400)',
                                                height: '100%',
                                                borderRadius: 6,
                                                transition: 'width 0.4s ease',
                                            }}
                                        />
                                    </div>

                                    <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 12, color: 'var(--text-300)', marginBottom: 16 }}>
                                        <span>{g.percentage}% reached</span>
                                        <span>{isDone ? '🎉 Goal Completed!' : `₹${g.remaining.toLocaleString('en-IN')} remaining`}</span>
                                    </div>
                                </div>

                                {/* Quick Add Money CTA */}
                                <button
                                    className="btn btn-secondary"
                                    style={{ width: '100%', justifyContent: 'center', borderColor: 'var(--border-light)' }}
                                    onClick={() => setAddModal({ open: true, goal: g, amount: '' })}
                                >
                                    <Plus size={14} /> Deposit / Add Savings
                                </button>
                            </div>
                        );
                    })}
                </div>
            )}

            {/* Create / Edit Goal Modal */}
            {modal.open && (
                <div className="modal-backdrop">
                    <div className="modal" style={{ maxWidth: 460 }}>
                        <div className="modal-header">
                            <h2>{modal.goal ? 'Edit Savings Goal' : 'Create New Savings Goal'}</h2>
                            <button className="btn btn-ghost btn-icon" onClick={() => setModal({ open: false, goal: null })}>
                                ✕
                            </button>
                        </div>
                        <form onSubmit={handleSave}>
                            <div className="modal-body">
                                <div className="form-group">
                                    <label className="label">Goal Title *</label>
                                    <input
                                        className="input"
                                        type="text"
                                        placeholder="e.g. Royal Enfield Hunter 350, iPhone 16, Goa Trip"
                                        value={form.title}
                                        onChange={(e) => setForm({ ...form, title: e.target.value })}
                                        required
                                    />
                                </div>

                                <div className="form-row">
                                    <div className="form-group">
                                        <label className="label">Target Amount (₹) *</label>
                                        <input
                                            className="input"
                                            type="number"
                                            placeholder="e.g. 150000"
                                            value={form.target_amount}
                                            onChange={(e) => setForm({ ...form, target_amount: e.target.value })}
                                            required
                                            min="1"
                                        />
                                    </div>
                                    <div className="form-group">
                                        <label className="label">Already Saved (₹)</label>
                                        <input
                                            className="input"
                                            type="number"
                                            placeholder="0"
                                            value={form.saved_amount}
                                            onChange={(e) => setForm({ ...form, saved_amount: e.target.value })}
                                            min="0"
                                        />
                                    </div>
                                </div>

                                <div className="form-row">
                                    <div className="form-group">
                                        <label className="label">Category</label>
                                        <select
                                            className="select"
                                            value={form.category}
                                            onChange={(e) => setForm({ ...form, category: e.target.value })}
                                        >
                                            {GOAL_CATEGORIES.map((c) => (
                                                <option key={c} value={c}>{c}</option>
                                            ))}
                                        </select>
                                    </div>
                                    <div className="form-group">
                                        <label className="label">Target Date (Optional)</label>
                                        <input
                                            className="input"
                                            type="date"
                                            value={form.target_date}
                                            onChange={(e) => setForm({ ...form, target_date: e.target.value })}
                                        />
                                    </div>
                                </div>

                                <div className="form-group" style={{ marginBottom: 0 }}>
                                    <label className="label">Card Accent Color</label>
                                    <div style={{ display: 'flex', gap: 10, marginTop: 6 }}>
                                        {GOAL_COLORS.map((col) => (
                                            <div
                                                key={col}
                                                onClick={() => setForm({ ...form, color: col })}
                                                style={{
                                                    width: 30,
                                                    height: 30,
                                                    borderRadius: '50%',
                                                    background: col,
                                                    cursor: 'pointer',
                                                    border: form.color === col ? '3px solid #fff' : '2px solid transparent',
                                                    transform: form.color === col ? 'scale(1.15)' : 'none',
                                                    transition: 'all 0.2s',
                                                }}
                                            />
                                        ))}
                                    </div>
                                </div>
                            </div>
                            <div className="modal-footer">
                                <button type="button" className="btn btn-secondary" onClick={() => setModal({ open: false, goal: null })}>
                                    Cancel
                                </button>
                                <button type="submit" className="btn btn-primary">
                                    {modal.goal ? 'Update Goal' : 'Create Goal 🎯'}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {/* Quick Deposit Modal */}
            {addModal.open && (
                <div className="modal-backdrop">
                    <div className="modal" style={{ maxWidth: 380 }}>
                        <div className="modal-header">
                            <h2>Deposit to {addModal.goal?.title}</h2>
                            <button className="btn btn-ghost btn-icon" onClick={() => setAddModal({ open: false, goal: null, amount: '' })}>
                                ✕
                            </button>
                        </div>
                        <form onSubmit={handleAddSavings}>
                            <div className="modal-body">
                                <p style={{ fontSize: 13, color: 'var(--text-300)', marginBottom: 16 }}>
                                    How much money did you set aside for this goal today?
                                </p>
                                <div className="form-group" style={{ marginBottom: 0 }}>
                                    <label className="label">Deposit Amount (₹) *</label>
                                    <input
                                        className="input"
                                        type="number"
                                        placeholder="e.g. 500 or 2000"
                                        value={addModal.amount}
                                        onChange={(e) => setAddModal({ ...addModal, amount: e.target.value })}
                                        required
                                        min="1"
                                        autoFocus
                                    />
                                </div>
                            </div>
                            <div className="modal-footer">
                                <button type="button" className="btn btn-secondary" onClick={() => setAddModal({ open: false, goal: null, amount: '' })}>
                                    Cancel
                                </button>
                                <button type="submit" className="btn btn-primary">
                                    Add to Goal
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
}
