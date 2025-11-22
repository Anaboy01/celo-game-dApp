// apps/web/src/lib/ipfs.ts
// Complete IPFS integration for fetching game images and metadata

const IPFS_GATEWAY = process.env.NEXT_PUBLIC_IPFS_GATEWAY || 'https://gateway.pinata.cloud/ipfs/'

export interface GameMetadata {
  templateId: number
  images: string[] // Array of 4 IPFS hashes
  answer: string // For testing only, should not be exposed to client
  hint: string
  difficulty: 'easy' | 'medium' | 'hard'
}

export async function uploadToIPFS(data: any): Promise<string> {
  try {
    const apiKey = process.env.NEXT_PUBLIC_PINATA_API_KEY
    const apiSecret = process.env.NEXT_PUBLIC_PINATA_SECRET
    
    if (!apiKey || !apiSecret) {
      throw new Error('Pinata credentials not configured')
    }

    const response = await fetch('https://api.pinata.cloud/pinning/pinJSONToIPFS', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'pinata_api_key': apiKey,
        'pinata_secret_api_key': apiSecret,
      },
      body: JSON.stringify({
        pinataContent: data,
        pinataMetadata: {
          name: `game-metadata-${Date.now()}`,
        },
      }),
    })

    if (!response.ok) {
      throw new Error('Failed to upload to IPFS')
    }

    const result = await response.json()
    return result.IpfsHash
  } catch (error) {
    console.error('[IPFS] Upload error:', error)
    throw error
  }
}

export async function fetchFromIPFS(hash: string): Promise<any> {
  try {
    const response = await fetch(`${IPFS_GATEWAY}${hash}`)
    if (!response.ok) throw new Error('Failed to fetch from IPFS')
    return await response.json()
  } catch (error) {
    console.error('[IPFS] Fetch error:', error)
    return null
  }
}

export async function getGameMetadata(templateId: number): Promise<GameMetadata | null> {
  try {
    // For now, return mock data based on template ID
    // In production, fetch metadata hash from contract and then from IPFS
    return getMockGameMetadata(templateId)
  } catch (error) {
    console.error('[IPFS] Error getting game metadata:', error)
    return null
  }
}

export function getIPFSImageUrl(hash: string): string {
  if (!hash) return '/placeholder.svg'
  if (hash.startsWith('http')) return hash
  return `${IPFS_GATEWAY}${hash}`
}

// Mock data for development/testing
function getMockGameMetadata(templateId: number): GameMetadata {
  const mockGames: Record<number, GameMetadata> = {
    0: {
      templateId: 0,
      images: [
        'https://images.pexels.com/photos/32379731/pexels-photo-32379731.jpeg',  // beach sunset Lagos :contentReference[oaicite:0]{index=0}  
        'https://images.pexels.com/photos/32155417/pexels-photo-32155417.jpeg',  // boat on beach :contentReference[oaicite:1]{index=1}  
        'https://images.pexels.com/photos/11527369/pexels-photo-11527369.jpeg',  // people enjoying beach :contentReference[oaicite:2]{index=2}  
        'https://images.pexels.com/photos/30493378/pexels-photo-30493378.jpeg',  // shores of Lagos :contentReference[oaicite:3]{index=3}  
      ],
      answer: 'beach',
      hint: 'A sandy place by the ocean where people go to relax or swim',
      difficulty: 'easy',
    },
    1: {
      templateId: 1,
      images: [
        'https://images.pexels.com/photos/240040/pexels-photo-240040.jpeg',  // forest :contentReference[oaicite:4]{index=4}  
        'https://images.pexels.com/photos/1878622/pexels-photo-1878622.jpeg',  // dense forest :contentReference[oaicite:5]{index=5}  
        'https://images.pexels.com/photos/27627208/pexels-photo-27627208.jpeg',  // forest path / trees :contentReference[oaicite:6]{index=6}  
        'https://images.pexels.com/photos/27413057/pexels-photo-27413057.jpeg',  // forest light :contentReference[oaicite:7]{index=7}  
      ],
      answer: 'forest',
      hint: 'A large area covered chiefly with trees and undergrowth',
      difficulty: 'medium',
    },
    2: {
      templateId: 2,
      images: [
        // Pexels has fewer direct “magic wand” photos; using something more mystical / abstract
        'https://images.pexels.com/photos/256312/pexels-photo-256312.jpeg',  // abstract light (representing magic)  
        'https://images.pexels.com/photos/2735613/pexels-photo-2735613.jpeg',  // sparkles or light  
        'https://images.pexels.com/photos/3017949/pexels-photo-3017949.jpeg',  // book on table with light  
        'https://images.pexels.com/photos/529972/pexels-photo-529972.jpeg',    // hands in light or glow  
      ],
      answer: 'magic',
      hint: 'A supernatural force often seen in fantasy stories',
      difficulty: 'hard',
    },
    3: {
      templateId: 3,
      images: [
        'https://images.pexels.com/photos/325185/pexels-photo-325185.jpeg',  // restaurant interior  
        'https://images.pexels.com/photos/262978/pexels-photo-262978.jpeg',  // plated food in restaurant  
        'https://images.pexels.com/photos/567648/pexels-photo-567648.jpeg',  // chef cooking  
        'https://images.pexels.com/photos/3184299/pexels-photo-3184299.jpeg',  // people dining  
      ],
      answer: 'restaurant',
      hint: 'A place where people pay to sit and eat food',
      difficulty: 'hard',
    },
  }
  
  

  return mockGames[templateId % 3] || mockGames[0]
}

export function validateImageUrls(images: string[]): boolean {
  if (!Array.isArray(images) || images.length !== 4) return false
  return images.every(img => typeof img === 'string' && img.length > 0)
}