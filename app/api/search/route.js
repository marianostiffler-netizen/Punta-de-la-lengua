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

    // Analyze query for better search
    const analysis = analyzeQuery(query)
    
    // Search iTunes
    const searchResults = await searchITunesDirect(query, analysis)
    
    // Remove duplicates
    const uniqueResults = removeDuplicates(searchResults)
    
    // Rank results
    const rankedResults = rankResults(uniqueResults, analysis)
    
    // Return top 15 results
    const finalResults = rankedResults.slice(0, 15)
    
    return NextResponse.json({
      success: true,
      results: finalResults,
      query: query,
      analysis: analysis,
      total: finalResults.length
    })
    
  } catch (error) {
    console.error('Search error:', error)
    return NextResponse.json({
      success: false,
      error: 'Internal server error'
    }, { status: 500 })
  }
}

async function searchITunesDirect(query, analysis) {
  try {
    // Build search parameters based on analysis
    const params = new URLSearchParams({
      term: query,
      media: 'music',
      entity: 'song',
      limit: '50',
      lang: 'es_us'
    })

    const response = await fetch(`${ITUNES_API_BASE}?${params}`)
    
    if (!response.ok) {
      throw new Error(`iTunes API error: ${response.status}`)
    }

    const data = await response.json()
    
    if (!data.results || !Array.isArray(data.results)) {
      return []
    }

    // Transform iTunes results to our format
    return data.results.map(item => ({
      title: item.trackName || '',
      artist: item.artistName || '',
      album: item.collectionName || '',
      genre: item.primaryGenreName || '',
      release_date: item.releaseDate || '',
      image: item.artworkUrl100 || item.artworkUrl60 || '',
      preview_url: item.previewUrl || '',
      itunes_url: item.trackViewUrl || '',
      itunes_id: item.trackId?.toString() || '',
      apple_music_url: '', // iTunes API doesn't provide Apple Music links directly
      popularity: 0 // Will be calculated in ranking
    }))
    
  } catch (error) {
    console.error('iTunes search error:', error)
    return []
  }
}

function removeDuplicates(results) {
  const seen = new Set()
  return results.filter(song => {
    const key = `${song.title.toLowerCase().trim()}-${song.artist.toLowerCase().trim()}`
    if (seen.has(key)) {
      return false
    }
    seen.add(key)
    return true
  })
}

function rankResults(results, analysis) {
  return results.map(song => {
    let score = 0
    
    // Artist match bonus
    if (analysis.artist && song.artist.toLowerCase().includes(analysis.artist.toLowerCase())) {
      score += 60
    }
    
    // Audio preview bonus
    if (song.preview_url) {
      score += 30
    }
    
    // Keyword matching in title
    if (analysis.keywords) {
      analysis.keywords.forEach(keyword => {
        if (song.title.toLowerCase().includes(keyword.toLowerCase())) {
          score += 25
        }
      })
    }
    
    // Genre match bonus
    if (analysis.genre && song.genre && song.genre.toLowerCase().includes(analysis.genre.toLowerCase())) {
      score += 25
    }
    
    // Era match bonus
    if (analysis.era && song.release_date) {
      const year = new Date(song.release_date).getFullYear()
      if (analysis.era === '80s' && year >= 1980 && year < 1990) score += 40
      if (analysis.era === '90s' && year >= 1990 && year < 2000) score += 40
      if (analysis.era === '2000s' && year >= 2000 && year < 2010) score += 40
      if (analysis.era === '2010s' && year >= 2010 && year < 2020) score += 40
      if (analysis.era === '2020s' && year >= 2020) score += 40
    }
    
    // Latin artist bonus
    const latinArtists = ['shakira', 'bad bunny', 'j balvin', 'daddy yankee', 'rosalía', 'ozuna', 'maluma', 'nicky jam', 'becky g', 'karol g', 'sech', 'myke towers']
    if (latinArtists.some(artist => song.artist.toLowerCase().includes(artist))) {
      score += 15
    }
    
    return { ...song, popularity: score }
  }).sort((a, b) => b.popularity - a.popularity)
}

function analyzeQuery(query) {
  const lowerQuery = query.toLowerCase()
  
  return {
    keywords: extractKeywords(lowerQuery),
    artist: detectArtist(lowerQuery),
    genre: detectGenre(lowerQuery),
    era: detectEra(lowerQuery),
    lyrics: detectLyrics(lowerQuery),
    original: query
  }
}

function extractKeywords(query) {
  // Remove common words and extract meaningful keywords
  const stopWords = ['the', 'a', 'an', 'and', 'or', 'but', 'in', 'on', 'at', 'to', 'for', 'of', 'with', 'by', 'song', 'canción', 'cancion', 'music', 'musica']
  
  return query
    .split(/\s+/)
    .filter(word => word.length > 2 && !stopWords.includes(word))
    .slice(0, 5) // Limit to top 5 keywords
}

function detectArtist(query) {
  // Common artist detection
  const artists = [
    'taylor swift', 'ed sheeran', 'drake', 'bad bunny', 'billie eilish', 'ariana grande',
    'justin bieber', 'shakira', 'bruno mars', 'adele', 'the weeknd',
    'post malone', 'dua lipa', 'harry styles', 'olivia rodrigo', 'sabrina carpenter',
    'j balvin', 'rosalía', 'pablo alborán', 'alvaro soler', 'melendi', 'enrique iglesias',
    'ricky martin', 'chayanne', 'mana', 'caifanes', 'jaguares', 'molotov',
    'soda stereo', 'charly garcía', 'fito páez', 'andrés calamaro'
  ]
  
  for (const artist of artists) {
    if (query.includes(artist)) {
      return artist
    }
  }
  
  return null
}

function detectGenre(query) {
  const genres = {
    'rock': ['rock', 'rock and roll', 'hard rock', 'soft rock'],
    'pop': ['pop', 'synth-pop', 'electropop'],
    'reggaeton': ['reggaeton', 'reggaetón', 'perreo'],
    'hip hop': ['hip hop', 'hip-hop', 'rap'],
    'electronic': ['electronic', 'edm', 'house', 'techno'],
    'jazz': ['jazz', 'smooth jazz'],
    'classical': ['classical', 'symphony', 'orchestra'],
    'country': ['country', 'country-pop'],
    'r&b': ['r&b', 'rnb', 'rhythm and blues'],
    'metal': ['metal', 'heavy metal', 'death metal'],
    'punk': ['punk', 'punk rock'],
    'indie': ['indie', 'alternative'],
    'latin': ['latin', 'latino', 'salsa', 'bachata', 'merengue']
  }
  
  for (const [genre, keywords] of Object.entries(genres)) {
    if (keywords.some(keyword => query.includes(keyword))) {
      return genre
    }
  }
  
  return null
}

function detectEra(query) {
  const eras = {
    '50s': ['50s', 'fifties', '1950s'],
    '60s': ['60s', 'sixties', '1960s'],
    '70s': ['70s', 'seventies', '1970s'],
    '80s': ['80s', 'eighties', '1980s'],
    '90s': ['90s', 'nineties', '1990s'],
    '2000s': ['2000s', 'two thousands', 'y2k'],
    '2010s': ['2010s', 'twenty tens'],
    '2020s': ['2020s', 'twenty twenties']
  }
  
  for (const [era, keywords] of Object.entries(eras)) {
    if (keywords.some(keyword => query.includes(keyword))) {
      return era
    }
  }
  
  return null
}

function detectLyrics(query) {
  // Detect if query contains lyrics indicators
  const lyricsIndicators = [
    'la que dice', 'el que dice', 'que dice', 'canta', 'cantando',
    'the one that says', 'that goes like', 'sings', 'lyrics',
    'letra', 'letras', 'versos', 'estribillo'
  ]
  
  return lyricsIndicators.some(indicator => query.includes(indicator))
}
