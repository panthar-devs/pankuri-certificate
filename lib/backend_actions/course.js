"use server"
import axios from "axios"
import { revalidatePath } from "next/cache"
import { auth } from "../auth"

const BASE_URL = process.env.API_URL || "http://localhost:8080/api"

// Resolve Bearer token
async function getAuthHeaders() {
    const session = await auth().catch(() => null)
    const token = session?.user?.accessToken
    return token ? { Authorization: `Bearer ${token}` } : {}
}

// ──────────────────────────────────────────
// Get All Courses (Admin) (GET /courses)
export async function getAllCourses({ page = 1, limit = 20, status = "active", categoryId = null, level = null } = {}) {
    try {
        const headers = await getAuthHeaders()
        const params = { page, limit, status }
        if (categoryId) params.categoryId = categoryId
        if (level) params.level = level
        const res = await axios.get(`${BASE_URL}/courses`, { headers, params })
        return { success: true, data: res.data.data, pagination: res.data.pagination }
    } catch (error) {
        return { success: false, error: error.response?.data?.message || "getAllCourses failed" }
    }
}

// Get Course by ID (GET /courses/:courseId)
export async function getCourseById(courseId) {
    try {
        const headers = await getAuthHeaders()
        const res = await axios.get(`${BASE_URL}/courses/${courseId}`, { headers })
        return { success: true, data: res.data.data }
    } catch (error) {
        console.log("Error in getCourseById:", error.response?.data)
        return { success: false, error: error.response?.data?.message || "getCourseById failed" }
    }
}

// Create Course (POST /courses)
export async function createCourse(payload) {
    try {
        const headers = await getAuthHeaders()
        const res = await axios.post(`${BASE_URL}/courses`, payload, { headers })
        revalidatePath("/courses")
        return { success: true, data: res.data }
    } catch (error) {
        return { success: false, error: error.response?.data?.message || "createCourse failed" }
    }
}



// Bulk Create Course (POST /courses)
export async function bulkCreateCourses(payloads) {
    console.log("Parsed data ==> ", payloads)
    try {
        const headers = await getAuthHeaders()
        const res = await axios.post(`${BASE_URL}/courses/bulk`, { courses: payloads }, { headers })
        revalidatePath("/courses")
        return { success: true, data: res.data }
    } catch (error) {
        return { success: false, error: error.response?.data?.message || "bulkCreateCourses failed" }
    }
}

// Update Course (PUT /courses/:courseId)
export async function updateCourse(courseId, payload) {

    console.log("Update course payload ===> ", payload)
    try {
        const headers = await getAuthHeaders()
        const res = await axios.put(`${BASE_URL}/courses/${courseId}`, payload, { headers })
        revalidatePath("/courses")
        return { success: true, data: res.data }
    } catch (error) {
        console.log("update course error ==> ", error.response?.data)
        return { success: false, error: error.response?.data?.message || "updateCourse failed" }
    }
}

// Delete Course (DELETE /courses/:courseId)
export async function deleteCourse(courseId) {
    try {
        const headers = await getAuthHeaders()
        const res = await axios.delete(`${BASE_URL}/courses/${courseId}`, { headers })
        revalidatePath("/courses")
        return { success: true, data: res.data }
    } catch (error) {
        return { success: false, error: error.response?.data?.message || "deleteCourse failed" }
    }
}

// Toggle Course Publish Status (PATCH /courses/:courseId/publish)
export async function toggleCoursePublishStatus(courseId, status) {
    try {
        const headers = await getAuthHeaders()
        const res = await axios.patch(`${BASE_URL}/courses/${courseId}/publish`, { status }, { headers })
        revalidatePath("/courses")
        return { success: true, data: res.data }
    } catch (error) {
        return { success: false, error: error.response?.data?.message || "toggleCoursePublishStatus failed" }
    }
}
