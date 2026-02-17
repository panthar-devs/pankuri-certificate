"use client"

import { toast } from "sonner"
import * as XLSX from "xlsx"

export interface ParsedCourse {
    title: string
    slug: string
    description: string
    thumbnailImage: string
    coverImage: string
    categoryId: string
    trainerId: string
    level: string
    duration: string
    language: string
    hasCertificate: string
    price: string
    discountedPrice: string
    demoVideoId: string

    valid?: "pending" | "valid" | "invalid"
    error?: string

    // Backend-ready payload
    backendPayload?: {
        title: string
        slug: string
        description?: string
        thumbnailImage?: string
        coverImage?: string
        categoryId: string
        trainerId: string
        level: "beginner" | "intermediate" | "advanced" | "expert"
        duration?: number
        language: string
        hasCertificate: boolean
        price?: number
        discountedPrice?: number
        demoVideoId?: string
        status?: string // Add status field
        tags?: string[] // Add tags field
    }
}

export interface BulkCourseUploadProps {
    categories: Array<{ id: string; name: string }>
    trainers: Array<{ id: string; user: { displayName: string } }>
}

export const validateRow = (row: ParsedCourse): ParsedCourse => {
    const errors: string[] = []

    if (!row.title || row.title.length < 3) {
        errors.push("Title must be at least 3 characters")
    }
    if (!row.slug || row.slug.length < 1) {
        errors.push("Slug is required")
    }
    if (!row.categoryId) {
        errors.push("Category is required")
    }
    if (!["beginner", "intermediate", "advanced", "expert"].includes(row.level?.toLowerCase())) {
        errors.push("Invalid level (must be: beginner, intermediate, advanced, expert)")
    }

    return {
        ...row,
        valid: errors.length > 0 ? "invalid" : "valid",
        error: errors.join(", ")
    }
}

export const parseCourseExcel = async ({ file, setParsedData, setValid }: any) => {
    if (!file) {
        toast.error("Please select a file first")
        return
    }

    try {
        const data = await file.arrayBuffer()
        const workbook = XLSX.read(data, { type: "array" })
        const sheetName = workbook.SheetNames[0]
        const worksheet = workbook.Sheets[sheetName]
        const jsonData = XLSX.utils.sheet_to_json<any>(worksheet)

        const getValue = (row: any, ...keys: string[]) => {
            for (const key of keys) {
                const trimmedKey = key.trim()
                if (row[trimmedKey]) return String(row[trimmedKey]).trim()
                if (row[trimmedKey.toLowerCase()]) return String(row[trimmedKey.toLowerCase()]).trim()
                if (row[trimmedKey.toUpperCase()]) return String(row[trimmedKey.toUpperCase()]).trim()

                const foundKey = Object.keys(row).find(k =>
                    k.trim().toLowerCase() === trimmedKey.toLowerCase()
                )
                if (foundKey) return String(row[foundKey]).trim()
            }
            return null;
        }

        const parsed: ParsedCourse[] = jsonData.map((row) => {
            const title = getValue(row, "title", "Title")
            const slug = getValue(row, "slug", "Slug") || title.toLowerCase().replace(/[^a-z0-9\s-]/g, "").replace(/\s+/g, "-").replace(/-+/g, "-").trim()
            const description = getValue(row, "description", "Description")
            const thumbnailImage = getValue(row, "thumbnailImage", "ThumbnailImage", "thumbnail")
            const coverImage = getValue(row, "coverImage", "CoverImage", "cover")
            const categoryId = getValue(row, "categoryId", "CategoryId", "category")
            const trainerId = getValue(row, "trainerId", "TrainerId", "trainer")
            const level = getValue(row, "level", "Level").toLowerCase()
            const duration = getValue(row, "duration", "Duration")
            const language = getValue(row, "language", "Language") || "en"
            const hasCertificate = getValue(row, "hasCertificate", "HasCertificate", "certificate")
            const price = getValue(row, "price", "Price")
            const discountedPrice = getValue(row, "discountedPrice", "DiscountedPrice", "discount")
            const demoVideoId = getValue(row, "demoVideoId", "DemoVideoId", "demo")
            const status = getValue(row, "status", "Status") || "inactive"
            const tagsRaw = getValue(row, "tags", "Tags") || ""

            const parseTags = (str: string): string[] => {
                if (!str) return []
                try {
                    return JSON.parse(str)
                } catch {
                    return str.split(',').map(t => t.trim()).filter(Boolean)
                }
            }

            const priceNum = price ? parseInt(price, 10) : 0
            const discountedPriceNum = discountedPrice ? parseInt(discountedPrice, 10) : undefined

            const backendPayload = {
                title,
                slug,
                description: description || undefined,
                thumbnailImage: thumbnailImage || undefined,
                coverImage: coverImage || undefined,
                categoryId,
                trainerId,
                level: level as "beginner" | "intermediate" | "advanced" | "expert",
                duration: duration ? parseInt(duration, 10) : undefined,
                language,
                hasCertificate: ["true", "1", "yes"].includes(hasCertificate.toLowerCase()),
                price: priceNum > 0 ? priceNum : undefined,
                discountedPrice: (priceNum > 0 && discountedPriceNum) ? discountedPriceNum : undefined,
                demoVideoId: demoVideoId || undefined,
                status,
                tags: parseTags(tagsRaw),
            }

            return {
                title,
                slug,
                description,
                thumbnailImage,
                coverImage,
                categoryId,
                trainerId,
                level,
                duration,
                language,
                hasCertificate,
                price,
                discountedPrice,
                demoVideoId,
                backendPayload,
            }
        })

        const validatedData = parsed.map(validateRow)
        setParsedData(validatedData)

        const validCount = validatedData.filter(v => v.valid === "valid").length
        setValid(validCount)
        toast.success(`Parsed ${validatedData.length} courses (${validCount} valid)`)
    } catch (error) {
        console.error("Parse error:", error)
        toast.error("Failed to parse Excel file")
    } finally {
        // setIsParsing(false)
    }
}

