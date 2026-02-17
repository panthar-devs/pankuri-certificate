"use client"

import { Button } from "@/components/ui/button"
import {
    Dialog,
    DialogClose,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from "@/components/ui/dialog"
import { Field, FieldDescription, FieldError, FieldLabel } from "@/components/ui/field"
import { Input } from "@/components/ui/input"
import { Progress } from "@/components/ui/progress"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Switch } from "@/components/ui/switch"
import { generatePresignedUrlForImage } from "@/lib/action"
import { updateCourse } from "@/lib/backend_actions/course"
import { useForm } from "@tanstack/react-form"
import axios from "axios"
import { Loader2, Pencil, X } from "lucide-react"
import Image from "next/image"
import { useRouter } from "next/navigation"
import { useEffect, useState, useTransition } from "react"
import { toast } from "sonner"
import z from "zod"
import { VideoCombobox } from "./video-combobox"

import MDEditor, { commands } from "@uiw/react-md-editor"
import "@uiw/react-md-editor/markdown-editor.css"

const courseSchema = z.object({
    title: z.string().min(3, "Title must be at least 3 characters"),
    slug: z.string().min(1, "Slug is required"),
    description: z.string().optional(),
    thumbnailImage: z.string().optional(),
    coverImage: z.string().optional(),
    hasPricing: z.boolean().default(false),
    price: z.number().optional(),
    discountedPrice: z.number().optional(),
    categoryId: z.string().min(1, "Category is required"),
    level: z.enum(["beginner", "intermediate", "advanced", "expert"]),
    duration: z.number().optional(),
    language: z.string(),
    hasCertificate: z.boolean(),
    demoVideoId: z.string().optional(),
})

export function EditCourseDialog({ course, categories, children }) {
    const [open, setOpen] = useState(false)
    const [isPending, startTransition] = useTransition()
    const router = useRouter()
    const [thumbnailPreview, setThumbnailPreview] = useState(course.thumbnailImage || "")
    const [thumbnailFile, setThumbnailFile] = useState(null)
    const [coverPreview, setCoverPreview] = useState(course.coverImage || "")
    const [coverFile, setCoverFile] = useState(null)
    const [uploadProgress, setUploadProgress] = useState({ thumbnail: 0, cover: 0 })

    console.log("Edit course ==> ", course)

    const form = useForm({
        defaultValues: {
            title: course?.title,
            slug: course?.slug,
            description: course.description || "",
            thumbnailImage: course?.thumbnailImage || "",
            coverImage: course?.coverImage || "",
            hasPricing: course?.isPaid || false,
            price: course.pricing?.price / 100 || 0,
            discountedPrice: course.pricing?.discountedPrice / 100 || 0,
            categoryId: course?.categoryId,
            level: course?.level,
            duration: course?.duration || 0,
            language: course?.language || "en",
            hasCertificate: course?.hasCertificate || false,
            demoVideoId: course?.demoVideoId || "",
        },
        validators: {
            onSubmit: courseSchema,
        },
        onSubmit: async ({ value }) => {
            startTransition(async () => {
                try {
                    let thumbnailUrl = value.thumbnailImage
                    let coverUrl = value.coverImage
                    const bucketName = "pankhuri-v3"

                    // Upload thumbnail if new file selected
                    if (thumbnailFile) {
                        toast.info("Uploading thumbnail...")
                        const thumbnailKey = `${process.env.NEXT_PUBLIC_BUCKET_MODE}/course-thumbnails/${Date.now()}_${thumbnailFile.name}`
                        const { url } = await generatePresignedUrlForImage(bucketName, thumbnailKey, thumbnailFile.type)

                        await axios.put(url, thumbnailFile, {
                            headers: {
                                'Content-Type': thumbnailFile.type,
                                'x-amz-acl': 'public-read'
                            },
                            onUploadProgress: (progressEvent) => {
                                setUploadProgress(prev => ({
                                    ...prev,
                                    thumbnail: Math.round((progressEvent.loaded * 100) / progressEvent.total)
                                }))
                            },
                        })

                        thumbnailUrl = `https://${bucketName}.blr1.digitaloceanspaces.com/${thumbnailKey}`
                        toast.success("Thumbnail uploaded successfully")
                    }

                    // Upload cover if new file selected
                    if (coverFile) {
                        toast.info("Uploading cover image...")
                        const coverKey = `${process.env.NEXT_PUBLIC_BUCKET_MODE}/course-covers/${Date.now()}_${coverFile.name}`
                        const { url } = await generatePresignedUrlForImage(bucketName, coverKey, coverFile.type)

                        await axios.put(url, coverFile, {
                            headers: {
                                'Content-Type': coverFile.type,
                                'x-amz-acl': 'public-read'
                            },
                            onUploadProgress: (progressEvent) => {
                                setUploadProgress(prev => ({
                                    ...prev,
                                    cover: Math.round((progressEvent.loaded * 100) / progressEvent.total)
                                }))
                            },
                        })

                        coverUrl = `https://${bucketName}.blr1.digitaloceanspaces.com/${coverKey}`
                        toast.success("Cover image uploaded successfully")
                    }

                    // Update course with uploaded images
                    const result = await updateCourse(course.id, {
                        ...value,
                        thumbnailImage: thumbnailUrl,
                        coverImage: coverUrl,
                    })

                    if (result.success) {
                        toast.success("Course updated successfully")
                        setThumbnailFile(null)
                        setCoverFile(null)
                        setUploadProgress({ thumbnail: 0, cover: 0 })
                        setOpen(false)
                        router.refresh()
                    } else {
                        toast.warning(result.error || "Failed to update course")
                    }
                } catch (error) {
                    toast.error(error.message || "An unexpected error occurred")
                }
            })
        },
    })


    const handleThumbnailChange = (e) => {
        const file = e.target.files?.[0]
        if (!file) return
        setThumbnailFile(file)
        const reader = new FileReader()
        reader.onloadend = () => setThumbnailPreview(reader.result)
        reader.readAsDataURL(file)
    }

    const handleCoverChange = (e) => {
        const file = e.target.files?.[0]
        if (!file) return
        setCoverFile(file)
        const reader = new FileReader()
        reader.onloadend = () => setCoverPreview(reader.result)
        reader.readAsDataURL(file)
    }

    const handleRemoveThumbnail = () => {
        setThumbnailFile(null)
        setThumbnailPreview("")
        form.setFieldValue("thumbnailImage", "")
    }

    const handleRemoveCover = () => {
        setCoverFile(null)
        setCoverPreview("")
        form.setFieldValue("coverImage", "")
    }


    const editorCommands = [
        commands.bold,
        commands.italic,
        commands.strikethrough,
        commands.divider,
        commands.link,
        commands.quote,
        commands.code,
        commands.codeBlock,
        commands.unorderedListCommand,
        commands.orderedListCommand,
    ];


    useEffect(() => {
        if (!open) {
            document.body.style.overflow = "";
            document.body.style.paddingRight = "";
        }

        return () => {
            document.body.style.overflow = "";
            document.body.style.paddingRight = "";
        };
    }, [open]);

    return (
        <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
                <Button variant="gradient">
                    <Pencil className="mr-2 h-4 w-4" />
                    Edit Course
                </Button>
            </DialogTrigger>
            <DialogContent className="max-w-5xl max-h-[90vh] overflow-y-auto">
                <DialogHeader>
                    <DialogTitle>Edit Course</DialogTitle>
                    <DialogDescription>Update course information</DialogDescription>
                </DialogHeader>
                <form
                    onSubmit={(e) => {
                        e.preventDefault()
                        e.stopPropagation()
                        form.handleSubmit()
                    }}
                    className="space-y-4"
                >
                    <form.Field
                        name="title"
                        children={(field) => (
                            <Field>
                                <FieldLabel htmlFor="title">Course Title *</FieldLabel>
                                <Input
                                    id="title"
                                    placeholder="Enter course title"
                                    disabled={isPending}
                                    value={field.state.value}
                                    onChange={(e) => field.handleChange(e.target.value)}
                                    onBlur={field.handleBlur}
                                />
                                {field.state.meta.errors.length > 0 && <FieldError errors={field.state.meta.errors} />}
                            </Field>
                        )}
                    />

                    <form.Field
                        name="slug"
                        children={(field) => (
                            <Field>
                                <FieldLabel htmlFor="slug">Slug *</FieldLabel>
                                <Input
                                    id="slug"
                                    placeholder="course-slug"
                                    disabled={isPending}
                                    value={field.state.value}
                                    onChange={(e) => field.handleChange(e.target.value)}
                                    onBlur={field.handleBlur}
                                />
                                {field.state.meta.errors.length > 0 && <FieldError errors={field.state.meta.errors} />}
                            </Field>
                        )}
                    />

                    <form.Field
                        name="description"
                        children={(field) => (
                            <Field>
                                <FieldLabel htmlFor="description">Description</FieldLabel>
                                <div data-color-mode="light" className="rounded-md border border-input bg-background">
                                    <MDEditor
                                        id={field.name}
                                        value={field.state.value}
                                        onChange={(nextValue) => field.handleChange(nextValue || "")}
                                        commands={editorCommands}
                                        preview="edit"
                                        height={250}
                                        textareaProps={{
                                            placeholder: "Brief description of what this module covers in markdown format...",
                                        }}
                                    />
                                </div>
                                {field.state.meta.errors.length > 0 && <FieldError errors={field.state.meta.errors} />}
                            </Field>
                        )}
                    />

                    <div className="p-4 rounded-xl border border-dashed bg-muted/40 transition-all duration-300 hover:bg-muted/60">
                        <form.Field
                            name="hasPricing"
                            children={(field) => (
                                <div className="flex items-center justify-between gap-4">
                                    <div className="space-y-0.5">
                                        <FieldLabel htmlFor={field.name} className="text-base font-semibold flex items-center gap-2">
                                            Course Pricing
                                        </FieldLabel>
                                        <FieldDescription>
                                            Does this course have a specific price?
                                            <br />
                                            <em> By default, courses are locked because of wholeapp lock, Add amount for course specific pricing  </em>
                                        </FieldDescription>
                                    </div>
                                    <Switch
                                        id={field.name}
                                        checked={field.state.value}
                                        onCheckedChange={(checked) => field.handleChange(checked)}
                                    />
                                </div>
                            )}
                        />

                        <form.Subscribe selector={(state) => state.values.hasPricing}
                            children={(hasPricing) => (
                                hasPricing ? (
                                    <div className="mt-6 pt-6 border-t border-dashed grid grid-cols-1 sm:grid-cols-2 gap-6 animate-in fade-in slide-in-from-top-4 duration-500">
                                        {/* Insert price and discounted price */}
                                        <form.Field
                                            name="price"
                                            children={(field) => (
                                                <Field className="flex flex-col gap-2">
                                                    <FieldLabel htmlFor={field.name} className="text-sm font-medium text-foreground/80">
                                                        Base Price (₹) *
                                                    </FieldLabel>
                                                    <Input
                                                        id={field.name}
                                                        value={field.state.value}
                                                        disabled={isPending}
                                                        type="number"
                                                        min="0"
                                                        readOnly
                                                        aria-readonly="true"
                                                        aria-describedby="price-readonly-message"
                                                        onChange={(e) => field.handleChange(parseInt(e.target.value) || 0)}
                                                        placeholder="0.00"
                                                        className="h-10 bg-background shadow-sm transition-shadow focus-visible:ring-1 cursor-not-allowed"
                                                    />
                                                    <FieldDescription id="price-readonly-message" className="text-[10px] text-amber-600 font-medium">
                                                        ⓘ Pricing can only be changed via the separate "Change Pricing" button
                                                    </FieldDescription>
                                                    {field.state.meta.errors.length > 0 && <FieldError errors={field.state.meta.errors} />}
                                                </Field>
                                            )}
                                        />

                                        {/* Discounted Price */}
                                        <form.Field
                                            name="discountedPrice"
                                            children={(field) => (
                                                <Field className="flex flex-col gap-2">
                                                    <FieldLabel htmlFor={field.name} className="text-sm font-medium text-foreground/80">
                                                        Discounted Price (₹)
                                                    </FieldLabel>
                                                    <Input
                                                        id={field.name}
                                                        type="number"
                                                        min="0"
                                                        readOnly
                                                        aria-readonly="true"
                                                        aria-describedby="discounted-price-readonly-message"
                                                        value={field.state.value}
                                                        onChange={(e) => field.handleChange(parseInt(e.target.value) || 0)}
                                                        placeholder="0.00"
                                                        className="h-10 bg-background shadow-sm transition-shadow focus-visible:ring-1 cursor-not-allowed"
                                                    />
                                                    <FieldDescription id="discounted-price-readonly-message" className="text-[10px] text-amber-600 font-medium">
                                                        ⓘ Pricing can only be changed via the separate "Change Pricing" button
                                                    </FieldDescription>
                                                    {field.state.meta.errors.length > 0 && <FieldError errors={field.state.meta.errors} />}
                                                </Field>
                                            )}
                                        />
                                    </div>
                                ) : null
                            )}
                        />
                    </div>


                    <form.Field
                        name="categoryId"
                        children={(field) => (
                            <Field>
                                <FieldLabel htmlFor="categoryId">Category *</FieldLabel>
                                <Select
                                    disabled={isPending}
                                    value={field.state.value}
                                    onValueChange={(value) => field.handleChange(value)}
                                >
                                    <SelectTrigger>
                                        <SelectValue placeholder="Select category" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        {categories.map((cat) => (
                                            <SelectItem key={cat.id} value={cat.id}>
                                                {cat.name}
                                            </SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                                {field.state.meta.errors.length > 0 && <FieldError errors={field.state.meta.errors} />}
                            </Field>
                        )}
                    />

                    <Field orientation="horizontal">
                        <form.Field
                            name="level"
                            children={(field) => (
                                <Field>
                                    <FieldLabel htmlFor="level">Level</FieldLabel>
                                    <Select
                                        disabled={isPending}
                                        value={field.state.value}
                                        onValueChange={(value) => field.handleChange(value)}
                                    >
                                        <SelectTrigger>
                                            <SelectValue />
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="beginner">Beginner</SelectItem>
                                            <SelectItem value="intermediate">Intermediate</SelectItem>
                                            <SelectItem value="advanced">Advanced</SelectItem>
                                            <SelectItem value="expert">Expert</SelectItem>
                                        </SelectContent>
                                    </Select>
                                    {field.state.meta.errors.length > 0 && <FieldError errors={field.state.meta.errors} />}
                                </Field>
                            )}
                        />

                        <form.Field
                            name="duration"
                            children={(field) => (
                                <Field>
                                    <FieldLabel htmlFor="duration">Duration (minutes)</FieldLabel>
                                    <Input
                                        id="duration"
                                        type="number"
                                        placeholder="60"
                                        disabled={isPending}
                                        value={field.state.value}
                                        onChange={(e) => field.handleChange(Number(e.target.value))}
                                        onBlur={field.handleBlur}
                                    />
                                    {field.state.meta.errors.length > 0 && <FieldError errors={field.state.meta.errors} />}
                                </Field>
                            )}
                        />
                    </Field>

                    <Field orientation="horizontal">
                        <form.Field
                            name="language"
                            children={(field) => (
                                <Field>
                                    <FieldLabel htmlFor="language">Language</FieldLabel>
                                    <Input
                                        id="language"
                                        placeholder="en"
                                        disabled={isPending}
                                        value={field.state.value}
                                        onChange={(e) => field.handleChange(e.target.value)}
                                        onBlur={field.handleBlur}
                                    />
                                    {field.state.meta.errors.length > 0 && <FieldError errors={field.state.meta.errors} />}
                                </Field>
                            )}
                        />

                        <form.Field
                            name="hasCertificate"
                            children={(field) => (
                                <Field>
                                    <FieldLabel htmlFor="hasCertificate">Certificate</FieldLabel>
                                    <Select
                                        disabled={isPending}
                                        value={field.state.value ? "true" : "false"}
                                        onValueChange={(value) => field.handleChange(value === "true")}
                                    >
                                        <SelectTrigger>
                                            <SelectValue />
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="true">Yes</SelectItem>
                                            <SelectItem value="false">No</SelectItem>
                                        </SelectContent>
                                    </Select>
                                    {field.state.meta.errors.length > 0 && <FieldError errors={field.state.meta.errors} />}
                                </Field>
                            )}
                        />
                    </Field>

                    <form.Field
                        name="demoVideoId"
                        children={(field) => (
                            <Field>
                                <FieldLabel htmlFor="demoVideoId">Demo Video (Optional)</FieldLabel>
                                <VideoCombobox
                                    value={field.state.value}
                                    onValueChange={(value) => field.handleChange(value)}
                                    disabled={isPending}
                                />
                                <p className="text-xs text-muted-foreground mt-1">
                                    Select a demo video to showcase this course
                                </p>
                                {field.state.meta.errors.length > 0 && <FieldError errors={field.state.meta.errors} />}
                            </Field>
                        )}
                    />

                    <Field orientation="horizontal">
                        <form.Field
                            name="thumbnailImage"
                            children={(field) => (
                                <Field>
                                    <FieldLabel htmlFor="thumbnail">Thumbnail Image</FieldLabel>
                                    <Input
                                        id="thumbnail"
                                        type="file"
                                        accept="image/*"
                                        disabled={isPending}
                                        onChange={handleThumbnailChange}
                                        className="cursor-pointer"
                                    />
                                    {thumbnailFile && <p className="text-sm text-muted-foreground mt-1">Selected: {thumbnailFile.name}</p>}
                                    {thumbnailPreview && (
                                        <div className="relative w-full aspect-video rounded-md overflow-hidden border border-input mt-2">
                                            <Image src={thumbnailPreview} alt="Thumbnail Preview" fill className="object-cover" />
                                            <Button
                                                type="button"
                                                variant="destructive"
                                                size="icon"
                                                className="absolute top-2 right-2 h-6 w-6"
                                                onClick={handleRemoveThumbnail}
                                                disabled={isPending}
                                            >
                                                <X className="h-4 w-4" />
                                            </Button>
                                        </div>
                                    )}
                                    {isPending && uploadProgress.thumbnail > 0 && (
                                        <div className="space-y-1 mt-2">
                                            <div className="flex items-center justify-between text-xs">
                                                <span className="text-muted-foreground">Uploading thumbnail...</span>
                                                <span className="font-medium">{uploadProgress.thumbnail}%</span>
                                            </div>
                                            <Progress value={uploadProgress.thumbnail} className="h-2" />
                                        </div>
                                    )}
                                    {field.state.meta.errors.length > 0 && <FieldError errors={field.state.meta.errors} />}
                                </Field>
                            )}
                        />

                        <form.Field
                            name="coverImage"
                            children={(field) => (
                                <Field>
                                    <FieldLabel htmlFor="cover">Cover Image</FieldLabel>
                                    <Input
                                        id="cover"
                                        type="file"
                                        accept="image/*"
                                        disabled={isPending}
                                        onChange={handleCoverChange}
                                        className="cursor-pointer"
                                    />
                                    {coverFile && <p className="text-sm text-muted-foreground mt-1">Selected: {coverFile.name}</p>}
                                    {coverPreview && (
                                        <div className="relative w-full aspect-video rounded-md overflow-hidden border border-input mt-2">
                                            <Image src={coverPreview} alt="Cover Preview" fill className="object-cover" />
                                            <Button
                                                type="button"
                                                variant="destructive"
                                                size="icon"
                                                className="absolute top-2 right-2 h-6 w-6"
                                                onClick={handleRemoveCover}
                                                disabled={isPending}
                                            >
                                                <X className="h-4 w-4" />
                                            </Button>
                                        </div>
                                    )}
                                    {isPending && uploadProgress.cover > 0 && (
                                        <div className="space-y-1 mt-2">
                                            <div className="flex items-center justify-between text-xs">
                                                <span className="text-muted-foreground">Uploading cover...</span>
                                                <span className="font-medium">{uploadProgress.cover}%</span>
                                            </div>
                                            <Progress value={uploadProgress.cover} className="h-2" />
                                        </div>
                                    )}
                                    {field.state.meta.errors.length > 0 && <FieldError errors={field.state.meta.errors} />}
                                </Field>
                            )}
                        />
                    </Field>

                    <Field orientation="horizontal">
                        <DialogClose asChild>
                            <Button type="button" variant="outline" disabled={isPending} className="flex-1">
                                Cancel
                            </Button>
                        </DialogClose>
                        <Button type="submit" disabled={isPending} variant="gradient" className="flex-1">
                            {isPending ? (
                                <>
                                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                    Updating...
                                </>
                            ) : (
                                "Update Course"
                            )}
                        </Button>
                    </Field>
                </form>
            </DialogContent>
        </Dialog>
    )
}
