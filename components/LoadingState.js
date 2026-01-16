export default function LoadingState() {
  return (
    <div className="space-y-4">
      {[1, 2, 3].map((i) => (
        <div 
          key={i} 
          className="bg-white/10 backdrop-blur-sm border border-white/20 rounded-xl p-6 animate-pulse"
        >
          <div className="flex gap-4">
            <div className="w-24 h-24 bg-white/20 rounded-lg"></div>
            <div className="flex-1 space-y-2">
              <div className="h-6 bg-white/20 rounded w-3/4"></div>
              <div className="h-4 bg-white/20 rounded w-1/2"></div>
              <div className="h-4 bg-white/20 rounded w-1/3"></div>
            </div>
          </div>
        </div>
      ))}
    </div>
  )
}
