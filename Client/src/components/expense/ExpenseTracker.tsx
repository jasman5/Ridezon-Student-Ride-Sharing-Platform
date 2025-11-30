import { useState, useEffect, useCallback } from "react";
import { motion } from "framer-motion";
import { Plus, Receipt, CheckCircle2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { AddExpenseModal, CreateExpenseData } from "./AddExpenseModal";
import { ExpenseDetailsModal } from "./ExpenseDetailsModal";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";

interface User {
    id: string;
    fullName: string;
    email?: string;
}

interface Expense {
    id: string;
    amount: number;
    description: string;
    type: string;
    payer: User;
    createdAt: string;
    splitDetails: Record<string, { amount: number; settled: boolean; percentage?: number }>;
}

interface ExpenseTrackerProps {
    groupId: string;
    currentUser: User;
    members: User[];
}

export function ExpenseTracker({ groupId, currentUser, members }: ExpenseTrackerProps) {
    const [expenses, setExpenses] = useState<Expense[]>([]);
    const [isAddOpen, setIsAddOpen] = useState(false);
    const [selectedExpense, setSelectedExpense] = useState<Expense | null>(null);
    const { toast } = useToast();

    const fetchExpenses = useCallback(async () => {
        try {
            const response = await fetch(`https://ridezon.mlsctiet.com/api/groups/${groupId}/expenses`, {
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

    const handleAddExpense = async (expenseData: CreateExpenseData) => {
        try {
            const response = await fetch(`https://ridezon.mlsctiet.com/api/groups/${groupId}/expenses`, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    Authorization: `Bearer ${sessionStorage.getItem("access")}`,
                },
                body: JSON.stringify(expenseData),
            });

            if (response.ok) {
                fetchExpenses();
                setIsAddOpen(false);
                toast({ title: "Success", description: "Expense added" });
            } else {
                const error = await response.json();
                toast({ title: "Error", description: error.message || "Failed to add expense", variant: "destructive" });
            }
        } catch {
            toast({ title: "Error", description: "Failed to add expense", variant: "destructive" });
        }
    };

    const handleSettleSplit = async (expenseId: string, debtorId: string) => {
        try {
            const response = await fetch(`https://ridezon.mlsctiet.com/api/expenses/${expenseId}/settle/${debtorId}`, {
                method: "PUT",
                headers: {
                    Authorization: `Bearer ${sessionStorage.getItem("access")}`,
                }
            });

            if (response.ok) {
                fetchExpenses();
                // Update selected expense to reflect changes immediately in modal
                if (selectedExpense && selectedExpense.id === expenseId) {
                    const updatedExpense = await response.json();
                    setSelectedExpense(updatedExpense);
                }
                toast({ title: "Success", description: "Marked as settled" });
            }
        } catch {
            toast({ title: "Error", description: "Failed to settle expense", variant: "destructive" });
        }
    };

    const totalExpenses = expenses.reduce((sum, exp) => sum + exp.amount, 0);

    // Calculate my balance
    const myBalance = expenses.reduce((acc, exp) => {
        if (exp.payer.id === currentUser.id) {
            // I paid, so add what others owe me (if not settled)
            const owedToMe = Object.entries(exp.splitDetails || {}).reduce((sum, [uid, details]) => {
                return uid !== currentUser.id && !details.settled ? sum + details.amount : sum;
            }, 0);
            return acc + owedToMe;
        } else {
            // Someone else paid, subtract what I owe (if not settled)
            const mySplit = exp.splitDetails?.[currentUser.id];
            if (mySplit && !mySplit.settled) {
                return acc - mySplit.amount;
            }
            return acc;
        }
    }, 0);

    return (
        <div className="flex flex-col h-[600px] bg-white/10 dark:bg-black/10 backdrop-blur-md rounded-lg border border-white/20 dark:border-white/10">
            <div className="p-4 border-b border-white/10 dark:border-white/5 flex justify-between items-center">
                <div>
                    <h3 className="font-semibold text-lg">Expenses</h3>
                    <div className="flex gap-4 text-sm">
                        <span className="text-muted-foreground">Total: ₹{totalExpenses.toFixed(2)}</span>
                        <span className={myBalance >= 0 ? "text-green-500" : "text-red-500"}>
                            My Balance: {myBalance >= 0 ? "+" : "-"}₹{Math.abs(myBalance).toFixed(2)}
                        </span>
                    </div>
                </div>
                <Button size="sm" onClick={() => setIsAddOpen(true)} className="bg-primary hover:bg-primary/90">
                    <Plus size={16} className="mr-1" /> Add
                </Button>
            </div>

            <ScrollArea className="flex-1 p-4">
                <div className="space-y-3">
                    {expenses.map((exp) => {
                        const isSettled = Object.values(exp.splitDetails || {}).every(d => d.settled);
                        return (
                            <motion.div
                                key={exp.id}
                                initial={{ opacity: 0, x: -10 }}
                                animate={{ opacity: 1, x: 0 }}
                                onClick={() => setSelectedExpense(exp)}
                                className="flex items-center justify-between p-3 rounded-lg bg-white/5 dark:bg-white/5 border border-white/10 cursor-pointer hover:bg-white/10 transition-colors"
                            >
                                <div className="flex items-center gap-3">
                                    <div className={`p-2 rounded-full ${isSettled ? "bg-green-500/20 text-green-500" : "bg-primary/20 text-primary"}`}>
                                        {isSettled ? <CheckCircle2 size={18} /> : <Receipt size={18} />}
                                    </div>
                                    <div>
                                        <p className="font-medium">{exp.description}</p>
                                        <p className="text-xs text-muted-foreground">
                                            Paid by {exp.payer.id === currentUser.id ? "You" : exp.payer.fullName} • {new Date(exp.createdAt).toLocaleDateString()}
                                        </p>
                                    </div>
                                </div>
                                <div className="text-right">
                                    <span className="font-bold block">₹{exp.amount.toFixed(2)}</span>
                                    <Badge variant="outline" className="text-[10px] h-5">{exp.type}</Badge>
                                </div>
                            </motion.div>
                        );
                    })}
                    {expenses.length === 0 && (
                        <div className="text-center py-10 text-muted-foreground">
                            No expenses recorded yet.
                        </div>
                    )}
                </div>
            </ScrollArea>

            <AddExpenseModal
                isOpen={isAddOpen}
                onClose={() => setIsAddOpen(false)}
                onAdd={handleAddExpense}
                members={members}
                currentUser={currentUser}
            />

            <ExpenseDetailsModal
                isOpen={!!selectedExpense}
                onClose={() => setSelectedExpense(null)}
                expense={selectedExpense}
                currentUser={currentUser}
                members={members}
                onSettle={handleSettleSplit}
            />
        </div>
    );
}
