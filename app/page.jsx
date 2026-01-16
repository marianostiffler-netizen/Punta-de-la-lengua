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
    <main className="min-h-screen p-6">
      <div className="max-w-2xl mx-auto">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-light text-gray-900 mb-2">
            Song Finder
          </h1>
          <p className="text-gray-600 text-sm">
            Encuentra cualquier canción
          </p>
        </div>
        
        <SearchBar onSearch={handleSearch} loading={loading} />
        
        {error && (
          <div className="mt-4 p-3 bg-red-50 border border-red-200 rounded-lg text-red-700 text-sm text-center">
            {error}
          </div>
        )}
        
        <div className="mt-8">
          {loading ? (
            <LoadingState />
          ) : results.length > 0 ? (
            <div className="space-y-3">
              {results.map((song, idx) => (
                <ResultCard key={`${song.itunes_id || idx}-${song.title}`} song={song} />
              ))}
            </div>
          ) : !loading && !error ? (
            <div className="text-center text-gray-400 mt-12">
              <p className="text-sm">
                Busca por título, artista o letras
              </p>
            </div>
          ) : null}
        </div>
      </div>
    </main>
  )
}
