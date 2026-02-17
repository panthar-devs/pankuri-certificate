"use client"

import { toast } from "sonner"
import * as XLSX from "xlsx"


export interface ParsedModule {
    courseId: string
    title: string
    slug: string
    description: string
    sequence: string
    duration: string

    valid?: "pending" | "valid" | "invalid"
    error?: string
    status?: "draft" | "published" | "archived"

    // Backend-ready payload
    backendPayload?: {
        courseId: string
        title: string
        slug: string
        description?: string
        sequence: number
        duration?: number
        status?: "draft" | "published" | "archived"
    }
}

const validateRow = (row: ParsedModule): ParsedModule => {
    const errors: string[] = []

    if (!row.title || row.title.length < 3) {
        errors.push("Title must be at least 3 characters")
    }
    if (!row.slug || row.slug.length < 1) {
        errors.push("Slug is required")
    }
    if (!row.courseId) {
        errors.push("Course is required")
    }
    if (!row.sequence) {
        errors.push("Sequence must be at least 1")
    }

    return {
        ...row,
        valid: errors.length > 0 ? "invalid" : "valid",
        error: errors.join(", ")
    }
}

export const parseModuleExcel = async ({ file, setParsedData, setValid }: any) => {
    if (!file) {
        toast.error("Please select a file first")
        return
    }

    // setIsParsing(true)

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

        const parsed: ParsedModule[] = jsonData.map((row) => {
            const courseId = getValue(row, "courseId", "CourseId", "course")
            const title = getValue(row, "title", "Title")
            const slug = getValue(row, "slug", "Slug") || title.toLowerCase().replace(/[^a-z0-9\s-]/g, "").replace(/\s+/g, "-").replace(/-+/g, "-").trim()
            const description = getValue(row, "description", "Description")
            const sequence = getValue(row, "sequence", "Sequence")
            const duration = getValue(row, "duration", "Duration")
            const status = getValue(row, "status", "Status") || "draft"

            const backendPayload = {
                courseId,
                title,
                slug,
                description: description || undefined,
                sequence: sequence ? parseInt(sequence, 10) : 1,
                duration: duration ? parseInt(duration, 10) : undefined,
                status: (status.toLowerCase() || "draft") as "draft" | "published" | "archived"
            }

            return {
                courseId,
                title,
                slug,
                description,
                sequence,
                duration,
                status: (status.toLowerCase() || "draft") as "draft" | "published" | "archived",
                backendPayload,
            }
        })

        const validatedData = parsed.map(validateRow)
        setParsedData(validatedData)

        const validCount = validatedData.filter(v => v.valid === "valid").length
        setValid(validCount)
        toast.success(`Parsed ${validatedData.length} modules (${validCount} valid)`)
    } catch (error) {
        console.error("Parse error:", error)
        toast.error("Failed to parse Excel file")
    }
}