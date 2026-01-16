import { NextResponse } from 'next/server'

const ITUNES_API_BASE = 'https://itunes.apple.com/search'

export async function POST(request) {
  try {
    const { query } = await request.json()
    
    if (!query || typeof query !== 'string' || query.trim().length === 0) {
      return NextResponse.json({
        success: false,
        error: 'Query is required and must be a non-empty string'
      }, { status: 400 })
    }

    // Search iTunes directly
    const params = new URLSearchParams({
      term: query.trim(),
      media: 'music',
      entity: 'song',
      limit: '50',
      lang: 'es_us'
    })

    console.log('Searching iTunes with params:', params.toString())

    const response = await fetch(`${ITUNES_API_BASE}?${params}`)
    
    if (!response.ok) {
      console.error('iTunes API error:', response.status, response.statusText)
      throw new Error(`iTunes API error: ${response.status}`)
    }

    const data = await response.json()
    console.log('iTunes response:', data)
    
    if (!data.results || !Array.isArray(data.results)) {
      console.log('No results found in iTunes response')
      return NextResponse.json({
        success: true,
        results: [],
        query: query,
        total: 0
      })
    }

    // Transform iTunes results to our format
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
      popularity: 0
    }))

    console.log('Processed results:', results.length)

    return NextResponse.json({
      success: true,
      results: results,
      query: query,
      total: results.length
    })
    
  } catch (error) {
    console.error('Search error:', error)
    return NextResponse.json({
      success: false,
      error: `Internal server error: ${error.message}`
    }, { status: 500 })
  }
}
