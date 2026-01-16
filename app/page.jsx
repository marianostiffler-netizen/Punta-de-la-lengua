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
    
    try {
      const res = await fetch('/api/search', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ query })
      })
      
      const data = await res.json()
      
      if (data.success) {
        setResults(data.results)
      } else {
        setError(data.error || 'Error en la búsqueda')
      }
    } catch (err) {
      console.error('Error:', err)
      setError('Error conectando con el servidor')
    }
    
    setLoading(false)
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900">
      {/* Header */}
      <div className="container mx-auto px-4 py-8 max-w-5xl">
        <div className="text-center mb-12">
          <h1 className="text-6xl font-bold text-white mb-3">
            🎵 Song Finder
          </h1>
          <p className="text-xl text-gray-300">
            Encuentra cualquier canción por letras, artista o época
          </p>
        </div>

        {/* Search Bar */}
        <form onSubmit={handleSearch} className="mb-8">
          <div className="relative">
            <input
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder='Ej: "canción triste de los 80" o "la que dice umbrella ella"'
              className="w-full px-6 py-5 text-lg rounded-2xl bg-white/95 text-gray-900 placeholder-gray-500 border-2 border-transparent focus:outline-none focus:border-purple-500 transition shadow-xl"
              disabled={loading}
            />
            <button
              type="submit"
              disabled={loading || !query.trim()}
              className="absolute right-2 top-1/2 -translate-y-1/2 px-8 py-3 bg-purple-600 hover:bg-purple-700 text-white rounded-xl font-semibold disabled:opacity-50 disabled:cursor-not-allowed transition shadow-lg"
            >
              {loading ? '⏳ Buscando...' : '🔍 Buscar'}
            </button>
          </div>
          
          {/* Ejemplos */}
          <div className="mt-4 flex flex-wrap gap-2 justify-center">
            <span className="text-gray-400 text-sm">Ejemplos:</span>
            {['umbrella rihanna', 'rock de los 80', 'reggaeton bad bunny'].map((example) => (
              <button
                key={example}
                type="button"
                onClick={() => setQuery(example)}
                className="px-3 py-1 bg-white/10 hover:bg-white/20 text-gray-300 text-sm rounded-full transition"
              >
                {example}
              </button>
            ))}
          </div>
        </form>

        {/* Error Message */}
        {error && (
          <div className="mb-6 p-4 bg-red-500/20 border-l-4 border-red-500 rounded-lg">
            <p className="text-red-200">⚠️ {error}</p>
          </div>
        )}

        {/* Loading State */}
        {loading && (
          <div className="space-y-4">
            {[1, 2, 3].map((i) => (
              <div 
                key={i} 
                className="bg-white/10 backdrop-blur-sm rounded-2xl p-6 animate-pulse"
              >
                <div className="flex gap-4">
                  <div className="w-20 h-20 bg-white/20 rounded-xl flex-shrink-0"></div>
                  <div className="flex-1 space-y-3">
                    <div className="h-5 bg-white/20 rounded w-3/4"></div>
                    <div className="h-4 bg-white/20 rounded w-1/2"></div>
                    <div className="h-3 bg-white/20 rounded w-1/3"></div>
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
              📊 Resultados ({results.length})
            </h2>
            {results.map((song, idx) => (
              <div 
                key={idx}
                className="bg-white/10 backdrop-blur-md rounded-2xl p-6 hover:bg-white/15 transition-all duration-200 shadow-lg hover:shadow-xl"
              >
                <div className="flex gap-6 items-start">
                  {/* Album Art */}
                  {song.image && (
                    <img 
                      src={song.image} 
                      alt={song.title}
                      className="w-24 h-24 rounded-xl object-cover flex-shrink-0 shadow-md"
                    />
                  )}
                  
                  {/* Song Info */}
                  <div className="flex-1 min-w-0">
                    <h3 className="text-2xl font-bold text-white mb-1 truncate">
                      {song.title}
                    </h3>
                    <p className="text-lg text-gray-300 mb-2">{song.artist}</p>
                    
                    <div className="flex flex-wrap gap-3 text-sm">
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
                    <div className="mt-3 flex gap-3">
                      {song.itunes_url && (
                        <a 
                          href={song.itunes_url} 
                          target="_blank" 
                          rel="noopener noreferrer"
                          className="text-sm text-blue-400 hover:text-blue-300 underline"
                        >
                          🎵 Ver en iTunes
                        </a>
                      )}
                      {song.apple_music_url && (
                        <a 
                          href={song.apple_music_url} 
                          target="_blank" 
                          rel="noopener noreferrer"
                          className="text-sm text-pink-400 hover:text-pink-300 underline"
                        >
                          🎧 Apple Music
                        </a>
                      )}
                    </div>
                  </div>

                  {/* Audio Preview */}
                  {song.preview_url && (
                    <div className="flex-shrink-0">
                      <audio 
                        controls 
                        className="w-64 h-10"
                        preload="none"
                      >
                        <source src={song.preview_url} type="audio/mpeg" />
                        Tu navegador no soporta audio.
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
              Escribe cualquier cosa que recuerdes: letras, artista, época...
            </p>
          </div>
        )}

        {/* No Results */}
        {!loading && results.length === 0 && query !== '' && !error && (
          <div className="text-center py-20">
            <div className="text-6xl mb-4">🤷‍♂️</div>
            <h2 className="text-2xl font-bold text-white mb-2">
              No encontramos nada
            </h2>
            <p className="text-gray-400">
              Intenta con otros términos o palabras clave
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
