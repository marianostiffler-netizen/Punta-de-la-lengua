'use client'
import { useState } from 'react'
import SearchBar from '../components/SearchBar'
import ResultCard from '../components/ResultCard'
import LoadingState from '../components/LoadingState'

export default function Home() {
  const [results, setResults] = useState([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)

  const handleSearch = async (query) => {
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
        setResults(data.results || [])
      } else {
        setError(data.error || 'Error en la búsqueda')
      }
    } catch (error) {
      console.error('Error:', error)
      setError('Error de conexión')
    } finally {
      setLoading(false)
    }
  }

  return (
    <main className="min-h-screen p-8">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-5xl font-bold text-white text-center mb-2">
          🎵 Song Finder
        </h1>
        <p className="text-gray-300 text-center mb-8">
          Describe la canción que buscas, nosotros la encontramos
        </p>
        
        <SearchBar onSearch={handleSearch} loading={loading} />
        
        {error && (
          <div className="mt-4 p-4 bg-red-500/20 border border-red-500/50 rounded-lg text-red-200 text-center">
            {error}
          </div>
        )}
        
        <div className="mt-8">
          {loading ? (
            <LoadingState />
          ) : results.length > 0 ? (
            <div className="space-y-4">
              {results.map((song, idx) => (
                <ResultCard key={`${song.itunes_id || idx}-${song.title}`} song={song} />
              ))}
            </div>
          ) : !loading && !error ? (
            <div className="text-center text-gray-400 mt-8">
              <p className="text-lg">🎵</p>
              <p className="mt-2">Busca canciones por título, artista, género o época</p>
              <p className="text-sm mt-2 text-gray-500">
                Ej: "canción triste de los 80" o "la que dice umbrella ella"
              </p>
            </div>
          ) : null}
        </div>
      </div>
    </main>
  )
}
