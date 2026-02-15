"use client"

import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select"
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table"
import { updateModuleStatus } from "@/lib/backend_actions/module"
import { BookOpen, Clock, ListOrdered, MoreHorizontal, Pencil, Trash2 } from "lucide-react"
import { useRouter } from "next/navigation"
import { useState } from "react"
import { toast } from "sonner"
import DeleteModuleDialog from "./delete-module-dialog"
import EditModuleDialog from "./edit-module-dialog"
import { HandleCopyBtn } from "@/lib/client.utils"

const STATUS_BADGES = {
    draft: { variant: "secondary", label: "Draft" },
    published: { variant: "default", label: "Published" },
    archived: { variant: "outline", label: "Archived" },
}

export default function ModulesTable({ modules, courses, selectedCourseId }) {
    const router = useRouter()
    const [deletingModule, setDeletingModule] = useState(null)

    const handleStatusToggle = async (moduleId, currentStatus) => {
        const newStatus = currentStatus === "published" ? "draft" : "published"
        const result = await updateModuleStatus(moduleId, newStatus)

        if (result.success) {
            toast.success(`Module ${newStatus === "published" ? "published" : "unpublished"} successfully`)
            router.refresh()
        } else {
            toast.error(result.error || "Failed to update module status")
        }
    }

    const getCourseName = (courseId) => {
        const course = courses.find(c => c.id === courseId)
        return course?.title || "Unknown Course"
    }

    const handleCourseFilter = (value) => {
        const params = new URLSearchParams(window.location.search)
        if (value === "all") {
            params.delete("courseId")
        } else {
            params.set("courseId", value)
        }
        router.push(`/module?${params.toString()}`)
    }

    return (
        <>
            <Card className="mb-6">
                <CardContent>
                    <div className="flex items-center gap-4">
                        <div className="flex-1">
                            <label className="text-sm font-medium mb-2 block">Filter by Course</label>
                            <Select value={selectedCourseId || "all"} onValueChange={handleCourseFilter}>
                                <SelectTrigger className="w-[300px]">
                                    <SelectValue placeholder="All Courses" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="all">All Courses</SelectItem>
                                    {courses.map((course) => (
                                        <SelectItem key={course.id} value={course.id}>
                                            {course.title}
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </div>
                        <div className="text-sm text-muted-foreground">
                            <strong>{modules.length}</strong> module(s) found
                        </div>
                    </div>
                </CardContent>
            </Card>

            <Card className="pt-0!" >
                <CardContent className="px-2">
                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead className="w-[70px]">Seq</TableHead>
                                <TableHead>Title</TableHead>
                                <TableHead>Module Id</TableHead>
                                <TableHead>Course</TableHead>
                                <TableHead>Status</TableHead>
                                <TableHead className="text-center">Lessons</TableHead>
                                <TableHead className="text-center">Duration</TableHead>
                                <TableHead className="text-right">Actions</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {modules.length === 0 ? (
                                <TableRow>
                                    <TableCell colSpan={7} className="text-center py-12">
                                        <BookOpen className="h-12 w-12 mx-auto mb-4 opacity-30" />
                                        <p className="text-muted-foreground">
                                            {selectedCourseId
                                                ? "No modules found for this course"
                                                : "No modules found. Select a course to view modules."}
                                        </p>
                                    </TableCell>
                                </TableRow>
                            ) : (
                                modules.map((module) => (
                                    <TableRow key={module.id} className="group cursor-pointer">
                                        <TableCell onClick={() => { router.push(`/module/${module.id}`) }} >
                                            <div>
                                                <span className="w-8 h-8 rounded-full bg-primary/10 text-primary font-semibold text-sm flex items-center justify-center" >
                                                    {module.sequence}
                                                </span>
                                            </div>
                                        </TableCell>
                                        <TableCell onClick={() => { router.push(`/module/${module.id}`) }} >
                                            <div>
                                                <p className="font-medium group-hover:text-primary transition-colors">
                                                    {module.title}
                                                </p>
                                                {module.description && (
                                                    <p className="text-xs text-muted-foreground line-clamp-1 mt-1">
                                                        {module.description}
                                                    </p>
                                                )}
                                            </div>
                                        </TableCell>
                                        <TableCell>
                                            <HandleCopyBtn id={module.id} />
                                        </TableCell>
                                        <TableCell onClick={() => { router.push(`/module/${module.id}`) }} >
                                            <span className="text-sm">{getCourseName(module.courseId)}</span>
                                        </TableCell>
                                        <TableCell onClick={() => { router.push(`/module/${module.id}`) }} >
                                            <Badge variant={STATUS_BADGES[module.status]?.variant}>
                                                {STATUS_BADGES[module.status]?.label}
                                            </Badge>
                                        </TableCell>
                                        <TableCell className="text-center" onClick={() => { router.push(`/module/${module.id}`) }}
                                        >
                                            <div className="flex items-center justify-center gap-1 text-sm text-muted-foreground">
                                                <ListOrdered className="h-3 w-3" />
                                                <span>{module._count?.lessons || 0}</span>
                                            </div>
                                        </TableCell>
                                        <TableCell className="text-center" onClick={() => { router.push(`/module/${module.id}`) }}
                                        >
                                            {module.duration ? (
                                                <div className="flex items-center justify-center gap-1 text-sm text-muted-foreground">
                                                    <Clock className="h-3 w-3" />
                                                    <span>{module.duration}m</span>
                                                </div>
                                            ) : (
                                                <span className="text-xs text-muted-foreground">-</span>
                                            )}
                                        </TableCell>
                                        <TableCell className="text-right" >
                                            <DropdownMenu>
                                                <DropdownMenuTrigger asChild>
                                                    <Button variant="ghost" size="sm">
                                                        <MoreHorizontal className="h-4 w-4" />
                                                    </Button>
                                                </DropdownMenuTrigger>
                                                <DropdownMenuContent align="end">
                                                    <DropdownMenuLabel>Actions</DropdownMenuLabel>
                                                    <DropdownMenuSeparator />
                                                    <DropdownMenuItem asChild>
                                                        <EditModuleDialog module={module} courses={courses}>
                                                            <Button variant="ghost" type="button" className="w-full justify-start p-0">
                                                                <Pencil className="mr-2 h-4 w-4" />
                                                                Edit
                                                            </Button>
                                                        </EditModuleDialog>
                                                    </DropdownMenuItem>
                                                    <DropdownMenuItem onClick={() => handleStatusToggle(module.id, module.status)}>
                                                        {module.status === "published" ? "Unpublish" : "Publish"}
                                                    </DropdownMenuItem>
                                                    <DropdownMenuSeparator />
                                                    <DropdownMenuItem
                                                        onClick={() => setDeletingModule(module)}
                                                        className="text-destructive focus:text-destructive"
                                                    >
                                                        <Trash2 className="mr-2 h-4 w-4" />
                                                        Delete
                                                    </DropdownMenuItem>
                                                </DropdownMenuContent>
                                            </DropdownMenu>
                                        </TableCell>
                                    </TableRow>
                                ))
                            )}
                        </TableBody>
                    </Table>
                </CardContent>
            </Card>


            {deletingModule && (
                <DeleteModuleDialog
                    module={deletingModule}
                    open={!!deletingModule}
                    onOpenChange={(open) => !open && setDeletingModule(null)}
                />
            )}
        </>
    )
}
