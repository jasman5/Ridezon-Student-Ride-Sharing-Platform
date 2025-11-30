"use client";

import { useState, useEffect, useCallback } from "react";
import { motion } from "framer-motion";
import { Plus, Receipt } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { ScrollArea } from "@/components/ui/scroll-area";
import { useToast } from "@/hooks/use-toast";

interface Expense {
    id: string;
    amount: number;
    description: string;
    payer: {
        id: string;
        fullName: string;
    };
    createdAt: string;
}



interface ExpenseTrackerProps {
    groupId: string;
}

export function ExpenseTracker({ groupId }: ExpenseTrackerProps) {
    const [expenses, setExpenses] = useState<Expense[]>([]);
    const [isAddOpen, setIsAddOpen] = useState(false);
    const [newExpense, setNewExpense] = useState({ amount: "", description: "" });
    const { toast } = useToast();

    const fetchExpenses = useCallback(async () => {
        try {
            const response = await fetch(`http://localhost:4000/api/groups/${groupId}/expenses`, {
                headers: {
                    Authorization: `Bearer ${sessionStorage.getItem("access")}`,
                }
            });
            if (response.ok) {
                const data = await response.json();
                setExpenses(data);
            }
        } catch (error) {
            console.error("Error fetching expenses:", error);
        }
    }, [groupId]);

    useEffect(() => {
        fetchExpenses();
    }, [fetchExpenses]);

    const handleAddExpense = async () => {
        try {
            const response = await fetch(`http://localhost:4000/api/groups/${groupId}/expenses`, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    Authorization: `Bearer ${sessionStorage.getItem("access")}`,
                },
                body: JSON.stringify({
                    amount: parseFloat(newExpense.amount),
                    description: newExpense.description,
                    splitDetails: {} // Simple split for now
                }),
            });

            if (response.ok) {
                fetchExpenses();
                setIsAddOpen(false);
                setNewExpense({ amount: "", description: "" });
                toast({ title: "Success", description: "Expense added" });
            }
        } catch {
            toast({ title: "Error", description: "Failed to add expense", variant: "destructive" });
        }
    };

    const totalExpenses = expenses.reduce((sum, exp) => sum + exp.amount, 0);

    return (
        <div className="flex flex-col h-[600px] bg-white/10 dark:bg-black/10 backdrop-blur-md rounded-lg border border-white/20 dark:border-white/10">
            <div className="p-4 border-b border-white/10 dark:border-white/5 flex justify-between items-center">
                <div>
                    <h3 className="font-semibold text-lg">Expenses</h3>
                    <p className="text-sm text-muted-foreground">Total: ₹{totalExpenses.toFixed(2)}</p>
                </div>
                <Dialog open={isAddOpen} onOpenChange={setIsAddOpen}>
                    <DialogTrigger asChild>
                        <Button size="sm" className="bg-primary hover:bg-primary/90">
                            <Plus size={16} className="mr-1" /> Add
                        </Button>
                    </DialogTrigger>
                    <DialogContent>
                        <DialogHeader>
                            <DialogTitle>Add Expense</DialogTitle>
                        </DialogHeader>
                        <div className="space-y-4 py-4">
                            <div className="space-y-2">
                                <Label>Description</Label>
                                <Input
                                    value={newExpense.description}
                                    onChange={(e) => setNewExpense({ ...newExpense, description: e.target.value })}
                                    placeholder="Lunch, Gas, etc."
                                />
                            </div>
                            <div className="space-y-2">
                                <Label>Amount</Label>
                                <Input
                                    type="number"
                                    value={newExpense.amount}
                                    onChange={(e) => setNewExpense({ ...newExpense, amount: e.target.value })}
                                    placeholder="0.00"
                                />
                            </div>
                            <Button onClick={handleAddExpense} className="w-full bg-primary">Save Expense</Button>
                        </div>
                    </DialogContent>
                </Dialog>
            </div>

            <ScrollArea className="flex-1 p-4">
                <div className="space-y-3">
                    {expenses.map((exp) => (
                        <motion.div
                            key={exp.id}
                            initial={{ opacity: 0, x: -10 }}
                            animate={{ opacity: 1, x: 0 }}
                            className="flex items-center justify-between p-3 rounded-lg bg-white/5 dark:bg-white/5 border border-white/10"
                        >
                            <div className="flex items-center gap-3">
                                <div className="p-2 rounded-full bg-primary/20 text-primary">
                                    <Receipt size={18} />
                                </div>
                                <div>
                                    <p className="font-medium">{exp.description}</p>
                                    <p className="text-xs text-muted-foreground">Paid by {exp.payer.fullName}</p>
                                </div>
                            </div>
                            <span className="font-bold text-primary">₹{exp.amount.toFixed(2)}</span>
                        </motion.div>
                    ))}
                    {expenses.length === 0 && (
                        <div className="text-center py-10 text-muted-foreground">
                            No expenses recorded yet.
                        </div>
                    )}
                </div>
            </ScrollArea>
        </div>
    );
}
