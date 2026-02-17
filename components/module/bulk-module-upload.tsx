"use client"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { bulkCreateModules } from "@/lib/backend_actions/module"
import { ParsedModule, parseModuleExcel } from "@/lib/helper_bulk/module.helper"
import { AlertCircle, CheckCircle2, FileSpreadsheet, Loader2, Upload } from "lucide-react"
import { useRouter } from "next/navigation"
import { useState } from "react"
import { toast } from "sonner"
import { Badge } from "../ui/badge"



const BulkModuleUpload = () => {
    const router = useRouter()
    const [file, setFile] = useState<File | null>(null)
    const [valid, setValid] = useState<number | null>(null)
    const [parsedData, setParsedData] = useState<ParsedModule[]>([])
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



    const handleBulkUpload = async () => {

        setIsUploading(true)

        try {
            const data = parsedData.filter(m => m.valid === "valid").map(m => m.backendPayload!)
            const result = await bulkCreateModules(data)

            if (result.success) {
                toast.success(`Successfully uploaded ${data.length} modules!`)
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
                            onClick={() => {
                                parseModuleExcel({ file, setParsedData, setValid })
                            }}
                            disabled={!file}
                            className="flex-1 py-6"
                            variant="gradient"
                        >
                            Parse File
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
                                        <TableHead>Status</TableHead>
                                        <TableHead>Error</TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {parsedData.map((module, index) => (
                                        <TableRow key={index}>
                                            <TableCell>
                                                {module.valid === "valid" ? (
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
                                                <Badge variant={module.status === "published" ? "gradient" : module.status === "draft" ? "secondary" : "destructive"} >
                                                    {module.status}
                                                </Badge>
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
