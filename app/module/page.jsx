import { Suspense } from "react"
import { getModulesByCourse } from "@/lib/backend_actions/module"
import { getAllCourses } from "@/lib/backend_actions/course"
import { TableSkeleton, PageHeaderSkeleton } from "@/components/ui/skeleton-loader"
import ModulesTable from "@/components/module/modules-table"
import CreateModuleDialog from "@/components/module/create-module-dialog"
import BulkModuleUpload from "@/components/module/bulk-module-upload"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Button } from "@/components/ui/button"
import { Plus, Upload } from "lucide-react"

async function ModulesContent({ courseId, status }) {
    // const courseId = searchParams?.courseId || null
    // const status = searchParams?.status || "published"

    // Fetch modules and courses in parallel
    console.log("Fetching modules for courseId:", courseId, "with status:", status);
    const [modulesResult, coursesResult] = await Promise.all([
        courseId ? getModulesByCourse(courseId, { status, limit: 100 }) : { success: true, data: [] },
        getAllCourses({ limit: 100, status: "active" })
    ])

    const modules = modulesResult.success ? modulesResult.data : []
    const courses = coursesResult.success ? coursesResult.data : []

    return (
        <>
            <div className="mb-6">
                <h1 className="text-3xl sm:text-4xl font-bold text-gray-900">
                    Modules <span className="bg-gradient-to-r from-purple-400 via-pink-400 to-orange-400 bg-clip-text text-transparent">Management</span>
                </h1>
                <p className="text-muted-foreground mt-2">Manage course modules and their content structure</p>
            </div>

            <Tabs defaultValue="single" className="w-full">
                <TabsList variant="line" className="w-full justify-start border-b rounded-none bg-transparent px-0 gap-4">
                    <TabsTrigger
                        value="single"
                        className="text-base px-1 pb-3 gap-2 data-[state=active]:font-semibold"
                    >
                        <Plus className="w-4 h-4" />
                        Single Module
                    </TabsTrigger>
                    <TabsTrigger
                        value="bulk"
                        className="text-base px-1 pb-3 gap-2 data-[state=active]:font-semibold"
                    >
                        <Upload className="w-4 h-4" />
                        Bulk Upload
                    </TabsTrigger>
                </TabsList>

                <TabsContent value="single" className="mt-6">
                    <div className="flex items-center justify-end mb-6">
                        <CreateModuleDialog courses={courses} />
                    </div>

                    <ModulesTable
                        modules={modules}
                        courses={courses}
                        selectedCourseId={courseId}
                    />
                </TabsContent>

                <TabsContent value="bulk" className="mt-6">
                    <BulkModuleUpload courses={courses} />
                </TabsContent>
            </Tabs>
        </>
    )
}

export default async function ModulePage({ searchParams }) {
    const courseId = (await searchParams)?.courseId || null
    const status = (await searchParams)?.status || undefined
    return (
        <div className="container mx-auto px-6 py-24">
            <Suspense fallback={<PageHeaderSkeleton />}>
                <ModulesContent courseId={courseId} status={status} />
            </Suspense>
        </div>
    )
}