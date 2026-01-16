import axios from 'axios'

const ITUNES_API_BASE = 'https://itunes.apple.com/search'

/**
 * Busca canciones en iTunes Store
 * @param {Object} analysis - Análisis con keywords, artist, etc
 * @returns {Array} Lista de canciones encontradas
 */
export async function searchITunes(analysis) {
  try {
    const { keywords, possible_artist, genre } = analysis
    
    // Construir query de búsqueda
    let searchQuery = keywords.join(' ')
    if (possible_artist) {
      searchQuery += ` ${possible_artist}` 
    }

    console.log('🎵 Buscando en iTunes:', searchQuery)

    // Parámetros de búsqueda
    const params = {
      term: searchQuery,
      media: 'music',
      entity: 'song',
      limit: 25, // Más resultados para tener opciones
      country: 'US', // Puedes cambiarlo a 'AR' para Argentina
      lang: 'es_es'
    }

    // Si hay género específico, agregarlo
    if (genre) {
      params.attribute = 'genreTerm'
      params.term = `${searchQuery} ${genre}` 
    }

    // Hacer request a iTunes API
    const response = await axios.get(ITUNES_API_BASE, { params })

    const results = response.data.results

    if (!results || results.length === 0) {
      console.log('❌ No se encontraron resultados en iTunes')
      return []
    }

    // Formatear resultados
    const songs = results.map(track => ({
      // Información básica
      title: track.trackName,
      artist: track.artistName,
      album: track.collectionName,
      
      // URLs e IDs
      itunes_id: track.trackId,
      itunes_url: track.trackViewUrl,
      apple_music_url: track.trackViewUrl.replace('itunes.apple.com', 'music.apple.com'),
      
      // Imágenes (iTunes da múltiples tamaños)
      image_small: track.artworkUrl30,
      image_medium: track.artworkUrl60,
      image_large: track.artworkUrl100,
      image: track.artworkUrl100, // Imagen por defecto
      
      // Preview de audio (30 segundos)
      preview_url: track.previewUrl,
      
      // Metadata adicional
      genre: track.primaryGenreName,
      release_date: track.releaseDate,
      duration_ms: track.trackTimeMillis,
      price: track.trackPrice,
      currency: track.currency,
      explicit: track.trackExplicitness === 'explicit',
      
      // Para ranking
      collection_price: track.collectionPrice || 0,
      track_number: track.trackNumber || 0,
      
      // Identificador de fuente
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
 * Busca por artista específico en iTunes
 * @param {string} artistName - Nombre del artista
 * @param {number} limit - Cantidad de resultados
 * @returns {Array} Canciones del artista
 */
export async function searchByArtist(artistName, limit = 20) {
  try {
    const response = await axios.get(ITUNES_API_BASE, {
      params: {
        term: artistName,
        media: 'music',
        entity: 'song',
        attribute: 'artistTerm',
        limit: limit,
        country: 'US'
      }
    })

    const results = response.data.results
    
    return results.map(track => ({
      title: track.trackName,
      artist: track.artistName,
      album: track.collectionName,
      image: track.artworkUrl100,
      preview_url: track.previewUrl,
      itunes_url: track.trackViewUrl,
      genre: track.primaryGenreName,
      release_date: track.releaseDate
    }))

  } catch (error) {
    console.error('❌ Error buscando artista en iTunes:', error.message)
    return []
  }
}

/**
 * Busca por álbum específico
 * @param {string} albumName - Nombre del álbum
 * @param {string} artistName - Nombre del artista (opcional)
 * @returns {Array} Canciones del álbum
 */
export async function searchByAlbum(albumName, artistName = null) {
  try {
    let searchTerm = albumName
    if (artistName) {
      searchTerm += ` ${artistName}` 
    }

    const response = await axios.get(ITUNES_API_BASE, {
      params: {
        term: searchTerm,
        media: 'music',
        entity: 'song',
        attribute: 'albumTerm',
        limit: 50,
        country: 'US'
      }
    })

    const results = response.data.results
    
    // Agrupar por álbum y devolver
    return results.map(track => ({
      title: track.trackName,
      artist: track.artistName,
      album: track.collectionName,
      track_number: track.trackNumber,
      image: track.artworkUrl100,
      preview_url: track.previewUrl,
      itunes_url: track.trackViewUrl,
      duration_ms: track.trackTimeMillis
    }))

  } catch (error) {
    console.error('❌ Error buscando álbum en iTunes:', error.message)
    return []
  }
}

/**
 * Obtiene información detallada de una canción por ID
 * @param {number} trackId - ID de iTunes de la canción
 * @returns {Object|null} Información de la canción
 */
export async function getTrackById(trackId) {
  try {
    const response = await axios.get(ITUNES_API_BASE, {
      params: {
        id: trackId,
        entity: 'song'
      }
    })

    const results = response.data.results
    
    if (!results || results.length === 0) {
      return null
    }

    const track = results[0]
    
    return {
      title: track.trackName,
      artist: track.artistName,
      album: track.collectionName,
      itunes_id: track.trackId,
      preview_url: track.previewUrl,
      image: track.artworkUrl100,
      genre: track.primaryGenreName,
      release_date: track.releaseDate,
      duration_ms: track.trackTimeMillis,
      price: track.trackPrice,
      explicit: track.trackExplicitness === 'explicit'
    }

  } catch (error) {
    console.error('❌ Error obteniendo canción por ID:', error.message)
    return null
  }
}
