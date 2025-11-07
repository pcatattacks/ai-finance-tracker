/**
 * Test helpers for API integration tests
 */

import { vi } from 'vitest'

/**
 * Mock Clerk auth function
 */
export function mockAuth(userId: string | null = 'test-user-123', email = 'test@example.com') {
  return vi.fn().mockResolvedValue({
    userId,
    emailAddresses: email ? [{ emailAddress: email }] : [],
  })
}

/**
 * Mock NextRequest
 */
export function createMockRequest(options: {
  method?: string
  body?: any
  headers?: Record<string, string>
  url?: string
} = {}) {
  const {
    method = 'GET',
    body = null,
    headers = {},
    url = 'http://localhost:3000',
  } = options

  return {
    method,
    url,
    headers: new Headers(headers),
    json: async () => body,
  } as any
}

/**
 * Mock Prisma client for testing
 */
export function createMockPrisma() {
  return {
    user: {
      findUnique: vi.fn(),
      create: vi.fn(),
      update: vi.fn(),
      delete: vi.fn(),
    },
    transaction: {
      findMany: vi.fn(),
      findUnique: vi.fn(),
      create: vi.fn(),
      update: vi.fn(),
      delete: vi.fn(),
    },
    category: {
      findMany: vi.fn(),
      findUnique: vi.fn(),
      create: vi.fn(),
    },
  }
}
