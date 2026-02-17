export const formatINR = (amt: number) =>
    new Intl.NumberFormat("en-IN", { style: "currency", currency: "INR", minimumFractionDigits: 0, maximumFractionDigits: 0 }).format(amt / 100)

export const subscription_helper = (subscriptions: any[]) => {
    const activeSubs = subscriptions.filter((s: any) => s.status === "active" && !s.cancelAtPeriodEnd).length
    const activeOrders = subscriptions.filter((s: any) => s.status === "active" && s.cancelAtPeriodEnd).length
    const uniqueRecurringUsers = new Set(
        subscriptions.filter((s: any) => s.status === "active" && !s.cancelAtPeriodEnd).map((s: any) => s.userId)
    ).size
    const fullAppSubs = subscriptions.filter((s: any) => s.plan?.planType === "WHOLE_APP" && s.status === "active").length
    const categoryOrders = subscriptions.filter((s: any) => s.plan?.planType === "CATEGORY" && s.status === "active").length
    const courseOrders = subscriptions.filter((s: any) => s.plan?.planType === "COURSE" && s.status === "active").length



    // Normalize price to monthly: yearly plans divided by 12
    const getMonthlyPrice = (s: any) => {
        const price = s.plan?.price || 0
        return s.plan?.subscriptionType === "yearly" ? price / 12 : price
    }

    // Billing amount: monthly-normalized total from all active subs
    const billingAmount = subscriptions
        .filter((s: any) => s.status === "active")
        .reduce((sum: number, s: any) => sum + getMonthlyPrice(s), 0)

    // Estimated amount: projected next month (only recurring, excludes orders)
    const estimatedAmount = subscriptions
        .filter((s: any) => s.status === "active" && !s.cancelAtPeriodEnd)
        .reduce((sum: number, s: any) => sum + getMonthlyPrice(s), 0)

    return {
        activeSubs,
        activeOrders,
        uniqueRecurringUsers,
        fullAppSubs,
        categoryOrders,
        courseOrders,
        billingAmount,
        estimatedAmount,
    }
}

