import React, { useState, useEffect, useContext, useRef } from 'react';
import { Container, Row, Col, Card, Form, Button, ListGroup, Badge } from 'react-bootstrap';
import { motion, AnimatePresence } from 'framer-motion';
import { AuthContext } from '../context/AuthContext';
import Navbar from '../components/Navbar';
import Sidebar from '../components/Sidebar';
import axios from 'axios';
import API_BASE_URL from '../config/api';

const ChatPage = () => {
  const { user } = useContext(AuthContext);
  const [conversations, setConversations] = useState([]);
  const [selectedUser, setSelectedUser] = useState(null);
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState('');
  const [allUsers, setAllUsers] = useState([]);
  const [showNewChat, setShowNewChat] = useState(false);
  const [loading, setLoading] = useState(true);
  const messagesEndRef = useRef(null);

  useEffect(() => {
    fetchConversations();
    fetchAllUsers();
  }, []);

  useEffect(() => {
    if (selectedUser) {
      fetchMessages(selectedUser._id);
    }
  }, [selectedUser]);

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const fetchConversations = async () => {
    try {
      const res = await axios.get(`${API_BASE_URL}/api/messages/conversations`);
      setConversations(res.data);
      setLoading(false);
    } catch (error) {
      console.error('Error fetching conversations:', error);
      setLoading(false);
    }
  };

  const fetchAllUsers = async () => {
    try {
      const res = await axios.get(`${API_BASE_URL}/api/messages/users/all`);
      setAllUsers(res.data);
    } catch (error) {
      console.error('Error fetching users:', error);
    }
  };

  const fetchMessages = async (userId) => {
    try {
      const res = await axios.get(`${API_BASE_URL}/api/messages/${userId}`);
      setMessages(res.data);
    } catch (error) {
      console.error('Error fetching messages:', error);
    }
  };

  const handleSendMessage = async (e) => {
    e.preventDefault();
    if (!newMessage.trim() || !selectedUser) return;

    try {
      const res = await axios.post(`${API_BASE_URL}/api/messages`, {
        receiverId: selectedUser._id,
        content: newMessage
      });
      setMessages([...messages, res.data]);
      setNewMessage('');
      fetchConversations(); // Update conversation list
    } catch (error) {
      console.error('Error sending message:', error);
      alert('Failed to send message');
    }
  };

  const handleSelectConversation = (conversation) => {
    setSelectedUser(conversation.user);
    setShowNewChat(false);
  };

  const handleStartNewChat = (user) => {
    setSelectedUser(user);
    setShowNewChat(false);
    setMessages([]);
  };

  const getRoleBadgeColor = (role) => {
    const colors = {
      admin: 'danger',
      manager: 'primary',
      developer: 'success',
      tester: 'warning'
    };
    return colors[role] || 'secondary';
  };

  return (
    <div className="d-flex">
      <Sidebar role={user?.role} />
      <div className="flex-grow-1">
        <Navbar user={user} />
        <Container fluid className="p-4" style={{ background: '#f8f9fa', minHeight: 'calc(100vh - 70px)' }}>
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
            <h2 className="mb-4">
              <i className="bi bi-chat-dots me-3"></i>
              Messages
            </h2>

            <Row style={{ height: 'calc(100vh - 200px)' }}>
              {/* Conversations List */}
              <Col md={4} className="pe-2">
                <Card className="h-100">
                  <Card.Header className="d-flex justify-content-between align-items-center">
                    <h5 className="mb-0">Conversations</h5>
                    <Button 
                      size="sm" 
                      variant="primary"
                      onClick={() => setShowNewChat(!showNewChat)}
                    >
                      <i className="bi bi-plus-circle me-1"></i>
                      New
                    </Button>
                  </Card.Header>
                  <Card.Body className="p-0" style={{ overflowY: 'auto' }}>
                    {showNewChat ? (
                      <ListGroup variant="flush">
                        {allUsers.map(u => (
                          <ListGroup.Item 
                            key={u._id}
                            action
                            onClick={() => handleStartNewChat(u)}
                            className="d-flex justify-content-between align-items-center"
                          >
                            <div>
                              <div className="fw-bold">{u.name}</div>
                              <Badge bg={getRoleBadgeColor(u.role)} className="mt-1">
                                {u.role}
                              </Badge>
                            </div>
                            <i className="bi bi-arrow-right-circle"></i>
                          </ListGroup.Item>
                        ))}
                      </ListGroup>
                    ) : loading ? (
                      <div className="text-center p-4">
                        <div className="spinner-border text-primary"></div>
                      </div>
                    ) : conversations.length === 0 ? (
                      <div className="text-center p-4 text-muted">
                        <i className="bi bi-chat-text fs-1 d-block mb-3"></i>
                        No conversations yet
                      </div>
                    ) : (
                      <ListGroup variant="flush">
                        {conversations.map(conv => (
                          <ListGroup.Item
                            key={conv.user._id}
                            action
                            active={selectedUser?._id === conv.user._id}
                            onClick={() => handleSelectConversation(conv)}
                          >
                            <div className="d-flex justify-content-between align-items-start">
                              <div className="flex-grow-1">
                                <div className="d-flex align-items-center mb-1">
                                  <strong>{conv.user.name}</strong>
                                  <Badge bg={getRoleBadgeColor(conv.user.role)} className="ms-2">
                                    {conv.user.role}
                                  </Badge>
                                </div>
                                <small className="text-muted d-block text-truncate">
                                  {conv.lastMessage}
                                </small>
                                <small className="text-muted">
                                  {new Date(conv.lastMessageTime).toLocaleString()}
                                </small>
                              </div>
                              {conv.unreadCount > 0 && (
                                <Badge bg="danger" pill>{conv.unreadCount}</Badge>
                              )}
                            </div>
                          </ListGroup.Item>
                        ))}
                      </ListGroup>
                    )}
                  </Card.Body>
                </Card>
              </Col>

              {/* Chat Messages */}
              <Col md={8} className="ps-2">
                <Card className="h-100 d-flex flex-column">
                  {selectedUser ? (
                    <>
                      <Card.Header>
                        <div className="d-flex align-items-center">
                          <div className="avatar bg-primary text-white rounded-circle me-3" 
                               style={{ width: '40px', height: '40px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                            {selectedUser.name.charAt(0).toUpperCase()}
                          </div>
                          <div>
                            <h5 className="mb-0">{selectedUser.name}</h5>
                            <Badge bg={getRoleBadgeColor(selectedUser.role)}>
                              {selectedUser.role}
                            </Badge>
                          </div>
                        </div>
                      </Card.Header>
                      
                      <Card.Body style={{ overflowY: 'auto', flex: 1 }}>
                        <AnimatePresence>
                          {messages.map((msg, index) => {
                            const isOwn = msg.sender._id === user._id;
                            return (
                              <motion.div
                                key={msg._id}
                                initial={{ opacity: 0, y: 10 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: index * 0.03 }}
                                className={`d-flex mb-3 ${isOwn ? 'justify-content-end' : 'justify-content-start'}`}
                              >
                                <div className={`${isOwn ? 'bg-primary text-white' : 'bg-light'} p-3 rounded`} 
                                     style={{ maxWidth: '70%' }}>
                                  {!isOwn && (
                                    <small className="d-block fw-bold mb-1">{msg.sender.name}</small>
                                  )}
                                  <p className="mb-1">{msg.content}</p>
                                  <small className={isOwn ? 'text-white-50' : 'text-muted'}>
                                    {new Date(msg.createdAt).toLocaleTimeString()}
                                  </small>
                                </div>
                              </motion.div>
                            );
                          })}
                        </AnimatePresence>
                        <div ref={messagesEndRef} />
                      </Card.Body>

                      <Card.Footer>
                        <Form onSubmit={handleSendMessage}>
                          <div className="d-flex gap-2">
                            <Form.Control
                              type="text"
                              placeholder="Type a message..."
                              value={newMessage}
                              onChange={(e) => setNewMessage(e.target.value)}
                              autoFocus
                            />
                            <Button type="submit" variant="primary">
                              <i className="bi bi-send"></i>
                            </Button>
                          </div>
                        </Form>
                      </Card.Footer>
                    </>
                  ) : (
                    <Card.Body className="d-flex align-items-center justify-content-center">
                      <div className="text-center text-muted">
                        <i className="bi bi-chat-square-text fs-1 d-block mb-3"></i>
                        <h4>Select a conversation to start chatting</h4>
                        <p>or click "New" to start a new conversation</p>
                      </div>
                    </Card.Body>
                  )}
                </Card>
              </Col>
            </Row>
          </motion.div>
        </Container>
      </div>
    </div>
  );
};

export default ChatPage;
