'use client'
import { useState } from 'react'

export default function SearchBar({ onSearch, loading }) {
  const [query, setQuery] = useState('')

  const handleSubmit = (e) => {
    e.preventDefault()
    if (query.trim()) {
      onSearch(query)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="relative">
      <input
        type="text"
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        placeholder='Ej: "canción triste de los 80" o "la que dice umbrella ella"'
        className="w-full px-6 py-4 text-lg rounded-full bg-white/10 backdrop-blur-sm text-white placeholder-gray-400 border border-white/20 focus:outline-none focus:border-purple-400 transition"
        disabled={loading}
      />
      <button
        type="submit"
        disabled={loading}
        className="absolute right-2 top-1/2 -translate-y-1/2 px-6 py-2 bg-purple-600 hover:bg-purple-700 text-white rounded-full font-semibold disabled:opacity-50 transition"
      >
        {loading ? '🔍 Buscando...' : '🔍 Buscar'}
      </button>
    </form>
  )
}
