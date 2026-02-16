import PaginationNumberless from '@/components/customized/pagination/pagination-12'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import UploadVideoDialog from '@/components/upload-video-dialog'
import BulkVideoUpload from '@/components/video-upload/bulk-video-upload'
import { videoColumns } from '@/components/video-upload/column'
import { DataTable } from '@/components/video-upload/data-table'
import { VideoFilter } from '@/components/video-upload/video-filter'
import { getAllVideos } from '@/lib/backend_actions/videos'
import { Plus, Upload } from 'lucide-react'

const page = async ({ searchParams }) => {
    // 1. Await searchParams (Next.js 15 requirement, good practice generally)
    const params = await searchParams

    // 2. Parse params securely
    const page = Number(params?.page) || 1
    const limit = Number(params?.limit) || 100
    const search = params?.search || undefined
    const status = (params?.status && params?.status !== 'all') ? params.status : undefined

    // 3. Fetch Data
    const res = await getAllVideos({
        status,
        search,
        offset: (page - 1) * limit,
        limit,
    })
    console.log("\nGet all video response", res.data)
    const videos = res.success ? res.data.data : []
    const pagination = res.success ? res.data.pagination : []
    const totalCount = res.meta?.total || videos.length // Assuming backend returns meta

    return (
        <main className="min-h-screen">
            <div className="container mx-auto px-6 py-24">

                <div className="mb-6">
                    <h1 className="text-3xl sm:text-4xl font-bold text-gray-900">
                        Video <span className="bg-gradient-to-r from-purple-400 via-pink-400 to-orange-400 bg-clip-text text-transparent">Library</span>
                    </h1>
                    <p className="text-muted-foreground">Manage and organize your video content</p>
                </div>

                <Tabs defaultValue="single" className="w-full">
                    <TabsList variant="line" className="w-full justify-start border-b rounded-none bg-transparent px-0 gap-4">
                        <TabsTrigger
                            value="single"
                            className="text-base px-1 pb-3 gap-2 data-[state=active]:font-semibold"
                        >
                            <Plus className="w-4 h-4" />
                            Upload Video
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
                        <div className='flex flex-col sm:flex-row sm:items-center justify-between gap-4'>
                            {/* No props needed now, Filter is self-contained */}
                            <VideoFilter />

                            <div className="flex items-center gap-2 shrink-0">
                                <UploadVideoDialog>
                                    <Button variant="gradient">
                                        <Plus className="w-4 h-4 mr-2" />
                                        Upload Video
                                    </Button>
                                </UploadVideoDialog>
                            </div>
                        </div>
                        <DataTable
                            columns={videoColumns}
                            data={videos}
                            // Ensure pagination logic is robust
                            pagination={{
                                currentPage: (pagination.offset / pagination.limit) + 1,
                                totalPages: Math.ceil(pagination.total / pagination.limit) || 1
                            }}
                        />
                        <PaginationNumberless pagination={{
                            page: (pagination.offset / pagination.limit) + 1,
                            limit: pagination.limit,
                            total: pagination.total,
                            totalPages: Math.ceil(pagination.total / pagination.limit) || 1
                        }} redirectTo="video-upload" />
                    </TabsContent>

                    <TabsContent value="bulk" className="mt-6">
                        <BulkVideoUpload />
                    </TabsContent>
                </Tabs>
            </div>
        </main>
    )
}

export default page