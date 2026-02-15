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
import { updateTrainer } from "@/lib/backend_actions/trainer"
import { Eye, EyeOff, MoreHorizontal, Pencil, Trash2, Award, Users } from "lucide-react"
import Image from "next/image"
import { useRouter } from "next/navigation"
import { useTransition } from "react"
import { toast } from "sonner"
import { DeleteTrainerDialog } from "./delete-trainer-dialog"
import { EditTrainerDialog } from "./edit-trainer-dialog"
import { HandleCopyBtn } from "@/lib/client.utils"

export function TrainersTable({ trainers }) {
    const router = useRouter()
    const [isPending, startTransition] = useTransition()

    const handleToggleStatus = async (trainerId, currentStatus) => {
        const newStatus = currentStatus === "active" ? "inactive" : "active"
        startTransition(async () => {
            const result = await updateTrainer(trainerId, { status: newStatus })
            if (result.success) {
                toast.success(`Trainer ${newStatus === "active" ? "activated" : "deactivated"}`)
                router.refresh()
            } else {
                toast.error(result.error || "Failed to update status")
            }
        })
    }

    if (!trainers || trainers.length === 0) {
        return (
            <div className="border rounded-lg p-8 text-center">
                <p className="text-muted-foreground">No trainers found. Create your first trainer to get started.</p>
            </div>
        )
    }

    return (
        <div className="border rounded-lg">
            <Table>
                <TableHeader>
                    <TableRow>
                        <TableHead className="w-[50px]">Photo</TableHead>
                        <TableHead>Name</TableHead>
                        <TableHead>Trainer Id</TableHead>
                        <TableHead>Email</TableHead>
                        <TableHead>Specialization</TableHead>
                        <TableHead>Experience</TableHead>
                        <TableHead>Rating</TableHead>
                        <TableHead>Students</TableHead>
                        <TableHead>Status</TableHead>
                        <TableHead className="w-20">Actions</TableHead>
                    </TableRow>
                </TableHeader>
                <TableBody>
                    {trainers.map((trainer) => (
                        <TableRow key={trainer.id} className="hover:bg-accent/50 cursor-pointer">
                            <TableCell onClick={() => router.push(`/trainer/${trainer.id}`)}>
                                {trainer.user?.profileImage ? (
                                    <div className="relative w-12 h-12 rounded-full overflow-hidden bg-muted">
                                        <Image
                                            src={trainer.user.profileImage}
                                            alt={trainer.user.displayName}
                                            fill
                                            className="object-cover"
                                        />
                                    </div>
                                ) : (
                                    <div className="w-12 h-12 rounded-full bg-muted flex items-center justify-center text-xs font-medium">
                                        {trainer.user?.displayName?.charAt(0)?.toUpperCase() || "?"}
                                    </div>
                                )}
                            </TableCell>
                            <TableCell onClick={() => router.push(`/trainer/${trainer.id}`)}>
                                <div className="max-w-[200px]">
                                    <p className="font-medium truncate">{trainer.user?.displayName || "—"}</p>
                                    {trainer.bio && (
                                        <p className="text-xs text-muted-foreground truncate">{trainer.bio}</p>
                                    )}
                                </div>
                            </TableCell>
                            <TableCell> <HandleCopyBtn id={trainer.id} /></TableCell>
                            <TableCell onClick={() => router.push(`/trainer/${trainer.id}`)} className="text-muted-foreground">
                                {trainer.user?.email || "—"}
                            </TableCell>
                            <TableCell onClick={() => router.push(`/trainer/${trainer.id}`)}>
                                {trainer.specialization && trainer.specialization.length > 0 ? (
                                    <div className="flex flex-wrap gap-1 max-w-[200px]">
                                        {trainer.specialization.slice(0, 2).map((spec) => (
                                            <Badge key={spec} variant="secondary" className="text-xs">
                                                {spec}
                                            </Badge>
                                        ))}
                                        {trainer.specialization.length > 2 && (
                                            <Badge variant="outline" className="text-xs">
                                                +{trainer.specialization.length - 2}
                                            </Badge>
                                        )}
                                    </div>
                                ) : (
                                    "—"
                                )}
                            </TableCell>
                            <TableCell onClick={() => router.push(`/trainer/${trainer.id}`)}>
                                {trainer.experience ? `${trainer.experience} yrs` : "—"}
                            </TableCell>
                            <TableCell onClick={() => router.push(`/trainer/${trainer.id}`)}>
                                <div className="flex items-center gap-1">
                                    <Award className="h-4 w-4 text-yellow-500" />
                                    <span className="font-medium">{trainer.rating?.toFixed(1) || "0.0"}</span>
                                </div>
                            </TableCell>
                            <TableCell onClick={() => router.push(`/trainer/${trainer.id}`)}>
                                <div className="flex items-center gap-1">
                                    <Users className="h-4 w-4 text-muted-foreground" />
                                    <span>{trainer.totalStudents || 0}</span>
                                </div>
                            </TableCell>
                            <TableCell onClick={() => router.push(`/trainer/${trainer.id}`)}>
                                <Badge variant={trainer.status === "active" ? "default" : "secondary"}>
                                    {trainer.status}
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
                                            <EditTrainerDialog trainer={trainer}>
                                                <Button variant="ghost" className="w-full justify-start p-0">
                                                    <Pencil className="mr-2 h-4 w-4" />
                                                    Edit
                                                </Button>
                                            </EditTrainerDialog>
                                        </DropdownMenuItem>
                                        <DropdownMenuItem onClick={() => handleToggleStatus(trainer.id, trainer.status)}>
                                            {trainer.status === "active" ? (
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
                                            <DeleteTrainerDialog trainer={trainer}>
                                                <Button variant="ghost" className="w-full justify-start p-0 text-destructive hover:bg-destructive/10 hover:text-destructive">
                                                    <Trash2 className="mr-2 h-4 w-4 text-red-500" />
                                                    Delete
                                                </Button>
                                            </DeleteTrainerDialog>
                                        </DropdownMenuItem>
                                    </DropdownMenuContent>
                                </DropdownMenu>
                            </TableCell>
                        </TableRow>
                    ))}
                </TableBody>
            </Table>
        </div>
    )
}
