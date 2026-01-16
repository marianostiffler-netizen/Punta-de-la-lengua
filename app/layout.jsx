import './globals.css'

export const metadata = {
  title: 'Song Finder',
  description: 'Busca canciones fácilmente',
}

export default function RootLayout({ children }) {
  return (
    <html lang="es">
      <body className="min-h-screen bg-gray-50">
        {children}
      </body>
    </html>
  )
}
