'use client'
import { useState } from 'react'
import SearchBar from '@/components/SearchBar'
import ResultCard from '@/components/ResultCard'

export default function Home() {
  const [results, setResults] = useState([])
  const [loading, setLoading] = useState(false)

  const handleSearch = async (query: string) => {
    setLoading(true)
    try {
      const res = await fetch('/api/search', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ query })
      })
      const data = await res.json()
      setResults(data.results)
    } catch (error) {
      console.error('Error:', error)
    }
    setLoading(false)
  }

  return (
    <main className="min-h-screen bg-gradient-to-br from-purple-900 via-blue-900 to-black p-8">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-5xl font-bold text-white text-center mb-2">
          🎵 Song Finder
        </h1>
        <p className="text-gray-300 text-center mb-8">
          Describe la canción que buscas, nosotros la encontramos
        </p>
        
        <SearchBar onSearch={handleSearch} loading={loading} />
        
        <div className="mt-8 space-y-4">
          {results.map((song: any, idx: number) => (
            <ResultCard key={idx} song={song} />
          ))}
        </div>
      </div>
    </main>
  )
}
