"use client"

import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import {
    CalendarDays,
    CheckCircle2,
    Clock,
    CreditCard,
    Crown,
    Hash,
    IndianRupee,
    Mail,
    Phone,
    Receipt,
    Repeat,
    ShieldCheck,
    Tag,
    User,
    Wallet,
    XCircle,
} from "lucide-react"

function formatPrice(amount: number, currency = "INR") {
    return new Intl.NumberFormat("en-IN", {
        style: "currency",
        currency,
        minimumFractionDigits: 0,
    }).format(amount / 100)
}

function formatDateTime(dateStr: string | null) {
    if (!dateStr) return "—"
    return new Date(dateStr).toLocaleString("en-IN", {
        day: "numeric",
        month: "short",
        year: "numeric",
        hour: "2-digit",
        minute: "2-digit",
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

const PAYMENT_STATUS: Record<string, "default" | "secondary" | "outline" | "destructive"> = {
    paid: "default",
    captured: "default",
    authorized: "secondary",
    failed: "destructive",
    refunded: "outline",
    pending: "secondary",
}

function DetailRow({ icon: Icon, label, value, className }: { icon?: any; label: string; value: React.ReactNode; className?: string }) {
    return (
        <div className={`flex items-start justify-between py-3 ${className || ""}`}>
            <span className="text-sm text-muted-foreground flex items-center gap-2 shrink-0">
                {Icon && <Icon className="h-4 w-4" />}
                {label}
            </span>
            <span className="text-sm font-medium text-right">{value}</span>
        </div>
    )
}

export function SubscriptionDetailTabs({ subscription }: { subscription: any }) {
    const sub = subscription
    const plan = sub.plan
    const user = sub.user
    const payments = sub.payments || []
    const totalPaid = payments
        .filter((p: any) => p.status === "paid")
        .reduce((sum: number, p: any) => sum + (p.amount || 0), 0)

    return (
        <Tabs defaultValue="subscription" className="w-full">
            <TabsList variant="line" className="w-full justify-start border-b rounded-none bg-transparent px-0 gap-4">
                <TabsTrigger value="subscription" className="text-base px-1 pb-3 data-[state=active]:font-semibold">
                    Subscription
                </TabsTrigger>
                <TabsTrigger value="payments" className="text-base px-1 pb-3 data-[state=active]:font-semibold gap-2">
                    Payments
                    {payments.length > 0 && (
                        <Badge variant="secondary" className="text-[10px] px-1.5 py-0 ml-1">
                            {payments.length}
                        </Badge>
                    )}
                </TabsTrigger>
                <TabsTrigger value="subscriber" className="text-base px-1 pb-3 data-[state=active]:font-semibold">
                    Subscriber
                </TabsTrigger>
            </TabsList>

            {/* Subscription Tab — User's subscription details + plan info */}
            <TabsContent value="subscription" className="pt-8">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-full">
                    {/* Billing Period */}
                    <div className="space-y-1">
                        <h3 className="text-sm font-medium text-muted-foreground uppercase tracking-wider mb-4">
                            Billing Period
                        </h3>
                        <div className="rounded-xl border divide-y">
                            <DetailRow icon={CalendarDays} label="Period Start" value={formatDateTime(sub.currentPeriodStart)} className="px-4" />
                            <DetailRow icon={CalendarDays} label="Period End" value={formatDateTime(sub.currentPeriodEnd)} className="px-4" />
                            <DetailRow icon={Repeat} label="Next Billing" value={formatDateTime(sub.nextBillingAt)} className="px-4" />
                        </div>
                    </div>

                    {/* Status & Config */}
                    <div className="space-y-1">
                        <h3 className="text-sm font-medium text-muted-foreground uppercase tracking-wider mb-4">
                            Status
                        </h3>
                        <div className="rounded-xl border divide-y">
                            <DetailRow icon={CreditCard} label="Provider" value={
                                <Badge variant="outline" className="capitalize text-xs">{sub.provider}</Badge>
                            } className="px-4" />
                            <DetailRow icon={ShieldCheck} label="Trial" value={
                                sub.isTrial ? (
                                    <div className="flex flex-col items-end gap-1">
                                        <Badge variant="secondary" className="text-xs">Active Trial</Badge>
                                        {sub.trialEndsAt && <span className="text-xs text-muted-foreground">Ends {formatDateTime(sub.trialEndsAt)}</span>}
                                    </div>
                                ) : "No"
                            } className="px-4" />
                            <DetailRow icon={XCircle} label="Cancel at Period End" value={
                                sub.cancelAtPeriodEnd ? (
                                    <Badge variant="destructive" className="text-xs">Yes — will cancel</Badge>
                                ) : "No"
                            } className="px-4" />
                            {sub.graceUntil && (
                                <DetailRow icon={Clock} label="Grace Until" value={formatDateTime(sub.graceUntil)} className="px-4" />
                            )}
                        </div>
                    </div>

                    {/* Plan Summary (compact, inside subscription context) */}
                    <div className="md:col-span-2 space-y-1">
                        <h3 className="text-sm font-medium text-muted-foreground uppercase tracking-wider mb-4">
                            Plan
                        </h3>
                        {plan ? (
                            <div className="rounded-xl border divide-y">
                                <DetailRow icon={Crown} label="Plan Name" value={plan.name} className="px-4" />
                                {plan.description && (
                                    <DetailRow icon={Tag} label="Description" value={
                                        <span className="text-muted-foreground">{plan.description}</span>
                                    } className="px-4" />
                                )}
                                <DetailRow icon={Repeat} label="Billing Cycle" value={
                                    <Badge variant="secondary" className="capitalize text-xs">{plan.subscriptionType}</Badge>
                                } className="px-4" />
                                <DetailRow icon={IndianRupee} label="Price" value={
                                    <div className="flex items-center gap-2">
                                        {plan.discountedPrice ? (
                                            <>
                                                <span className="font-semibold text-green-600">{formatPrice(plan.discountedPrice, plan.currency)}</span>
                                                <span className="text-xs text-muted-foreground line-through">{formatPrice(plan.price, plan.currency)}</span>
                                                <Badge variant="default" className="text-[10px]">
                                                    {Math.round(((plan.price - plan.discountedPrice) / plan.price) * 100)}% off
                                                </Badge>
                                            </>
                                        ) : (
                                            <span className="font-semibold">{formatPrice(plan.price, plan.currency)}</span>
                                        )}
                                    </div>
                                } className="px-4" />
                                <DetailRow icon={Crown} label="Access Type" value={
                                    <Badge variant="outline" className="text-xs gap-1">
                                        {plan.planType === "WHOLE_APP" && <Crown className="h-3 w-3" />}
                                        {plan.planType === "WHOLE_APP" ? "Full App" : plan.planType === "CATEGORY" ? "Category" : plan.planType}
                                    </Badge>
                                } className="px-4" />
                            </div>
                        ) : (
                            <p className="text-sm text-muted-foreground">Plan information unavailable</p>
                        )}
                    </div>

                    {/* Timestamps */}
                    <div className="md:col-span-2 space-y-1">
                        <h3 className="text-sm font-medium text-muted-foreground uppercase tracking-wider mb-4">
                            Timeline
                        </h3>
                        <div className="rounded-xl border divide-y">
                            <DetailRow icon={Clock} label="Subscribed On" value={formatDateTime(sub.createdAt)} className="px-4" />
                            <DetailRow icon={Clock} label="Last Updated" value={formatDateTime(sub.updatedAt)} className="px-4" />
                        </div>
                    </div>
                </div>
            </TabsContent>

            {/* Payments Tab */}
            <TabsContent value="payments" className="pt-8">
                <div className="max-w-full space-y-6">
                    {/* Payment Summary */}
                    {payments.length > 0 && (
                        <div className="flex items-center gap-6 text-sm">
                            <div className="flex items-center gap-2">
                                <Wallet className="h-4 w-4 text-muted-foreground" />
                                <span className="text-muted-foreground">Total Paid:</span>
                                <span className="font-bold text-lg">{formatPrice(totalPaid, plan?.currency)}</span>
                            </div>
                            <div className="flex items-center gap-2">
                                <Receipt className="h-4 w-4 text-muted-foreground" />
                                <span className="text-muted-foreground">Transactions:</span>
                                <span className="font-semibold">{payments.length}</span>
                            </div>
                        </div>
                    )}

                    {payments.length > 0 ? (
                        <div className="space-y-3">
                            {payments
                                .sort((a: any, b: any) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
                                .map((payment: any) => (
                                    <div
                                        key={payment.id}
                                        className="rounded-xl border p-4 hover:bg-accent/30 transition-colors"
                                    >
                                        <div className="flex items-start justify-between gap-4">
                                            <div className="flex items-start gap-3">
                                                <div className={`w-10 h-10 rounded-lg flex items-center justify-center shrink-0 ${payment.status === "paid" ? "bg-green-500/10" : "bg-muted"
                                                    }`}>
                                                    {payment.status === "paid" ? (
                                                        <CheckCircle2 className="h-5 w-5 text-green-600" />
                                                    ) : (
                                                        <CreditCard className="h-5 w-5 text-muted-foreground" />
                                                    )}
                                                </div>
                                                <div>
                                                    <p className="font-semibold text-sm">
                                                        {formatPrice(payment.amount, payment.currency)}
                                                    </p>
                                                    <p className="text-xs text-muted-foreground mt-0.5">
                                                        {formatDateTime(payment.createdAt)}
                                                    </p>
                                                </div>
                                            </div>

                                            <Badge variant={PAYMENT_STATUS[payment.status] || "outline"} className="text-xs capitalize">
                                                {payment.status}
                                            </Badge>
                                        </div>

                                        <div className="flex flex-wrap items-center gap-x-4 gap-y-1 mt-3 text-xs text-muted-foreground">
                                            <span className="flex items-center gap-1">
                                                <CreditCard className="h-3 w-3" />
                                                {payment.paymentMethod?.toUpperCase() || "—"}
                                            </span>
                                            <span className="flex items-center gap-1">
                                                <Tag className="h-3 w-3" />
                                                {payment.paymentType}
                                            </span>
                                            <span className="flex items-center gap-1">
                                                <Hash className="h-3 w-3" />
                                                {payment.paymentId}
                                            </span>
                                            {payment.eventType && (
                                                <Badge variant="outline" className="text-[10px] px-1.5 py-0">
                                                    {payment.eventType}
                                                </Badge>
                                            )}
                                        </div>
                                    </div>
                                ))}
                        </div>
                    ) : (
                        <div className="text-center py-16 text-muted-foreground border rounded-xl">
                            <Receipt className="h-10 w-10 mx-auto mb-3 opacity-30" />
                            <p className="font-medium">No payments recorded yet</p>
                            <p className="text-sm mt-1">Payment records will appear here once the user is charged.</p>
                        </div>
                    )}
                </div>
            </TabsContent>

            {/* Subscriber Tab */}
            <TabsContent value="subscriber" className="pt-8">
                {user ? (
                    <div className="max-w-full space-y-6">
                        <div className="flex items-center gap-4">
                            <Avatar className="h-16 w-16">
                                <AvatarImage src={user.profileImage} alt={user.displayName} />
                                <AvatarFallback className="text-lg">
                                    {user.displayName ? getInitials(user.displayName) : "?"}
                                </AvatarFallback>
                            </Avatar>
                            <div>
                                <h3 className="text-xl font-semibold">{user.displayName || "Unknown User"}</h3>
                                <p className="text-muted-foreground text-sm">{user.email}</p>
                            </div>
                        </div>

                        <Separator />

                        <div className="rounded-xl border divide-y">
                            <DetailRow icon={User} label="Display Name" value={user.displayName || "—"} className="px-4" />
                            <DetailRow icon={Mail} label="Email" value={user.email || "—"} className="px-4" />
                            <DetailRow icon={Phone} label="Phone" value={user.phone || "—"} className="px-4" />
                            <DetailRow label="User ID" icon={User} value={
                                <code className="text-xs bg-muted px-2 py-1 rounded break-all">{user.id}</code>
                            } className="px-4" />
                        </div>
                    </div>
                ) : (
                    <div className="text-center py-16 text-muted-foreground">
                        <User className="h-10 w-10 mx-auto mb-3 opacity-30" />
                        <p className="font-medium">User information unavailable</p>
                    </div>
                )}
            </TabsContent>
        </Tabs>
    )
}
