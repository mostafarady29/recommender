import { useState, useEffect, useCallback } from "react";

interface Message {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: Date;
  sources_used?: number;
}

interface ChatSession {
  id: string;
  title: string;
  messages: Message[];
  paperId?: number;
  paperTitle?: string;
  createdAt: Date;
  updatedAt: Date;
}

const API_BASE = 'http://localhost:5000/api';

// Helper to get auth headers
const getAuthHeaders = () => {
  const token = localStorage.getItem('token');
  return {
    'Content-Type': 'application/json',
    'Authorization': token ? `Bearer ${token}` : ''
  };
};

// Helper to convert API response dates to Date objects
const convertDates = (sessions: any[]): ChatSession[] => {
  return sessions.map(session => ({
    ...session,
    createdAt: new Date(session.createdAt),
    updatedAt: new Date(session.updatedAt),
    messages: session.messages?.map((message: any) => ({
      ...message,
      timestamp: new Date(message.timestamp),
    })) || [],
  }));
};

export const useChatSessions = () => {
  const [chatSessions, setChatSessions] = useState<ChatSession[]>([]);
  const [currentSessionId, setCurrentSessionId] = useState<string | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [isInitialized, setIsInitialized] = useState(false);

  // 1. Load sessions from backend on mount
  useEffect(() => {
    const loadSessionsFromBackend = async () => {
      try {
        const token = localStorage.getItem('token');
        if (!token) {
          // User not logged in, create a local session
          createInitialSession();
          setIsInitialized(true);
          return;
        }

        const response = await fetch(`${API_BASE}/chat/sessions`, {
          headers: getAuthHeaders(),
        });

        if (response.ok) {
          const data = await response.json();
          if (data.success && data.data.length > 0) {
            const sessions = convertDates(data.data);
            setChatSessions(sessions);

            // Load the most recent session's messages
            await loadSessionMessages(sessions[0].id);
          } else {
            // No sessions exist, create initial one
            await createInitialSession();
          }
        } else {
          // Error fetching, create local session
          createInitialSession();
        }
      } catch (error) {
        console.error('Error loading chat sessions:', error);
        createInitialSession();
      } finally {
        setIsInitialized(true);
      }
    };

    loadSessionsFromBackend();
  }, []);

  // Helper to load messages for a specific session
  const loadSessionMessages = async (sessionId: string) => {
    try {
      const response = await fetch(`${API_BASE}/chat/sessions/${sessionId}`, {
        headers: getAuthHeaders(),
      });

      if (response.ok) {
        const data = await response.json();
        if (data.success) {
          const session = convertDates([data.data])[0];
          setCurrentSessionId(session.id);
          setMessages(session.messages);
          return session;
        }
      }
    } catch (error) {
      console.error('Error loading session messages:', error);
    }
    return null;
  };

  // Helper to create initial session (backend or local)
  const createInitialSession = async () => {
    const now = new Date();
    const initialMessage: Message = {
      id: '1',
      role: 'assistant',
      content: 'Hello! I am the Insight AI Assistant. I can help you summarize papers, find specific research, or explain complex scientific concepts. How can I assist you today?',
      timestamp: now
    };

    const token = localStorage.getItem('token');

    if (token) {
      // Create session on backend
      try {
        const response = await fetch(`${API_BASE}/chat/sessions`, {
          method: 'POST',
          headers: getAuthHeaders(),
          body: JSON.stringify({
            title: 'New Chat',
            messages: [{
              role: initialMessage.role,
              content: initialMessage.content,
              sources_used: initialMessage.sources_used
            }]
          }),
        });

        if (response.ok) {
          const data = await response.json();
          if (data.success) {
            // Reload all sessions
            const sessionsResponse = await fetch(`${API_BASE}/chat/sessions`, {
              headers: getAuthHeaders(),
            });
            const sessionsData = await sessionsResponse.json();
            const sessions = convertDates(sessionsData.data);
            setChatSessions(sessions);

            setCurrentSessionId(data.data.sessionId.toString());
            setMessages([initialMessage]);
            return;
          }
        }
      } catch (error) {
        console.error('Error creating session on backend:', error);
      }
    }

    // Fallback: create local session (when not logged in or error)
    const newSessionId = Date.now().toString();
    const newSession: ChatSession = {
      id: newSessionId,
      title: 'New Chat',
      messages: [initialMessage],
      createdAt: now,
      updatedAt: now,
    };

    setChatSessions([newSession]);
    setCurrentSessionId(newSessionId);
    setMessages([initialMessage]);
  };

  // 2. Start a new chat session
  const startNewChat = useCallback(async (saveCurrentFirst = true) => {
    if (!isInitialized) return;

    const token = localStorage.getItem('token');

    // Save current session if it has messages
    if (saveCurrentFirst && currentSessionId && messages.length > 0 && token) {
      await updateCurrentSession(messages);
    }

    // Create new session
    await createInitialSession();

    // Reload sessions list
    if (token) {
      try {
        const response = await fetch(`${API_BASE}/chat/sessions`, {
          headers: getAuthHeaders(),
        });
        if (response.ok) {
          const data = await response.json();
          if (data.success) {
            setChatSessions(convertDates(data.data));
          }
        }
      } catch (error) {
        console.error('Error reloading sessions:', error);
      }
    }
  }, [currentSessionId, messages, isInitialized]);

  // 3. Load a specific chat session
  const loadChatSession = useCallback(async (session: ChatSession) => {
    if (!isInitialized) return;

    const token = localStorage.getItem('token');

    // Save current session before switching (if logged in)
    if (currentSessionId && currentSessionId !== session.id && messages.length > 0 && token) {
      await updateCurrentSession(messages);
    }

    // Load the selected session's messages
    if (token) {
      await loadSessionMessages(session.id);
    } else {
      setCurrentSessionId(session.id);
      setMessages(session.messages);
    }
  }, [currentSessionId, messages, isInitialized]);

  // 4. Update the current session with new messages
  const updateCurrentSession = useCallback(async (newMessages: Message[], newTitle?: string) => {
    if (!currentSessionId || !isInitialized) return;

    setMessages(newMessages);

    const token = localStorage.getItem('token');
    if (!token) {
      // Update local state only
      const sessionIndex = chatSessions.findIndex(s => s.id === currentSessionId);
      if (sessionIndex !== -1) {
        const updatedSessions = [...chatSessions];
        updatedSessions[sessionIndex] = {
          ...updatedSessions[sessionIndex],
          messages: newMessages,
          updatedAt: new Date(),
          title: newTitle && updatedSessions[sessionIndex].title === 'New Chat'
            ? newTitle.substring(0, 50) + (newTitle.length > 50 ? '...' : '')
            : updatedSessions[sessionIndex].title
        };
        setChatSessions(updatedSessions);
      }
      return;
    }

    // Update on backend
    try {
      const response = await fetch(`${API_BASE}/chat/sessions/${currentSessionId}`, {
        method: 'PUT',
        headers: getAuthHeaders(),
        body: JSON.stringify({
          title: newTitle,
          messages: newMessages.map(msg => ({
            role: msg.role,
            content: msg.content,
            sources_used: msg.sources_used
          }))
        }),
      });

      if (response.ok) {
        // Reload sessions to get updated list
        const sessionsResponse = await fetch(`${API_BASE}/chat/sessions`, {
          headers: getAuthHeaders(),
        });
        if (sessionsResponse.ok) {
          const data = await sessionsResponse.json();
          if (data.success) {
            setChatSessions(convertDates(data.data));
          }
        }
      }
    } catch (error) {
      console.error('Error updating session:', error);
    }
  }, [currentSessionId, chatSessions, isInitialized]);

  // 5. Delete a chat session
  const deleteSession = useCallback(async (sessionId: string) => {
    if (!isInitialized) return;

    const token = localStorage.getItem('token');

    if (token) {
      // Delete from backend
      try {
        const response = await fetch(`${API_BASE}/chat/sessions/${sessionId}`, {
          method: 'DELETE',
          headers: getAuthHeaders(),
        });

        if (response.ok) {
          // Reload sessions
          const sessionsResponse = await fetch(`${API_BASE}/chat/sessions`, {
            headers: getAuthHeaders(),
          });

          if (sessionsResponse.ok) {
            const data = await sessionsResponse.json();
            const updatedSessions = convertDates(data.data);
            setChatSessions(updatedSessions);

            // If deleting current session, switch to another
            if (sessionId === currentSessionId) {
              if (updatedSessions.length > 0) {
                await loadSessionMessages(updatedSessions[0].id);
              } else {
                await createInitialSession();
              }
            }
          }
        }
      } catch (error) {
        console.error('Error deleting session:', error);
      }
    } else {
      // Delete from local state
      const filteredSessions = chatSessions.filter(s => s.id !== sessionId);

      if (sessionId === currentSessionId) {
        if (filteredSessions.length > 0) {
          setCurrentSessionId(filteredSessions[0].id);
          setMessages(filteredSessions[0].messages);
        } else {
          await createInitialSession();
        }
      }
      setChatSessions(filteredSessions);
    }
  }, [chatSessions, currentSessionId, isInitialized]);

  return {
    chatSessions,
    currentSessionId,
    messages,
    setMessages,
    startNewChat,
    loadChatSession,
    updateCurrentSession,
    deleteSession,
  };
};