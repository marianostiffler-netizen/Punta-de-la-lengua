export async function POST(request) {
  try {
    const { query } = await request.json()
    
    if (!query || typeof query !== 'string' || query.trim().length === 0) {
      return Response.json({
        success: false,
        error: 'Query is required and must be a non-empty string'
      }, { status: 400 })
    }

    console.log('Search request received for query:', query)

    // Simple iTunes API call
    const searchUrl = `https://itunes.apple.com/search?term=${encodeURIComponent(query.trim())}&media=music&entity=song&limit=50&lang=es_us`
    
    console.log('Calling iTunes API:', searchUrl)

    const response = await fetch(searchUrl)
    
    if (!response.ok) {
      console.error('iTunes API error:', response.status, response.statusText)
      return Response.json({
        success: false,
        error: `iTunes API error: ${response.status} ${response.statusText}`
      }, { status: 500 })
    }

    const data = await response.json()
    console.log('iTunes raw response:', data)
    
    if (!data.results || !Array.isArray(data.results)) {
      console.log('No results found in iTunes response')
      return Response.json({
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

    console.log('Successfully processed results:', results.length, 'songs')

    return Response.json({
      success: true,
      results: results,
      query: query,
      total: results.length
    })
    
  } catch (error) {
    console.error('Search error:', error)
    return Response.json({
      success: false,
      error: `Internal server error: ${error.message}`
    }, { status: 500 })
  }
}
