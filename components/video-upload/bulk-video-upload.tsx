"use client"

import { useState, useTransition } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { toast } from "sonner"
import { Upload, FileSpreadsheet, Loader2, CheckCircle2, AlertCircle } from "lucide-react"
import * as XLSX from "xlsx"
import { createBulkVideos } from "@/lib/backend_actions/videos"
import { Badge } from "../ui/badge"

interface ParsedVideo {
    title: string
    externalUrl: string
    thumbnailUrl: string
    duration: string
    videoQuality: string
    isShort: boolean
    disclaimer: string
    products: string  // JSON string for display
    timeStamps: string  // JSON string for display
    description: string

    valid?: "pending" | "valid" | "invalid"
    status?: string
    error?: string

    // Backend-ready payload (not shown in UI)
    backendPayload?: {
        title: string
        externalUrl: string | null
        thumbnailUrl: string | null
        duration: number | null
        // quality: number
        metadata: {
            quality: number
            isShort: boolean
        }
        videoDescription: {
            disclaimer?: string
            products?: Array<{
                name: string
                url: string
                image: string
            }>
            timestamps?: Array<{
                time_interval: string
                time_content: string
            }>
            description?: string
        } | null
    }
}

const BulkVideoUpload = () => {
    const [file, setFile] = useState<File | null>(null)
    const [valid, setValid] = useState<number | null>(null)
    const [parsedData, setParsedData] = useState<ParsedVideo[]>([])
    const [isParsing, setIsParsing] = useState(false)
    const [dragActive, setDragActive] = useState(false)
    const [isPending, startTransition] = useTransition()


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
        toast.success(`File "${selectedFile.name}" selected`)
    }

    const handleFileInput = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files[0]) {
            handleFileSelect(e.target.files[0])
        }
    }

    const validateRow = (row: ParsedVideo): ParsedVideo => {
        const errors: string[] = []

        if (!row.title || row.title.length < 3) {
            errors.push("Title must be at least 3 characters")
        }
        if (!row.externalUrl || !row.externalUrl.startsWith("http")) {
            errors.push("Invalid URL")
        }
        if (!row.duration) {
            errors.push("Duration is required")
        }

        return {
            ...row,
            valid: errors.length > 0 ? "invalid" : "valid",
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

            console.log("Json data for excel sheet ==> ", jsonData)

            const parsed: ParsedVideo[] = jsonData.map((row) => {
                // Helper to safely parse JSON strings
                const safeJsonParse = (str: string, fallback: any = null) => {
                    try {
                        return str ? JSON.parse(str) : fallback
                    } catch {
                        return fallback
                    }
                }

                // Parse raw fields
                const title = row.title || row.Title || ""
                const externalUrl = row.externalUrl || row.ExternalUrl || row.url || row.URL || ""
                const thumbnailUrl = row.thumbnailUrl || row.ThumbnailUrl || row.thumbnail || row.Thumbnail || ""
                const duration = parseFloat(row.duration || row.Duration || "0")
                const videoQuality = parseInt(row.videoQuality || row.VideoQuality || "720", 10)
                const isShort = row.isShort === true || row.IsShort === true || row.isShort === "true" || false
                const disclaimer = row.disclaimer || row.Disclaimer || ""
                const description = row.description || row.Description || ""
                const status = row.status || row.Status || "processing"
                // Parse JSON arrays from Excel cells
                const productsRaw = row.products || row.Products || "[]"
                const timeStampsRaw = row.timeStamps || row.TimeStamps || "[]"
                const productsArray = safeJsonParse(productsRaw, [])
                const timeStampsArray = safeJsonParse(timeStampsRaw, [])

                // Build videoDescription object (null if all fields empty)
                const videoDescription = (disclaimer || productsArray.length > 0 || timeStampsArray.length > 0 || description)
                    ? {
                        disclaimer: disclaimer || undefined,
                        products: productsArray.length > 0 ? productsArray : undefined,
                        timestamps: timeStampsArray.length > 0 ? timeStampsArray : undefined,
                        description: description || undefined,
                    }
                    : null

                // Build backend-ready payload
                const backendPayload = {
                    title,
                    externalUrl: externalUrl || null,
                    thumbnailUrl: thumbnailUrl || null,
                    duration: duration || null,
                    // quality: videoQuality,
                    valid: externalUrl ? "valid" : "invalid",
                    status: externalUrl ? "ready" : status,
                    metadata: {
                        quality: videoQuality,
                        isShort,
                    },
                    videoDescription,
                    storageKey: null, // No file upload in bulk
                }

                return {
                    // UI Display Fields
                    title,
                    externalUrl,
                    thumbnailUrl,
                    duration: duration.toString(),
                    videoQuality: videoQuality.toString(),
                    isShort,
                    disclaimer,
                    status,
                    products: productsRaw,
                    timeStamps: timeStampsRaw,
                    description,

                    // Backend Payload
                    backendPayload,
                }
            })

            const validatedData = parsed.map(validateRow)
            setParsedData(validatedData)

            const validCount = validatedData.filter(v => v.status === "valid").length
            setValid(validCount)
            toast.success(`Parsed ${validatedData.length} videos (${validCount} valid)`)
        } catch (error) {
            console.error("Parse error:", error)
            toast.error("Failed to parse Excel file")
        } finally {
            setIsParsing(false)
        }
    }

    const handleBulkUpload = async () => {
        try {
            startTransition(async () => {
                const res = await createBulkVideos(parsedData.filter(v => v.status === "valid").map(v => v.backendPayload!))
                if (res.success) {
                    toast.success(`Successfully uploaded ${parsedData.filter(v => v.status === "valid").length} videos`)
                } else {
                    toast.warning(`Failed to upload videos: ${res.error}`)
                }
            })
        } catch (error) {
            console.error("Bulk upload error:", error)
            toast.error("An error occurred during bulk upload")
        }

    }

    return (
        <div className="space-y-6">
            <Card>
                <CardHeader>
                    <CardTitle>Upload Excel File</CardTitle>
                    <CardDescription>
                        Upload an Excel file with columns: title, description, externalUrl, duration, videoQuality, isShort
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
                                disabled={parsedData.filter(v => v.status === "valid").length === 0 || isPending}
                                className="flex-1 py-6 "
                            >
                                {isPending ? (
                                    <>
                                        <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                                        Uploading...
                                    </>
                                ) : (
                                    `Upload ${parsedData.filter(v => v.status === "valid").length} Videos`
                                )}
                            </Button>
                        )}
                    </div>
                </CardContent>
            </Card>

            {parsedData.length > 0 && (
                <Card>
                    <CardHeader>
                        <CardTitle>Parsed Videos ({parsedData.length})
                            <span className="text-green-300" >  {valid !== null && `${valid} valid`} </span>
                            <span className="text-red-300" >  {valid !== null && `${parsedData.length - valid} Invalid`} </span>
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
                                        <TableHead className="w-12">Valid</TableHead>
                                        <TableHead>Title</TableHead>
                                        <TableHead>Video URL</TableHead>
                                        <TableHead>Thumbnail URL</TableHead>
                                        <TableHead>Duration</TableHead>
                                        <TableHead>Quality</TableHead>
                                        <TableHead>Short</TableHead>
                                        <TableHead>Disclaimer</TableHead>
                                        <TableHead>Products</TableHead>
                                        <TableHead>TimeStamps</TableHead>
                                        <TableHead>Description</TableHead>
                                        <TableHead>Status</TableHead>
                                        <TableHead>Error Message</TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {parsedData.map((video, index) => (
                                        <TableRow key={index}>
                                            <TableCell>
                                                {video.valid === "valid" ? (
                                                    <CheckCircle2 className="w-5 h-5 text-green-500" />
                                                ) : (
                                                    <AlertCircle className="w-5 h-5 text-destructive" />
                                                )}
                                            </TableCell>
                                            <TableCell className="font-medium max-w-[200px] truncate">
                                                {video.title}
                                            </TableCell>
                                            <TableCell className="max-w-[150px] truncate text-xs">
                                                {video.externalUrl}
                                            </TableCell>
                                            <TableCell className="max-w-[150px] truncate text-xs">
                                                {video.thumbnailUrl}
                                            </TableCell>
                                            <TableCell>{video.duration}</TableCell>
                                            <TableCell>{video.videoQuality}</TableCell>
                                            <TableCell>{video.isShort ? "Yes" : "No"}</TableCell>
                                            <TableCell className="max-w-[200px] truncate text-muted-foreground">
                                                {video.disclaimer}
                                            </TableCell>
                                            <TableCell className="max-w-[200px] truncate text-muted-foreground">
                                                {video.products}
                                            </TableCell>
                                            <TableCell className="max-w-[200px] truncate text-muted-foreground">
                                                {video.timeStamps}
                                            </TableCell>
                                            <TableCell className="max-w-[200px] truncate text-muted-foreground">
                                                {video.description}
                                            </TableCell>
                                            <TableCell className="max-w-[200px] truncate text-muted-foreground">
                                                <Badge variant={video.status === "ready" ? "gradient" : "secondary"} >
                                                    {video.status}
                                                </Badge>
                                            </TableCell>
                                            <TableCell className="text-xs text-destructive max-w-[150px] truncate">
                                                {video.error}
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

export default BulkVideoUpload