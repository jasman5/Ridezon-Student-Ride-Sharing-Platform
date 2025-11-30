"use client";

import { useState, useEffect, useRef } from "react";
import { motion } from "framer-motion";
import { Send, User } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { io, Socket } from "socket.io-client";
import { useToast } from "@/hooks/use-toast";
import { CurrentUserDetailsProps } from "@/lib/auth";

interface Message {
    id: string;
    content: string;
    senderId: string;
    sender: {
        id: string;
        fullName: string;
        avatar?: string;
    };
    createdAt: string;
}

interface ChatWindowProps {
    groupId: string;
    currentUser: CurrentUserDetailsProps;
}

export function ChatWindow({ groupId, currentUser }: ChatWindowProps) {
    const [messages, setMessages] = useState<Message[]>([]);
    const [newMessage, setNewMessage] = useState("");
    const [socket, setSocket] = useState<Socket | null>(null);
    const scrollRef = useRef<HTMLDivElement>(null);
    const { toast } = useToast();

    useEffect(() => {
        // Initialize Socket.io
        const newSocket = io("http://localhost:4000"); // Update with actual backend URL
        setSocket(newSocket);

        newSocket.emit("join_group", groupId);

        newSocket.on("receive_message", (message: Message) => {
            setMessages((prev) => [...prev, message]);
        });

        // Fetch initial messages
        const fetchMessages = async () => {
            try {
                const response = await fetch(`http://localhost:4000/api/groups/${groupId}/messages`, {
                    headers: {
                        Authorization: `Bearer ${sessionStorage.getItem("access")}`,
                    }
                });
                if (response.ok) {
                    const data = await response.json();
                    setMessages(data);
                }
            } catch (error) {
                console.error("Error fetching messages:", error);
            }
        };
        fetchMessages();

        return () => {
            newSocket.disconnect();
        };
    }, [groupId]);

    useEffect(() => {
        if (scrollRef.current) {
            scrollRef.current.scrollIntoView({ behavior: "smooth" });
        }
    }, [messages]);

    const handleSendMessage = async () => {
        if (!newMessage.trim() || !socket) return;

        try {
            const response = await fetch(`http://localhost:4000/api/groups/${groupId}/messages`, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    Authorization: `Bearer ${sessionStorage.getItem("access")}`,
                },
                body: JSON.stringify({ content: newMessage }),
            });

            if (response.ok) {
                const savedMessage = await response.json();
                socket.emit("send_message", { ...savedMessage, groupId });
                setNewMessage("");
            }
        } catch {
            toast({
                title: "Error",
                description: "Failed to send message",
                variant: "destructive",
            });
        }
    };

    return (
        <div className="flex flex-col h-[600px] bg-white/10 dark:bg-black/10 backdrop-blur-md rounded-lg border border-white/20 dark:border-white/10">
            <div className="p-4 border-b border-white/10 dark:border-white/5">
                <h3 className="font-semibold text-lg">Group Chat</h3>
            </div>

            <ScrollArea className="flex-1 p-4">
                <div className="space-y-4">
                    {messages.map((msg) => {
                        const isMe = msg.senderId === currentUser.id;
                        return (
                            <motion.div
                                key={msg.id}
                                initial={{ opacity: 0, y: 10 }}
                                animate={{ opacity: 1, y: 0 }}
                                className={`flex ${isMe ? "justify-end" : "justify-start"}`}
                            >
                                <div className={`flex gap-2 max-w-[70%] ${isMe ? "flex-row-reverse" : "flex-row"}`}>
                                    <Avatar className="h-8 w-8">
                                        <AvatarImage src={msg.sender.avatar} />
                                        <AvatarFallback><User size={14} /></AvatarFallback>
                                    </Avatar>
                                    <div
                                        className={`p-3 rounded-lg ${isMe
                                            ? "bg-primary text-primary-foreground"
                                            : "bg-white/20 dark:bg-white/10"
                                            }`}
                                    >
                                        {!isMe && <p className="text-xs font-medium mb-1 opacity-70">{msg.sender.fullName}</p>}
                                        <p className="text-sm">{msg.content}</p>
                                        <p className="text-[10px] mt-1 opacity-50 text-right">
                                            {new Date(msg.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                        </p>
                                    </div>
                                </div>
                            </motion.div>
                        );
                    })}
                    <div ref={scrollRef} />
                </div>
            </ScrollArea>

            <div className="p-4 border-t border-white/10 dark:border-white/5 flex gap-2">
                <Input
                    value={newMessage}
                    onChange={(e) => setNewMessage(e.target.value)}
                    placeholder="Type a message..."
                    className="bg-white/5 dark:bg-black/5 border-white/10"
                    onKeyDown={(e) => e.key === "Enter" && handleSendMessage()}
                />
                <Button onClick={handleSendMessage} size="icon" className="bg-primary hover:bg-primary/90">
                    <Send size={18} />
                </Button>
            </div>
        </div>
    );
}
