import React, { useState, useEffect } from 'react';
import { useSocket } from '../../../context/SocketContext';

export const FloatingChat = ({ tripId, currentUser, isEmbedded = false }) => {
    const socket = useSocket();
    const [messages, setMessages] = useState([]);
    const [inputValue, setInputValue] = useState("");
    const [isOpen, setIsOpen] = useState(false);

    useEffect(() => {
        if (!socket) return;

        socket.emit("join_trip", tripId);

        socket.on("receive_message", (incomingMessage) => {
            setMessages((prev) => [...prev, incomingMessage]);
        });

        return () => {
            socket.off("receive_message");
        };
    }, [socket, tripId]);

    const handleSendMessage = (e) => {
        e.preventDefault();
        if (!inputValue.trim()) return;

        const messageData = {
            tripId: tripId,
            text: inputValue,
            sender: currentUser,
            timestamp: new Date().toISOString()
        };

        socket.emit("send_message", messageData);

        setMessages((prev) => [...prev, messageData]);
        setInputValue("");
    };

    // --- Basic UI ---
    if (isEmbedded) {
        return (
            <div className="bg-white flex flex-col h-full w-full rounded-b-2xl overflow-hidden">
                {/* Messages Area */}
                <div className="flex-1 p-4 overflow-y-auto bg-slate-50 flex flex-col gap-3">
                    {messages.map((msg, index) => (
                        <div
                            key={index}
                            className={`p-3 rounded-2xl max-w-[85%] shadow-sm ${msg.sender === currentUser ? 'bg-sky-500 text-white self-end rounded-tr-sm' : 'bg-white border border-slate-100 text-slate-800 self-start rounded-tl-sm'}`}
                        >
                            <span className={`text-[10px] font-bold block mb-1 uppercase tracking-wider ${msg.sender === currentUser ? 'text-sky-100' : 'text-slate-400'}`}>{msg.sender}</span>
                            <p className="text-sm">{msg.text}</p>
                        </div>
                    ))}
                </div>

                {/* Input Area */}
                <form onSubmit={handleSendMessage} className="p-4 border-t border-slate-100 flex gap-3 bg-white">
                    <input
                        type="text"
                        value={inputValue}
                        onChange={(e) => setInputValue(e.target.value)}
                        className="flex-1 border border-slate-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:border-sky-500 focus:ring-2 focus:ring-sky-500/20 transition-all bg-slate-50"
                        placeholder="Type a message..."
                    />
                    <button type="submit" className="bg-sky-500 text-white px-6 py-2.5 rounded-xl text-sm font-bold shadow-sm shadow-sky-500/30 hover:bg-sky-600 transition-colors">Send</button>
                </form>
            </div>
        );
    }

    return (
        <div className="fixed bottom-4 right-4 z-50">
            {!isOpen ? (
                <button
                    onClick={() => setIsOpen(true)}
                    className="bg-blue-600 text-white p-4 rounded-full shadow-lg hover:bg-blue-700"
                >
                    💬 Chat
                </button>
            ) : (
                <div className="bg-white rounded-lg shadow-2xl w-80 h-96 flex flex-col border border-gray-200">
                    {/* Header */}
                    <div className="bg-blue-600 text-white p-3 rounded-t-lg flex justify-between items-center">
                        <h3 className="font-bold">Trip Chat</h3>
                        <button onClick={() => setIsOpen(false)} className="text-white hover:text-gray-200">✖</button>
                    </div>

                    {/* Messages Area */}
                    <div className="flex-1 p-3 overflow-y-auto bg-gray-50 flex flex-col gap-2">
                        {messages.map((msg, index) => (
                            <div
                                key={index}
                                className={`p-2 rounded-lg max-w-[80%] ${msg.sender === currentUser ? 'bg-blue-100 self-end rounded-tr-none' : 'bg-white border self-start rounded-tl-none'}`}
                            >
                                <span className="text-xs font-bold text-gray-500 block mb-1">{msg.sender}</span>
                                <p className="text-sm">{msg.text}</p>
                            </div>
                        ))}
                    </div>

                    {/* Input Area */}
                    <form onSubmit={handleSendMessage} className="p-3 border-t flex gap-2 bg-white rounded-b-lg">
                        <input
                            type="text"
                            value={inputValue}
                            onChange={(e) => setInputValue(e.target.value)}
                            className="flex-1 border rounded px-2 py-1 text-sm focus:outline-none focus:border-blue-500"
                            placeholder="Type a message..."
                        />
                        <button type="submit" className="bg-blue-600 text-white px-3 py-1 rounded text-sm">Send</button>
                    </form>
                </div>
            )}
        </div>
    );
};
