"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { toast } from "sonner"
import { Upload, FileSpreadsheet, Loader2, CheckCircle2, AlertCircle } from "lucide-react"
import * as XLSX from "xlsx"
import { bulkCreateModules } from "@/lib/backend_actions/module"
import { useRouter } from "next/navigation"

interface ParsedModule {
    courseId: string
    title: string
    slug: string
    description: string
    sequence: string
    duration: string

    status?: "pending" | "valid" | "invalid"
    error?: string

    // Backend-ready payload
    backendPayload?: {
        courseId: string
        title: string
        slug: string
        description?: string
        sequence: number
        duration?: number
    }
}

interface BulkModuleUploadProps {
    courses: Array<{ id: string; title: string }>
}

const BulkModuleUpload = ({ courses }: BulkModuleUploadProps) => {
    const router = useRouter()
    const [file, setFile] = useState<File | null>(null)
    const [valid, setValid] = useState<number | null>(null)
    const [parsedData, setParsedData] = useState<ParsedModule[]>([])
    const [isParsing, setIsParsing] = useState(false)
    const [isUploading, setIsUploading] = useState(false)
    const [dragActive, setDragActive] = useState(false)

    const handleDrag = (e: React.DragEvent) => {
        e.preventDefault()
        e.stopPropagation()
        if (e.type === "dragenter" || e.type === "dragover") {
            setDragActive(true)
        } else if (e.type === "dragleave") {
            setDragActive(false)
        }
    }

    const handleDrop = (e: React.DragEvent) => {
        e.preventDefault()
        e.stopPropagation()
        setDragActive(false)

        if (e.dataTransfer.files && e.dataTransfer.files[0]) {
            handleFileSelect(e.dataTransfer.files[0])
        }
    }

    const handleFileSelect = (selectedFile: File) => {
        const validTypes = [
            "application/vnd.ms-excel",
            "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
            "text/csv"
        ]

        if (!validTypes.includes(selectedFile.type)) {
            toast.error("Please upload a valid Excel or CSV file")
            return
        }

        setFile(selectedFile)
        setParsedData([])
        setValid(null)
        toast.success(`File "${selectedFile.name}" selected`)
    }

    const handleFileInput = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files[0]) {
            handleFileSelect(e.target.files[0])
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
        } else if (!courses.find(c => c.id === row.courseId)) {
            errors.push("Invalid course ID")
        }
        if (!row.sequence || parseInt(row.sequence) < 1) {
            errors.push("Sequence must be at least 1")
        }

        return {
            ...row,
            status: errors.length > 0 ? "invalid" : "valid",
            error: errors.join(", ")
        }
    }

    const parseExcel = async () => {
        if (!file) {
            toast.error("Please select a file first")
            return
        }

        setIsParsing(true)

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
                return ""
            }

            const parsed: ParsedModule[] = jsonData.map((row) => {
                const courseId = getValue(row, "courseId", "CourseId", "course")
                const title = getValue(row, "title", "Title")
                const slug = getValue(row, "slug", "Slug")
                const description = getValue(row, "description", "Description")
                const sequence = getValue(row, "sequence", "Sequence")
                const duration = getValue(row, "duration", "Duration")

                const backendPayload = {
                    courseId,
                    title,
                    slug,
                    description: description || undefined,
                    sequence: sequence ? parseInt(sequence, 10) : 1,
                    duration: duration ? parseInt(duration, 10) : undefined,
                }

                return {
                    courseId,
                    title,
                    slug,
                    description,
                    sequence,
                    duration,
                    backendPayload,
                }
            })

            const validatedData = parsed.map(validateRow)
            setParsedData(validatedData)

            const validCount = validatedData.filter(v => v.status === "valid").length
            setValid(validCount)
            toast.success(`Parsed ${validatedData.length} modules (${validCount} valid)`)
        } catch (error) {
            console.error("Parse error:", error)
            toast.error("Failed to parse Excel file")
        } finally {
            setIsParsing(false)
        }
    }

    const handleBulkUpload = async () => {
        const validModules = parsedData.filter(v => v.status === "valid")

        if (validModules.length === 0) {
            toast.error("No valid modules to upload")
            return
        }

        setIsUploading(true)
        toast.info(`Uploading ${validModules.length} modules...`)

        try {
            const payloads = validModules.map(v => v.backendPayload!)

            const result = await bulkCreateModules(payloads)

            if (result.success) {
                toast.success(`Successfully uploaded ${validModules.length} modules!`)
                setParsedData([])
                setFile(null)
                setValid(null)
                router.refresh()
            } else {
                toast.error(result.error || "Bulk upload failed")
            }
        } catch (error) {
            console.error("Bulk upload error:", error)
            toast.error("An error occurred during bulk upload")
        } finally {
            setIsUploading(false)
        }
    }

    return (
        <div className="space-y-6">
            <Card>
                <CardHeader>
                    <CardTitle>Upload Excel File</CardTitle>
                    <CardDescription>
                        Upload an Excel file with columns: courseId, title, slug, description, sequence, duration
                    </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                    <div
                        className={`relative border-2 border-dashed rounded-lg p-12 transition-colors ${dragActive
                                ? "border-primary bg-primary/5"
                                : "border-muted-foreground/25 hover:border-muted-foreground/50"
                            }`}
                        onDragEnter={handleDrag}
                        onDragLeave={handleDrag}
                        onDragOver={handleDrag}
                        onDrop={handleDrop}
                    >
                        <input
                            type="file"
                            id="file-upload"
                            className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                            accept=".xlsx,.xls,.csv"
                            onChange={handleFileInput}
                        />
                        <div className="flex flex-col items-center justify-center space-y-4 text-center">
                            <div className="p-4 bg-primary/10 rounded-full">
                                {file ? (
                                    <FileSpreadsheet className="w-10 h-10 text-primary" />
                                ) : (
                                    <Upload className="w-10 h-10 text-primary" />
                                )}
                            </div>
                            <div>
                                <p className="text-lg font-semibold">
                                    {file ? file.name : "Drop your Excel file here"}
                                </p>
                                <p className="text-sm text-muted-foreground mt-1">
                                    or click to browse (Excel or CSV)
                                </p>
                            </div>
                        </div>
                    </div>

                    <div className="flex gap-3">
                        <Button
                            onClick={parseExcel}
                            disabled={!file || isParsing}
                            className="flex-1 py-6"
                            variant="gradient"
                        >
                            {isParsing ? (
                                <>
                                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                                    Parsing...
                                </>
                            ) : (
                                "Parse File"
                            )}
                        </Button>
                        {parsedData.length > 0 && (
                            <Button
                                onClick={handleBulkUpload}
                                disabled={valid === 0 || isUploading}
                                className="flex-1 py-6"
                            >
                                {isUploading ? (
                                    <>
                                        <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                                        Uploading...
                                    </>
                                ) : (
                                    `Upload ${valid} Modules`
                                )}
                            </Button>
                        )}
                    </div>
                </CardContent>
            </Card>

            {parsedData.length > 0 && (
                <Card>
                    <CardHeader>
                        <CardTitle>
                            Parsed Modules ({parsedData.length})
                            {valid !== null && (
                                <>
                                    <span className="text-green-500 ml-2">{valid} valid</span>
                                    <span className="text-red-500 ml-2">{parsedData.length - valid} invalid</span>
                                </>
                            )}
                        </CardTitle>
                        <CardDescription>
                            Review the parsed data before uploading
                        </CardDescription>
                    </CardHeader>
                    <CardContent>
                        <div className="border rounded-lg overflow-hidden">
                            <Table>
                                <TableHeader>
                                    <TableRow>
                                        <TableHead className="w-12">Status</TableHead>
                                        <TableHead>Title</TableHead>
                                        <TableHead>Slug</TableHead>
                                        <TableHead>Course ID</TableHead>
                                        <TableHead>Sequence</TableHead>
                                        <TableHead>Duration</TableHead>
                                        <TableHead>Description</TableHead>
                                        <TableHead>Error</TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {parsedData.map((module, index) => (
                                        <TableRow key={index}>
                                            <TableCell>
                                                {module.status === "valid" ? (
                                                    <CheckCircle2 className="w-5 h-5 text-green-500" />
                                                ) : (
                                                    <AlertCircle className="w-5 h-5 text-destructive" />
                                                )}
                                            </TableCell>
                                            <TableCell className="font-medium max-w-[200px] truncate">
                                                {module.title}
                                            </TableCell>
                                            <TableCell className="text-xs max-w-[150px] truncate">
                                                {module.slug}
                                            </TableCell>
                                            <TableCell className="text-xs">{module.courseId}</TableCell>
                                            <TableCell>{module.sequence}</TableCell>
                                            <TableCell>{module.duration}</TableCell>
                                            <TableCell className="text-xs max-w-[200px] truncate">
                                                {module.description}
                                            </TableCell>
                                            <TableCell className="text-xs text-destructive max-w-[200px] truncate">
                                                {module.error}
                                            </TableCell>
                                        </TableRow>
                                    ))}
                                </TableBody>
                            </Table>
                        </div>
                    </CardContent>
                </Card>
            )}
        </div>
    )
}

export default BulkModuleUpload
