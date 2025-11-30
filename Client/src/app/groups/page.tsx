"use client";

import { useState, useEffect, useMemo } from "react";
import { motion } from "framer-motion";
import { MessageCircle, Receipt, MapPin, Users, Car } from "lucide-react";
import { AnimatedBackground } from "@/components/ui/animated-background";
import { PoolNavbar } from "@/components/poolNavbar";
import { ChatWindow } from "@/components/chat/ChatWindow";
import { ExpenseTracker } from "@/components/expense/ExpenseTracker";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { poolApi, authApi } from "@/lib";
import { useToast } from "@/hooks/use-toast";
import { formatDate } from "@/lib/utils/date-utils";
import { Pool } from "@/types/pool";
import { CurrentUserDetailsProps } from "@/lib/auth";

export default function GroupsPage() {
    const [pools, setPools] = useState<Pool[]>([]);
    const [currentUser, setCurrentUser] = useState<CurrentUserDetailsProps | null>(null);
    const [selectedPool, setSelectedPool] = useState<Pool | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const { toast } = useToast();

    useEffect(() => {
        const fetchData = async () => {
            try {
                setIsLoading(true);
                const [poolData, userData] = await Promise.all([
                    poolApi.getAllPools(),
                    authApi.getCurrentUser()
                ]);
                setPools(poolData);
                setCurrentUser(userData);
                if (userData) {
                    sessionStorage.setItem("user", JSON.stringify(userData));
                }
            } catch (error) {
                console.error("Error fetching data:", error);
                toast({ title: "Error", description: "Failed to load groups", variant: "destructive" });
            } finally {
                setIsLoading(false);
            }
        };
        fetchData();
    }, [toast]);

    const myGroups = useMemo(() => {
        if (!currentUser) return [];
        return pools.filter(pool => {
            const isCreator = (pool.creator?.email === currentUser.email) || (pool.created_by?.email === currentUser.email);
            const isCreatorById = pool.creatorId === currentUser.id;
            const isPassenger = pool.passengers?.some(p => p.fullName === currentUser.full_name);

            return isCreator || isCreatorById || isPassenger;
        });
    }, [pools, currentUser]);

    return (
        <AnimatedBackground variant="paths" intensity="subtle" className="min-h-screen">
            <PoolNavbar />
            <div className="container mx-auto p-4 h-[calc(100vh-80px)]">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 h-full">
                    {/* Groups List */}
                    <div className="md:col-span-1 bg-card/50 backdrop-blur-md rounded-lg border border-border flex flex-col overflow-hidden shadow-sm">
                        <div className="p-4 border-b border-border">
                            <h2 className="text-xl font-semibold text-primary">My Groups</h2>
                        </div>
                        <div className="flex-1 overflow-y-auto p-4 space-y-3">
                            {isLoading ? (
                                <div className="flex justify-center items-center py-10">
                                    <div className="h-10 w-10 border-4 border-primary/30 border-t-primary rounded-full animate-spin"></div>
                                </div>
                            ) : myGroups.length > 0 ? (
                                myGroups.map(pool => (
                                    <motion.div
                                        key={pool.id}
                                        whileHover={{ scale: 1.02 }}
                                        whileTap={{ scale: 0.98 }}
                                        onClick={() => setSelectedPool(pool)}
                                        className={`p-3 rounded-lg cursor-pointer border transition-colors ${selectedPool?.id === pool.id
                                            ? "bg-primary/10 border-primary"
                                            : "bg-card border-border hover:bg-accent"
                                            }`}
                                    >
                                        <div className="flex justify-between items-start">
                                            <h3 className="font-medium truncate text-foreground">{pool.origin || pool.start_point} to {pool.destination || pool.end_point}</h3>
                                            <span className="text-xs text-muted-foreground">{formatDate(pool.departureTime || pool.departure_time || "")}</span>
                                        </div>
                                        <div className="flex items-center gap-2 mt-2 text-xs text-muted-foreground">
                                            <span className="flex items-center gap-1"><MapPin size={12} /> {pool.transportMode || pool.transport_mode}</span>
                                            <span className="flex items-center gap-1"><Users size={12} /> {pool.passengers?.length || pool.members?.length || 1} Members</span>
                                        </div>
                                    </motion.div>
                                ))
                            ) : (
                                <div className="text-center py-10 px-4">
                                    <div className="bg-muted rounded-full w-16 h-16 flex items-center justify-center mx-auto mb-4">
                                        <Car className="w-8 h-8 text-muted-foreground" />
                                    </div>
                                    <h3 className="text-lg font-medium mb-2 text-foreground">No Groups Yet</h3>
                                    <p className="text-sm text-muted-foreground mb-4">
                                        You haven&apos;t joined any ride groups yet. Find a ride to get started!
                                    </p>
                                    <Button
                                        variant="outline"
                                        className="w-full"
                                        onClick={() => window.location.href = '/pools'}
                                    >
                                        Find a Ride
                                    </Button>
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Chat & Expenses Area */}
                    <div className="md:col-span-2 h-full">
                        {selectedPool && currentUser ? (
                            <Tabs defaultValue="chat" className="h-full flex flex-col">
                                <TabsList className="w-full justify-start bg-card/50 backdrop-blur-md border border-border mb-4">
                                    <TabsTrigger value="chat" className="flex items-center gap-2 data-[state=active]:bg-primary data-[state=active]:text-primary-foreground">
                                        <MessageCircle size={16} /> Chat
                                    </TabsTrigger>
                                    <TabsTrigger value="expenses" className="flex items-center gap-2 data-[state=active]:bg-primary data-[state=active]:text-primary-foreground">
                                        <Receipt size={16} /> Expenses
                                    </TabsTrigger>
                                </TabsList>

                                <TabsContent value="chat" className="flex-1 mt-0">
                                    <ChatWindow groupId={String(selectedPool.id)} currentUser={currentUser} />
                                </TabsContent>

                                <TabsContent value="expenses" className="flex-1 mt-0">
                                    <ExpenseTracker groupId={String(selectedPool.id)} />
                                </TabsContent>
                            </Tabs>
                        ) : (
                            <div className="h-full flex items-center justify-center bg-card/30 rounded-lg border border-border border-dashed">
                                <div className="text-center text-muted-foreground">
                                    <MessageCircle size={48} className="mx-auto mb-4 opacity-50" />
                                    <p>Select a group to view chat and expenses</p>
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </AnimatedBackground>
    );
}
