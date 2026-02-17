"use client"

import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { HandleCopyBtn } from "@/lib/client.utils"
import {
    CalendarDays,
    CreditCard,
    Crown,
    IndianRupee,
    MoreHorizontal,
    Repeat,
    ShoppingBag,
    XCircle,
} from "lucide-react"
import { useRouter } from "next/navigation"
import PaginationNumberless from "../customized/pagination/pagination-12"

const STATUS_VARIANT: Record<string, "default" | "secondary" | "outline" | "destructive"> = {
    active: "default",
    cancelled: "destructive",
    paused: "secondary",
    expired: "outline",
    created: "secondary",
    pending: "outline",
    halted: "destructive",
    completed: "default",
}

const PLAN_TYPE_LABELS: Record<string, string> = {
    WHOLE_APP: "Full App",
    CATEGORY: "Category",
}

function formatPrice(amount: number, currency = "INR") {
    return new Intl.NumberFormat("en-IN", {
        style: "currency",
        currency,
        minimumFractionDigits: 0,
    }).format(amount / 100)
}

function formatDate(dateStr: string | null) {
    if (!dateStr) return "—"
    return new Date(dateStr).toLocaleDateString("en-IN", {
        day: "numeric",
        month: "short",
        year: "numeric",
    })
}

function getInitials(name: string) {
    return name
        .split(" ")
        .map((w) => w[0])
        .join("")
        .toUpperCase()
        .slice(0, 2)
}

export function SubscriptionsTable({
    subscriptions,
    pagination,
}: {
    subscriptions: any[]
    pagination?: any
}) {
    const router = useRouter()

    if (!subscriptions || subscriptions.length === 0) {
        return (
            <div className="border rounded-lg p-12 text-center">
                <CreditCard className="h-10 w-10 mx-auto mb-3 text-muted-foreground/40" />
                <p className="text-muted-foreground font-medium">No subscriptions found.</p>
                <p className="text-sm text-muted-foreground mt-1">
                    Subscriptions will appear here once users purchase a plan.
                </p>
            </div>
        )
    }

    return (
        <>
            <div className="border rounded-lg overflow-hidden">
                <Table>
                    <TableHeader>
                        <TableRow className="bg-muted/40">
                            <TableHead>User</TableHead>
                            <TableHead>Plan</TableHead>
                            <TableHead>Nature</TableHead>
                            <TableHead>Type</TableHead>
                            <TableHead>Billing</TableHead>
                            <TableHead>Price</TableHead>
                            <TableHead>Status</TableHead>
                            <TableHead>Current Period</TableHead>
                            <TableHead>Subscription ID</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {subscriptions.map((sub) => (
                            <TableRow
                                key={sub.id}
                                className="hover:bg-accent/50 cursor-pointer transition-colors"
                                onClick={() => router.push(`/plan/user-subscription/${sub.id}`)}
                            >
                                {/* User */}
                                <TableCell>
                                    <div className="flex items-center gap-3">
                                        <Avatar className="h-8 w-8">
                                            <AvatarImage src={sub.user?.profileImage} alt={sub.user?.displayName} />
                                            <AvatarFallback className="text-xs">
                                                {sub.user?.displayName ? getInitials(sub.user.displayName) : "?"}
                                            </AvatarFallback>
                                        </Avatar>
                                        <div className="min-w-0">
                                            <p className="font-medium text-sm truncate">{sub.user?.displayName || "Unknown"}</p>
                                            <p className="text-xs text-muted-foreground truncate">{sub.user?.email}</p>
                                        </div>
                                    </div>
                                </TableCell>

                                {/* Plan Name */}
                                <TableCell>
                                    <div className="max-w-[200px]">
                                        <p className="font-medium text-sm truncate">{sub.plan?.name || "—"}</p>
                                    </div>
                                </TableCell>

                                {/* Nature: Subscription vs Order */}
                                <TableCell>
                                    {sub.cancelAtPeriodEnd ? (
                                        <Badge className="text-xs gap-1 bg-purple-500/10 text-purple-700 border-purple-500/20 hover:bg-purple-500/20">
                                            <ShoppingBag className="h-3 w-3" />
                                            Order
                                        </Badge>
                                    ) : (
                                        <Badge variant="secondary" className="text-xs gap-1">
                                            <Repeat className="h-3 w-3" />
                                            Subscription
                                        </Badge>
                                    )}
                                </TableCell>

                                {/* Plan Type */}
                                <TableCell>
                                    <Badge variant="outline" className="text-xs gap-1">
                                        {sub.plan?.planType === "WHOLE_APP" && <Crown className="h-3 w-3" />}
                                        {PLAN_TYPE_LABELS[sub.plan?.planType] || sub.plan?.planType || "—"}
                                    </Badge>
                                </TableCell>

                                {/* Billing cycle */}
                                <TableCell>
                                    <Badge variant="secondary" className="text-xs capitalize">
                                        {sub.plan?.subscriptionType || "—"}
                                    </Badge>
                                </TableCell>

                                {/* Price */}
                                <TableCell>
                                    <span className="font-semibold text-sm">
                                        {sub.plan?.price ? formatPrice(sub.plan.price, sub.plan.currency) : "—"}
                                    </span>
                                </TableCell>

                                {/* Status */}
                                <TableCell>
                                    <Badge variant={STATUS_VARIANT[sub.status] || "outline"} className="text-xs capitalize">
                                        {sub.status}
                                    </Badge>
                                </TableCell>

                                {/* Period */}
                                <TableCell>
                                    <div className="text-xs text-muted-foreground whitespace-nowrap">
                                        <span>{formatDate(sub.currentPeriodStart)}</span>
                                        <span className="mx-1">→</span>
                                        <span>{formatDate(sub.currentPeriodEnd)}</span>
                                    </div>
                                </TableCell>

                                {/* Subscription ID */}
                                <TableCell onClick={(e) => e.stopPropagation()}>
                                    <HandleCopyBtn id={sub.subscriptionId || sub.id} />
                                </TableCell>
                            </TableRow>
                        ))}
                    </TableBody>
                </Table>
            </div>
            {pagination && (
                <PaginationNumberless pagination={pagination} redirectTo="plan/user-subscription" />
            )}
        </>
    )
}
