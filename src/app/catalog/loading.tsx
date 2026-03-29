import { Skeleton } from "@/components/ui/skeleton"

export default function CatalogLoading() {
  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex flex-col md:flex-row gap-8">
        {/* 左側 Sidebar 骨架屏 */}
        <aside className="w-full md:w-64 flex-shrink-0">
          <div className="sticky top-20 text-muted-foreground space-y-4">
            <Skeleton className="h-10 w-full rounded-2xl" />
            
            <div className="bg-card/40 border border-white/5 rounded-2xl overflow-hidden p-4">
              <Skeleton className="h-6 w-24 mb-6" />
              <div className="space-y-4">
                <Skeleton className="h-8 w-full rounded-xl" />
                <Skeleton className="h-8 w-full rounded-xl" />
                <Skeleton className="h-8 w-full rounded-xl" />
                <Skeleton className="h-8 w-full rounded-xl" />
                <Skeleton className="h-8 w-full rounded-xl" />
              </div>
            </div>
          </div>
        </aside>

        {/* 右側列表骨架屏 */}
        <main className="flex-1">
          <div className="mb-6 flex items-center justify-between">
            <Skeleton className="h-8 w-32" />
            <Skeleton className="h-6 w-24 rounded-full" />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {[1, 2, 3, 4, 5, 6].map((i) => (
              <div key={i} className="flex flex-col rounded-xl overflow-hidden border border-white/5 bg-card/60">
                <div className="h-48 w-full bg-muted/50 animate-pulse" />
                <div className="p-4 space-y-4">
                  <div className="flex items-center justify-between">
                    <Skeleton className="h-6 w-2/3" />
                    <Skeleton className="h-5 w-16 rounded-full" />
                  </div>
                  <Skeleton className="h-10 w-full" />
                  <div className="flex items-center justify-between mt-4">
                    <Skeleton className="h-4 w-12" />
                    <Skeleton className="h-6 w-24" />
                  </div>
                  <Skeleton className="h-10 w-full mt-4 rounded-xl" />
                </div>
              </div>
            ))}
          </div>
        </main>
      </div>
    </div>
  )
}
