import { NextResponse } from 'next/server'
import { searchITunes } from '../../../lib/itunes.js'
import { rankResults, removeDuplicates } from '../../../lib/ranker.js'

export async function POST(request) {
  const startTime = Date.now()
  
  try {
    const { query } = await request.json()

    if (!query || query.trim().length === 0) {
      return NextResponse.json(
        { error: 'Query vacío' },
        { status: 400 }
      )
    }

    console.log(`\n🔍 Nueva búsqueda: "${query}"`)

    // PASO 1: Analizar query con método simple
    console.log('📊 Analizando query...')
    const analysis = analyzeQuery(query)
    console.log('✅ Análisis completado:', analysis)

    // PASO 2: Buscar en iTunes directamente
    console.log('🎵 Buscando en iTunes...')
    const itunesResults = await searchITunesDirect(query)

    if (itunesResults.length === 0) {
      console.log('⚠️  No se encontraron resultados')
      return NextResponse.json({
        success: true,
        results: [],
        analysis,
        metadata: {
          total_found: 0,
          search_time_ms: Date.now() - startTime,
          message: 'No se encontraron canciones. Intenta con otros términos.'
        }
      })
    }

    // PASO 3: Eliminar duplicados
    const uniqueResults = removeDuplicates(itunesResults)
    console.log(`📦 Resultados únicos: ${uniqueResults.length}`)

    // PASO 4: Rankear resultados
    console.log('🏆 Rankeando resultados...')
    const ranked = rankResults(uniqueResults, analysis)

    // PASO 5: Limitar a top 15
    const topResults = ranked.slice(0, 15)

    const duration = Date.now() - startTime
    console.log(`✅ Búsqueda completada en ${duration}ms`)
    console.log(`📊 Devolviendo ${topResults.length} resultados\n`)

    return NextResponse.json({
      success: true,
      results: topResults,
      analysis,
      metadata: {
        total_found: ranked.length,
        search_time_ms: duration,
        source: 'itunes'
      }
    })

  } catch (error) {
    console.error('❌ Error en búsqueda:', error)
    
    return NextResponse.json({
      success: false,
      error: 'Error en la búsqueda',
      message: error.message,
      results: []
    }, { status: 500 })
  }
}

/**
 * Búsqueda directa en iTunes API
 */
async function searchITunesDirect(query) {
  try {
    const ITUNES_API_BASE = 'https://itunes.apple.com/search'
    
    // Parámetros de búsqueda
    const params = new URLSearchParams({
      term: query,
      media: 'music',
      entity: 'song',
      limit: 25,
      country: 'US',
      lang: 'es_es'
    })

    // Hacer request a iTunes API
    const response = await fetch(`${ITUNES_API_BASE}?${params}`)
    const data = await response.json()

    const results = data.results

    if (!results || results.length === 0) {
      console.log('❌ No se encontraron resultados en iTunes')
      return []
    }

    // Formatear resultados
    const songs = results.map(track => ({
      title: track.trackName,
      artist: track.artistName,
      album: track.collectionName,
      itunes_id: track.trackId,
      itunes_url: track.trackViewUrl,
      image: track.artworkUrl100,
      preview_url: track.previewUrl,
      genre: track.primaryGenreName,
      release_date: track.releaseDate,
      duration_ms: track.trackTimeMillis,
      price: track.trackPrice,
      currency: track.currency,
      explicit: track.trackExplicitness === 'explicit',
      collection_price: track.collectionPrice || 0,
      track_number: track.trackNumber || 0,
      source: 'itunes'
    }))

    console.log(`✅ Encontradas ${songs.length} canciones en iTunes`)
    return songs

  } catch (error) {
    console.error('❌ Error en iTunes API:', error.message)
    return []
  }
}

/**
 * Analiza el query del usuario con método simple (sin Claude)
 */
function analyzeQuery(query) {
  console.log('🔍 Analizando query sin IA...')
  
  // Extraer palabras clave del query
  const words = query.toLowerCase()
    .replace(/[^\w\s]/g, ' ') // Reemplazar caracteres especiales por espacios
    .split(' ')
    .filter(word => word.length > 2) // Filtrar palabras muy cortas
  
  // Detectar posibles artistas
  const possible_artist = detectArtist(query)
  
  // Detectar género
  const genre = detectGenre(query)
  
  // Detectar época
  const era = detectEra(query)
  
  // Detectar si menciona letras
  const is_lyrics = query.toLowerCase().includes('dice') || 
                   query.toLowerCase().includes('va') || 
                   query.toLowerCase().includes('canta') ||
                   query.toLowerCase().includes('letra')

  return {
    keywords: words,
    possible_artist: possible_artist,
    genre: genre,
    era: era,
    mood: null,
    language: 'es',
    is_lyrics: is_lyrics,
    explicit_ok: true
  }
}

/**
 * Detecta posibles nombres de artistas en el query
 */
function detectArtist(query) {
  const artistPatterns = [
    'bad bunny', 'j balvin', 'shakira', 'maluma', 'ozuna', 'karol g',
    'soda stereo', 'cerati', 'charly garcía', 'luis miguel',
    'ricky martin', 'enrique iglesias', 'juanes', 'manu chao',
    'calamaro', 'andrés calamaro', 'fito páez', 'los fabulosos',
    'gustavo cerati', 'spinetta', 'luis alberto spinetta'
  ]
  
  const queryLower = query.toLowerCase()
  
  for (const artist of artistPatterns) {
    if (queryLower.includes(artist)) {
      return artist
    }
  }
  
  return null
}

/**
 * Detecta géneros musicales comunes
 */
function detectGenre(query) {
  const genres = {
    'reggaeton': ['reggaeton', 'reggeaton', 'perreo'],
    'rock': ['rock', 'rock and roll', 'rock&roll'],
    'pop': ['pop'],
    'jazz': ['jazz'],
    'blues': ['blues'],
    'country': ['country'],
    'electronic': ['electrónica', 'electronic', 'edm', 'house', 'techno'],
    'hip hop': ['hip hop', 'hip-hop', 'rap'],
    'r&b': ['r&b', 'rnb', 'rhythm and blues'],
    'salsa': ['salsa'],
    'bachata': ['bachata'],
    'cumbia': ['cumbia'],
    'tango': ['tango'],
    'folklore': ['folklore', 'folclore']
  }
  
  const queryLower = query.toLowerCase()
  
  for (const [genre, keywords] of Object.entries(genres)) {
    for (const keyword of keywords) {
      if (queryLower.includes(keyword)) {
        return genre
      }
    }
  }
  
  return null
}

/**
 * Detecta décadas o épocas
 */
function detectEra(query) {
  const eraPatterns = [
    { pattern: /\b(19|20)\d{2}s?\b/, extract: (match) => match + 's' },
    { pattern: /\baños?\s+(19|20)\d{2}s?\b/, extract: (match) => match.replace(/\baños?\s+/, '') },
    { pattern: /\b\d{4}\b/, extract: (match) => Math.floor(parseInt(match) / 10) * 10 + 's' },
    { pattern: /\b(19|20)\d{2}\b/, extract: (match) => Math.floor(parseInt(match) / 10) * 10 + 's' }
  ]
  
  const queryLower = query.toLowerCase()
  
  for (const { pattern, extract } of eraPatterns) {
    const match = queryLower.match(pattern)
    if (match) {
      return extract(match[0])
    }
  }
  
  return null
}
