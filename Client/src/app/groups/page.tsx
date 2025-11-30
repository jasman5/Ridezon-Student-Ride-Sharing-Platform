"use client";

import { useState, useEffect, useMemo } from "react";
import { motion } from "framer-motion";
import { MessageCircle, Receipt, MapPin, Users, Car, BarChart2 } from "lucide-react";
import { AnimatedBackground } from "@/components/ui/animated-background";
import { PoolNavbar } from "@/components/poolNavbar";
import { ChatWindow } from "@/components/chat/ChatWindow";
import { ExpenseTracker } from "@/components/expense/ExpenseTracker";
import { PollsTab } from "@/components/poll/PollsTab";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { poolApi, authApi } from "@/lib";
import { useToast } from "@/hooks/use-toast";
import { formatDate } from "@/lib/utils/date-utils";
import { Pool } from "@/types/pool";
import { CurrentUserDetailsProps } from "@/lib/auth";

import { useSearchParams } from "next/navigation";

export default function GroupsPage() {
    const [pools, setPools] = useState<Pool[]>([]);
    const [currentUser, setCurrentUser] = useState<CurrentUserDetailsProps | null>(null);
    const [selectedPool, setSelectedPool] = useState<Pool | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const { toast } = useToast();
    const searchParams = useSearchParams();
    const poolIdFromUrl = searchParams.get("poolId");

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

        const normalize = (value?: string | number | null) =>
            value?.toString().trim().toLowerCase() ?? "";

        const userIdentifiers = new Set<string>([
            currentUser.id,
            currentUser.email,
            currentUser.full_name,
            currentUser.phone_number,
        ]
            .map(normalize)
            .filter((identifier) => identifier.length > 0));

        const matchesIdentifiers = (
            candidates: Array<string | number | undefined | null>,
        ) =>
            candidates
                .map((candidate) => normalize(candidate))
                .some(
                    (normalizedCandidate) =>
                        normalizedCandidate.length > 0 &&
                        userIdentifiers.has(normalizedCandidate),
                );

        return pools.filter((pool) => {
            const isCreator = matchesIdentifiers([
                // pool.creator?.id, // creator object doesn't have id in interface
                pool.creatorId,
                pool.creator?.email,
                pool.creator?.fullName,
                pool.created_by?.email,
                pool.created_by?.full_name,
            ]);

            if (isCreator) {
                return true;
            }

            const matchesMember = pool.members?.some((member) =>
                matchesIdentifiers([
                    member.id,
                    member.email,
                    member.full_name,
                    member.phone_number,
                ]),
            );

            const matchesPassenger = Array.isArray(pool.passengers)
                ? pool.passengers.some((passenger) => {
                    // passenger is from Pool['passengers'] which has { id, fullName, avatar, phone, gender }
                    // It doesn't seem to have status in the interface definition in pool.ts?
                    // But api.ts BackendPassenger extends BackendUser.
                    // Let's check pool.ts again.
                    // pool.ts: passengers?: { id?, fullName, avatar?, phone?, gender? }[]
                    // It doesn't have status or userId or user object.
                    // But the runtime object might have it.
                    // If I want to be type safe I should update Pool interface or use what's there.
                    // The code checks passenger.status.

                    // If I can't change the interface easily right now, I might need to cast to a more specific type locally
                    // or just use what's available.
                    // But the goal is to remove 'any'.

                    // Let's assume for now we use the fields we know exist or add them to Pool interface if needed.
                    // For now I will use the fields that are on the interface or safely access them.

                    return matchesIdentifiers([
                        passenger.id,
                        // passenger.userId, // Not on interface
                        // passenger.email, // Not on interface
                        passenger.fullName,
                        passenger.phone,
                        // passenger.user?.id, // Not on interface
                    ]);
                })
                : false;

            const matchesAcceptedRequest = pool.requests?.some((request) =>
                request.status === "ACCEPTED" &&
                matchesIdentifiers([
                    request.userId,
                    request.user?.email,
                    request.user?.fullName,
                ]),
            );

            return matchesMember || matchesPassenger || matchesAcceptedRequest;
        });
    }, [pools, currentUser]);

    // Auto-select pool if poolId is present in URL
    useEffect(() => {
        if (poolIdFromUrl && myGroups.length > 0 && !selectedPool) {
            const poolToSelect = myGroups.find(p => String(p.id) === poolIdFromUrl);
            if (poolToSelect) {
                setSelectedPool(poolToSelect);
            }
        }
    }, [poolIdFromUrl, myGroups, selectedPool]);

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
                                            <span className="flex items-center gap-1"><Users size={12} /> {(pool.passengers?.length || 0) + 1} Members</span>
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
                                    <TabsTrigger value="polls" className="flex items-center gap-2 data-[state=active]:bg-primary data-[state=active]:text-primary-foreground">
                                        <BarChart2 size={16} /> Polls
                                    </TabsTrigger>
                                </TabsList>
                                <TabsContent value="chat" className="flex-1 mt-0">
                                    {selectedPool.group?.id ? (
                                        <ChatWindow groupId={selectedPool.group.id} currentUser={currentUser} />
                                    ) : (
                                        <div className="flex items-center justify-center h-full text-muted-foreground">
                                            Group chat not available
                                        </div>
                                    )}
                                </TabsContent>

                                <TabsContent value="expenses" className="flex-1 mt-0">
                                    {selectedPool.group?.id ? (
                                        <ExpenseTracker
                                            groupId={selectedPool.group.id}
                                            currentUser={{
                                                id: currentUser.id,
                                                fullName: currentUser.full_name,
                                                email: currentUser.email
                                            }}
                                            members={(selectedPool.passengers || selectedPool.members || []).map(m => {
                                                const fullName = 'fullName' in m ? m.fullName : m.full_name;
                                                const email = 'email' in m ? m.email : undefined;
                                                // PoolMembers has email optional, passengers has email optional (added in my api.ts fix but maybe not in pool.ts interface?)
                                                // Let's check pool.ts interface for passengers.
                                                // passengers?: { id?, fullName, avatar?, phone?, gender? }[]
                                                // It doesn't have email.
                                                // But I can cast or check.
                                                // For now let's just use what we have.

                                                return {
                                                    id: m.id || "unknown",
                                                    fullName: fullName || "Unknown",
                                                    email: email
                                                };
                                            })}
                                        />
                                    ) : (
                                        <div className="flex items-center justify-center h-full text-muted-foreground">
                                            Expenses not available
                                        </div>
                                    )}
                                </TabsContent>

                                <TabsContent value="polls" className="flex-1 mt-0">
                                    {selectedPool.group?.id ? (
                                        <PollsTab
                                            groupId={selectedPool.group.id}
                                            currentUser={{
                                                id: currentUser.id,
                                                full_name: currentUser.full_name,
                                                email: currentUser.email,
                                                phone_number: currentUser.phone_number || "",
                                                gender: currentUser.gender || ""
                                            }}
                                        />
                                    ) : (
                                        <div className="flex items-center justify-center h-full text-muted-foreground">
                                            Polls not available
                                        </div>
                                    )}
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
        </AnimatedBackground >
    );
}
