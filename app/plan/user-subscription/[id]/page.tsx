import { SubscriptionDetailTabs } from "@/components/subscription/subscription-detail-tabs"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Separator } from "@/components/ui/separator"
import { PageHeaderSkeleton } from "@/components/ui/skeleton-loader"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { getSubscriptionById } from "@/lib/backend_actions/subscription"
import {
    ArrowLeft,
    CalendarDays,
    ChevronRight,
    CreditCard,
    Crown,
    IndianRupee,
    Repeat,
} from "lucide-react"
import Link from "next/link"
import { notFound } from "next/navigation"
import { Suspense } from "react"

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

async function SubscriptionDetailContent({ subscriptionId }: { subscriptionId: string }) {
    const result = await getSubscriptionById(subscriptionId)

    console.log("Subscription by id response ==> ", result)

    if (!result.success || !result.data) {
        notFound()
    }

    const sub = result.data.data ?? result.data
    const plan = sub.plan
    const user = sub.user

    return (
        <>
            {/* Breadcrumb */}
            <div className="flex items-center gap-2 text-sm text-muted-foreground mb-8">
                <Link href="/plan/user-subscription" className="hover:text-foreground transition-colors">
                    Subscriptions
                </Link>
                <span>/</span>
                <span className="text-foreground font-medium truncate max-w-[300px]">
                    {user?.displayName || "Unknown User"}
                </span>
            </div>

            {/* Hero Section */}
            <div className="mb-10">
                <div className="flex items-start gap-5 mb-5">
                    {/* User Avatar */}
                    {user ? (
                        <Avatar className="h-14 w-14">
                            <AvatarImage src={user.profileImage} alt={user.displayName} />
                            <AvatarFallback className="text-lg">
                                {user.displayName ? getInitials(user.displayName) : "?"}
                            </AvatarFallback>
                        </Avatar>
                    ) : (
                        <div className="w-14 h-14 rounded-2xl bg-primary/10 flex items-center justify-center shrink-0">
                            <CreditCard className="h-7 w-7 text-primary" />
                        </div>
                    )}

                    <div className="flex-1 min-w-0">
                        {/* User name as title */}
                        <h1 className="text-3xl font-bold tracking-tight mb-1">
                            {user?.displayName || "Subscription Details"}
                        </h1>

                        {/* Plan name + email as subtitle */}
                        <p className="text-muted-foreground text-sm mb-3">
                            {user?.email}
                            {plan?.name && <> &middot; {plan.name}</>}
                        </p>

                        {/* Badges */}
                        <div className="flex flex-wrap items-center gap-2">
                            {sub.cancelAtPeriodEnd ? (
                                <Badge variant="destructive" className="text-xs">
                                    Cancelling
                                </Badge>
                            ) : (
                                <Badge
                                    variant={STATUS_VARIANT[sub.status] || "outline"}
                                    className="text-xs capitalize"
                                >
                                    {sub.status}
                                </Badge>
                            )}
                            {sub.isTrial && (
                                <Badge variant="secondary" className="text-xs">
                                    Trial
                                </Badge>
                            )}
                            <Badge variant="outline" className="text-xs capitalize gap-1">
                                <CreditCard className="h-3 w-3" />
                                {sub.provider}
                            </Badge>
                            {plan?.planType && (
                                <Badge variant="outline" className="text-xs gap-1">
                                    {plan.planType === "WHOLE_APP" && <Crown className="h-3 w-3" />}
                                    {plan.planType === "WHOLE_APP" ? "Full App" : plan.planType === "CATEGORY" ? "Category" : plan.planType}
                                </Badge>
                            )}
                            {plan?.subscriptionType && (
                                <Badge variant="secondary" className="text-xs capitalize">
                                    {plan.subscriptionType}
                                </Badge>
                            )}
                        </div>
                    </div>
                </div>

                {/* Stats row */}
                <div className="flex flex-wrap items-center gap-6 text-sm text-muted-foreground mt-4">
                    {plan?.price && (
                        <span className="flex items-center gap-1.5">
                            <IndianRupee className="h-3.5 w-3.5" />
                            {formatPrice(plan.price, plan.currency)}
                            {plan.discountedPrice && (
                                <span className="text-green-600 font-medium ml-1">
                                    ({formatPrice(plan.discountedPrice, plan.currency)} discounted)
                                </span>
                            )}
                        </span>
                    )}
                    <span className="flex items-center gap-1.5">
                        <CalendarDays className="h-3.5 w-3.5" />
                        {formatDate(sub.currentPeriodStart)} → {formatDate(sub.currentPeriodEnd)}
                    </span>
                    {sub.nextBillingAt && (
                        <span className="flex items-center gap-1.5">
                            <Repeat className="h-3.5 w-3.5" />
                            Next billing: {formatDate(sub.nextBillingAt)}
                        </span>
                    )}
                </div>

                <Separator className="mt-8" />
            </div>

            {/* Tabs */}
            <SubscriptionDetailTabs subscription={sub} />
        </>
    )
}

export default async function SubscriptionDetailPage({
    params,
}: {
    params: Promise<{ id: string }>
}) {
    const { id } = await params

    return (
        <div className="container mx-auto max-w-6xl px-6 py-24">
            <Suspense fallback={<PageHeaderSkeleton />}>
                <SubscriptionDetailContent subscriptionId={id} />
            </Suspense>
        </div>
    )
}