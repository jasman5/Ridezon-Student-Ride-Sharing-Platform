import { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Checkbox } from "@/components/ui/checkbox";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";

interface User {
    id: string;
    fullName: string;
    email?: string;
}

export interface CreateExpenseData {
    description: string;
    amount: number;
    type: string;
    splitDetails: Record<string, {
        amount: number;
        settled: boolean;
        percentage?: number;
    }>;
}

interface AddExpenseModalProps {
    isOpen: boolean;
    onClose: () => void;
    onAdd: (expense: CreateExpenseData) => void;
    members: User[];
    currentUser: User;
}

export function AddExpenseModal({ isOpen, onClose, onAdd, members, currentUser }: AddExpenseModalProps) {
    const [description, setDescription] = useState("");
    const [amount, setAmount] = useState("");
    const [splitType, setSplitType] = useState("EQUAL");
    const [selectedMembers, setSelectedMembers] = useState<string[]>(members.map(m => m.id));
    const [splitDetails, setSplitDetails] = useState<Record<string, number>>({});

    // Reset state when modal opens
    useEffect(() => {
        if (isOpen) {
            setDescription("");
            setAmount("");
            setSplitType("EQUAL");
            setSelectedMembers(members.map(m => m.id));
            setSplitDetails({});
        }
    }, [isOpen, members]);

    const handleToggleMember = (memberId: string) => {
        if (selectedMembers.includes(memberId)) {
            setSelectedMembers(selectedMembers.filter(id => id !== memberId));
        } else {
            setSelectedMembers([...selectedMembers, memberId]);
        }
    };

    const handleSplitChange = (memberId: string, value: string) => {
        setSplitDetails(prev => ({
            ...prev,
            [memberId]: parseFloat(value) || 0
        }));
    };

    const validateSplit = () => {
        const totalAmount = parseFloat(amount);
        if (isNaN(totalAmount) || totalAmount <= 0) return false;

        if (splitType === "EQUAL") {
            return selectedMembers.length > 0;
        } else if (splitType === "EXACT") {
            const sum = Object.values(splitDetails).reduce((a, b) => a + b, 0);
            return Math.abs(sum - totalAmount) < 0.01;
        } else if (splitType === "PERCENTAGE") {
            const sum = Object.values(splitDetails).reduce((a, b) => a + b, 0);
            return Math.abs(sum - 100) < 0.01;
        }
        return false;
    };

    const handleSubmit = () => {
        if (!validateSplit()) return;

        const finalSplitDetails: Record<string, { amount: number; settled: boolean; percentage?: number }> = {};
        const totalAmount = parseFloat(amount);

        if (splitType === "EQUAL") {
            const splitAmount = totalAmount / selectedMembers.length;
            selectedMembers.forEach(memberId => {
                finalSplitDetails[memberId] = {
                    amount: splitAmount,
                    settled: memberId === currentUser.id // Payer is settled with themselves
                };
            });
        } else if (splitType === "EXACT") {
            Object.keys(splitDetails).forEach(memberId => {
                finalSplitDetails[memberId] = {
                    amount: splitDetails[memberId],
                    settled: memberId === currentUser.id
                };
            });
        } else if (splitType === "PERCENTAGE") {
            Object.keys(splitDetails).forEach(memberId => {
                const percentage = splitDetails[memberId];
                finalSplitDetails[memberId] = {
                    amount: (totalAmount * percentage) / 100,
                    percentage: percentage,
                    settled: memberId === currentUser.id
                };
            });
        }

        onAdd({
            description,
            amount: totalAmount,
            type: splitType,
            splitDetails: finalSplitDetails
        });
    };

    return (
        <Dialog open={isOpen} onOpenChange={onClose}>
            <DialogContent className="sm:max-w-[500px]">
                <DialogHeader>
                    <DialogTitle>Add Expense</DialogTitle>
                </DialogHeader>
                <div className="space-y-4 py-4">
                    <div className="space-y-2">
                        <Label>Description</Label>
                        <Input
                            value={description}
                            onChange={(e) => setDescription(e.target.value)}
                            placeholder="What is this for?"
                        />
                    </div>
                    <div className="space-y-2">
                        <Label>Amount</Label>
                        <Input
                            type="number"
                            value={amount}
                            onChange={(e) => setAmount(e.target.value)}
                            placeholder="0.00"
                        />
                    </div>

                    <Tabs defaultValue="EQUAL" onValueChange={setSplitType}>
                        <TabsList className="grid w-full grid-cols-3">
                            <TabsTrigger value="EQUAL">Equally</TabsTrigger>
                            <TabsTrigger value="EXACT">Unequally</TabsTrigger>
                            <TabsTrigger value="PERCENTAGE">By %</TabsTrigger>
                        </TabsList>

                        <ScrollArea className="h-[200px] mt-4 border rounded-md p-2">
                            <div className="space-y-2">
                                {members.map(member => (
                                    <div key={member.id} className="flex items-center justify-between p-2 hover:bg-accent rounded-md">
                                        <div className="flex items-center gap-2">
                                            {splitType === "EQUAL" && (
                                                <Checkbox
                                                    checked={selectedMembers.includes(member.id)}
                                                    onCheckedChange={() => handleToggleMember(member.id)}
                                                />
                                            )}
                                            <Avatar className="h-8 w-8">
                                                <AvatarFallback>{member.fullName[0]}</AvatarFallback>
                                            </Avatar>
                                            <span className="text-sm font-medium">{member.fullName} {member.id === currentUser.id && "(You)"}</span>
                                        </div>

                                        {splitType !== "EQUAL" && (
                                            <div className="flex items-center gap-1">
                                                <Input
                                                    type="number"
                                                    className="w-20 h-8 text-right"
                                                    placeholder="0"
                                                    value={splitDetails[member.id] || ""}
                                                    onChange={(e) => handleSplitChange(member.id, e.target.value)}
                                                />
                                                <span className="text-xs text-muted-foreground">
                                                    {splitType === "PERCENTAGE" ? "%" : "₹"}
                                                </span>
                                            </div>
                                        )}
                                    </div>
                                ))}
                            </div>
                        </ScrollArea>
                    </Tabs>

                    {splitType === "EXACT" && (
                        <div className="text-right text-sm text-muted-foreground">
                            Total: {Object.values(splitDetails).reduce((a, b) => a + b, 0)} / {amount || 0}
                        </div>
                    )}
                    {splitType === "PERCENTAGE" && (
                        <div className="text-right text-sm text-muted-foreground">
                            Total: {Object.values(splitDetails).reduce((a, b) => a + b, 0)}% / 100%
                        </div>
                    )}

                </div>
                <DialogFooter>
                    <Button variant="outline" onClick={onClose}>Cancel</Button>
                    <Button onClick={handleSubmit} disabled={!description || !amount || !validateSplit()}>Save</Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}
