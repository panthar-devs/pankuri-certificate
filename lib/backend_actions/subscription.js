"use server"
import axios from "axios"
import { revalidatePath } from "next/cache"
import { auth } from "../auth"

const BASE_URL = process.env.API_URL || "http://localhost:8080/api"

async function getAuthHeaders() {
    const session = await auth().catch(() => null)
    const token = session?.user?.accessToken
    return token ? { Authorization: `Bearer ${token}` } : {}
}

// ───────────────────────────────────────────────────────────────────────────────
// Admin: Get All Users Subscription 
export async function getAllUserSubscription({ page = 1, limit = 50, status = null, search = null } = {}) {
    try {
        const headers = await getAuthHeaders()
        const params = { page, limit, status, search }
        const res = await axios.get(`${BASE_URL}/subscriptions/admin/all`, { headers, params })

        console.log("getAllUserSubscription response data:", res.data);
        return { success: true, data: res.data }
    } catch (error) {
        console.error("getAllUserSubscription error:", error.response?.data || error.message);
        return { success: false, error: error.response?.data?.message || "getAllUserSubscription failed" }
    }
}

// ───────────────────────────────────────────────────────────────────────────────
// Admin: Get Single Subscription by ID
export async function getSubscriptionById(id) {
    try {
        const headers = await getAuthHeaders()
        const res = await axios.get(`${BASE_URL}/subscriptions/${id}`, { headers })
        return { success: true, data: res.data }
    } catch (error) {
        console.error("getSubscriptionById error:", error.response?.data || error.message)
        return { success: false, error: error.response?.data?.message || "getSubscriptionById failed" }
    }
}
