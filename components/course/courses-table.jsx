"use client"

import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { toggleCoursePublishStatus } from "@/lib/backend_actions/course"
import { Check, Copy, Eye, EyeOff, Lock, MoreHorizontal, Pencil, Trash2, Unlock } from "lucide-react"
import Image from "next/image"
import { useRouter } from "next/navigation"
import { useState, useTransition } from "react"
import { toast } from "sonner"
import { DeleteCourseDialog } from "./delete-course-dialog"
import { EditCourseDialog } from "./edit-course-dialog"
import PaginationNumberless from "../customized/pagination/pagination-12"
import { HandleCopyBtn } from "@/lib/client.utils"

const LEVEL_BADGES = {
    beginner: "default",
    intermediate: "secondary",
    advanced: "outline",
    expert: "destructive"
}

export function CoursesTable({ courses, categories, pagination }) {
    const router = useRouter()

    const [isPending, startTransition] = useTransition()

    const handleToggleStatus = async (courseId, currentStatus) => {
        const newStatus = currentStatus === "active" ? "inactive" : "active"
        startTransition(async () => {
            const result = await toggleCoursePublishStatus(courseId, newStatus)
            if (result.success) {
                toast.success(`Course ${newStatus === "active" ? "activated" : "deactivated"}`)
                router.refresh()
            } else {
                toast.error(result.error || "Failed to update status")
            }
        })
    }

    const getCategoryName = (categoryId) => {
        const category = categories.find(cat => cat.id === categoryId)
        return category?.name || "—"
    }

    if (!courses || courses.length === 0) {
        return (
            <div className="border rounded-lg p-8 text-center">
                <p className="text-muted-foreground">No courses found. Create your first course to get started.</p>
            </div>
        )
    }

    return (
        <>
            <div className="border rounded-lg">
                <Table>
                    <TableHeader>
                        <TableRow>
                            <TableHead className="w-[50px]">Thumbnail</TableHead>
                            <TableHead>Title</TableHead>
                            <TableHead>Course ID</TableHead>
                            <TableHead>Category</TableHead>
                            <TableHead>Level</TableHead>
                            <TableHead>Duration</TableHead>
                            <TableHead>Language</TableHead>
                            <TableHead>Paid</TableHead>
                            <TableHead>Status</TableHead>
                            <TableHead className="w-[80px]">Actions</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {courses.map((course) => (
                            <TableRow key={course.id} className="hover:bg-accent/50 cursor-pointer">
                                <TableCell onClick={() => { router.push(`/course/${course.id}`) }}
                                >
                                    {course.thumbnailImage ? (
                                        <div className="relative w-12 h-12 rounded overflow-hidden bg-muted">
                                            <Image
                                                src={course.thumbnailImage}
                                                alt={course.title}
                                                fill
                                                className="object-cover"
                                            />
                                        </div>
                                    ) : (
                                        <div className="w-12 h-12 rounded bg-muted flex items-center justify-center text-xs">
                                            {course.title.charAt(0).toUpperCase()}
                                        </div>
                                    )}
                                </TableCell>
                                <TableCell onClick={() => { router.push(`/course/${course.id}`) }}
                                >
                                    <div className="max-w-[300px]">
                                        <p className="font-medium truncate">{course.title}</p>
                                        {course.description && (
                                            <p className="text-xs text-muted-foreground truncate">{course.description}</p>
                                        )}
                                    </div>
                                </TableCell>
                                <TableCell className="text-muted-foreground">
                                    <HandleCopyBtn id={course.id} />
                                </TableCell>
                                <TableCell className="text-muted-foreground">{getCategoryName(course.categoryId)}</TableCell>
                                <TableCell onClick={() => { router.push(`/course/${course.id}`) }}>
                                    <Badge variant={LEVEL_BADGES[course.level] || "default"}>
                                        {course.level}
                                    </Badge>
                                </TableCell>
                                <TableCell onClick={() => { router.push(`/course/${course.id}`) }}>
                                    {course.duration ? `${course.duration} min` : "—"}
                                </TableCell>
                                <TableCell onClick={() => { router.push(`/course/${course.id}`) }} className="uppercase">{course.language}</TableCell>
                                <TableCell onClick={() => { router.push(`/course/${course.id}`) }}>
                                    <Badge variant={course.isPaid ? "default" : "secondary"} className="p-2" >
                                        {course.isPaid ? <Lock /> : <Unlock />}
                                    </Badge>
                                </TableCell>
                                <TableCell onClick={() => { router.push(`/course/${course.id}`) }}>
                                    <Badge variant={course.status === "active" ? "secondary" : "outline"}>
                                        {course.status}
                                    </Badge>
                                </TableCell>
                                <TableCell  >
                                    <DropdownMenu>
                                        <DropdownMenuTrigger asChild>
                                            <Button variant="ghost" size="icon" disabled={isPending}>
                                                <MoreHorizontal className="h-4 w-4" />
                                                <span className="sr-only">Open menu</span>
                                            </Button>
                                        </DropdownMenuTrigger>
                                        <DropdownMenuContent align="end">
                                            <DropdownMenuLabel>Actions</DropdownMenuLabel>
                                            <DropdownMenuSeparator />
                                            <DropdownMenuItem asChild>
                                                <EditCourseDialog course={course} categories={categories}>
                                                    <Button variant="ghost" className="w-full justify-start p-0">
                                                        <Pencil className="mr-2 h-4 w-4" />
                                                        Edit
                                                    </Button>
                                                </EditCourseDialog>
                                            </DropdownMenuItem>
                                            <DropdownMenuItem onClick={() => handleToggleStatus(course.id, course.status)}>
                                                {course.status === "active" ? (
                                                    <>
                                                        <EyeOff className="mr-2 h-4 w-4" />
                                                        Deactivate
                                                    </>
                                                ) : (
                                                    <>
                                                        <Eye className="mr-2 h-4 w-4" />
                                                        Activate
                                                    </>
                                                )}
                                            </DropdownMenuItem>
                                            <DropdownMenuSeparator />
                                            <DropdownMenuItem asChild>
                                                <DeleteCourseDialog course={course}>
                                                    <Button variant="ghost" className="w-full justify-start p-0 text-destructive">
                                                        <Trash2 className="mr-2 h-4 w-4 text-red-500" />
                                                        Delete
                                                    </Button>
                                                </DeleteCourseDialog>
                                            </DropdownMenuItem>
                                        </DropdownMenuContent>
                                    </DropdownMenu>
                                </TableCell>
                            </TableRow>
                        ))}
                    </TableBody>
                </Table>
            </div>
            <PaginationNumberless pagination={pagination} redirectTo="course" />
        </>
    )
}
