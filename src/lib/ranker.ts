/**
 * Rankea los resultados de búsqueda usando múltiples factores
 * @param {Array} results - Resultados de iTunes
 * @param {Object} analysis - Análisis original de Claude
 * @returns {Array} Resultados ordenados por relevancia
 */
export function rankResults(results: any[], analysis: any = {}) {
  if (!results || results.length === 0) {
    return []
  }

  // Calcular score para cada resultado
  const scored = results.map(song => {
    let score = 0

    // 1. Precio del álbum (indicador indirecto de popularidad)
    // Álbumes más caros suelen ser más populares/recientes
    if (song.collection_price) {
      score += Math.min(song.collection_price * 2, 20) // Máximo 20 puntos
    }

    // 2. Tiene preview (muy importante para la UX)
    if (song.preview_url) {
      score += 30 // Bonus importante: 30 puntos
    }

    // 3. Coincidencia exacta con artista buscado
    if (analysis.possible_artist && song.artist) {
      const artistQuery = analysis.possible_artist.toLowerCase()
      const artistResult = song.artist.toLowerCase()
      
      if (artistResult.includes(artistQuery) || artistQuery.includes(artistResult)) {
        score += 60 // Bonus muy alto: 60 puntos
      }
    }

    // 4. Coincidencia con keywords en título
    if (analysis.keywords && analysis.keywords.length > 0) {
      const titleLower = song.title.toLowerCase()
      const albumLower = (song.album || '').toLowerCase()
      
      analysis.keywords.forEach((keyword: string) => {
        const kw = keyword.toLowerCase()
        // Coincidencia en título (peso alto)
        if (titleLower.includes(kw)) {
          score += 25
        }
        // Coincidencia en álbum (peso menor)
        if (albumLower.includes(kw)) {
          score += 10
        }
      })
    }

    // 5. Coincidencia de género
    if (analysis.genre && song.genre) {
      const genreMatch = song.genre.toLowerCase()
        .includes(analysis.genre.toLowerCase())
      if (genreMatch) {
        score += 25 // Bonus: 25 puntos
      }
    }

    // 6. Fecha de lanzamiento (recencia)
    if (song.release_date) {
      const releaseYear = new Date(song.release_date).getFullYear()
      const currentYear = new Date().getFullYear()
      const yearsAgo = currentYear - releaseYear

      // Si se especificó una época
      if (analysis.era) {
        const targetDecade = parseInt(analysis.era.replace(/s$/, ''))
        const songDecade = Math.floor(releaseYear / 10) * 10
        
        if (songDecade === targetDecade) {
          score += 40 // Bonus alto por década correcta
        } else {
          // Penalizar si está muy lejos de la década buscada
          const decadeDiff = Math.abs(songDecade - targetDecade) / 10
          score -= decadeDiff * 10
        }
      } else {
        // Sin época especificada: preferir canciones más recientes
        // pero no penalizar mucho las viejas
        if (yearsAgo <= 2) {
          score += 20 // Muy reciente
        } else if (yearsAgo <= 5) {
          score += 15 // Reciente
        } else if (yearsAgo <= 10) {
          score += 10 // Medio reciente
        }
      }
    }

    // 7. Penalización por contenido explícito (si no se permite)
    if (song.explicit && !analysis.explicit_ok) {
      score -= 15
    }

    // 8. Bonus por estar en posiciones bajas del álbum
    // (los hits suelen ser las primeras canciones)
    if (song.track_number && song.track_number <= 3) {
      score += 5
    }

    // 9. Coincidencia de idioma (si es relevante)
    if (analysis.language === 'es') {
      // Bonus para artistas latinos/españoles comunes
      const latinArtists = ['shakira', 'maluma', 'ozuna', 'bad bunny', 
                           'karol g', 'j balvin', 'soda stereo', 
                           'cerati', 'chayanne', 'juanes']
      
      const artistLower = song.artist.toLowerCase()
      const isLatin = latinArtists.some((la: string) => artistLower.includes(la))
      
      if (isLatin) {
        score += 15
      }
    }

    return {
      ...song,
      final_score: Math.round(score)
    }
  })

  // Ordenar por score descendente
  scored.sort((a, b) => b.final_score - a.final_score)

  console.log('🏆 Top 5 resultados:')
  scored.slice(0, 5).forEach((song: any, i: number) => {
    console.log(`  ${i + 1}. "${song.title}" - ${song.artist} (score: ${song.final_score})`)
  })

  return scored
}

/**
 * Elimina duplicados de resultados
 * @param {Array} results - Resultados con posibles duplicados
 * @returns {Array} Resultados sin duplicados
 */
export function removeDuplicates(results: any[]) {
  const seen = new Set()
  
  return results.filter(song => {
    // Crear identificador único más robusto
    const titleNormalized = song.title
      .toLowerCase()
      .replace(/[^\w\s]/g, '') // Remover puntuación
      .trim()
    
    const artistNormalized = song.artist
      .toLowerCase()
      .replace(/[^\w\s]/g, '')
      .trim()
    
    const key = `${titleNormalized}_${artistNormalized}` 
    
    if (seen.has(key)) {
      console.log(`  ⏭️  Duplicado ignorado: "${song.title}" - ${song.artist}`)
      return false
    }
    
    seen.add(key)
    return true
  })
}

/**
 * Filtra resultados por criterios específicos
 * @param {Array} results - Resultados a filtrar
 * @param {Object} filters - Filtros a aplicar
 * @returns {Array} Resultados filtrados
 */
export function filterResults(results: any[], filters: any = {}) {
  let filtered = [...results]

  // Filtrar por año/década
  if (filters.year) {
    filtered = filtered.filter(song => {
      if (!song.release_date) return false
      const year = new Date(song.release_date).getFullYear()
      return year === filters.year
    })
  }

  if (filters.decade) {
    filtered = filtered.filter(song => {
      if (!song.release_date) return false
      const year = new Date(song.release_date).getFullYear()
      const decade = Math.floor(year / 10) * 10
      return decade === filters.decade
    })
  }

  // Filtrar por artista
  if (filters.artist) {
    filtered = filtered.filter(song => 
      song.artist.toLowerCase().includes(filters.artist.toLowerCase())
    )
  }

  // Filtrar por género
  if (filters.genre) {
    filtered = filtered.filter(song =>
      song.genre && song.genre.toLowerCase().includes(filters.genre.toLowerCase())
    )
  }

  // Filtrar por contenido explícito
  if (filters.no_explicit) {
    filtered = filtered.filter(song => !song.explicit)
  }

  // Solo canciones con preview
  if (filters.has_preview) {
    filtered = filtered.filter(song => song.preview_url)
  }

  return filtered
}

/**
 * Agrupa resultados por artista
 * @param {Array} results - Resultados a agrupar
 * @returns {Object} Resultados agrupados por artista
 */
export function groupByArtist(results: any[]) {
  return results.reduce((groups: Record<string, any[]>, song) => {
    const artist = song.artist
    if (!groups[artist]) {
      groups[artist] = []
    }
    groups[artist].push(song)
    return groups
  }, {})
}

/**
 * Agrupa resultados por década
 * @param {Array} results - Resultados a agrupar
 * @returns {Object} Resultados agrupados por década
 */
export function groupByDecade(results: any[]) {
  return results.reduce((groups: Record<string, any[]>, song) => {
    if (!song.release_date) return groups
    
    const year = new Date(song.release_date).getFullYear()
    const decade = `${Math.floor(year / 10) * 10}s` 
    
    if (!groups[decade]) {
      groups[decade] = []
    }
    groups[decade].push(song)
    return groups
  }, {})
}
