"use client";

import { useState, useEffect, useCallback } from "react";
import { Plus, BarChart2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog";
import { PollCard, Poll } from "./PollCard";
import { CreatePollModal } from "./CreatePollModal";
import { useToast } from "@/hooks/use-toast";
import { CurrentUserDetailsProps } from "@/lib/auth";

interface PollsTabProps {
    groupId: string;
    currentUser: CurrentUserDetailsProps;
}

export function PollsTab({ groupId, currentUser }: PollsTabProps) {
    const [polls, setPolls] = useState<Poll[]>([]);
    const [isCreateOpen, setIsCreateOpen] = useState(false);
    const [isLoading, setIsLoading] = useState(true);
    const { toast } = useToast();

    const fetchPolls = useCallback(async () => {
        try {
            const response = await fetch(`https://ridezon.mlsctiet.com/api/groups/${groupId}/polls`, {
                headers: {
                    Authorization: `Bearer ${sessionStorage.getItem("access")}`,
                },
            });
            if (response.ok) {
                const data = await response.json();
                setPolls(data);
            }
        } catch (error) {
            console.error("Error fetching polls:", error);
        } finally {
            setIsLoading(false);
        }
    }, [groupId]);

    useEffect(() => {
        fetchPolls();
    }, [fetchPolls]);

    const handleCreatePoll = async (data: { question: string; options: string[] }) => {
        try {
            const response = await fetch(`https://ridezon.mlsctiet.com/api/groups/${groupId}/polls`, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    Authorization: `Bearer ${sessionStorage.getItem("access")}`,
                },
                body: JSON.stringify(data),
            });

            if (response.ok) {
                toast({
                    title: "Success",
                    description: "Poll created successfully",
                });
                setIsCreateOpen(false);
                fetchPolls(); // Refresh list
            } else {
                throw new Error("Failed to create poll");
            }
        } catch (error) {
            throw error; // Re-throw for modal to handle
        }
    };

    const handleVote = async (pollId: string, optionId: string) => {
        try {
            const response = await fetch(`https://ridezon.mlsctiet.com/api/polls/${pollId}/vote/${optionId}`, {
                method: "POST",
                headers: {
                    Authorization: `Bearer ${sessionStorage.getItem("access")}`,
                },
            });

            if (response.ok) {
                fetchPolls(); // Refresh to show new votes
            } else {
                throw new Error("Failed to vote");
            }
        } catch (error) {
            throw error;
        }
    };

    return (
        <div className="h-full flex flex-col">
            <div className="flex justify-between items-center mb-4 px-1">
                <h3 className="font-semibold text-lg flex items-center gap-2">
                    <BarChart2 className="text-primary" size={20} />
                    Active Polls
                </h3>
                <Button onClick={() => setIsCreateOpen(true)} size="sm" className="gap-1">
                    <Plus size={16} /> New Poll
                </Button>
            </div>

            <div className="flex-1 overflow-y-auto pr-2 space-y-4">
                {isLoading ? (
                    <div className="flex justify-center py-10">
                        <div className="h-8 w-8 border-4 border-primary/30 border-t-primary rounded-full animate-spin"></div>
                    </div>
                ) : polls.length > 0 ? (
                    polls.map((poll) => (
                        <PollCard
                            key={poll.id}
                            poll={poll}
                            currentUserId={currentUser.id}
                            onVote={handleVote}
                        />
                    ))
                ) : (
                    <div className="text-center py-10 text-muted-foreground bg-card/30 rounded-lg border border-border border-dashed">
                        <BarChart2 size={48} className="mx-auto mb-4 opacity-50" />
                        <p>No polls yet. Create one to ask the group!</p>
                    </div>
                )}
            </div>

            <Dialog open={isCreateOpen} onOpenChange={setIsCreateOpen}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>Create a Poll</DialogTitle>
                    </DialogHeader>
                    <CreatePollModal
                        onSubmit={handleCreatePoll}
                        onCancel={() => setIsCreateOpen(false)}
                    />
                </DialogContent>
            </Dialog>
        </div>
    );
}
