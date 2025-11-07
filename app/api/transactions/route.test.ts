import { describe, it, expect, vi, beforeEach } from 'vitest'
import { GET, POST } from './route'
import { createMockRequest, createMockPrisma, mockAuth } from '@/test/helpers/api'

// Mock Clerk auth
vi.mock('@clerk/nextjs/server', () => ({
  auth: mockAuth(),
}))

// Mock Prisma
const mockPrisma = createMockPrisma()
vi.mock('@/lib/prisma', () => ({
  prisma: mockPrisma,
}))

describe('Transactions API', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  describe('GET /api/transactions', () => {
    it('should return transactions for authenticated user', async () => {
      const mockUser = {
        id: '1',
        clerkId: 'test-user-123',
        email: 'test@example.com',
      }

      const mockTransactions = [
        {
          id: '1',
          userId: '1',
          date: new Date('2024-01-15'),
          amount: -87.50,
          merchantRaw: 'Whole Foods',
          merchantNormalized: 'Whole Foods',
          description: 'Grocery shopping',
          category: { id: '1', name: 'Groceries' },
          subcategory: null,
        },
        {
          id: '2',
          userId: '1',
          date: new Date('2024-01-16'),
          amount: -15.99,
          merchantRaw: 'Netflix',
          merchantNormalized: 'Netflix',
          description: 'Monthly subscription',
          category: { id: '2', name: 'Subscriptions' },
          subcategory: { id: '3', name: 'Streaming' },
        },
      ]

      mockPrisma.user.findUnique.mockResolvedValue(mockUser)
      mockPrisma.transaction.findMany.mockResolvedValue(mockTransactions)

      const request = createMockRequest()
      const response = await GET(request)
      const data = await response.json()

      expect(response.status).toBe(200)
      expect(data.transactions).toHaveLength(2)
      expect(data.transactions[0].merchantRaw).toBe('Whole Foods')
      expect(mockPrisma.transaction.findMany).toHaveBeenCalledWith({
        where: { userId: '1' },
        include: {
          category: true,
          subcategory: true,
        },
        orderBy: { date: 'desc' },
        take: 100,
      })
    })

    it('should create user on first login', async () => {
      const newUser = {
        id: '2',
        clerkId: 'new-user-456',
        email: 'newuser@example.com',
      }

      // User doesn't exist yet
      mockPrisma.user.findUnique.mockResolvedValue(null)
      mockPrisma.user.create.mockResolvedValue(newUser)
      mockPrisma.transaction.findMany.mockResolvedValue([])

      const request = createMockRequest()
      const response = await GET(request)

      expect(mockPrisma.user.create).toHaveBeenCalledWith({
        data: {
          clerkId: 'test-user-123',
          email: 'test@example.com',
        },
      })
      expect(response.status).toBe(200)
    })

    it('should return 401 for unauthenticated requests', async () => {
      // Mock auth to return null userId
      const { auth } = await import('@clerk/nextjs/server')
      vi.mocked(auth).mockResolvedValueOnce({ userId: null } as any)

      const request = createMockRequest()
      const response = await GET(request)
      const data = await response.json()

      expect(response.status).toBe(401)
      expect(data.error).toBe('Unauthorized')
    })

    it('should limit results to 100 most recent transactions', async () => {
      const mockUser = { id: '1', clerkId: 'test-user-123', email: 'test@example.com' }
      mockPrisma.user.findUnique.mockResolvedValue(mockUser)
      mockPrisma.transaction.findMany.mockResolvedValue([])

      const request = createMockRequest()
      await GET(request)

      expect(mockPrisma.transaction.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          take: 100,
        })
      )
    })

    it('should order transactions by date descending', async () => {
      const mockUser = { id: '1', clerkId: 'test-user-123', email: 'test@example.com' }
      mockPrisma.user.findUnique.mockResolvedValue(mockUser)
      mockPrisma.transaction.findMany.mockResolvedValue([])

      const request = createMockRequest()
      await GET(request)

      expect(mockPrisma.transaction.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          orderBy: { date: 'desc' },
        })
      )
    })

    it('should handle database errors gracefully', async () => {
      mockPrisma.user.findUnique.mockRejectedValue(new Error('Database error'))

      const request = createMockRequest()
      const response = await GET(request)
      const data = await response.json()

      expect(response.status).toBe(500)
      expect(data.error).toBe('Internal server error')
    })
  })

  describe('POST /api/transactions', () => {
    it('should create a new transaction', async () => {
      const mockUser = {
        id: '1',
        clerkId: 'test-user-123',
        email: 'test@example.com',
      }

      const newTransaction = {
        id: '123',
        userId: '1',
        date: new Date('2024-01-15'),
        amount: -87.50,
        merchantRaw: 'Whole Foods',
        merchantNormalized: 'Whole Foods',
        description: 'Grocery shopping',
        categoryId: '1',
        hash: 'abc123',
      }

      mockPrisma.user.findUnique.mockResolvedValue(mockUser)
      mockPrisma.transaction.findUnique.mockResolvedValue(null) // No duplicate
      mockPrisma.transaction.create.mockResolvedValue(newTransaction)

      const request = createMockRequest({
        method: 'POST',
        body: {
          date: '2024-01-15',
          amount: -87.50,
          merchant: 'Whole Foods',
          description: 'Grocery shopping',
          categoryId: '1',
        },
      })

      const response = await POST(request)
      const data = await response.json()

      expect(response.status).toBe(201)
      expect(data.transaction).toBeDefined()
      expect(data.transaction.merchantRaw).toBe('Whole Foods')
      expect(mockPrisma.transaction.create).toHaveBeenCalled()
    })

    it('should return 401 for unauthenticated requests', async () => {
      const { auth } = await import('@clerk/nextjs/server')
      vi.mocked(auth).mockResolvedValueOnce({ userId: null } as any)

      const request = createMockRequest({
        method: 'POST',
        body: { date: '2024-01-15', amount: -10, merchant: 'Test' },
      })

      const response = await POST(request)
      const data = await response.json()

      expect(response.status).toBe(401)
      expect(data.error).toBe('Unauthorized')
    })

    it('should validate required fields', async () => {
      const request = createMockRequest({
        method: 'POST',
        body: { amount: -10 }, // Missing date and merchant
      })

      const response = await POST(request)
      const data = await response.json()

      expect(response.status).toBe(400)
      expect(data.error).toBe('Missing required fields')
    })

    it('should detect duplicate transactions', async () => {
      const mockUser = { id: '1', clerkId: 'test-user-123', email: 'test@example.com' }
      const existingTransaction = {
        id: '999',
        hash: 'duplicate-hash',
      }

      mockPrisma.user.findUnique.mockResolvedValue(mockUser)
      mockPrisma.transaction.findUnique.mockResolvedValue(existingTransaction)

      const request = createMockRequest({
        method: 'POST',
        body: {
          date: '2024-01-15',
          amount: -87.50,
          merchant: 'Whole Foods',
          description: 'Duplicate',
        },
      })

      const response = await POST(request)
      const data = await response.json()

      expect(response.status).toBe(409)
      expect(data.error).toBe('Duplicate transaction')
    })

    it('should return 404 if user not found', async () => {
      mockPrisma.user.findUnique.mockResolvedValue(null)

      const request = createMockRequest({
        method: 'POST',
        body: {
          date: '2024-01-15',
          amount: -10,
          merchant: 'Test',
        },
      })

      const response = await POST(request)
      const data = await response.json()

      expect(response.status).toBe(404)
      expect(data.error).toBe('User not found')
    })

    it('should use merchant as description if description not provided', async () => {
      const mockUser = { id: '1', clerkId: 'test-user-123', email: 'test@example.com' }
      mockPrisma.user.findUnique.mockResolvedValue(mockUser)
      mockPrisma.transaction.findUnique.mockResolvedValue(null)
      mockPrisma.transaction.create.mockResolvedValue({} as any)

      const request = createMockRequest({
        method: 'POST',
        body: {
          date: '2024-01-15',
          amount: -10,
          merchant: 'Test Merchant',
        },
      })

      await POST(request)

      expect(mockPrisma.transaction.create).toHaveBeenCalledWith({
        data: expect.objectContaining({
          description: 'Test Merchant',
        }),
      })
    })

    it('should generate a transaction hash for deduplication', async () => {
      const mockUser = { id: '1', clerkId: 'test-user-123', email: 'test@example.com' }
      mockPrisma.user.findUnique.mockResolvedValue(mockUser)
      mockPrisma.transaction.findUnique.mockResolvedValue(null)
      mockPrisma.transaction.create.mockResolvedValue({} as any)

      const request = createMockRequest({
        method: 'POST',
        body: {
          date: '2024-01-15',
          amount: -87.50,
          merchant: 'Whole Foods',
          description: 'Grocery',
        },
      })

      await POST(request)

      // Check that a hash was generated and used
      expect(mockPrisma.transaction.create).toHaveBeenCalledWith({
        data: expect.objectContaining({
          hash: expect.any(String),
        }),
      })

      // Check that the hash was used to check for duplicates
      expect(mockPrisma.transaction.findUnique).toHaveBeenCalledWith({
        where: { hash: expect.any(String) },
      })
    })

    it('should handle database errors gracefully', async () => {
      mockPrisma.user.findUnique.mockRejectedValue(new Error('Database error'))

      const request = createMockRequest({
        method: 'POST',
        body: {
          date: '2024-01-15',
          amount: -10,
          merchant: 'Test',
        },
      })

      const response = await POST(request)
      const data = await response.json()

      expect(response.status).toBe(500)
      expect(data.error).toBe('Internal server error')
    })
  })

  describe('Transaction hash generation', () => {
    it('should generate consistent hashes for same data', async () => {
      const mockUser = { id: '1', clerkId: 'test-user-123', email: 'test@example.com' }
      mockPrisma.user.findUnique.mockResolvedValue(mockUser)
      mockPrisma.transaction.findUnique.mockResolvedValue(null)
      mockPrisma.transaction.create.mockResolvedValue({} as any)

      const transactionData = {
        date: '2024-01-15',
        amount: -87.50,
        merchant: 'Whole Foods',
        description: 'Grocery',
      }

      const request1 = createMockRequest({ method: 'POST', body: transactionData })
      await POST(request1)
      const hash1 = mockPrisma.transaction.create.mock.calls[0][0].data.hash

      vi.clearAllMocks()
      mockPrisma.user.findUnique.mockResolvedValue(mockUser)
      mockPrisma.transaction.findUnique.mockResolvedValue(null)
      mockPrisma.transaction.create.mockResolvedValue({} as any)

      const request2 = createMockRequest({ method: 'POST', body: transactionData })
      await POST(request2)
      const hash2 = mockPrisma.transaction.create.mock.calls[0][0].data.hash

      expect(hash1).toBe(hash2)
    })

    it('should generate different hashes for different data', async () => {
      const mockUser = { id: '1', clerkId: 'test-user-123', email: 'test@example.com' }
      mockPrisma.user.findUnique.mockResolvedValue(mockUser)
      mockPrisma.transaction.findUnique.mockResolvedValue(null)
      mockPrisma.transaction.create.mockResolvedValue({} as any)

      const request1 = createMockRequest({
        method: 'POST',
        body: {
          date: '2024-01-15',
          amount: -87.50,
          merchant: 'Whole Foods',
          description: 'Grocery',
        },
      })
      await POST(request1)
      const hash1 = mockPrisma.transaction.create.mock.calls[0][0].data.hash

      vi.clearAllMocks()
      mockPrisma.user.findUnique.mockResolvedValue(mockUser)
      mockPrisma.transaction.findUnique.mockResolvedValue(null)
      mockPrisma.transaction.create.mockResolvedValue({} as any)

      const request2 = createMockRequest({
        method: 'POST',
        body: {
          date: '2024-01-15',
          amount: -50.00, // Different amount
          merchant: 'Whole Foods',
          description: 'Grocery',
        },
      })
      await POST(request2)
      const hash2 = mockPrisma.transaction.create.mock.calls[0][0].data.hash

      expect(hash1).not.toBe(hash2)
    })
  })
})
