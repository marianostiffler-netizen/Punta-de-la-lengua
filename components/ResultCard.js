export default function ResultCard({ song }) {
  return (
    <div className="bg-white border border-gray-200 rounded-lg p-4 hover:shadow-sm transition-shadow">
      <div className="flex gap-3">
        {song.image && (
          <img 
            src={song.image} 
            alt={song.title}
            className="w-16 h-16 rounded object-cover flex-shrink-0"
          />
        )}
        <div className="flex-1 min-w-0">
          <h3 className="text-base font-medium text-gray-900 truncate">{song.title}</h3>
          <p className="text-sm text-gray-600 truncate">{song.artist}</p>
          {song.album && (
            <p className="text-xs text-gray-500 mt-1 truncate">{song.album}</p>
          )}
          <div className="flex gap-3 mt-2">
            {song.itunes_url && (
              <a 
                href={song.itunes_url} 
                target="_blank" 
                rel="noopener noreferrer"
                className="text-xs text-gray-500 hover:text-gray-700"
              >
                Ver →
              </a>
            )}
            {song.preview_url && (
              <audio controls className="h-8">
                <source src={song.preview_url} type="audio/mpeg" />
              </audio>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
