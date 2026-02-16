"use server"
import axios from "axios"
import { revalidatePath } from "next/cache"
import { auth } from "../auth"

const BASE_URL = process.env.API_URL || "http://localhost:8080/api"

// Resolve Bearer token (next-auth session → cookie fallback)
async function getAuthHeaders() {
    const session = await auth().catch(() => null)
    const token = session?.user?.accessToken

    return token ? { Authorization: `Bearer ${token}` } : {}
}

// ───────────────────────────────────────────────────────────────────────────────
// Create Video  (POST /videos)
export async function createVideo(payload) {
    try {
        const headers = await getAuthHeaders()
        const res = await axios.post(`${BASE_URL}/videos`, payload, { headers })
        console.log("Create video response", res.data)
        revalidatePath("/admin/video-upload")
        return { success: true, data: res.data }
    } catch (error) {
        console.error("createVideo error", error.response?.data)
        return { success: false, error: error.response?.data?.message || "createVideo failed" }
    }
}



// ───────────────────────────────────────────────────────────────────────────────
// Create Bulk Video  (POST /videos)
export async function createBulkVideos(payload) {
    try {
        const headers = await getAuthHeaders()
        const res = await axios.post(`${BASE_URL}/videos/bulk`, { data: payload }, { headers })
        console.log("Create bulk videos response", res.data)
        revalidatePath("/admin/video-upload")
        return { success: true, data: res.data }
    } catch (error) {
        console.error("createBulkVideos error", error.response?.data)
        return { success: false, error: error.response?.data?.message || "createBulkVideos failed" }
    }
}





// Get all Video  (Get /videos)
export async function getAllVideos(payload) {
    console.log("video payload ==> ", payload)
    try {
        const headers = await getAuthHeaders()
        const res = await axios.get(`${BASE_URL}/videos`, {
            headers,
            params: {
                status: payload?.status || undefined,
                search: payload?.search || undefined,
                limit: payload?.limit || undefined,
                offset: payload?.offset || undefined
            }
        })
        return { success: true, data: res.data }
    } catch (error) {
        console.error("getAllVideos error", error.response?.data)
        return { success: false, error: error.response?.data?.message || "getAllVideos failed" }
    }
}
// Get video by ID not stream but video info
export async function getVideoById(id) {
    try {
        const headers = await getAuthHeaders()
        const res = await axios.get(`${BASE_URL}/video/${id}`, {
            headers,
        })
        console.log("\nGet video by ID response", res.data)
        return { success: true, data: res.data.data }
    } catch (error) {
        console.error("getVideoById error", error.response?.data)
        return { success: false, error: error.response?.data?.message || "getVideoById failed" }
    }
}


// Update video details (PUT /video/:id)
export async function updateVideo(id, data) {
    console.log("Update videos data ==> ", JSON.stringify(data, null, 2))
    try {
        const headers = await getAuthHeaders()
        const res = await axios.put(`${BASE_URL}/videos/${id}`, data, {
            headers,
        })
        console.log("\n Update video by ID response", res.data)
        revalidatePath("/admin/video-upload")
        return { success: true, data: res.data }
    } catch (error) {
        console.error("update video error", error.response?.data)
        return { success: false, error: error.response?.data?.message || "updateVideo failed" }
    }
}


export async function deleteVideo(id) {
    try {
        const headers = await getAuthHeaders()
        const res = await axios.delete(`${BASE_URL}/videos/${id}`, {
            headers,
        })
        console.log("\n Delete video by ID response", res.data)
        revalidatePath("/admin/video-upload")
        return { success: true, data: res.data.data }
    } catch (error) {
        console.error("delete video error", error.response?.data)
        return { success: false, error: error.response?.data?.message || "deleteVideo failed" }
    }
}