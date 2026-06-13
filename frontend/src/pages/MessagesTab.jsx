import React, { useState, useEffect, useRef } from 'react';
import { useAuth } from '../context/AuthContext';
import { useVideo } from '../context/VideoContext';
import { getContactsAPI, getMessagesAPI, sendMessageAPI, markMessagesReadAPI } from '../services/api';
import { MessageCircle, Send, Search, User } from 'lucide-react';
import LoadingSpinner from '../components/Common/LoadingSpinner';

const MessagesTab = () => {
  const { user } = useAuth();
  const { socket } = useVideo();
  const [contacts, setContacts] = useState([]);
  const [selectedContact, setSelectedContact] = useState(null);
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState('');
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);
  const messagesEndRef = useRef(null);

  useEffect(() => {
    fetchContacts();
  }, []);

  useEffect(() => {
    if (selectedContact) {
      fetchMessages(selectedContact._id);
    }
  }, [selectedContact]);

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  // Listen for real-time messages
  useEffect(() => {
    if (!socket) return;

    const handleNewMessage = (msg) => {
      // If the message is from the currently selected contact, add to list
      if (selectedContact && msg.sender._id === selectedContact._id) {
        setMessages((prev) => [...prev, msg]);
        markMessagesReadAPI(selectedContact._id);
      } else {
        // Otherwise, maybe update unread count on contacts list (simplification: just re-fetch contacts)
        fetchContacts();
      }
    };

    socket.on('receive-message', handleNewMessage);
    return () => socket.off('receive-message', handleNewMessage);
  }, [socket, selectedContact]);

  const fetchContacts = async () => {
    try {
      const res = await getContactsAPI();
      if (res.success) {
        setContacts(res.data);
      }
    } catch (error) {
      console.error('Failed to load contacts', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchMessages = async (contactId) => {
    try {
      const res = await getMessagesAPI(contactId);
      if (res.success) {
        setMessages(res.data);
        // Mark as read
        await markMessagesReadAPI(contactId);
        fetchContacts(); // Update unread counts
      }
    } catch (error) {
      console.error('Failed to load messages', error);
    }
  };

  const handleSendMessage = async (e) => {
    e.preventDefault();
    if (!newMessage.trim() || !selectedContact) return;

    const msgContent = newMessage;
    setNewMessage('');
    setSending(true);

    try {
      const res = await sendMessageAPI(selectedContact._id, msgContent);
      if (res.success) {
        // Optimistically add to UI
        // Since we populate sender in backend, simulate it here
        setMessages(prev => [...prev, { ...res.data, sender: { _id: user._id, name: user.name, role: user.role } }]);
      }
    } catch (error) {
      console.error('Failed to send message', error);
      setNewMessage(msgContent); // Revert on fail
    } finally {
      setSending(false);
    }
  };

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  if (loading) return <LoadingSpinner />;

  return (
    <div className="flex h-[calc(100vh-140px)] bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-sm">
      {/* Sidebar: Contacts */}
      <div className="w-1/3 border-r border-slate-200 flex flex-col bg-slate-50">
        <div className="p-4 border-b border-slate-200 bg-white">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
            <input 
              type="text" 
              placeholder="Search contacts..." 
              className="w-full pl-10 pr-4 py-2 bg-slate-100 border-none rounded-xl text-sm focus:ring-2 focus:ring-primary-500 transition-all"
            />
          </div>
        </div>
        
        <div className="flex-1 overflow-y-auto custom-scrollbar">
          {contacts.length === 0 ? (
            <div className="p-6 text-center text-slate-500 text-sm">
              No conversations yet.<br/>Book an appointment to start chatting.
            </div>
          ) : (
            contacts.map((contact) => (
              <button
                key={contact._id}
                onClick={() => setSelectedContact(contact)}
                className={`w-full flex items-center p-4 border-b border-slate-100 transition-colors ${
                  selectedContact?._id === contact._id ? 'bg-primary-50' : 'hover:bg-slate-100'
                }`}
              >
                <div className="relative">
                  {contact.profilePic ? (
                    <img src={contact.profilePic} alt={contact.name} className="w-12 h-12 rounded-full object-cover border border-slate-200" />
                  ) : (
                    <div className="w-12 h-12 rounded-full bg-primary-100 flex items-center justify-center text-primary-600 font-bold">
                      {contact.name?.charAt(0)}
                    </div>
                  )}
                  {contact.unreadCount > 0 && selectedContact?._id !== contact._id && (
                    <span className="absolute -top-1 -right-1 bg-rose-500 text-white text-[10px] font-bold w-5 h-5 rounded-full flex items-center justify-center border-2 border-white">
                      {contact.unreadCount}
                    </span>
                  )}
                </div>
                <div className="ml-4 text-left flex-1 min-w-0">
                  <div className="flex justify-between items-baseline mb-1">
                    <h4 className="font-bold text-slate-800 text-sm truncate">{contact.name}</h4>
                  </div>
                  <p className="text-xs text-slate-500 truncate capitalize">{contact.role}</p>
                </div>
              </button>
            ))
          )}
        </div>
      </div>

      {/* Main Chat Area */}
      <div className="flex-1 flex flex-col bg-white">
        {selectedContact ? (
          <>
            {/* Chat Header */}
            <div className="h-[70px] px-6 border-b border-slate-200 flex items-center shrink-0 bg-white">
              <div className="flex items-center space-x-3">
                {selectedContact.profilePic ? (
                  <img src={selectedContact.profilePic} alt={selectedContact.name} className="w-10 h-10 rounded-full object-cover" />
                ) : (
                  <div className="w-10 h-10 rounded-full bg-slate-100 flex items-center justify-center text-slate-600 font-bold">
                    {selectedContact.name?.charAt(0)}
                  </div>
                )}
                <div>
                  <h3 className="font-bold text-slate-800">{selectedContact.name}</h3>
                  <span className="text-xs text-slate-500 capitalize">{selectedContact.role}</span>
                </div>
              </div>
            </div>

            {/* Messages */}
            <div className="flex-1 overflow-y-auto p-6 bg-slate-50 space-y-4 custom-scrollbar">
              {messages.length === 0 ? (
                <div className="h-full flex flex-col items-center justify-center text-slate-400 space-y-3">
                  <MessageCircle size={40} className="text-slate-300" />
                  <p className="text-sm">Say hello to {selectedContact.name}!</p>
                </div>
              ) : (
                messages.map((msg, idx) => {
                  const isMe = msg.sender._id === user._id;
                  return (
                    <div key={idx} className={`flex ${isMe ? 'justify-end' : 'justify-start'}`}>
                      <div className={`max-w-[70%] px-4 py-3 rounded-2xl ${
                        isMe ? 'bg-primary-600 text-white rounded-tr-none' : 'bg-white border border-slate-200 text-slate-800 rounded-tl-none shadow-sm'
                      }`}>
                        <p className="text-sm">{msg.content}</p>
                        <span className={`text-[10px] mt-1 block ${isMe ? 'text-primary-200' : 'text-slate-400'}`}>
                          {new Date(msg.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                        </span>
                      </div>
                    </div>
                  );
                })
              )}
              <div ref={messagesEndRef} />
            </div>

            {/* Input */}
            <div className="p-4 bg-white border-t border-slate-200">
              <form onSubmit={handleSendMessage} className="flex items-end space-x-3">
                <textarea
                  value={newMessage}
                  onChange={(e) => setNewMessage(e.target.value)}
                  placeholder="Type a message..."
                  className="flex-1 max-h-32 min-h-[44px] px-4 py-3 bg-slate-100 border-none rounded-2xl text-sm focus:ring-2 focus:ring-primary-500 resize-none custom-scrollbar"
                  rows="1"
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' && !e.shiftKey) {
                      e.preventDefault();
                      handleSendMessage(e);
                    }
                  }}
                />
                <button
                  type="submit"
                  disabled={!newMessage.trim() || sending}
                  className="w-12 h-12 flex items-center justify-center bg-primary-600 text-white rounded-full hover:bg-primary-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors shrink-0 shadow-sm"
                >
                  <Send size={18} className={sending ? 'opacity-50' : ''} />
                </button>
              </form>
            </div>
          </>
        ) : (
          <div className="flex-1 flex flex-col items-center justify-center text-slate-400 space-y-4">
            <MessageCircle size={64} className="text-slate-200" />
            <p className="text-lg font-medium text-slate-500">Select a contact to start messaging</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default MessagesTab;
