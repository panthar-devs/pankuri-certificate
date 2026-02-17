"use client"

import { Button } from "@/components/ui/button"
import {
    Command,
    CommandEmpty,
    CommandGroup,
    CommandInput,
    CommandItem,
    CommandList,
} from "@/components/ui/command"
import {
    Popover,
    PopoverContent,
    PopoverTrigger,
} from "@/components/ui/popover"
import { getAllVideos } from "@/lib/backend_actions/videos"
import { cn, formatDuration } from "@/lib/utils"
import { Check, ChevronsUpDown, Video } from "lucide-react"
import { useEffect, useState } from "react"
import { toast } from "sonner"
import { TableSkeleton } from "../ui/skeleton-loader"

export function VideoCombobox({ value, onValueChange, disabled }) {
    const [open, setOpen] = useState(false)
    const [videos, setVideos] = useState([])
    const [search, setSearch] = useState("")
    const [loading, setLoading] = useState(false)

    const fetchVideos = async (searchQuery = "") => {
        setLoading(true)
        try {
            const result = await getAllVideos({
                status: "ready",
                search: searchQuery
            })

            if (result.success) {
                setVideos(result.data.data || [])
            } else {
                toast.error(result.error || "Failed to fetch videos")
                setVideos([])
            }
        } catch (error) {
            console.error("Error fetching videos:", error)
            toast.error("Failed to load videos")
            setVideos([])
        } finally {
            setLoading(false)
        }
    }

    useEffect(() => {
        if (open) {
            fetchVideos(search)
        }
    }, [open])

    const handleSearch = (searchValue) => {
        setSearch(searchValue)
        // Debounce search - only search after user stops typing
        const timeoutId = setTimeout(() => {
            fetchVideos(searchValue)
        }, 500)

        return () => clearTimeout(timeoutId)
    }

    const selectedVideo = videos.find(video => video.id === value)

    return (
        <Popover open={open} onOpenChange={setOpen} modal>
            <PopoverTrigger asChild>
                <Button
                    variant="outline"
                    role="combobox"
                    aria-expanded={open}
                    className="w-full justify-between"
                    disabled={disabled}
                >
                    {selectedVideo ? (
                        <div className="flex items-center gap-2 truncate">
                            <Video className="h-4 w-4 shrink-0" />
                            <span className="truncate">{selectedVideo.title}</span>
                        </div>
                    ) : (
                        <span className="text-muted-foreground">Select video...</span>
                    )}
                    <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                </Button>
            </PopoverTrigger>
            <PopoverContent className="w-full p-0" align="start">
                <Command shouldFilter={false}>
                    <CommandInput
                        placeholder="Search videos..."
                        value={search}
                        onValueChange={handleSearch}
                    />
                    <CommandList>
                        {loading ? (
                            <TableSkeleton />
                        ) : (
                            <>
                                <CommandEmpty>No videos found.</CommandEmpty>
                                <CommandGroup>
                                    {videos.map((video) => (
                                        <CommandItem
                                            key={video.id}
                                            value={video.id}
                                            onSelect={() => {
                                                onValueChange(video.id === value ? "" : video.id)
                                                setOpen(false)
                                            }}
                                        >
                                            <Check
                                                className={cn(
                                                    "mr-2 h-4 w-4",
                                                    value === video.id ? "opacity-100" : "opacity-0"
                                                )}
                                            />
                                            <div className="flex flex-col gap-1 flex-1 min-w-0">
                                                <span className="truncate font-medium">{video.title}</span>
                                                {video.duration && (
                                                    <span className="text-xs text-muted-foreground">
                                                        Duration: {formatDuration(video.duration)}
                                                    </span>
                                                )}
                                            </div>
                                        </CommandItem>
                                    ))}
                                </CommandGroup>
                            </>
                        )}
                    </CommandList>
                </Command>
            </PopoverContent>
        </Popover>
    )
}
