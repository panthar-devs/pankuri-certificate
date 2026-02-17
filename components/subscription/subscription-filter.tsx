"use client"

import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Search, X } from "lucide-react"
import { usePathname, useRouter, useSearchParams } from "next/navigation"
import { useEffect, useRef, useState } from "react"
import useDebounce from "@/lib/hooks/use-debounce"

const STATUS_OPTIONS = [
    { value: "pending", label: "Pending" },
    { value: "trial", label: "Trial" },
    { value: "active", label: "Active" },
    { value: "past_due", label: "Past Due" },
    { value: "cancelled", label: "Cancelled" },
    { value: "halted", label: "Halted" },
    { value: "expired", label: "Expired" },
]

export function SubscriptionFilter() {
    const router = useRouter()
    const pathname = usePathname()
    const searchParams = useSearchParams()

    const [searchTerm, setSearchTerm] = useState(searchParams.get("search") || "")
    const [statusFilter, setStatusFilter] = useState(searchParams.get("status") || "all")
    const debouncedSearch = useDebounce(searchTerm, 500)

    const isFirstRender = useRef(true)

    const buildUrl = (overrides: any = {}) => {
        const params = new URLSearchParams()

        const search = overrides.search !== undefined ? overrides.search : debouncedSearch
        const status = overrides.status !== undefined ? overrides.status : statusFilter

        if (search) params.set("search", search)
        if (status && status !== "all") params.set("status", status)
        params.set("page", "1")

        return `${pathname}?${params.toString()}`
    }

    useEffect(() => {
        if (isFirstRender.current) {
            isFirstRender.current = false
            return
        }

        router.push(buildUrl({ search: debouncedSearch }))
    }, [debouncedSearch])

    const handleStatusChange = (value) => {
        setStatusFilter(value)
        router.push(buildUrl({ status: value }))
    }

    return (
        <div className="flex flex-1 flex-col sm:flex-row gap-4 items-center rounded-lg my-8">
            <div className="flex-1 w-full relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
                <Input
                    placeholder="Search subscriptions..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10 h-10"
                />
                {searchTerm && (
                    <button
                        onClick={() => setSearchTerm("")}
                        className="absolute right-3 top-1/2 transform -translate-y-1/2 text-muted-foreground hover:text-foreground"
                    >
                        <X className="w-4 h-4" />
                    </button>
                )}
            </div>

            <Select value={statusFilter} onValueChange={handleStatusChange}>
                <SelectTrigger className="w-[180px] h-10">
                    <SelectValue placeholder="Filter by status" />
                </SelectTrigger>
                <SelectContent>
                    <SelectItem value="all">All Status</SelectItem>
                    {STATUS_OPTIONS.map((status) => (
                        <SelectItem key={status.value} value={status.value}>
                            {status.label}
                        </SelectItem>
                    ))}
                </SelectContent>
            </Select>
        </div>
    )
}