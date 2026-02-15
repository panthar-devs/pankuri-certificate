"use client"

import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
    DropdownMenuSeparator,
} from "@/components/ui/dropdown-menu"
import { Play, Download, Trash2, MoreHorizontal, Edit } from "lucide-react"
import Image from "next/image"
import { DeleteVideoDialog } from "./delete-video-dialog"
import { EditVideoDialog } from "./edit-video-dialog"
import { toast } from "sonner"
import { useState } from "react"
import { VideoPlayer } from "./VideoPlayer"
import { formatDuration } from "@/lib/utils"
import { HandleCopyBtn } from "@/lib/client.utils"

export const videoColumns = [
    {
        accessorKey: "thumbnailUrl",
        header: "Thumbnail",
        cell: ({ row }) => (
            <Image
                src={row.original.thumbnailUrl || "/placeholder.svg"}
                alt={row.original.title || "Video"}
                width={80}
                height={45}
                className="rounded object-cover"
            />
        ),
    },
    {
        accessorKey: "title",
        header: "Title",
        cell: ({ row }) => <div className="max-w-xs truncate font-medium">{row.original.title || "Untitled"}</div>,
    },
    {
        accessorKey: "id",
        header: "Video ID",
        cell: ({ row }) => <div className="text-muted-foreground text-xs truncate max-w-[170px]">{<HandleCopyBtn id={row.original.id} />}</div>,
    },
    {
        accessorKey: "duration",
        header: "Duration",
        cell: ({ row }) => {
            return formatDuration(row.original.duration)
        },
    },
    {
        accessorKey: "quality",
        header: "Quality",
        cell: ({ row }) => <Badge variant="secondary">{row.original.metadata.quality}</Badge>,
    },
    {
        accessorKey: "Status",
        header: "Status",
        cell: ({ row }) => <Badge variant="default">{row.original.status}</Badge>,
    },
    {
        accessorKey: "uploadedAt",
        header: "Uploaded",
        cell: ({ row }) => {
            if (!row.original.createdAt) return "—"
            return new Date(row.original.createdAt).toLocaleDateString()
        },
    },
    {
        id: "actions",
        header: "Actions",
        cell: ({ row }) => {
            const [showPlayer, setShowPlayer] = useState(false);
            const handleDownload = async () => {

                console.log("Download:", row.original)
                const video = row.original

                if (video.videoUrl) {
                    try {
                        const response = await fetch(video.videoUrl)
                        const blob = await response.blob()
                        const url = window.URL.createObjectURL(blob)
                        const link = document.createElement("a")
                        link.href = url
                        link.download = `${video.title || "video"}.mp4`
                        document.body.appendChild(link)
                        link.click()
                        document.body.removeChild(link)
                        window.URL.revokeObjectURL(url)
                        toast.success("Download started")
                    } catch (error) {
                        toast.error("Failed to download video")
                        console.error("Download error:", error)
                    }
                } else {
                    toast.error("Video URL not available")
                }
            }
            return (
                <>
                    <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="sm">
                                <MoreHorizontal className="w-4 h-4" />
                                <span className="sr-only">Open menu</span>
                            </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end" className="w-48">
                            <DropdownMenuItem onClick={() => setShowPlayer(true)} >
                                <Play className="w-4 h-4 mr-2" />
                                Play
                            </DropdownMenuItem>
                            <EditVideoDialog video={row.original}>
                                <DropdownMenuItem onSelect={(e) => e.preventDefault()}>
                                    <Edit className="w-4 h-4 mr-2" />
                                    Edit
                                </DropdownMenuItem>
                            </EditVideoDialog>
                            <DropdownMenuItem onClick={handleDownload}>
                                <Download className="w-4 h-4 mr-2" />
                                Download
                            </DropdownMenuItem>
                            <DropdownMenuSeparator />
                            <DeleteVideoDialog video={row.original}>
                                <DropdownMenuItem
                                    onSelect={(e) => e.preventDefault()}
                                    className="text-destructive focus:text-destructive"
                                >
                                    <Trash2 className="w-4 h-4 mr-2" />
                                    Delete
                                </DropdownMenuItem>
                            </DeleteVideoDialog>
                        </DropdownMenuContent>
                    </DropdownMenu>
                    <VideoPlayer
                        isOpen={showPlayer}
                        onClose={() => setShowPlayer(false)}
                        video={row.original}
                    />
                </>
            )
        },
    },
]
