'use client';

import { useEffect, useState, useRef } from 'react';
import axios from 'axios';
import { io } from 'socket.io-client';
import Header from '../../../components/header';
import { useRouter } from 'next/navigation';

export default function AdminChatPage() {
    const [users, setUsers] = useState([]);
    const [selectedUser, setSelectedUser] = useState(null);
    const [messages, setMessages] = useState([]);
    const [text, setText] = useState('');
    const [unreadMap, setUnreadMap] = useState({});
    const [socketInstance, setSocketInstance] = useState(null); // Thêm state quản lý socket
    const [isCheckingAuth, setIsCheckingAuth] = useState(true);
    const bottomRef = useRef();
    const router = useRouter();

    // Setup axios token
    useEffect(() => {
        axios.interceptors.request.use(
            (config) => {
                const token = localStorage.getItem('token');
                if (token) config.headers.Authorization = `Bearer ${token}`;
                return config;
            },
            (error) => Promise.reject(error)
        );
    }, []);

    // Check login token + khởi tạo socket
    useEffect(() => {
        const token = localStorage.getItem('token');
        if (!token) {
            router.push('/admin');
        } else {
            const sock = io(`${process.env.NEXT_PUBLIC_API_URL}`, {
                auth: { token },
            });
            setSocketInstance(sock); // Lưu socket
            setIsCheckingAuth(false); // Cho render UI

            return () => sock.disconnect(); // Cleanup socket
        }
    }, [router]);

    // Nhận tin nhắn
    useEffect(() => {
        if (!socketInstance) return;

        const handleReceiveMessage = (data) => {
            const { telegramId } = data;
            if (selectedUser && String(telegramId) === String(selectedUser.telegramId)) {
                setMessages((prev) => [...prev, data]);
            } else {
                setUnreadMap((prev) => ({
                    ...prev,
                    [telegramId]: (prev[telegramId] || 0) + 1,
                }));
            }
        };

        socketInstance.on('receive-message', handleReceiveMessage);
        return () => socketInstance.off('receive-message', handleReceiveMessage);
    }, [socketInstance, selectedUser?.telegramId]);

    // Fetch users + unread
    useEffect(() => {
        const fetchData = async () => {
            const [usersRes, unreadRes] = await Promise.all([
                axios.get(`${process.env.NEXT_PUBLIC_API_URL}/api/users`),
                axios.get(`${process.env.NEXT_PUBLIC_API_URL}/api/unread-map`),
            ]);
            setUsers(usersRes.data);
            setUnreadMap(unreadRes.data);
        };
        fetchData();
    }, []);

    const handleSelectUser = async (user) => {
        setSelectedUser(user);
        setUnreadMap((prev) => ({ ...prev, [user.telegramId]: 0 }));
        await axios.post(`${process.env.NEXT_PUBLIC_API_URL}/api/mark-read/${user.telegramId}`);
        const res = await axios.get(`${process.env.NEXT_PUBLIC_API_URL}/api/messages/${user.telegramId}`);
        setMessages(res.data);
    };

    const send = () => {
        if (!text.trim() || !selectedUser || !socketInstance) return;
        socketInstance.emit('send-message', {
            telegramId: selectedUser.telegramId,
            message: text,
        });
        setText('');
    };

    useEffect(() => {
        bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, [messages]);

    if (isCheckingAuth) {
        return (
            <div className="flex justify-center items-center h-screen bg-[#1e1e2f] text-white">
                <p>🔒 Đang kiểm tra đăng nhập...</p>
            </div>
        );
    }

    return (
        <div>
            <Header />
            <div className="flex h-screen bg-[#1e1e2f] text-white">
                {/* Sidebar */}
                <div className="w-[300px] bg-[#2a2f4a] p-4 overflow-y-auto border-r border-[#3a3f5c]">
                    <h2 className="text-lg font-bold mb-4 text-gray-200">📋 Người dùng Telegram</h2>
                    {[...users].sort((a, b) => (unreadMap[b.telegramId] || 0) - (unreadMap[a.telegramId] || 0))
                        .map((user, index) => {
                            const unread = unreadMap[user.telegramId] || 0;
                            const isActive = selectedUser?.telegramId === user.telegramId;
                            return (
                                <div
                                    key={`${user.telegramId}_${index}`}
                                    onClick={() => handleSelectUser(user)}
                                    className={`relative cursor-pointer p-3 rounded-lg mb-2 text-sm transition ${isActive ? 'bg-[#3c456d]' : 'hover:bg-[#333a55]'}`}
                                >
                                    <div className="flex justify-between items-center">
                                        <span className="truncate max-w-[190px] text-gray-100 font-medium">
                                            {user.fullName || user.username || user.telegramId}
                                        </span>
                                        {unread > 0 && (
                                            <span className="bg-red-500 text-white text-xs rounded-full px-2 py-0.5">{unread}</span>
                                        )}
                                    </div>
                                </div>
                            );
                        })}
                </div>

                {/* Chat box */}
                <div className="flex-1 flex flex-col bg-[#1e1e2f]">
                    {selectedUser ? (
                        <>
                            <div className="px-6 py-4 border-b border-[#2e3353] text-base font-semibold text-white">
                                💬 Chat với: {selectedUser.fullName || selectedUser.telegramId}
                            </div>
                            <div className="flex-1 overflow-y-auto px-6 py-4 space-y-2">
                                {messages.map((msg, i) => (
                                    <div key={i} className={`flex ${msg.direction === 'cskh' ? 'justify-end' : 'justify-start'}`}>
                                        <div className={`rounded-xl px-4 py-2 max-w-[70%] text-sm leading-relaxed whitespace-pre-wrap ${msg.direction === 'cskh' ? 'bg-[#5db26d] text-white' : 'bg-[#2f364c] text-gray-200'}`}>
                                            {msg.message}
                                        </div>
                                    </div>
                                ))}
                                <div ref={bottomRef}></div>
                            </div>
                            <div className="flex items-center px-6 py-4 border-t border-[#2e3353] gap-3">
                                <input
                                    className="flex-1 bg-[#2a2f4a] text-white px-4 py-2 rounded-full focus:outline-none placeholder-gray-400"
                                    value={text}
                                    onChange={(e) => setText(e.target.value)}
                                    onKeyDown={(e) => e.key === 'Enter' && send()}
                                    placeholder="Nhập tin nhắn..."
                                />
                                <button onClick={send} className="w-10 h-10 rounded-full bg-blue-500 hover:bg-blue-600 flex items-center justify-center" title="Gửi">
                                    ➤
                                </button>
                            </div>
                        </>
                    ) : (
                        <p className="text-gray-400 p-6">🛈 Chọn một người dùng để bắt đầu trò chuyện.</p>
                    )}
                </div>
            </div>
        </div>
    );
}
