import { SubscriptionFilter } from "@/components/subscription/subscription-filter"
import { SubscriptionsTable } from "@/components/subscription/subscriptions-table"
import { PageHeaderSkeleton } from "@/components/ui/skeleton-loader"
import { getAllUserSubscription } from "@/lib/backend_actions/subscription"
import { formatINR, subscription_helper } from "@/lib/helper_bulk/subscription.helper"
import { BadgeIndianRupee, BookOpen, Crown, Layers, Repeat, ShoppingBag, TrendingUp, Users } from "lucide-react"
import { Suspense } from "react"

async function SubscriptionsContent({ searchP }: { searchP: any }) {
    const page = Number(searchP?.page) || 1
    const limit = Number(searchP?.limit) || 50
    const search = searchP?.search || null

    const result = await getAllUserSubscription({ limit, page, search })
    const subscriptions = result.success ? result.data.data : []


    // Metrics
    const { activeSubs, activeOrders, uniqueRecurringUsers, fullAppSubs, categoryOrders, courseOrders, billingAmount, estimatedAmount } = subscription_helper(subscriptions)

    const pagination = result.success
        ? {
            page,
            totalPages: Math.ceil((result.data.meta?.total || subscriptions.length) / limit) || 1,
        }
        : undefined

    return (
        <>
            <div className="mb-8">
                <h1 className="text-3xl sm:text-4xl font-bold text-gray-900">
                    User{" "}
                    <span className="bg-linear-to-r from-purple-400 via-pink-400 to-orange-400 bg-clip-text text-transparent">
                        Subscriptions
                    </span>
                </h1>
                <p className="text-muted-foreground mt-2">
                    Track and manage all user subscription activity
                </p>
            </div>

            <SubscriptionFilter />

            {/* Metrics */}
            {subscriptions.length > 0 && (
                <>
                    <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
                        {/* 1. Active Subscriptions */}
                        <div className="rounded-xl border bg-card p-5 flex items-start gap-4">
                            <div className="w-10 h-10 rounded-lg bg-blue-500/10 flex items-center justify-center shrink-0">
                                <Repeat className="h-5 w-5 text-blue-600" />
                            </div>
                            <div>
                                <p className="text-xs text-muted-foreground font-medium">Active Subscriptions</p>
                                <p className="text-2xl font-bold mt-0.5">{activeSubs}</p>
                                <p className="text-[10px] text-muted-foreground mt-1">Auto-renewing plans</p>
                            </div>
                        </div>

                        {/* 2. Active Orders */}
                        <div className="rounded-xl border bg-card p-5 flex items-start gap-4">
                            <div className="w-10 h-10 rounded-lg bg-purple-500/10 flex items-center justify-center shrink-0">
                                <ShoppingBag className="h-5 w-5 text-purple-600" />
                            </div>
                            <div>
                                <p className="text-xs text-muted-foreground font-medium">Active Orders</p>
                                <p className="text-2xl font-bold text-purple-600 mt-0.5">{activeOrders}</p>
                                <p className="text-[10px] text-muted-foreground mt-1">One-time / non-renewing</p>
                            </div>
                        </div>

                        {/* 3. Total Subscribers */}
                        <div className="rounded-xl border bg-card p-5 flex items-start gap-4">
                            <div className="w-10 h-10 rounded-lg bg-emerald-500/10 flex items-center justify-center shrink-0">
                                <Users className="h-5 w-5 text-emerald-600" />
                            </div>
                            <div>
                                <p className="text-xs text-muted-foreground font-medium">Total Subscribers</p>
                                <p className="text-2xl font-bold mt-0.5">{uniqueRecurringUsers}</p>
                                <p className="text-[10px] text-muted-foreground mt-1">Recurring paying users</p>
                            </div>
                        </div>

                        {/* 4. Full App Subscriptions */}
                        <div className="rounded-xl border bg-card p-5 flex items-start gap-4">
                            <div className="w-10 h-10 rounded-lg bg-amber-500/10 flex items-center justify-center shrink-0">
                                <Crown className="h-5 w-5 text-amber-600" />
                            </div>
                            <div>
                                <p className="text-xs text-muted-foreground font-medium">Full App</p>
                                <p className="text-2xl font-bold mt-0.5">{fullAppSubs}</p>
                                <p className="text-[10px] text-muted-foreground mt-1">Whole app subscriptions</p>
                            </div>
                        </div>

                        {/* 5. Category Orders */}
                        <div className="rounded-xl border bg-card p-5 flex items-start gap-4">
                            <div className="w-10 h-10 rounded-lg bg-pink-500/10 flex items-center justify-center shrink-0">
                                <Layers className="h-5 w-5 text-pink-600" />
                            </div>
                            <div>
                                <p className="text-xs text-muted-foreground font-medium">Category</p>
                                <p className="text-2xl font-bold mt-0.5">{categoryOrders}</p>
                                <p className="text-[10px] text-muted-foreground mt-1">Category access plans</p>
                            </div>
                        </div>

                        {/* 6. Course Orders */}
                        <div className="rounded-xl border bg-card p-5 flex items-start gap-4">
                            <div className="w-10 h-10 rounded-lg bg-indigo-500/10 flex items-center justify-center shrink-0">
                                <BookOpen className="h-5 w-5 text-indigo-600" />
                            </div>
                            <div>
                                <p className="text-xs text-muted-foreground font-medium">Course</p>
                                <p className="text-2xl font-bold mt-0.5">{courseOrders}</p>
                                <p className="text-[10px] text-muted-foreground mt-1">Course access plans</p>
                            </div>
                        </div>

                        {/* 7. Billing Amount */}
                        <div className="rounded-xl border bg-card p-5 flex items-start gap-4">
                            <div className="w-10 h-10 rounded-lg bg-green-500/10 flex items-center justify-center shrink-0">
                                <BadgeIndianRupee className="h-5 w-5 text-green-600" />
                            </div>
                            <div>
                                <p className="text-xs text-muted-foreground font-medium">Monthly Revenue</p>
                                <p className="text-2xl font-bold text-green-600 mt-0.5">{formatINR(billingAmount)}<span className="text-xs font-normal text-muted-foreground">/mo</span></p>
                                <p className="text-[10px] text-muted-foreground mt-1">Normalized from all billing cycles</p>
                            </div>
                        </div>

                        {/* 8. Estimated Amount */}
                        <div className="rounded-xl border bg-card p-5 flex items-start gap-4">
                            <div className="w-10 h-10 rounded-lg bg-teal-500/10 flex items-center justify-center shrink-0">
                                <TrendingUp className="h-5 w-5 text-teal-600" />
                            </div>
                            <div>
                                <p className="text-xs text-muted-foreground font-medium">Est. MRR</p>
                                <p className="text-2xl font-bold text-teal-600 mt-0.5">{formatINR(estimatedAmount)}<span className="text-xs font-normal text-muted-foreground">/mo</span></p>
                                <p className="text-[10px] text-muted-foreground mt-1">Recurring revenue excl. orders</p>
                            </div>
                        </div>
                    </div>

                    {/* <SubscriptionGraph data={subscription_graph_data} /> */}
                </>
            )}
            <SubscriptionsTable subscriptions={subscriptions} pagination={pagination} />
        </>
    )
}

export default async function UserSubscriptionsPage({
    searchParams,
}: {
    searchParams: Promise<any>
}) {
    const searchP = await searchParams

    return (
        <div className="container mx-auto px-6 py-24">
            <Suspense fallback={<PageHeaderSkeleton />}>
                <SubscriptionsContent searchP={searchP} />
            </Suspense>
        </div>
    )
}