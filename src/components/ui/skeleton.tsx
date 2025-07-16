
import { cn } from "@/lib/utils"

function Skeleton({
  className,
  ...props
}: React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      className={cn("animate-pulse rounded-md bg-muted", className)}
      {...props}
    />
  )
}

const SkeletonCard = ({ className }: { className?: string }) => (
  <div className={cn("p-6 space-y-4", className)}>
    <div className="flex items-center justify-between">
      <Skeleton className="h-4 w-[250px]" />
      <Skeleton className="h-6 w-16" />
    </div>
    <Skeleton className="h-3 w-full" />
    <Skeleton className="h-3 w-[80%]" />
    <div className="flex gap-2 mt-4">
      <Skeleton className="h-8 w-16" />
      <Skeleton className="h-8 w-20" />
    </div>
  </div>
)

const SkeletonProjectCard = () => (
  <div className="rounded-lg border bg-card p-6 shadow-sm animate-fade-in">
    <div className="flex items-start justify-between mb-4">
      <div className="space-y-2 flex-1">
        <Skeleton className="h-5 w-[200px]" />
        <Skeleton className="h-4 w-[150px]" />
      </div>
      <Skeleton className="h-6 w-16" />
    </div>
    
    <div className="space-y-3 mb-4">
      <Skeleton className="h-3 w-full" />
      <Skeleton className="h-3 w-[90%]" />
    </div>
    
    <div className="flex items-center justify-between">
      <div className="flex gap-2">
        <Skeleton className="h-6 w-16" />
        <Skeleton className="h-6 w-12" />
      </div>
      <Skeleton className="h-8 w-24" />
    </div>
  </div>
)

const SkeletonIdeaCard = () => (
  <div className="rounded-lg border bg-card p-4 shadow-sm animate-fade-in">
    <div className="flex items-center justify-between mb-3">
      <Skeleton className="h-4 w-[180px]" />
      <Skeleton className="h-5 w-8" />
    </div>
    
    <Skeleton className="h-3 w-full mb-2" />
    <Skeleton className="h-3 w-[85%] mb-4" />
    
    <div className="flex items-center justify-between">
      <Skeleton className="h-6 w-20" />
      <Skeleton className="h-8 w-16" />
    </div>
  </div>
)

export { Skeleton, SkeletonCard, SkeletonProjectCard, SkeletonIdeaCard }
