import { useState, useEffect } from 'react';
import { Plus, Mic, MicOff, Sparkles, X, CheckCircle } from 'lucide-react';
import { expensesAPI, advisorAPI } from '../api';
import toast from 'react-hot-toast';

const EXPENSE_CATEGORIES = ['Food', 'Transport', 'Shopping', 'Bills', 'Healthcare', 'Entertainment', 'Education', 'Rent', 'Insurance', 'Uncategorized'];

export default function QuickAddFAB() {
    const [open, setOpen] = useState(false);
    const [form, setForm] = useState({
        description: '',
        amount: '',
        expense_date: new Date().toISOString().slice(0, 10),
        category_name: 'Auto-detect',
        notes: '',
    });
    const [loading, setLoading] = useState(false);
    const [isListening, setIsListening] = useState(false);
    const [speechSupported, setSpeechSupported] = useState(false);

    useEffect(() => {
        if ('webkitSpeechRecognition' in window || 'SpeechRecognition' in window) {
            setSpeechSupported(true);
        }
    }, []);

    const startVoiceRecognition = () => {
        const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
        if (!SpeechRecognition) {
            toast.error('Voice input is not supported in this browser. Try Chrome.');
            return;
        }

        const recognition = new SpeechRecognition();
        recognition.lang = 'en-IN'; // Indian English
        recognition.interimResults = false;
        recognition.maxAlternatives = 1;

        setIsListening(true);
        toast('🎙️ Listening... Speak like "Petrol 500 rupees" or "Swiggy 350"', { icon: '👂' });

        recognition.onresult = async (event) => {
            const transcript = event.results[0][0].transcript;
            setIsListening(false);
            toast.success(`Heard: "${transcript}"`);

            // Use AI SMS/Text parser to parse voice input
            try {
                const { data } = await advisorAPI.parseSMS(transcript);
                if (data.amount) {
                    setForm((p) => ({
                        ...p,
                        amount: String(data.amount),
                        description: data.merchant !== 'Unknown Merchant' ? data.merchant : transcript,
                        category_name: data.predicted_category || 'Other',
                        notes: `Voice input: "${transcript}"`,
                    }));
                } else {
                    setForm((p) => ({
                        ...p,
                        description: transcript,
                    }));
                }
            } catch {
                setForm((p) => ({ ...p, description: transcript }));
            }
        };

        recognition.onerror = () => {
            setIsListening(false);
            toast.error('Could not hear clearly. Please try again.');
        };

        recognition.onend = () => {
            setIsListening(false);
        };

        recognition.start();
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!form.amount || Number(form.amount) <= 0) {
            toast.error('Please enter a valid amount');
            return;
        }
        if (!form.description.trim()) {
            toast.error('Please enter a description');
            return;
        }

        setLoading(true);
        try {
            await expensesAPI.create(form);
            toast.success('Expense recorded instantly! ⚡');
            setOpen(false);
            setForm({
                description: '',
                amount: '',
                expense_date: new Date().toISOString().slice(0, 10),
                category_name: 'Auto-detect',
                notes: '',
            });
            // Auto reload current page data if on expenses/dashboard
            if (window.location.pathname === '/expenses' || window.location.pathname === '/dashboard') {
                window.location.reload();
            }
        } catch (err) {
            toast.error(err.response?.data?.error || 'Failed to add expense');
        } finally {
            setLoading(false);
        }
    };

    return (
        <>
            {/* Floating Action Button (Bottom Right) */}
            <div
                style={{
                    position: 'fixed',
                    bottom: 24,
                    right: 24,
                    zIndex: 999,
                    display: 'flex',
                    alignItems: 'center',
                    gap: 10,
                }}
            >
                <button
                    onClick={() => setOpen(true)}
                    title="Quick Add Expense (Voice or Instant)"
                    style={{
                        width: 54,
                        height: 54,
                        borderRadius: '50%',
                        background: 'linear-gradient(135deg, var(--emerald-500), var(--blue-500))',
                        color: 'white',
                        border: 'none',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        cursor: 'pointer',
                        boxShadow: '0 4px 20px rgba(16, 185, 129, 0.4)',
                        transition: 'transform 0.2s, box-shadow 0.2s',
                    }}
                    onMouseEnter={(e) => (e.currentTarget.style.transform = 'scale(1.08)')}
                    onMouseLeave={(e) => (e.currentTarget.style.transform = 'scale(1)')}
                >
                    <Plus size={26} strokeWidth={2.5} />
                </button>
            </div>

            {/* Quick Add Modal */}
            {open && (
                <div className="modal-backdrop">
                    <div className="modal" style={{ maxWidth: 440 }}>
                        <div className="modal-header">
                            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                                <div
                                    style={{
                                        width: 32,
                                        height: 32,
                                        borderRadius: 8,
                                        background: 'rgba(16, 185, 129, 0.15)',
                                        display: 'flex',
                                        alignItems: 'center',
                                        justifyContent: 'center',
                                    }}
                                >
                                    <Sparkles size={16} color="var(--emerald-400)" />
                                </div>
                                <h2>Quick Add Expense</h2>
                            </div>
                            <button className="btn btn-ghost btn-icon" onClick={() => setOpen(false)}>
                                <X size={16} />
                            </button>
                        </div>

                        <form onSubmit={handleSubmit}>
                            <div className="modal-body">
                                {/* Voice Recognition Banner Button */}
                                <div style={{ marginBottom: 16 }}>
                                    <button
                                        type="button"
                                        onClick={startVoiceRecognition}
                                        className="btn btn-secondary"
                                        style={{
                                            width: '100%',
                                            justifyContent: 'center',
                                            padding: '12px 16px',
                                            borderColor: isListening ? 'var(--red-400)' : 'var(--emerald-500)',
                                            background: isListening ? 'rgba(239, 68, 68, 0.1)' : 'rgba(16, 185, 129, 0.08)',
                                            color: isListening ? 'var(--red-400)' : 'var(--emerald-400)',
                                            fontWeight: 600,
                                            animation: isListening ? 'pulse 1.5s infinite' : 'none',
                                        }}
                                    >
                                        {isListening ? (
                                            <>
                                                <MicOff size={16} /> Listening... Speak Now!
                                            </>
                                        ) : (
                                            <>
                                                <Mic size={16} /> 🎙️ Tap to Speak (Voice-to-Expense)
                                            </>
                                        )}
                                    </button>
                                    <div style={{ fontSize: 11, color: 'var(--text-300)', textAlign: 'center', marginTop: 5 }}>
                                        Example: <em>"Petrol 500 rupees"</em> or <em>"Grocery 1200"</em>
                                    </div>
                                </div>

                                <div className="form-group">
                                    <label className="label">Amount (₹) *</label>
                                    <input
                                        className="input"
                                        type="number"
                                        step="0.01"
                                        placeholder="0.00"
                                        value={form.amount}
                                        onChange={(e) => setForm({ ...form, amount: e.target.value })}
                                        required
                                        autoFocus
                                        style={{ fontSize: 18, fontWeight: 700 }}
                                    />
                                </div>

                                <div className="form-group">
                                    <label className="label">Description / Where spent? *</label>
                                    <input
                                        className="input"
                                        type="text"
                                        placeholder="e.g. Swiggy Lunch, Uber cab, Milk & Veggies"
                                        value={form.description}
                                        onChange={(e) => setForm({ ...form, description: e.target.value })}
                                        required
                                    />
                                </div>

                                <div className="form-row">
                                    <div className="form-group">
                                        <label className="label">Category</label>
                                        <select
                                            className="select"
                                            value={form.category_name}
                                            onChange={(e) => setForm({ ...form, category_name: e.target.value })}
                                        >
                                            <option value="Auto-detect">🤖 Auto-detect (AI)</option>
                                            {EXPENSE_CATEGORIES.map((c) => (
                                                <option key={c} value={c}>
                                                    {c}
                                                </option>
                                            ))}
                                        </select>
                                    </div>

                                    <div className="form-group">
                                        <label className="label">Date</label>
                                        <input
                                            className="input"
                                            type="date"
                                            value={form.expense_date}
                                            onChange={(e) => setForm({ ...form, expense_date: e.target.value })}
                                        />
                                    </div>
                                </div>
                            </div>

                            <div className="modal-footer">
                                <button type="button" className="btn btn-secondary" onClick={() => setOpen(false)}>
                                    Cancel
                                </button>
                                <button type="submit" className="btn btn-primary" disabled={loading}>
                                    {loading ? <span className="spinner" /> : 'Save Expense ⚡'}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </>
    );
}
