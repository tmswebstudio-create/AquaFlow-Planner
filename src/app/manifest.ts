
import { MetadataRoute } from 'next'

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: 'AquaFlow Planner',
    short_name: 'AquaFlow',
    description: 'A modern task manager for your daily flow.',
    start_url: '/',
    display: 'standalone',
    background_color: '#ffffff',
    theme_color: '#3b82f6',
    icons: [
      {
        src: 'data:image/svg+xml,<svg xmlns=%22http://www.w3.org/2000/svg%22 viewBox=%220 0 100 100%22><rect width=%22100%22 height=%22100%22 rx=%2222%22 fill=%22%233b82f6%22/><path d=%22M20 40h60M42 40v40%22 stroke=%22white%22 stroke-width=%228%22 stroke-linecap=%22round%22/><rect x=%2220%22 y=%2220%22 width=%2260%22 height=%2260%22 rx=%228%22 fill=%22none%22 stroke=%22white%22 stroke-width=%228%22/></svg>',
        sizes: '512x512',
        type: 'image/svg+xml',
        purpose: 'any',
      },
      {
        src: 'data:image/svg+xml,<svg xmlns=%22http://www.w3.org/2000/svg%22 viewBox=%220 0 100 100%22><rect width=%22100%22 height=%22100%22 rx=%2222%22 fill=%22%233b82f6%22/><path d=%22M20 40h60M42 40v40%22 stroke=%22white%22 stroke-width=%228%22 stroke-linecap=%22round%22/><rect x=%2220%22 y=%2220%22 width=%2260%22 height=%2260%22 rx=%228%22 fill=%22none%22 stroke=%22white%22 stroke-width=%228%22/></svg>',
        sizes: '512x512',
        type: 'image/svg+xml',
        purpose: 'maskable',
      },
    ],
  }
}
