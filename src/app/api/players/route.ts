import { PrismaClient } from '@prisma/client'
import { NextResponse } from 'next/server'

// Fallback for global Prisma instance in development
const globalForPrisma = globalThis as unknown as { prisma: PrismaClient }
const prisma = globalForPrisma.prisma || new PrismaClient()
if (process.env.NODE_ENV !== 'production') globalForPrisma.prisma = prisma

export async function POST(request: Request) {
  try {
    const { name, email, phone } = await request.json()
    
    if (!name?.trim()) {
      return NextResponse.json({ error: 'Name is required' }, { status: 400 })
    }

    const player = await prisma.player.create({
      data: {
        name,
        email: email || null,
        phone: phone || null,
        weeklyFrequency: 2,
        skillMultiplier: 1.0,
      },
      // Include empty arrays so the client interface PlayerType matches
      include: {
        rackets: true,
        jobs: true
      }
    })
    
    return NextResponse.json({ player })
  } catch (error) {
    console.error('Error creating player:', error)
    return NextResponse.json({ error: 'Failed to create player' }, { status: 500 })
  }
}
