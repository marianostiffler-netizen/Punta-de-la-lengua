export default function ResultCard({ song }) {
  return (
    <div className="bg-white/10 backdrop-blur-sm border border-white/20 rounded-xl p-6 hover:bg-white/20 transition">
      <div className="flex gap-4">
        {song.image && (
          <img 
            src={song.image} 
            alt={song.title}
            className="w-24 h-24 rounded-lg object-cover flex-shrink-0"
          />
        )}
        <div className="flex-1 min-w-0">
          <h3 className="text-xl font-bold text-white truncate">{song.title}</h3>
          <p className="text-gray-300">{song.artist}</p>
          {song.album && (
            <p className="text-sm text-gray-400 mt-1">📀 {song.album}</p>
          )}
          {song.genre && (
            <p className="text-sm text-purple-300 mt-1">🎵 {song.genre}</p>
          )}
          <div className="flex gap-2 mt-2">
            {song.itunes_url && (
              <a 
                href={song.itunes_url} 
                target="_blank" 
                rel="noopener noreferrer"
                className="text-xs text-blue-300 hover:text-blue-200"
              >
                Ver en iTunes →
              </a>
            )}
          </div>
        </div>
        {song.preview_url && (
          <div className="flex-shrink-0">
            <audio controls className="w-64 h-10">
              <source src={song.preview_url} type="audio/mpeg" />
            </audio>
          </div>
        )}
      </div>
    </div>
  )
}
