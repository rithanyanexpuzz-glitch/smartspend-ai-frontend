import { useState, useRef, useEffect } from 'react';
import { Bot, Send, Sparkles, User, RefreshCw, MessageSquare, TrendingUp, AlertCircle } from 'lucide-react';
import { advisorAPI } from '../api';
import toast from 'react-hot-toast';

const SUGGESTED_PROMPTS = [
    'How much did I spend this month?',
    'What are my top spending categories?',
    'Give me 3 tips to save ₹5,000 next month',
    'What is my savings rate and cash balance?',
];

export default function AdvisorPage() {
    const [messages, setMessages] = useState([
        {
            sender: 'ai',
            text: 'Hello! I am your **SmartSpend AI Financial Advisor** 🤖\n\nI have real-time access to your income, expenses, and budgets. Ask me anything about your finances or how you can save more money this month!',
        },
    ]);
    const [input, setInput] = useState('');
    const [loading, setLoading] = useState(false);
    const messagesEndRef = useRef(null);

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    };

    useEffect(() => {
        scrollToBottom();
    }, [messages, loading]);

    const handleSend = async (queryText) => {
        const text = queryText || input;
        if (!text.trim() || loading) return;

        const newMessages = [...messages, { sender: 'user', text }];
        setMessages(newMessages);
        setInput('');
        setLoading(true);

        try {
            const res = await advisorAPI.chat(text);
            setMessages([...newMessages, { sender: 'ai', text: res.data.reply }]);
        } catch {
            toast.error('Failed to get financial advice');
            setMessages([
                ...newMessages,
                { sender: 'ai', text: 'Sorry, I had trouble retrieving your records. Please ensure your backend is active.' },
            ]);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div style={{ maxWidth: 900, margin: '0 auto', display: 'flex', flexDirection: 'column', height: 'calc(100vh - 120px)' }}>
            {/* Header */}
            <div className="page-header" style={{ marginBottom: 16 }}>
                <div className="page-header-row">
                    <div>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                            <h1>AI Financial Advisor</h1>
                            <span className="badge badge-green" style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
                                <Sparkles size={11} /> Live Assistant
                            </span>
                        </div>
                        <p>Ask questions in English or Tamil about your spending, budget leaks & savings advice</p>
                    </div>
                </div>
            </div>

            {/* Chat Conversation Box */}
            <div
                className="card"
                style={{
                    flex: 1,
                    display: 'flex',
                    flexDirection: 'column',
                    overflow: 'hidden',
                    padding: 0,
                    border: '1px solid var(--border-light)',
                }}
            >
                {/* Messages Scroll Area */}
                <div style={{ flex: 1, overflowY: 'auto', padding: 20, display: 'flex', flexDirection: 'column', gap: 16 }}>
                    {messages.map((m, idx) => (
                        <div
                            key={idx}
                            style={{
                                display: 'flex',
                                gap: 12,
                                alignSelf: m.sender === 'user' ? 'flex-end' : 'flex-start',
                                maxWidth: '82%',
                            }}
                        >
                            {m.sender === 'ai' && (
                                <div
                                    style={{
                                        width: 34,
                                        height: 34,
                                        borderRadius: '50%',
                                        background: 'linear-gradient(135deg, var(--emerald-500), var(--blue-500))',
                                        display: 'flex',
                                        alignItems: 'center',
                                        justifyContent: 'center',
                                        flexShrink: 0,
                                        boxShadow: '0 2px 8px rgba(16, 185, 129, 0.3)',
                                    }}
                                >
                                    <Bot size={18} color="#fff" />
                                </div>
                            )}

                            <div
                                style={{
                                    padding: '12px 16px',
                                    borderRadius: 12,
                                    fontSize: 13.5,
                                    lineHeight: 1.6,
                                    whiteSpace: 'pre-line',
                                    background: m.sender === 'user' ? 'var(--emerald-600)' : 'var(--bg-750)',
                                    color: m.sender === 'user' ? '#fff' : 'var(--text-100)',
                                    border: m.sender === 'user' ? 'none' : '1px solid var(--border-light)',
                                    borderTopLeftRadius: m.sender === 'ai' ? 2 : 12,
                                    borderTopRightRadius: m.sender === 'user' ? 2 : 12,
                                }}
                            >
                                {m.text}
                            </div>

                            {m.sender === 'user' && (
                                <div
                                    style={{
                                        width: 34,
                                        height: 34,
                                        borderRadius: '50%',
                                        background: 'var(--bg-600)',
                                        display: 'flex',
                                        alignItems: 'center',
                                        justifyContent: 'center',
                                        flexShrink: 0,
                                    }}
                                >
                                    <User size={16} color="var(--text-200)" />
                                </div>
                            )}
                        </div>
                    ))}

                    {loading && (
                        <div style={{ display: 'flex', gap: 12, alignSelf: 'flex-start' }}>
                            <div
                                style={{
                                    width: 34,
                                    height: 34,
                                    borderRadius: '50%',
                                    background: 'var(--emerald-600)',
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                }}
                            >
                                <Bot size={18} color="#fff" />
                            </div>
                            <div
                                style={{
                                    padding: '12px 16px',
                                    borderRadius: 12,
                                    background: 'var(--bg-750)',
                                    border: '1px solid var(--border-light)',
                                    display: 'flex',
                                    alignItems: 'center',
                                    gap: 8,
                                    color: 'var(--text-300)',
                                    fontSize: 13,
                                }}
                            >
                                <div className="spinner" style={{ width: 14, height: 14 }} />
                                Analyzing your expenses and budgets...
                            </div>
                        </div>
                    )}
                    <div ref={messagesEndRef} />
                </div>

                {/* Suggestions Quick Buttons */}
                <div
                    style={{
                        padding: '10px 16px',
                        background: 'var(--bg-800)',
                        borderTop: '1px solid var(--border-light)',
                        display: 'flex',
                        gap: 8,
                        overflowX: 'auto',
                    }}
                >
                    {SUGGESTED_PROMPTS.map((p, i) => (
                        <button
                            key={i}
                            className="btn btn-secondary"
                            style={{
                                fontSize: 11.5,
                                padding: '4px 10px',
                                borderRadius: 14,
                                whiteSpace: 'nowrap',
                                flexShrink: 0,
                            }}
                            onClick={() => handleSend(p)}
                            disabled={loading}
                        >
                            <MessageSquare size={11} style={{ marginRight: 4 }} />
                            {p}
                        </button>
                    ))}
                </div>

                {/* Input Bar */}
                <div style={{ padding: 14, background: 'var(--bg-750)', borderTop: '1px solid var(--border-light)' }}>
                    <form
                        onSubmit={(e) => {
                            e.preventDefault();
                            handleSend();
                        }}
                        style={{ display: 'flex', gap: 10 }}
                    >
                        <input
                            className="input"
                            style={{ flex: 1, padding: '12px 16px' }}
                            placeholder="Ask financial advice (e.g., 'How can I save money this month?' or 'செலவு எவ்வளவு?')..."
                            value={input}
                            onChange={(e) => setInput(e.target.value)}
                            disabled={loading}
                        />
                        <button type="submit" className="btn btn-primary" style={{ padding: '0 20px' }} disabled={loading || !input.trim()}>
                            <Send size={16} />
                        </button>
                    </form>
                </div>
            </div>
        </div>
    );
}
