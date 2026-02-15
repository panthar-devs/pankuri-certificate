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
import { Check, Copy, Eye, EyeOff, Lock, MoreHorizontal, Pencil, Trash2, Unlock } from "lucide-react"
// import { deleteCategory, updateCategoryStatus } from "@/lib/category-actions"
import { deleteCategory, updateCategoryStatus } from "@/lib/backend_actions/category"
import Image from "next/image"
import { useRouter } from "next/navigation"
import { useState, useTransition } from "react"
import { toast } from "sonner"
import { DeleteCategoryDialog } from "./delete-category-dialog"
import { EditCategoryDialog } from "./edit-category-dialog"
import PaginationNumberless from "../customized/pagination/pagination-12"


export function CategoriesTable({ categories, parentCategories, pagination }) {
    const router = useRouter()
    const [isPending, startTransition] = useTransition()
    const [editingCategory, setEditingCategory] = useState(null)
    const [copiedId, setCopiedId] = useState(null)

    const handleToggleStatus = async (categoryId, currentStatus) => {
        const newStatus = currentStatus === "active" ? "inactive" : "active"
        startTransition(async () => {
            const result = await updateCategoryStatus(categoryId, newStatus)
            if (result.success) {
                toast.success(`Category ${newStatus === "active" ? "activated" : "deactivated"}`)
                router.refresh()
            } else {
                toast.error(result.error || "Failed to update status")
            }
        })
    }

    if (!categories || categories.length === 0) {
        return (
            <div className="border rounded-lg p-8 text-center">
                <p className="text-muted-foreground">No categories found. Create your first category to get started.</p>
            </div>
        )
    }

    const handleCopy = async (id) => {
        try {
            await navigator.clipboard.writeText(id)
            setCopiedId(id)
            toast.success("Category ID copied to clipboard")

            setTimeout(() => {
                setCopiedId(null)
            }, 2000)
        } catch (err) {
            toast.error("Failed to copy category ID")
        }
    }

    return (
        <>
            <div className="border rounded-lg">
                <Table>
                    <TableHeader>
                        <TableRow>
                            <TableHead className="w-[50px]">Icon</TableHead>
                            <TableHead>Name</TableHead>
                            <TableHead>Id</TableHead>
                            <TableHead>Slug</TableHead>
                            <TableHead>Description</TableHead>
                            <TableHead>Status</TableHead>
                            <TableHead>Sequence</TableHead>
                            <TableHead>Paid</TableHead>
                            <TableHead className="w-20">Actions</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {categories.map((category) => (
                            <TableRow key={category.id}>
                                <TableCell>
                                    {category.icon ? (
                                        <div className="relative w-8 h-8 rounded overflow-hidden bg-muted">
                                            <Image
                                                src={category?.icon || ""}
                                                alt={category.name}
                                                fill
                                                className="object-cover"
                                            />
                                        </div>
                                    ) : (
                                        <div className="w-8 h-8 rounded bg-muted flex items-center justify-center text-xs">
                                            {category.name.charAt(0).toUpperCase()}
                                        </div>
                                    )}
                                </TableCell>
                                <TableCell className="font-medium">{category.name}</TableCell>
                                <TableCell>
                                    <div className="flex items-center gap-2">
                                        <span className="text-muted-foreground text-xs truncate max-w-[120px]">{category.id}</span>
                                        <Button
                                            variant="ghost"
                                            size="icon"
                                            className="h-7 w-7"
                                            onClick={() => handleCopy(category.id)}
                                        >
                                            {copiedId === category.id ? (
                                                <Check className="h-3.5 w-3.5 text-green-500" />
                                            ) : (
                                                <Copy className="h-3.5 w-3.5" />
                                            )}
                                        </Button>
                                    </div>
                                </TableCell>
                                <TableCell className="text-muted-foreground">{category.slug}</TableCell>
                                <TableCell className="max-w-[300px] truncate">{category.description || "—"}</TableCell>
                                <TableCell>
                                    <Badge variant={category.status === "active" ? "default" : "secondary"}>{category.status}</Badge>
                                </TableCell>
                                <TableCell>{category.sequence}</TableCell>
                                <TableCell>
                                    <Badge variant={category.isPaid ? "default" : "secondary"} className="p-2" >
                                        {category.isPaid ? <Lock /> : <Unlock />}
                                    </Badge>
                                </TableCell>
                                <TableCell>
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
                                                <EditCategoryDialog category={category} parentCategories={parentCategories} asChild>
                                                    <Button variant="ghost" className="w-full justify-start p-0">
                                                        <Pencil className="mr-2 h-4 w-4" />
                                                        Edit
                                                    </Button>
                                                </EditCategoryDialog>
                                            </DropdownMenuItem>
                                            <DropdownMenuItem onClick={() => handleToggleStatus(category.id, category.status)}>
                                                {category.status === "active" ? (
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
                                                <DeleteCategoryDialog category={category} asChild>
                                                    <Button variant="ghost" className="w-full justify-start p-0 text-destructive">
                                                        <Trash2 className="mr-2 h-4 w-4" />
                                                        Delete
                                                    </Button>
                                                </DeleteCategoryDialog>
                                            </DropdownMenuItem>
                                        </DropdownMenuContent>
                                    </DropdownMenu>
                                </TableCell>
                            </TableRow>
                        ))}
                    </TableBody>
                </Table>
            </div>
            <PaginationNumberless pagination={pagination} redirectTo="category" />
        </>
    )
}
