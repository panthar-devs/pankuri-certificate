"use client"
import { toast } from "sonner"
import { Button } from "@/components/ui/button"
import { Check, Copy } from "lucide-react"
import { useState } from "react"

export const HandleCopyBtn = ({ id }: any) => {

    const [copiedId, setCopiedId] = useState(null)
    const handleCopy = async (id: string, setCopiedId: any) => {
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

        return
    }
    return (
        <div className="flex items-center gap-2">
            <span className="text-muted-foreground text-xs truncate max-w-[120px]">{id}</span>
            <Button
                variant="ghost"
                size="icon"
                className="h-7 w-7"
                onClick={() => handleCopy(id, setCopiedId)}
            >
                {copiedId === id ? (
                    <Check className="h-3.5 w-3.5 text-green-500" />
                ) : (
                    <Copy className="h-3.5 w-3.5" />
                )}
            </Button>
        </div>
    )
}