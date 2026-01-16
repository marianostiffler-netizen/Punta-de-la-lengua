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
        placeholder="Buscar canción..."
        className="w-full px-4 py-3 text-base border border-gray-300 rounded-lg focus:outline-none focus:border-gray-400 transition"
        disabled={loading}
      />
      <button
        type="submit"
        disabled={loading}
        className="absolute right-2 top-1/2 -translate-y-1/2 px-4 py-1.5 bg-gray-900 hover:bg-gray-800 text-white rounded text-sm disabled:opacity-50 transition"
      >
        {loading ? '...' : 'Buscar'}
      </button>
    </form>
  )
}
