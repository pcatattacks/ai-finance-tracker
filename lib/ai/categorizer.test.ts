import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { categorizeTransaction, CATEGORIES } from './categorizer'

// Mock fetch for API calls
const mockFetch = vi.fn()
global.fetch = mockFetch

describe('AI Categorizer', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  afterEach(() => {
    delete process.env.ANTHROPIC_API_KEY
    delete process.env.OPENAI_API_KEY
  })

  describe('CATEGORIES', () => {
    it('should have correct category taxonomy', () => {
      expect(CATEGORIES).toHaveLength(11)

      const categoryNames = CATEGORIES.map(c => c.name)
      expect(categoryNames).toContain('Housing')
      expect(categoryNames).toContain('Groceries')
      expect(categoryNames).toContain('Dining')
      expect(categoryNames).toContain('Transport')
      expect(categoryNames).toContain('Shopping')
    })

    it('should have subcategories for relevant categories', () => {
      const housing = CATEGORIES.find(c => c.name === 'Housing')
      expect(housing?.subcategories).toContain('Rent')
      expect(housing?.subcategories).toContain('Mortgage')

      const dining = CATEGORIES.find(c => c.name === 'Dining')
      expect(dining?.subcategories).toContain('Restaurants')
      expect(dining?.subcategories).toContain('Fast Food')
    })
  })

  describe('Rule-based categorization (fallback)', () => {
    it('should categorize grocery stores', async () => {
      const result = await categorizeTransaction('Whole Foods', 'Grocery shopping', -87.50)

      expect(result.category).toBe('Groceries')
      expect(result.confidence).toBeGreaterThan(0)
      expect(result.explanation).toContain('grocery')
    })

    it('should categorize dining establishments', async () => {
      const result = await categorizeTransaction('Starbucks Coffee', 'Coffee', -5.50)

      expect(result.category).toBe('Dining')
      expect(result.confidence).toBeGreaterThan(0)
      expect(result.explanation).toContain('dining')
    })

    it('should categorize gas stations', async () => {
      const result = await categorizeTransaction('Shell', 'Fuel', -45.00)

      expect(result.category).toBe('Transport')
      expect(result.subcategory).toBe('Gas')
      expect(result.confidence).toBeGreaterThan(0)
    })

    it('should categorize subscription services', async () => {
      const result = await categorizeTransaction('Netflix', 'Monthly subscription', -15.99)

      expect(result.category).toBe('Subscriptions')
      expect(result.confidence).toBeGreaterThan(0)
    })

    it('should categorize positive amounts as income', async () => {
      const result = await categorizeTransaction('Employer Inc', 'Payroll', 2500.00)

      expect(result.category).toBe('Income')
      expect(result.confidence).toBe(0.5)
    })

    it('should return Uncategorized for unknown merchants', async () => {
      const result = await categorizeTransaction('Unknown Merchant', 'Unknown', -50.00)

      expect(result.category).toBe('Uncategorized')
      expect(result.confidence).toBe(0)
      expect(result.explanation).toContain('No matching rules')
    })

    it('should be case-insensitive', async () => {
      const result1 = await categorizeTransaction('WHOLE FOODS', 'GROCERY', -50.00)
      const result2 = await categorizeTransaction('whole foods', 'grocery', -50.00)

      expect(result1.category).toBe(result2.category)
      expect(result1.category).toBe('Groceries')
    })

    it('should match partial merchant names', async () => {
      const result = await categorizeTransaction('Trader Joes Market', 'Shopping', -75.00)

      expect(result.category).toBe('Groceries')
    })
  })

  describe('AI categorization with Claude', () => {
    beforeEach(() => {
      process.env.ANTHROPIC_API_KEY = 'test-api-key'
    })

    it('should call Claude API with correct parameters', async () => {
      mockFetch.mockResolvedValue({
        ok: true,
        json: async () => ({
          content: [
            {
              text: JSON.stringify({
                category: 'Groceries',
                subcategory: null,
                confidence: 0.95,
                explanation: 'Clear grocery store purchase',
              }),
            },
          ],
        }),
      })

      await categorizeTransaction('Whole Foods', 'Grocery shopping', -87.50)

      expect(mockFetch).toHaveBeenCalledWith(
        'https://api.anthropic.com/v1/messages',
        expect.objectContaining({
          method: 'POST',
          headers: expect.objectContaining({
            'x-api-key': 'test-api-key',
            'anthropic-version': '2023-06-01',
          }),
        })
      )

      const callBody = JSON.parse(mockFetch.mock.calls[0][1].body)
      expect(callBody.model).toBe('claude-3-haiku-20240307')
      expect(callBody.temperature).toBeLessThanOrEqual(0.2)
      expect(callBody.messages[0].content).toContain('Whole Foods')
    })

    it('should parse Claude response correctly', async () => {
      mockFetch.mockResolvedValue({
        ok: true,
        json: async () => ({
          content: [
            {
              text: JSON.stringify({
                category: 'Transport',
                subcategory: 'Gas',
                confidence: 0.92,
                explanation: 'Gas station fuel purchase',
              }),
            },
          ],
        }),
      })

      const result = await categorizeTransaction('Shell', 'Fuel', -45.00)

      expect(result.category).toBe('Transport')
      expect(result.subcategory).toBe('Gas')
      expect(result.confidence).toBe(0.92)
      expect(result.explanation).toBe('Gas station fuel purchase')
    })

    it('should handle JSON in markdown code blocks', async () => {
      mockFetch.mockResolvedValue({
        ok: true,
        json: async () => ({
          content: [
            {
              text: '```json\n{"category":"Groceries","confidence":0.95,"explanation":"Grocery store"}\n```',
            },
          ],
        }),
      })

      const result = await categorizeTransaction('Whole Foods', 'Shopping', -50.00)

      expect(result.category).toBe('Groceries')
      expect(result.confidence).toBe(0.95)
    })

    it('should clamp confidence scores between 0 and 1', async () => {
      mockFetch.mockResolvedValue({
        ok: true,
        json: async () => ({
          content: [
            {
              text: JSON.stringify({
                category: 'Groceries',
                confidence: 1.5, // Invalid - too high
                explanation: 'Test',
              }),
            },
          ],
        }),
      })

      const result = await categorizeTransaction('Test', 'Test', -10.00)

      expect(result.confidence).toBe(1) // Clamped to 1
    })

    it('should fall back to rule-based on API error', async () => {
      mockFetch.mockRejectedValue(new Error('API Error'))

      const result = await categorizeTransaction('Whole Foods', 'Grocery', -50.00)

      expect(result.category).toBe('Groceries')
      expect(result.confidence).toBeGreaterThan(0)
    })

    it('should fall back to rule-based on invalid JSON response', async () => {
      mockFetch.mockResolvedValue({
        ok: true,
        json: async () => ({
          content: [{ text: 'Invalid response without JSON' }],
        }),
      })

      const result = await categorizeTransaction('Whole Foods', 'Grocery', -50.00)

      expect(result.category).toBe('Groceries')
    })
  })

  describe('AI categorization with OpenAI', () => {
    beforeEach(() => {
      process.env.OPENAI_API_KEY = 'test-openai-key'
    })

    it('should call OpenAI API with correct parameters', async () => {
      mockFetch.mockResolvedValue({
        ok: true,
        json: async () => ({
          choices: [
            {
              message: {
                content: JSON.stringify({
                  category: 'Dining',
                  subcategory: 'Coffee Shops',
                  confidence: 0.88,
                  explanation: 'Coffee shop purchase',
                }),
              },
            },
          ],
        }),
      })

      await categorizeTransaction('Starbucks', 'Coffee', -5.50)

      expect(mockFetch).toHaveBeenCalledWith(
        'https://api.openai.com/v1/chat/completions',
        expect.objectContaining({
          method: 'POST',
          headers: expect.objectContaining({
            Authorization: 'Bearer test-openai-key',
          }),
        })
      )

      const callBody = JSON.parse(mockFetch.mock.calls[0][1].body)
      expect(callBody.model).toBe('gpt-3.5-turbo')
      expect(callBody.temperature).toBe(0.2)
    })

    it('should parse OpenAI response correctly', async () => {
      mockFetch.mockResolvedValue({
        ok: true,
        json: async () => ({
          choices: [
            {
              message: {
                content: JSON.stringify({
                  category: 'Subscriptions',
                  subcategory: 'Streaming',
                  confidence: 0.99,
                  explanation: 'Streaming service subscription',
                }),
              },
            },
          ],
        }),
      })

      const result = await categorizeTransaction('Netflix', 'Monthly sub', -15.99)

      expect(result.category).toBe('Subscriptions')
      expect(result.subcategory).toBe('Streaming')
      expect(result.confidence).toBe(0.99)
    })
  })

  describe('Prompt building', () => {
    it('should include all categories in prompt', async () => {
      process.env.ANTHROPIC_API_KEY = 'test-key'

      mockFetch.mockResolvedValue({
        ok: true,
        json: async () => ({
          content: [{ text: '{"category":"Groceries","confidence":0.9,"explanation":"Test"}' }],
        }),
      })

      await categorizeTransaction('Test', 'Test', -10.00)

      const callBody = JSON.parse(mockFetch.mock.calls[0][1].body)
      const prompt = callBody.messages[0].content

      CATEGORIES.forEach(category => {
        expect(prompt).toContain(category.name)
      })
    })

    it('should include transaction details in prompt', async () => {
      process.env.ANTHROPIC_API_KEY = 'test-key'

      mockFetch.mockResolvedValue({
        ok: true,
        json: async () => ({
          content: [{ text: '{"category":"Groceries","confidence":0.9,"explanation":"Test"}' }],
        }),
      })

      await categorizeTransaction('Whole Foods', 'Grocery shopping', -87.50)

      const callBody = JSON.parse(mockFetch.mock.calls[0][1].body)
      const prompt = callBody.messages[0].content

      expect(prompt).toContain('Whole Foods')
      expect(prompt).toContain('Grocery shopping')
      expect(prompt).toContain('-87.50')
    })

    it('should include few-shot examples in prompt', async () => {
      process.env.ANTHROPIC_API_KEY = 'test-key'

      mockFetch.mockResolvedValue({
        ok: true,
        json: async () => ({
          content: [{ text: '{"category":"Groceries","confidence":0.9,"explanation":"Test"}' }],
        }),
      })

      await categorizeTransaction('Test', 'Test', -10.00)

      const callBody = JSON.parse(mockFetch.mock.calls[0][1].body)
      const prompt = callBody.messages[0].content

      expect(prompt).toContain('Examples:')
      expect(prompt).toContain('Whole Foods')
      expect(prompt).toContain('Netflix')
    })
  })

  describe('Edge cases', () => {
    it('should handle empty strings', async () => {
      const result = await categorizeTransaction('', '', -10.00)

      expect(result.category).toBe('Uncategorized')
    })

    it('should handle very long merchant names', async () => {
      const longName = 'A'.repeat(500)
      const result = await categorizeTransaction(longName, 'Test', -10.00)

      expect(result).toHaveProperty('category')
      expect(result).toHaveProperty('confidence')
    })

    it('should handle zero amounts', async () => {
      const result = await categorizeTransaction('Test', 'Test', 0)

      expect(result).toHaveProperty('category')
    })

    it('should handle very large amounts', async () => {
      const result = await categorizeTransaction('Test', 'Test', -999999.99)

      expect(result).toHaveProperty('category')
    })

    it('should handle special characters in merchant names', async () => {
      const result = await categorizeTransaction("McDonald's & Co.", 'Fast food', -8.50)

      expect(result.category).toBe('Dining')
    })
  })
})
