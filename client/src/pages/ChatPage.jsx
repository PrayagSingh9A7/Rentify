import { useEffect, useState, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { format, isToday, isYesterday } from 'date-fns';
import api from '../services/api';
import useAuthStore from '../store/authStore';
import { getSocket } from '../hooks/useSocket';

function formatMsgTime(date) {
  const d = new Date(date);
  if (isToday(d)) return format(d, 'h:mm a');
  if (isYesterday(d)) return 'Yesterday';
  return format(d, 'MMM d');
}

function ConversationList({ conversations, activeId, onSelect, loading }) {
  return (
    <div className="flex flex-col h-full">
      <div className="p-4 border-b border-surface-secondary">
        <h2 className="font-display font-bold text-lg">Messages</h2>
      </div>
      <div className="flex-1 overflow-y-auto">
        {loading ? (
          [...Array(5)].map((_, i) => (
            <div key={i} className="flex items-center gap-3 p-4 border-b border-surface-secondary">
              <div className="skeleton w-12 h-12 rounded-full shrink-0" />
              <div className="flex-1 space-y-1.5">
                <div className="skeleton h-3.5 w-32 rounded" />
                <div className="skeleton h-3 w-48 rounded" />
              </div>
            </div>
          ))
        ) : conversations.length === 0 ? (
          <div className="text-center py-16 text-text-muted px-4">
            <p className="text-4xl mb-3">💬</p>
            <p className="text-sm">No conversations yet</p>
            <p className="text-xs mt-1">Contact a property owner to start chatting</p>
          </div>
        ) : (
          conversations.map((conv) => {
            const { user } = useAuthStore.getState();
            const other = conv.participants?.find((p) => p._id !== user?._id);
            const isActive = conv._id === activeId;
            return (
              <button
                key={conv._id}
                onClick={() => onSelect(conv._id)}
                className={`w-full flex items-center gap-3 p-4 border-b border-surface-secondary hover:bg-surface-secondary transition-colors text-left ${isActive ? 'bg-accent/5 border-l-2 border-l-accent' : ''}`}
              >
                <div className="w-12 h-12 rounded-full overflow-hidden bg-accent/10 shrink-0">
                  {other?.avatar
                    ? <img src={other.avatar} alt={other.name} className="w-full h-full object-cover" />
                    : <span className="w-full h-full flex items-center justify-center text-accent font-bold">{other?.name?.charAt(0)}</span>
                  }
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex justify-between items-start">
                    <p className="font-medium text-sm truncate">{conv.isGroupChat ? conv.groupName : other?.name}</p>
                    {conv.lastMessageAt && (
                      <p className="text-xs text-text-muted shrink-0 ml-2">{formatMsgTime(conv.lastMessageAt)}</p>
                    )}
                  </div>
                  {conv.property && (
                    <p className="text-xs text-accent truncate">{conv.property.title}</p>
                  )}
                </div>
              </button>
            );
          })
        )}
      </div>
    </div>
  );
}

function ChatWindow({ conversationId }) {
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [typing, setTyping] = useState(null);
  const [conv, setConv] = useState(null);
  const bottomRef = useRef(null);
  const typingTimer = useRef(null);
  const { user } = useAuthStore();
  const socket = getSocket();

  useEffect(() => {
    if (!conversationId) return;
    setLoading(true);
    Promise.all([
      api.get(`/chat/conversations/${conversationId}/messages`),
      api.get('/chat/conversations').then(({ data }) => data.data.find((c) => c._id === conversationId)),
    ]).then(([{ data }, c]) => {
      setMessages(data.data);
      setConv(c);
      setLoading(false);
    }).catch(() => setLoading(false));

    socket.emit('join_conversation', conversationId);
    const handler = (msg) => setMessages((prev) => [...prev, msg]);
    const typingHandler = ({ userName }) => { setTyping(userName); clearTimeout(typingTimer.current); typingTimer.current = setTimeout(() => setTyping(null), 3000); };
    const stopTypingHandler = () => setTyping(null);

    socket.on('new_message', handler);
    socket.on('user_typing', typingHandler);
    socket.on('user_stopped_typing', stopTypingHandler);

    return () => {
      socket.emit('leave_conversation', conversationId);
      socket.off('new_message', handler);
      socket.off('user_typing', typingHandler);
      socket.off('user_stopped_typing', stopTypingHandler);
    };
  }, [conversationId]);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const sendMessage = async (e) => {
    e.preventDefault();
    if (!input.trim()) return;
    const text = input;
    setInput('');
    socket.emit('typing_stop', { conversationId, userId: user._id });
    try {
      await api.post(`/chat/conversations/${conversationId}/messages`, { content: text });
    } catch { setInput(text); }
  };

  const handleInputChange = (e) => {
    setInput(e.target.value);
    socket.emit('typing_start', { conversationId, userId: user._id, userName: user.name });
    clearTimeout(typingTimer.current);
    typingTimer.current = setTimeout(() => socket.emit('typing_stop', { conversationId, userId: user._id }), 1500);
  };

  const other = conv?.participants?.find((p) => p._id !== user?._id);

  return (
    <div className="flex flex-col h-full">
      {/* Header */}
      {other && (
        <div className="flex items-center gap-3 p-4 border-b border-surface-secondary bg-white">
          <div className="w-10 h-10 rounded-full overflow-hidden bg-accent/10 shrink-0">
            {other.avatar
              ? <img src={other.avatar} alt={other.name} className="w-full h-full object-cover" />
              : <span className="w-full h-full flex items-center justify-center text-accent font-bold text-sm">{other.name?.charAt(0)}</span>
            }
          </div>
          <div>
            <p className="font-semibold text-sm">{other.name}</p>
            {conv?.property && <p className="text-xs text-accent">{conv.property.title}</p>}
          </div>
        </div>
      )}

      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-4 space-y-3">
        {loading ? (
          <div className="space-y-3">
            {[...Array(5)].map((_, i) => (
              <div key={i} className={`flex ${i % 2 === 0 ? '' : 'justify-end'}`}>
                <div className={`skeleton h-10 rounded-2xl ${i % 2 === 0 ? 'w-48 rounded-bl-none' : 'w-36 rounded-br-none'}`} />
              </div>
            ))}
          </div>
        ) : messages.length === 0 ? (
          <div className="text-center py-16 text-text-muted">
            <p className="text-4xl mb-2">👋</p>
            <p className="text-sm">Say hi to start the conversation!</p>
          </div>
        ) : (
          messages.map((msg) => {
            const isMe = msg.sender?._id === user?._id || msg.sender === user?._id;
            return (
              <motion.div
                key={msg._id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className={`flex ${isMe ? 'justify-end' : 'justify-start'}`}
              >
                <div className={`max-w-[70%] ${isMe ? 'items-end' : 'items-start'} flex flex-col gap-0.5`}>
                  <div className={`px-4 py-2.5 rounded-2xl text-sm leading-relaxed ${
                    isMe
                      ? 'bg-accent text-white rounded-br-none'
                      : 'bg-white text-text-primary rounded-bl-none shadow-sm'
                  }`}>
                    {msg.content}
                  </div>
                  <p className="text-[10px] text-text-muted px-1">{format(new Date(msg.createdAt), 'h:mm a')}</p>
                </div>
              </motion.div>
            );
          })
        )}

        {typing && (
          <div className="flex items-center gap-2">
            <div className="bg-white px-4 py-2.5 rounded-2xl rounded-bl-none shadow-sm">
              <div className="flex gap-1">
                {[0,1,2].map((i) => (
                  <div key={i} className="w-1.5 h-1.5 bg-text-muted rounded-full animate-bounce" style={{ animationDelay: `${i * 0.15}s` }} />
                ))}
              </div>
            </div>
            <span className="text-xs text-text-muted">{typing} is typing...</span>
          </div>
        )}
        <div ref={bottomRef} />
      </div>

      {/* Input */}
      <form onSubmit={sendMessage} className="p-4 border-t border-surface-secondary bg-white">
        <div className="flex gap-2">
          <input
            value={input}
            onChange={handleInputChange}
            placeholder="Type a message..."
            className="flex-1 bg-surface-secondary rounded-2xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-accent/20"
          />
          <button type="submit" disabled={!input.trim()} className="bg-accent text-white w-10 h-10 rounded-xl flex items-center justify-center disabled:opacity-50 hover:bg-accent-dark transition-colors active:scale-95">
            <svg className="w-4 h-4 rotate-90" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
            </svg>
          </button>
        </div>
      </form>
    </div>
  );
}

export default function ChatPage() {
  const { conversationId } = useParams();
  const navigate = useNavigate();
  const [conversations, setConvs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeId, setActiveId] = useState(conversationId || null);

  useEffect(() => {
    api.get('/chat/conversations').then(({ data }) => {
      setConvs(data.data);
      if (!activeId && data.data.length) setActiveId(data.data[0]._id);
    }).catch(() => {}).finally(() => setLoading(false));
  }, []);

  const handleSelect = (id) => {
    setActiveId(id);
    navigate(`/chat/${id}`, { replace: true });
  };

  return (
    <div className="max-w-6xl mx-auto px-4 py-24 min-h-screen">
      <div className="card overflow-hidden" style={{ height: 'calc(100vh - 140px)' }}>
        <div className="flex h-full">
          {/* Sidebar */}
          <div className={`w-full md:w-80 border-r border-surface-secondary shrink-0 ${activeId ? 'hidden md:block' : ''}`}>
            <ConversationList
              conversations={conversations}
              activeId={activeId}
              onSelect={handleSelect}
              loading={loading}
            />
          </div>

          {/* Chat window */}
          <div className={`flex-1 ${!activeId ? 'hidden md:flex' : 'flex'} flex-col`}>
            {activeId ? (
              <>
                <button onClick={() => { setActiveId(null); navigate('/chat'); }}
                  className="md:hidden flex items-center gap-2 text-sm text-text-muted p-3 border-b border-surface-secondary">
                  ← Back
                </button>
                <ChatWindow conversationId={activeId} />
              </>
            ) : (
              <div className="flex-1 flex items-center justify-center text-text-muted">
                <div className="text-center">
                  <p className="text-5xl mb-3">💬</p>
                  <p className="font-semibold text-lg mb-1">Your Messages</p>
                  <p className="text-sm">Select a conversation to start chatting</p>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}