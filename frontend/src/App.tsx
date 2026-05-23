import { Header } from './components/Header';
import { MessageList } from './components/MessageList';
import { ChatInput } from './components/ChatInput';
import { useChat } from './hooks/useChat';

export default function App() {
  const { messages, send, clear, loading, error } = useChat();

  return (
    <div style={{ maxWidth: 480, margin: '40px auto', fontFamily: 'sans-serif' }}>
      <Header onClear={clear} canClear={messages.length > 0} />
      <MessageList messages={messages} />
      <div style={{ marginTop: 12 }}>
        <ChatInput onSend={send} disabled={loading} />
      </div>
      {error && (
        <div style={{ color: 'red', marginTop: 8 }}>{error}</div>
      )}
    </div>
  );
}
