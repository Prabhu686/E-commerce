import { useState, useRef, useEffect } from 'react';
import api from '../api/axios';

export default function ChatBot() {
  const [open, setOpen] = useState(false);
  const [messages, setMessages] = useState([
    { role: 'assistant', content: "👋 Hi! I'm NexaBot, your AI shopping assistant powered by Groq! Ask me anything about products, deals, or your orders!" }
  ]);
  const [input, setInput] = useState('');
  const [typing, setTyping] = useState(false);
  const bottomRef = useRef(null);

  useEffect(() => { bottomRef.current?.scrollIntoView({ behavior: 'smooth' }); }, [messages]);

  const send = async () => {
    if (!input.trim() || typing) return;
    const userMsg = input.trim();
    setInput('');

    const updatedMessages = [...messages, { role: 'user', content: userMsg }];
    setMessages(updatedMessages);
    setTyping(true);

    try {
      const { data } = await api.post('/ai/chat', {
        messages: updatedMessages
          .filter(m => m.role !== 'assistant' || updatedMessages.indexOf(m) > 0)
          .map(m => ({ role: m.role, content: m.content })),
      });
      setMessages(prev => [...prev, { role: 'assistant', content: data.reply }]);
    } catch {
      setMessages(prev => [...prev, { role: 'assistant', content: "Sorry, I'm having trouble connecting. Please try again! 🔄" }]);
    }
    setTyping(false);
  };

  const quickReplies = ['Flash deals?', 'Track my order', 'Loyalty points?', 'Return policy'];

  return (
    <>
      {/* Bubble */}
      <button onClick={() => setOpen(!open)}
        className="fixed bottom-6 right-6 z-40 w-14 h-14 bg-emerald-600 rounded-full flex items-center justify-center shadow-lg hover:bg-emerald-500 transition hover:scale-110">
        <span className="text-2xl">{open ? '✕' : '💬'}</span>
        <span className="absolute top-0 right-0 w-3 h-3 bg-green-400 rounded-full border-2 border-emerald-600" />
      </button>

      {/* Window */}
      {open && (
        <div className="fixed bottom-24 right-6 z-40 w-80 glass rounded-2xl shadow-2xl flex flex-col overflow-hidden animate-fade-in">
          {/* Header */}
          <div className="flex items-center gap-3 p-4 border-b border-white/10 bg-emerald-600/20">
            <div className="w-9 h-9 bg-emerald-600 rounded-full flex items-center justify-center text-lg">🤖</div>
            <div className="flex-1">
              <p className="font-bold text-sm">NexaBot AI</p>
              <p className="text-xs text-green-400">● Powered by Groq LLaMA 3</p>
            </div>
          </div>

          {/* Messages */}
          <div className="flex-1 overflow-y-auto p-3 space-y-2 max-h-72">
            {messages.map((m, i) => (
              <div key={i} className={`flex ${m.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                <div className={`max-w-[85%] px-3 py-2 rounded-2xl text-sm leading-relaxed ${m.role === 'user' ? 'bg-emerald-600 text-white rounded-br-sm' : 'glass text-slate-200 rounded-bl-sm'}`}>
                  {m.content}
                </div>
              </div>
            ))}
            {typing && (
              <div className="flex justify-start">
                <div className="glass px-4 py-3 rounded-2xl rounded-bl-sm">
                  <span className="flex gap-1 items-center">
                    <span className="text-xs text-slate-400 mr-1">NexaBot is thinking</span>
                    {[0,1,2].map(i => (
                      <span key={i} className="w-1.5 h-1.5 bg-emerald-400 rounded-full animate-bounce"
                        style={{ animationDelay: `${i * 0.15}s` }} />
                    ))}
                  </span>
                </div>
              </div>
            )}
            <div ref={bottomRef} />
          </div>

          {/* Quick replies */}
          {messages.length <= 1 && (
            <div className="px-3 pb-2 flex flex-wrap gap-1">
              {quickReplies.map(q => (
                <button key={q} onClick={() => { setInput(q); }}
                  className="text-xs glass px-2 py-1 rounded-full hover:bg-emerald-600/30 transition text-slate-300">
                  {q}
                </button>
              ))}
            </div>
          )}

          {/* Input */}
          <div className="p-3 border-t border-white/10 flex gap-2">
            <input value={input} onChange={e => setInput(e.target.value)}
              onKeyDown={e => e.key === 'Enter' && send()}
              placeholder="Ask NexaBot AI..." className="flex-1 text-sm py-2 px-3 rounded-xl" />
            <button onClick={send} disabled={typing}
              className="btn-primary px-3 py-2 text-sm disabled:opacity-50">→</button>
          </div>
        </div>
      )}
    </>
  );
}



