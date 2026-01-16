'use client'
import { useState } from 'react'

export default function Home() {
  const [query, setQuery] = useState('')
  const [results, setResults] = useState([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)

  const handleSearch = async (e) => {
    e.preventDefault()
    if (!query.trim()) return

    setLoading(true)
    setError(null)
    setResults([])
    
    try {
      console.log('Searching directly from frontend for:', query.trim())
      
      // Búsqueda directa a iTunes con encoding correcto
      const cleanQuery = encodeURIComponent(query.trim())
      const searchUrl = `https://itunes.apple.com/search?term=${cleanQuery}&media=music&entity=song&limit=10&lang=es_us`
      
      console.log('Calling iTunes API:', searchUrl)
      
      const response = await fetch(searchUrl)
      
      if (!response.ok) {
        console.error('iTunes API error:', response.status, response.statusText)
        setError(`Error de iTunes: ${response.status}`)
        return
      }
      
      const data = await response.json()
      console.log('iTunes response:', data)
      
      if (!data.results || !Array.isArray(data.results)) {
        console.log('No results found in iTunes response')
        setError('No se encontraron canciones')
        return
      }

      // Transformar resultados a nuestro formato
      const results = data.results.map(item => ({
        title: item.trackName || '',
        artist: item.artistName || '',
        album: item.collectionName || '',
        genre: item.primaryGenreName || '',
        release_date: item.releaseDate || '',
        image: item.artworkUrl100 || item.artworkUrl60 || '',
        preview_url: item.previewUrl || '',
        itunes_url: item.trackViewUrl || '',
        itunes_id: item.trackId?.toString() || '',
        apple_music_url: '',
        popularity: 0,
        youtube_url: `https://www.youtube.com/results?search_query=${encodeURIComponent(`${item.trackName || ''} ${item.artistName || ''}`)}`
      }))
      
      console.log('Successfully processed results:', results.length)
      setResults(results)
      
    } catch (err) {
      console.error('Search error:', err)
      setError(`Error: ${err.message}`)
    } finally {
      setLoading(false)
    }
  }

  const openYouTubeSearch = () => {
    const searchQuery = encodeURIComponent(query.trim())
    window.open(`https://www.youtube.com/results?search_query=${searchQuery}`, '_blank')
  }

  const setExampleQuery = (example) => {
    setQuery(example)
    setResults([])
    setError(null)
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900">
      <div className="container mx-auto px-4 py-8 max-w-5xl">
        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="text-5xl md:text-6xl font-bold text-white mb-3">
            🎵 Song Finder
          </h1>
          <p className="text-lg md:text-xl text-gray-300">
            Encuentra cualquier canción por letras, artista o época
          </p>
        </div>

        {/* Search Form */}
        <form onSubmit={handleSearch} className="mb-8">
          <div className="relative">
            <input
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder='Ej: "canción triste de los 80" o "la que dice umbrella ella"'
              className="w-full px-6 py-5 pr-32 text-lg rounded-2xl bg-white/95 text-gray-900 placeholder-gray-500 border-2 border-transparent focus:outline-none focus:border-purple-500 transition shadow-xl"
              disabled={loading}
            />
            <button
              type="submit"
              disabled={loading || !query.trim()}
              className="absolute right-2 top-1/2 -translate-y-1/2 px-6 md:px-8 py-3 bg-purple-600 hover:bg-purple-700 text-white rounded-xl font-semibold disabled:opacity-50 disabled:cursor-not-allowed transition shadow-lg text-sm md:text-base"
            >
              {loading ? '⏳ Buscando...' : '🔍 Buscar'}
            </button>
          </div>
          
          {/* Examples */}
          <div className="mt-4 flex flex-wrap gap-2 justify-center items-center">
            <span className="text-gray-400 text-sm">Prueba:</span>
            {['umbrella rihanna', 'rock de los 80', 'reggaeton'].map((example) => (
              <button
                key={example}
                type="button"
                onClick={() => setExampleQuery(example)}
                className="px-3 py-1 bg-white/10 hover:bg-white/20 text-gray-300 text-sm rounded-full transition"
              >
                {example}
              </button>
            ))}
          </div>
        </form>

        {/* Plan B YouTube - SIEMPRE visible */}
        <div className="mb-6 p-4 bg-yellow-500/20 border-l-4 border-yellow-500 rounded-lg">
          <p className="text-yellow-200 text-sm mb-2">⚠️ ¿No aparece lo que buscas?</p>
          <button
            onClick={openYouTubeSearch}
            className="px-4 py-2 bg-yellow-600 hover:bg-yellow-700 text-white rounded-lg font-semibold transition text-sm"
          >
            🔍 Buscar "{query.trim()}" en YouTube
          </button>
        </div>

        {/* Error */}
        {error && (
          <div className="mb-6 p-4 bg-red-500/20 border-l-4 border-red-500 rounded-lg">
            <p className="text-red-200">⚠️ {error}</p>
          </div>
        )}

        {/* Loading */}
        {loading && (
          <div className="space-y-4">
            {[1, 2, 3].map((i) => (
              <div 
                key={i} 
                className="bg-white/10 backdrop-blur-sm rounded-2xl p-6 animate-pulse"
              >
                <div className="flex gap-4">
                  <div className="w-20 h-20 bg-white/20 rounded-xl flex-shrink-0" />
                  <div className="flex-1 space-y-3">
                    <div className="h-5 bg-white/20 rounded w-3/4" />
                    <div className="h-4 bg-white/20 rounded w-1/2" />
                    <div className="h-3 bg-white/20 rounded w-1/3" />
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Results */}
        {!loading && results.length > 0 && (
          <div className="space-y-4">
            <h2 className="text-2xl font-bold text-white mb-4">
              📊 {results.length} resultado{results.length !== 1 ? 's' : ''}
            </h2>
            {results.map((song, idx) => (
              <div 
                key={`${song.itunes_id || idx}-${idx}`}
                className="bg-white/10 backdrop-blur-md rounded-2xl p-6 hover:bg-white/15 transition-all duration-200 shadow-lg hover:shadow-xl"
              >
                <div className="flex flex-col md:flex-row gap-6 items-start">
                  {/* Album Art */}
                  {song.image && (
                    <img 
                      src={song.image} 
                      alt={`${song.title} - ${song.artist}`}
                      className="w-24 h-24 rounded-xl object-cover flex-shrink-0 shadow-md"
                    />
                  )}
                  
                  {/* Song Info */}
                  <div className="flex-1 min-w-0">
                    <h3 className="text-xl md:text-2xl font-bold text-white mb-1">
                      {song.title}
                    </h3>
                    <p className="text-base md:text-lg text-gray-300 mb-3">
                      {song.artist}
                    </p>
                    
                    {/* Metadata badges */}
                    <div className="flex flex-wrap gap-2 text-sm mb-3">
                      {song.album && (
                        <span className="px-3 py-1 bg-white/10 rounded-full text-gray-300">
                          💿 {song.album}
                        </span>
                      )}
                      {song.genre && (
                        <span className="px-3 py-1 bg-purple-500/30 rounded-full text-purple-200">
                          🎸 {song.genre}
                        </span>
                      )}
                      {song.release_date && (
                        <span className="px-3 py-1 bg-blue-500/30 rounded-full text-blue-200">
                          📅 {new Date(song.release_date).getFullYear()}
                        </span>
                      )}
                    </div>

                    {/* Links */}
                    <div className="flex flex-wrap gap-3">
                      {song.itunes_url && (
                        <a 
                          href={song.itunes_url} 
                          target="_blank" 
                          rel="noopener noreferrer"
                          className="text-sm text-blue-400 hover:text-blue-300 underline"
                        >
                          🎵 iTunes
                        </a>
                      )}
                      {song.youtube_url && (
                        <a 
                          href={song.youtube_url} 
                          target="_blank" 
                          rel="noopener noreferrer"
                          className="text-sm text-red-400 hover:text-red-300 underline"
                        >
                          🎺 YouTube
                        </a>
                      )}
                    </div>
                  </div>

                  {/* Audio Preview */}
                  {song.preview_url && (
                    <div className="w-full md:w-auto flex-shrink-0">
                      <audio 
                        controls 
                        className="w-full md:w-64 h-10"
                        preload="none"
                      >
                        <source src={song.preview_url} type="audio/mpeg" />
                      </audio>
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Empty State */}
        {!loading && !error && results.length === 0 && query === '' && (
          <div className="text-center py-20">
            <div className="text-6xl mb-4">🎵</div>
            <h2 className="text-2xl font-bold text-white mb-2">
              ¿Qué canción buscas?
            </h2>
            <p className="text-gray-400">
              Escribe cualquier cosa: letras, artista, época, género...
            </p>
          </div>
        )}
      </div>

      {/* Footer */}
      <div className="text-center py-8 text-gray-500 text-sm">
        <p>Powered by Claude AI + iTunes Search API</p>
      </div>
    </div>
  )
}
