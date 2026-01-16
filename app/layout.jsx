import './globals.css'

export const metadata = {
  title: 'Song Finder - Encuentra cualquier canción',
  description: 'Busca canciones por letras, artista, género o época',
}

export default function RootLayout({ children }) {
  return (
    <html lang="es">
      <body className="antialiased">{children}</body>
    </html>
  )
}
