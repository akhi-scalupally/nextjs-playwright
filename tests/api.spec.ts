import { test, expect } from '@playwright/test';
import { clearTestData } from '../lib/db-sqlite';

test.describe('API Endpoints', () => {
  test.beforeEach(async () => {
    // Clear test database before each API test
    clearTestData();
  });

  test('address API GET endpoint works', async ({ request }) => {
    const response = await request.get('/api/address');
    expect(response.status()).toBe(200);
    
    const data = await response.json();
    expect(data).toHaveProperty('data');
  });

  test('address API POST endpoint works with valid data', async ({ request }) => {
    const testAddress = {
      name: 'Test User',
      line1: '123 Test Street',
      city: 'Test City',
      postalCode: '12345',
      country: 'Test Country'
    };

    const response = await request.post('/api/address', {
      data: testAddress
    });
    
    expect(response.status()).toBe(201);
    
    const data = await response.json();
    expect(data).toHaveProperty('data');
    expect(data.data).toHaveProperty('id');
  });

  test('address API POST endpoint validates required fields', async ({ request }) => {
    const invalidAddress = {
      name: '',
      line1: '',
      city: '',
      postalCode: '',
      country: ''
    };

    const response = await request.post('/api/address', {
      data: invalidAddress
    });
    
    expect(response.status()).toBe(400);
    
    const data = await response.json();
    expect(data).toHaveProperty('error');
    expect(data).toHaveProperty('missing');
  });
});

test.describe('API Tests', () => {
  test.beforeEach(async () => {
    // Clear test database before each API test
    clearTestData();
  });

  test('address API GET endpoint', async ({ request }) => {
    const response = await request.get('/api/address');
    expect(response.status()).toBe(200);
    
    const data = await response.json();
    expect(data).toHaveProperty('data');
    expect(Array.isArray(data.data)).toBe(true);
  });

  test('address API POST with valid data', async ({ request }) => {
    const testAddress = {
      name: 'John Doe',
      line1: '123 Main Street',
      line2: 'Apt 4B',
      city: 'New York',
      state: 'NY',
      postalCode: '10001',
      country: 'United States',
      phone: '+1-555-123-4567'
    };

    const response = await request.post('/api/address', {
      data: testAddress
    });
    
    expect(response.status()).toBe(201);
    
    const data = await response.json();
    expect(data).toHaveProperty('data');
    expect(data.data).toHaveProperty('id');
    expect(data.data.name).toBe(testAddress.name);
    expect(data.data.line1).toBe(testAddress.line1);
    expect(data.data.city).toBe(testAddress.city);
  });

  test('address API POST with missing required fields', async ({ request }) => {
    const invalidAddress = {
      name: '',
      line1: '',
      city: '',
      postalCode: '',
      country: ''
    };

    const response = await request.post('/api/address', {
      data: invalidAddress
    });
    
    expect(response.status()).toBe(400);
    
    const data = await response.json();
    expect(data).toHaveProperty('error');
    expect(data).toHaveProperty('missing');
    expect(Array.isArray(data.missing)).toBe(true);
  });

  test('address API POST with partial data', async ({ request }) => {
    const partialAddress = {
      name: 'Jane Doe',
      line1: '456 Oak Avenue',
      city: 'Los Angeles',
      postalCode: '90210',
      country: 'United States'
      // Missing optional fields like line2, state, phone
    };

    const response = await request.post('/api/address', {
      data: partialAddress
    });
    
    expect(response.status()).toBe(201);
    
    const data = await response.json();
    expect(data).toHaveProperty('data');
    expect(data.data.name).toBe(partialAddress.name);
    expect(data.data.line1).toBe(partialAddress.line1);
  });
});
