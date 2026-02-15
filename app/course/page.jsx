import { CourseFilter } from "@/components/course/course-filter"
import { CoursesTable } from "@/components/course/courses-table"
import { CreateCourseDialog } from "@/components/course/create-course-dialog"
import BulkCourseUpload from "@/components/course/bulk-course-upload"
import { Button } from "@/components/ui/button"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { PageHeaderSkeleton } from "@/components/ui/skeleton-loader"
import { getFlatCategories } from "@/lib/backend_actions/category"
import { getAllCourses } from "@/lib/backend_actions/course"
import { getAllTrainersAdmin } from "@/lib/backend_actions/trainer"
import { Plus, Upload } from "lucide-react"
import { Suspense } from "react"

async function CoursesContent({ searchP }) {

  const [coursesResult, categoriesResult, trainersResult] = await Promise.all([
    getAllCourses({
      limit: searchP.limit || 100,
      status: searchP.status || "active",
      categoryId: searchP.category || undefined,
      level: searchP.level || undefined,
      search: searchP.search || undefined,
      page: searchP.page || 1,
    }),
    getFlatCategories({ limit: 100, status: "active" }),
    getAllTrainersAdmin()
  ])

  const courses = coursesResult.success ? coursesResult.data : []
  const categories = categoriesResult.success ? categoriesResult.data.data : []
  const trainers = trainersResult.success ? trainersResult.data : []

  return (
    <>
      <div className="mb-6">
        <h1 className="text-3xl sm:text-4xl font-bold text-gray-900">
          Courses <span className="bg-gradient-to-r from-purple-400 via-pink-400 to-orange-400 bg-clip-text text-transparent">Management</span>
        </h1>
        <p className="text-muted-foreground mt-2">Manage your courses and content</p>
      </div>

      <Tabs defaultValue="single" className="w-full">
        <TabsList variant="line" className="w-full justify-start border-b rounded-none bg-transparent px-0 gap-4">
          <TabsTrigger
            value="single"
            className="text-base px-1 pb-3 gap-2 data-[state=active]:font-semibold"
          >
            <Plus className="w-4 h-4" />
            Single Course
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
          <div className="flex items-center justify-between mb-6">
            <CourseFilter categories={categories} />
            <CreateCourseDialog categories={categories} trainers={trainers}>
              <Button variant="gradient">
                <Plus className="mr-2 h-4 w-4" />
                Create Course
              </Button>
            </CreateCourseDialog>
          </div>

          <CoursesTable
            courses={courses}
            categories={categories}
            pagination={coursesResult.success && coursesResult.pagination}
          />
        </TabsContent>

        <TabsContent value="bulk" className="mt-6">
          <BulkCourseUpload categories={categories} trainers={trainers} />
        </TabsContent>
      </Tabs>
    </>
  )
}

export default async function CoursesPage({ searchParams }) {
  const searchP = await searchParams
  return (
    <div className="container mx-auto px-6 py-24">
      <Suspense fallback={<PageHeaderSkeleton />}>
        <CoursesContent searchP={searchP} />
      </Suspense>
    </div>
  )
}