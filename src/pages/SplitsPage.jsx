import { useState, useEffect } from 'react';
import { Users, Plus, CheckCircle, Clock, Trash2, ArrowUpRight, DollarSign, Split } from 'lucide-react';
import { splitsAPI } from '../api';
import { formatINR } from '../utils/helpers.js';
import toast from 'react-hot-toast';

export default function SplitsPage() {
    const [splits, setSplits] = useState([]);
    const [totalPending, setTotalPending] = useState(0);
    const [loading, setLoading] = useState(true);
    const [modal, setModal] = useState(false);
    const [form, setForm] = useState({
        title: '',
        total_amount: '',
        split_date: new Date().toISOString().slice(0, 10),
        category: 'Food',
        friends: '',
        notes: '',
    });

    const fetchSplits = async () => {
        try {
            setLoading(true);
            const res = await splitsAPI.list();
            setSplits(res.data.splits || []);
            setTotalPending(res.data.total_pending_to_receive || 0);
        } catch {
            toast.error('Failed to load expense splits');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchSplits();
    }, []);

    const handleCreate = async (e) => {
        e.preventDefault();
        if (!form.friends.trim()) {
            toast.error('Enter at least one friend name');
            return;
        }
        try {
            await splitsAPI.create(form);
            toast.success('Bill split created! 🍕');
            setModal(false);
            setForm({
                title: '',
                total_amount: '',
                split_date: new Date().toISOString().slice(0, 10),
                category: 'Food',
                friends: '',
                notes: '',
            });
            fetchSplits();
        } catch (err) {
            toast.error(err.response?.data?.error || 'Failed to split bill');
        }
    };

    const handleToggleSettle = async (memberId, name, isSettled) => {
        try {
            await splitsAPI.toggleSettle(memberId);
            toast.success(isSettled ? `Marked ${name}'s share as pending` : `Marked ${name}'s share as settled! ✅`);
            fetchSplits();
        } catch {
            toast.error('Failed to update status');
        }
    };

    const handleDelete = async (id) => {
        if (!window.confirm('Delete this split bill?')) return;
        try {
            await splitsAPI.delete(id);
            toast.success('Split bill deleted');
            fetchSplits();
        } catch {
            toast.error('Failed to delete');
        }
    };

    return (
        <div>
            {/* Page Header */}
            <div className="page-header">
                <div className="page-header-row">
                    <div>
                        <h1>Split Expenses</h1>
                        <p>Split group dinners, road trips, and room bills with friends (Splitwise style)</p>
                    </div>
                    <button className="btn btn-primary" onClick={() => setModal(true)}>
                        <Plus size={16} /> Split a Bill
                    </button>
                </div>
            </div>

            {/* Overview Stat */}
            <div className="stats-grid" style={{ marginBottom: 24 }}>
                <div className="card stat-card">
                    <div className="stat-label">Total You are Owed (To Receive)</div>
                    <div className="stat-value" style={{ color: totalPending > 0 ? 'var(--emerald-400)' : 'var(--text-200)' }}>
                        {formatINR(totalPending)}
                    </div>
                    <div className="stat-sub">From unsettled friends across all group bills</div>
                </div>
                <div className="card stat-card">
                    <div className="stat-label">Total Shared Bills</div>
                    <div className="stat-value">{splits.length}</div>
                    <div className="stat-sub">Tracked and managed</div>
                </div>
            </div>

            {/* Splits List */}
            {loading ? (
                <div style={{ textAlign: 'center', padding: '60px 0', color: 'var(--text-300)' }}>
                    <div className="spinner" style={{ margin: '0 auto 12px' }} />
                    Loading your splits...
                </div>
            ) : splits.length === 0 ? (
                <div className="card" style={{ textAlign: 'center', padding: '60px 20px' }}>
                    <Users size={48} color="var(--emerald-400)" style={{ margin: '0 auto 16px', opacity: 0.8 }} />
                    <h3 style={{ fontSize: 18, color: 'var(--text-100)', marginBottom: 8 }}>No Split Bills Yet</h3>
                    <p style={{ color: 'var(--text-300)', fontSize: 13.5, maxWidth: 450, margin: '0 auto 20px' }}>
                        Went out for dinner or booked a cab with friends? Create a split bill and track who has paid!
                    </p>
                    <button className="btn btn-primary" onClick={() => setModal(true)}>
                        <Plus size={16} /> Split Your First Bill
                    </button>
                </div>
            ) : (
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(360px, 1fr))', gap: 20 }}>
                    {splits.map((s) => (
                        <div key={s.id} className="card" style={{ display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
                            <div>
                                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 12 }}>
                                    <div>
                                        <span className="badge" style={{ background: 'var(--bg-750)', fontSize: 11, marginBottom: 4 }}>
                                            {s.category}
                                        </span>
                                        <h3 style={{ fontSize: 17, fontWeight: 700, color: 'var(--text-50)', margin: '4px 0 2px' }}>
                                            {s.title}
                                        </h3>
                                        <div style={{ fontSize: 11.5, color: 'var(--text-300)' }}>
                                            {new Date(s.split_date).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}
                                        </div>
                                    </div>

                                    <div style={{ textAlign: 'right' }}>
                                        <div style={{ fontSize: 11, color: 'var(--text-300)', textTransform: 'uppercase' }}>Total Bill</div>
                                        <div style={{ fontSize: 18, fontWeight: 800, color: 'var(--text-100)' }}>
                                            {formatINR(s.total_amount)}
                                        </div>
                                        <button className="btn btn-danger btn-icon" style={{ marginTop: 6 }} onClick={() => handleDelete(s.id)}>
                                            <Trash2 size={13} />
                                        </button>
                                    </div>
                                </div>

                                {/* Friends Share List */}
                                <div style={{ background: 'var(--bg-750)', borderRadius: 8, padding: '10px 12px', margin: '14px 0 10px' }}>
                                    <div style={{ fontSize: 11, color: 'var(--text-300)', textTransform: 'uppercase', marginBottom: 8, fontWeight: 600 }}>
                                        Members &amp; Shares (Equal Split)
                                    </div>
                                    <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                                        {s.members.map((m) => {
                                            const isYou = m.friend_name.toLowerCase() === 'you';
                                            return (
                                                <div
                                                    key={m.id}
                                                    style={{
                                                        display: 'flex',
                                                        justifyContent: 'space-between',
                                                        alignItems: 'center',
                                                        fontSize: 13,
                                                        padding: '4px 0',
                                                        borderBottom: '1px solid var(--border-light)',
                                                    }}
                                                >
                                                    <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                                                        <span style={{ fontWeight: isYou ? 700 : 500, color: isYou ? 'var(--emerald-400)' : 'var(--text-100)' }}>
                                                            {m.friend_name} {isYou && '(Payer)'}
                                                        </span>
                                                    </div>

                                                    <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                                                        <span style={{ fontWeight: 600, color: 'var(--text-200)' }}>
                                                            {formatINR(m.share_amount)}
                                                        </span>

                                                        {isYou ? (
                                                            <span className="badge badge-green" style={{ fontSize: 10 }}>Paid</span>
                                                        ) : (
                                                            <button
                                                                className={`badge ${m.is_settled ? 'badge-green' : 'badge-orange'}`}
                                                                style={{ cursor: 'pointer', border: 'none', fontSize: 10.5 }}
                                                                onClick={() => handleToggleSettle(m.id, m.friend_name, m.is_settled)}
                                                            >
                                                                {m.is_settled ? '✓ Settled' : '⏳ Pending (Click to Settle)'}
                                                            </button>
                                                        )}
                                                    </div>
                                                </div>
                                            );
                                        })}
                                    </div>
                                </div>
                            </div>

                            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 12, color: 'var(--text-300)', marginTop: 8 }}>
                                <span>Status: {s.is_fully_settled ? '🎉 All Settled' : `${s.settled_count} of ${s.member_count} Settled`}</span>
                                {s.pending_to_receive > 0 && (
                                    <span style={{ color: 'var(--amber-400)', fontWeight: 600 }}>
                                        To Receive: {formatINR(s.pending_to_receive)}
                                    </span>
                                )}
                            </div>
                        </div>
                    ))}
                </div>
            )}

            {/* Split Bill Modal */}
            {modal && (
                <div className="modal-backdrop">
                    <div className="modal" style={{ maxWidth: 440 }}>
                        <div className="modal-header">
                            <h2>Split an Expense</h2>
                            <button className="btn btn-ghost btn-icon" onClick={() => setModal(false)}>✕</button>
                        </div>
                        <form onSubmit={handleCreate}>
                            <div className="modal-body">
                                <div className="form-group">
                                    <label className="label">Title / Event *</label>
                                    <input
                                        className="input"
                                        placeholder="e.g. Dinner at Paradise, Goa Airbnb, Fuel for Trip"
                                        value={form.title}
                                        onChange={(e) => setForm({ ...form, title: e.target.value })}
                                        required
                                    />
                                </div>

                                <div className="form-row">
                                    <div className="form-group">
                                        <label className="label">Total Bill Amount (₹) *</label>
                                        <input
                                            className="input"
                                            type="number"
                                            placeholder="e.g. 2400"
                                            value={form.total_amount}
                                            onChange={(e) => setForm({ ...form, total_amount: e.target.value })}
                                            required
                                            min="1"
                                        />
                                    </div>
                                    <div className="form-group">
                                        <label className="label">Category</label>
                                        <select
                                            className="select"
                                            value={form.category}
                                            onChange={(e) => setForm({ ...form, category: e.target.value })}
                                        >
                                            <option value="Food">Food / Dining</option>
                                            <option value="Travel">Travel / Cab</option>
                                            <option value="Rent">Rent / Stay</option>
                                            <option value="Entertainment">Entertainment</option>
                                            <option value="General">General</option>
                                        </select>
                                    </div>
                                </div>

                                <div className="form-group">
                                    <label className="label">Friends to Split With (Comma separated) *</label>
                                    <input
                                        className="input"
                                        placeholder="e.g. Ramesh, Suresh, Priya"
                                        value={form.friends}
                                        onChange={(e) => setForm({ ...form, friends: e.target.value })}
                                        required
                                    />
                                    <div style={{ fontSize: 11, color: 'var(--text-300)', marginTop: 4 }}>
                                        Note: 'You' will automatically be included as the person who paid the total bill.
                                    </div>
                                </div>
                            </div>
                            <div className="modal-footer">
                                <button type="button" className="btn btn-secondary" onClick={() => setModal(false)}>
                                    Cancel
                                </button>
                                <button type="submit" className="btn btn-primary">
                                    Split Bill Equally 🍕
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
}
