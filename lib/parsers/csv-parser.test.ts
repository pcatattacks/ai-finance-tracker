import { describe, it, expect } from 'vitest'
import { parseCSV, type CSVParseResult } from './csv-parser'

describe('CSV Parser', () => {
  describe('parseCSV', () => {
    it('should parse valid CSV with standard headers', () => {
      const csv = `Date,Merchant,Description,Amount
2024-01-15,Whole Foods,Grocery shopping,-87.50
2024-01-16,Netflix,Monthly subscription,-15.99
2024-01-17,Shell,Fuel,-45.00`

      const result: CSVParseResult = parseCSV(csv)

      expect(result.success).toBe(true)
      expect(result.transactions).toHaveLength(3)
      expect(result.errors).toHaveLength(0)

      // Check first transaction
      expect(result.transactions[0]).toMatchObject({
        merchant: 'Whole Foods',
        description: 'Grocery shopping',
        amount: -87.50,
      })
      expect(result.transactions[0].date).toBeInstanceOf(Date)
    })

    it('should handle different column name variations', () => {
      const csv = `Transaction Date,Payee,Memo,Value
01/15/2024,Starbucks,Coffee,-5.50`

      const result = parseCSV(csv)

      expect(result.success).toBe(true)
      expect(result.transactions).toHaveLength(1)
      expect(result.transactions[0]).toMatchObject({
        merchant: 'Starbucks',
        description: 'Coffee',
        amount: -5.50,
      })
    })

    it('should handle various date formats', () => {
      const testCases = [
        { date: '2024-01-15', expected: new Date('2024-01-15') },
        { date: '01/15/2024', expected: new Date('2024-01-15') },
        { date: '01-15-2024', expected: new Date('2024-01-15') },
      ]

      testCases.forEach(({ date, expected }) => {
        const csv = `Date,Merchant,Amount\n${date},Test Merchant,-10.00`
        const result = parseCSV(csv)

        expect(result.success).toBe(true)
        expect(result.transactions[0].date.toDateString()).toBe(
          expected.toDateString()
        )
      })
    })

    it('should handle various amount formats', () => {
      const testCases = [
        { amount: '-$87.50', expected: -87.50 },
        { amount: '$87.50', expected: 87.50 },
        { amount: '(87.50)', expected: -87.50 }, // Accounting format
        { amount: '1,234.56', expected: 1234.56 },
        { amount: '-1,234.56', expected: -1234.56 },
      ]

      testCases.forEach(({ amount, expected }) => {
        const csv = `Date,Merchant,Amount\n2024-01-15,Test,${amount}`
        const result = parseCSV(csv)

        expect(result.success).toBe(true)
        expect(result.transactions[0].amount).toBe(expected)
      })
    })

    it('should skip empty lines', () => {
      const csv = `Date,Merchant,Amount
2024-01-15,Test1,-10.00

2024-01-16,Test2,-20.00`

      const result = parseCSV(csv)

      expect(result.success).toBe(true)
      expect(result.transactions).toHaveLength(2)
    })

    it('should skip rows with missing required fields', () => {
      const csv = `Date,Merchant,Amount
2024-01-15,Test1,-10.00
2024-01-16,,-20.00
,Test3,-30.00
2024-01-17,Test4,-40.00`

      const result = parseCSV(csv)

      expect(result.transactions).toHaveLength(2)
      expect(result.transactions[0].merchant).toBe('Test1')
      expect(result.transactions[1].merchant).toBe('Test4')
    })

    it('should handle case-insensitive headers', () => {
      const csv = `DATE,MERCHANT,AMOUNT
2024-01-15,Test,-10.00`

      const result = parseCSV(csv)

      expect(result.success).toBe(true)
      expect(result.transactions).toHaveLength(1)
    })

    it('should trim whitespace from values', () => {
      const csv = `Date,Merchant,Amount
2024-01-15,  Whole Foods  ,  -87.50  `

      const result = parseCSV(csv)

      expect(result.success).toBe(true)
      expect(result.transactions[0].merchant).toBe('Whole Foods')
    })

    it('should use merchant as description if description is missing', () => {
      const csv = `Date,Merchant,Amount
2024-01-15,Whole Foods,-87.50`

      const result = parseCSV(csv)

      expect(result.success).toBe(true)
      expect(result.transactions[0].description).toBe('Whole Foods')
    })

    it('should handle merchant field named as Description', () => {
      const csv = `Date,Description,Amount
2024-01-15,Whole Foods,-87.50`

      const result = parseCSV(csv)

      expect(result.success).toBe(true)
      expect(result.transactions[0].merchant).toBe('Whole Foods')
      expect(result.transactions[0].description).toBe('Whole Foods')
    })

    it('should preserve raw data', () => {
      const csv = `Date,Merchant,Amount,Extra Field
2024-01-15,Test,-10.00,Extra Value`

      const result = parseCSV(csv)

      expect(result.success).toBe(true)
      expect(result.transactions[0].rawData).toHaveProperty('extra field')
      expect(result.transactions[0].rawData['extra field']).toBe('Extra Value')
    })

    it('should return error for invalid CSV', () => {
      const csv = `This is not a valid CSV`

      const result = parseCSV(csv)

      expect(result.success).toBe(false)
      expect(result.errors.length).toBeGreaterThan(0)
    })

    it('should return error when required columns are missing', () => {
      const csv = `Name,Value
Test,100`

      const result = parseCSV(csv)

      expect(result.success).toBe(false)
      expect(result.errors[0]).toContain('Could not detect required columns')
    })

    it('should handle invalid date formats', () => {
      const csv = `Date,Merchant,Amount
invalid-date,Test,-10.00`

      const result = parseCSV(csv)

      expect(result.errors.length).toBeGreaterThan(0)
      expect(result.errors[0]).toContain('Invalid date format')
    })

    it('should handle invalid amount formats', () => {
      const csv = `Date,Merchant,Amount
2024-01-15,Test,not-a-number`

      const result = parseCSV(csv)

      expect(result.errors.length).toBeGreaterThan(0)
      expect(result.errors[0]).toContain('Invalid amount')
    })

    it('should continue parsing after encountering errors', () => {
      const csv = `Date,Merchant,Amount
2024-01-15,Test1,-10.00
invalid-date,Test2,-20.00
2024-01-17,Test3,-30.00`

      const result = parseCSV(csv)

      expect(result.transactions).toHaveLength(2)
      expect(result.errors.length).toBeGreaterThan(0)
      expect(result.transactions[0].merchant).toBe('Test1')
      expect(result.transactions[1].merchant).toBe('Test3')
    })

    it('should handle CSV with semicolon delimiter', () => {
      const csv = `Date;Merchant;Amount
2024-01-15;Test;-10.00`

      const result = parseCSV(csv)

      // Papa Parse auto-detects delimiter
      expect(result.success).toBe(true)
      expect(result.transactions).toHaveLength(1)
    })

    it('should handle positive amounts (income)', () => {
      const csv = `Date,Merchant,Amount
2024-01-15,Employer Payroll,2500.00
2024-01-16,Refund,50.00`

      const result = parseCSV(csv)

      expect(result.success).toBe(true)
      expect(result.transactions).toHaveLength(2)
      expect(result.transactions[0].amount).toBe(2500.00)
      expect(result.transactions[1].amount).toBe(50.00)
    })

    it('should handle large transaction datasets', () => {
      let csv = 'Date,Merchant,Amount\n'
      for (let i = 0; i < 1000; i++) {
        csv += `2024-01-${String((i % 28) + 1).padStart(2, '0')},Merchant ${i},-${(Math.random() * 100).toFixed(2)}\n`
      }

      const result = parseCSV(csv)

      expect(result.success).toBe(true)
      expect(result.transactions).toHaveLength(1000)
    })

    it('should handle special characters in merchant names', () => {
      const csv = `Date,Merchant,Amount
2024-01-15,"McDonald's",-10.00
2024-01-16,"Coffee & Tea Co.",-5.50`

      const result = parseCSV(csv)

      expect(result.success).toBe(true)
      expect(result.transactions).toHaveLength(2)
      expect(result.transactions[0].merchant).toBe("McDonald's")
      expect(result.transactions[1].merchant).toBe('Coffee & Tea Co.')
    })
  })
})
