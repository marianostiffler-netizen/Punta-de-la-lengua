interface Song {
  title: string
  artist: string
  album?: string
  year?: number
  image?: string
  lyrics_snippet?: string
  preview_url?: string
}

interface ResultCardProps {
  song: Song
}

export default function ResultCard({ song }: ResultCardProps) {
  return (
    <div className="bg-white/10 backdrop-blur-sm border border-white/20 rounded-xl p-6 hover:bg-white/20 transition">
      <div className="flex gap-4">
        {song.image && (
          <img 
            src={song.image} 
            alt={song.title}
            className="w-20 h-20 rounded-lg object-cover"
          />
        )}
        <div className="flex-1">
          <h3 className="text-xl font-bold text-white">{song.title}</h3>
          <p className="text-gray-300">{song.artist}</p>
          {song.lyrics_snippet && (
            <p className="text-sm text-gray-400 mt-2 italic">
              "{song.lyrics_snippet}"
            </p>
          )}
        </div>
        {song.preview_url && (
          <audio controls className="w-64">
            <source src={song.preview_url} type="audio/mpeg" />
          </audio>
        )}
      </div>
    </div>
  )
}
