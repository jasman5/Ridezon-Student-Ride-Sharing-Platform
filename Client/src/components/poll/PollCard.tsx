"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { Check, User } from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { useToast } from "@/hooks/use-toast";

export interface PollOption {
    id: string;
    text: string;
    votes: { userId: string }[];
}

export interface Poll {
    id: string;
    question: string;
    createdAt: string;
    creator: {
        id: string;
        fullName: string;
        avatar?: string;
    };
    options: PollOption[];
}

interface PollCardProps {
    poll: Poll;
    currentUserId: string;
    onVote: (pollId: string, optionId: string) => Promise<void>;
}

export function PollCard({ poll, currentUserId, onVote }: PollCardProps) {
    const [isVoting, setIsVoting] = useState(false);
    const { toast } = useToast();

    const totalVotes = poll.options.reduce((acc, opt) => acc + opt.votes.length, 0);

    const handleVote = async (optionId: string) => {
        if (isVoting) return;
        setIsVoting(true);
        try {
            await onVote(poll.id, optionId);
        } catch (error) {
            console.error("Vote error:", error);
            toast({
                title: "Error",
                description: "Failed to cast vote",
                variant: "destructive",
            });
        } finally {
            setIsVoting(false);
        }
    };

    return (
        <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-card/50 backdrop-blur-md rounded-lg border border-border p-4 mb-4"
        >
            <div className="flex items-start justify-between mb-4">
                <div className="flex items-center gap-2">
                    <Avatar className="h-8 w-8">
                        <AvatarImage src={poll.creator.avatar} />
                        <AvatarFallback><User size={14} /></AvatarFallback>
                    </Avatar>
                    <div>
                        <p className="text-sm font-medium text-muted-foreground">
                            {poll.creator.fullName} asked:
                        </p>
                        <h3 className="text-lg font-semibold">{poll.question}</h3>
                    </div>
                </div>
                <span className="text-xs text-muted-foreground">
                    {new Date(poll.createdAt).toLocaleDateString()}
                </span>
            </div>

            <div className="space-y-3">
                {poll.options.map((option) => {
                    const voteCount = option.votes.length;
                    const percentage = totalVotes > 0 ? (voteCount / totalVotes) * 100 : 0;
                    const hasVoted = option.votes.some(v => v.userId === currentUserId);

                    return (
                        <div
                            key={option.id}
                            className={`relative p-3 rounded-md border cursor-pointer transition-all ${hasVoted
                                ? "border-primary bg-primary/10"
                                : "border-border hover:bg-accent/50"
                                }`}
                            onClick={() => handleVote(option.id)}
                        >
                            {/* Progress Bar Background */}
                            <div
                                className="absolute top-0 left-0 h-full bg-primary/5 rounded-md transition-all duration-500"
                                style={{ width: `${percentage}%` }}
                            />

                            <div className="relative flex justify-between items-center z-10">
                                <div className="flex items-center gap-2">
                                    {hasVoted && <Check size={16} className="text-primary" />}
                                    <span className={hasVoted ? "font-medium text-primary" : ""}>
                                        {option.text}
                                    </span>
                                </div>
                                <div className="flex items-center gap-2 text-sm">
                                    {hasVoted && (
                                        <Avatar className="h-5 w-5 border border-background">
                                            <AvatarImage src="" /> {/* Ideally current user avatar */}
                                            <AvatarFallback className="text-[10px] bg-primary text-primary-foreground">
                                                You
                                            </AvatarFallback>
                                        </Avatar>
                                    )}
                                    <span className="text-muted-foreground">
                                        {voteCount} {voteCount === 1 ? "vote" : "votes"} ({Math.round(percentage)}%)
                                    </span>
                                </div>
                            </div>
                        </div>
                    );
                })}
            </div>

            <div className="mt-3 text-right text-xs text-muted-foreground">
                Total votes: {totalVotes}
            </div>
        </motion.div>
    );
}
