import './globals.css'

export const metadata = {
  title: 'Song Finder - Encuentra cualquier canción',
  description: 'Busca canciones por letras, artista, género o época usando IA',
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="es">
      <body className="antialiased">
        {children}
      </body>
    </html>
  )
}
