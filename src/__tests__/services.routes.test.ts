/**
 * Services Routes Tests
 * Covers: GET /services, GET /services/categories, GET /services/:id,
 *         POST /services, PUT /services/:id, DELETE /services/:id,
 *         POST /services/:id/activate, GET /services/admin/stats,
 *         POST /services/admin/refresh
 */
import { jest, describe, it, expect, beforeAll, beforeEach } from '@jest/globals';

// Mock auth
let mockAuthUser: any = { id: 'user-admin', role: 'admin' };

jest.unstable_mockModule('../middleware/auth.middleware.js', () => ({
  authenticate: (_req: any, _res: any, next: any) => {
    if (mockAuthUser) {
      _req.user = mockAuthUser;
    } else {
      return _res.status(401).json({ success: false, error: 'Unauthorized' });
    }
    next();
  },
  requireRole:
    (...roles: string[]) =>
    (req: any, res: any, next: any) => {
      if (req.user && roles.includes(req.user.role)) return next();
      return res.status(403).json({ success: false, error: 'Forbidden' });
    },
  AuthenticatedRequest: {},
}));

// Mock supabase
const mockSelect = jest.fn<any>();
const mockInsert = jest.fn<any>();
const mockUpdate = jest.fn<any>();
const mockEq = jest.fn<any>();
const mockSingle = jest.fn<any>();

function createChain(finalResult: any = { data: null, error: null }): any {
  const chain: any = {};
  chain.select = mockSelect.mockReturnValue(chain);
  chain.insert = mockInsert.mockReturnValue(chain);
  chain.update = mockUpdate.mockReturnValue(chain);
  chain.eq = mockEq.mockReturnValue(chain);
  chain.single = mockSingle.mockResolvedValue(finalResult);
  return chain;
}

const mockFrom = jest.fn<any>();

jest.unstable_mockModule('../lib/supabase.js', () => ({
  supabase: { from: mockFrom },
  createServiceClient: () => ({ from: mockFrom }),
}));

// Mock service catalog
const mockGetAll = jest.fn<any>();
const mockGetCategories = jest.fn<any>();
const mockGetById = jest.fn<any>();
const mockSearch = jest.fn<any>();
const mockUpsert = jest.fn<any>();
const mockRefresh = jest.fn<any>();
const mockGetStats = jest.fn<any>();

jest.unstable_mockModule('../services/service-catalog.service.js', () => ({
  serviceCatalog: {
    getAll: mockGetAll,
    getCategories: mockGetCategories,
    getById: mockGetById,
    search: mockSearch,
    upsert: mockUpsert,
    refresh: mockRefresh,
    getStats: mockGetStats,
  },
}));

jest.unstable_mockModule('../utils/errors.js', () => ({
  asyncHandler: (fn: any) => (req: any, res: any, next: any) =>
    Promise.resolve(fn(req, res, next)).catch(next),
  AppError: class AppError extends Error {
    statusCode: number;
    constructor(message: string, statusCode: number) {
      super(message);
      this.statusCode = statusCode;
    }
  },
}));

const { default: servicesRouter } = await import('../routes/services.routes.js');

const expressModule = await import('express');
const express = expressModule.default;
const { default: request } = await import('supertest');

let app: any;

beforeAll(() => {
  app = express();
  app.use(express.json());
  app.use('/services', servicesRouter);
});

beforeEach(() => {
  jest.clearAllMocks();
  mockAuthUser = { id: 'user-admin', role: 'admin' };
});

const SAMPLE_SERVICE = {
  id: '550e8400-e29b-41d4-a716-446655440000',
  name: 'General Consultation',
  description: 'Standard doctor visit',
  category: 'Primary Care',
  code: '99213',
  code_type: 'CPT',
  default_price: 150,
  currency: 'USD',
  duration_minutes: 30,
  is_active: true,
  requires_authorization: false,
  metadata: {},
  created_at: '2026-01-01T00:00:00Z',
  updated_at: '2026-01-01T00:00:00Z',
};

describe('Services Routes', () => {
  // ====================
  // PUBLIC ROUTES
  // ====================

  describe('GET /services', () => {
    it('returns paginated list of services from memory', async () => {
      mockGetAll.mockReturnValue([SAMPLE_SERVICE]);

      const res = await request(app).get('/services').expect(200);

      expect(res.body.success).toBe(true);
      expect(res.body.data).toHaveLength(1);
      expect(res.body.data[0].name).toBe('General Consultation');
      expect(res.body.source).toBe('memory');
      expect(res.body.pagination).toBeDefined();
    });

    it('filters by category', async () => {
      mockGetAll.mockReturnValue([SAMPLE_SERVICE]);

      const res = await request(app).get('/services?category=Primary%20Care').expect(200);

      expect(res.body.success).toBe(true);
    });

    it('searches services', async () => {
      mockSearch.mockReturnValue([SAMPLE_SERVICE]);
      mockGetAll.mockReturnValue([SAMPLE_SERVICE]);

      const res = await request(app).get('/services?search=consult').expect(200);

      expect(res.body.success).toBe(true);
      expect(mockSearch).toHaveBeenCalledWith('consult', false);
    });

    it('applies pagination', async () => {
      mockGetAll.mockReturnValue(Array(10).fill(SAMPLE_SERVICE));

      const res = await request(app).get('/services?limit=5&offset=2').expect(200);

      expect(res.body.data).toHaveLength(5);
      expect(res.body.pagination.limit).toBe(5);
      expect(res.body.pagination.offset).toBe(2);
    });
  });

  describe('GET /services/categories', () => {
    it('returns categories from memory', async () => {
      mockGetCategories.mockReturnValue(['Primary Care', 'Dental', 'Lab']);

      const res = await request(app).get('/services/categories').expect(200);

      expect(res.body.success).toBe(true);
      expect(res.body.data).toEqual(['Primary Care', 'Dental', 'Lab']);
      expect(res.body.source).toBe('memory');
    });
  });

  describe('GET /services/:id', () => {
    it('returns a service by ID', async () => {
      mockGetById.mockReturnValue(SAMPLE_SERVICE);

      const res = await request(app).get(`/services/${SAMPLE_SERVICE.id}`).expect(200);

      expect(res.body.success).toBe(true);
      expect(res.body.data.name).toBe('General Consultation');
    });

    it('returns 404 for unknown service', async () => {
      mockGetById.mockReturnValue(null);

      const res = await request(app)
        .get('/services/550e8400-e29b-41d4-a716-446655440099')
        .expect(404);

      expect(res.body.success).toBe(false);
      expect(res.body.error).toBe('Service not found');
    });

    it('validates that id is a UUID', async () => {
      const res = await request(app).get('/services/not-a-uuid');

      // Should reject with 400 due to UUID validation
      expect(res.status).toBe(400);
    });
  });

  // ====================
  // ADMIN ROUTES
  // ====================

  describe('POST /services', () => {
    it('creates a new service (admin)', async () => {
      const newService = {
        name: 'Blood Test',
        category: 'Lab',
        default_price: 75,
      };

      const chain = createChain({ data: { ...SAMPLE_SERVICE, ...newService }, error: null });
      mockFrom.mockReturnValue(chain);
      mockInsert.mockReturnValue(chain);
      mockSelect.mockReturnValue(chain);

      const res = await request(app).post('/services').send(newService).expect(201);

      expect(res.body.success).toBe(true);
      expect(mockUpsert).toHaveBeenCalled();
    });

    it('rejects non-admin users', async () => {
      mockAuthUser = { id: 'user-patient', role: 'patient' };

      const res = await request(app)
        .post('/services')
        .send({ name: 'Test', category: 'Lab', default_price: 50 })
        .expect(403);

      expect(res.body.success).toBe(false);
    });

    it('validates body schema', async () => {
      const res = await request(app).post('/services').send({ name: '' }); // missing required fields

      // Should reject with 400 due to schema validation
      expect(res.status).toBe(400);
    });
  });

  describe('PUT /services/:id', () => {
    it('updates a service (admin)', async () => {
      const chain = createChain({ data: { ...SAMPLE_SERVICE, default_price: 200 }, error: null });
      mockFrom.mockReturnValue(chain);
      mockUpdate.mockReturnValue(chain);

      const res = await request(app)
        .put(`/services/${SAMPLE_SERVICE.id}`)
        .send({ default_price: 200 })
        .expect(200);

      expect(res.body.success).toBe(true);
      expect(mockUpsert).toHaveBeenCalled();
    });

    it('returns 404 for non-existent service', async () => {
      const chain = createChain({ data: null, error: { message: 'Not found' } });
      mockFrom.mockReturnValue(chain);
      mockUpdate.mockReturnValue(chain);

      const res = await request(app)
        .put(`/services/${SAMPLE_SERVICE.id}`)
        .send({ default_price: 200 })
        .expect(404);

      expect(res.body.success).toBe(false);
    });
  });

  describe('DELETE /services/:id', () => {
    it('soft-deletes a service (admin)', async () => {
      const chain = createChain({ data: { ...SAMPLE_SERVICE, is_active: false }, error: null });
      mockFrom.mockReturnValue(chain);
      mockUpdate.mockReturnValue(chain);

      const res = await request(app).delete(`/services/${SAMPLE_SERVICE.id}`).expect(200);

      expect(res.body.success).toBe(true);
      expect(res.body.message).toContain('deactivated');
      expect(mockUpsert).toHaveBeenCalled();
    });
  });

  describe('POST /services/:id/activate', () => {
    it('reactivates a soft-deleted service', async () => {
      const chain = createChain({ data: { ...SAMPLE_SERVICE, is_active: true }, error: null });
      mockFrom.mockReturnValue(chain);
      mockUpdate.mockReturnValue(chain);

      const res = await request(app).post(`/services/${SAMPLE_SERVICE.id}/activate`).expect(200);

      expect(res.body.success).toBe(true);
      expect(res.body.message).toContain('activated');
    });
  });

  describe('GET /services/admin/stats', () => {
    it('returns catalog stats (admin)', async () => {
      mockGetStats.mockReturnValue({ total: 42, active: 38, categories: 6 });

      const res = await request(app).get('/services/admin/stats').expect(200);

      expect(res.body.success).toBe(true);
      expect(res.body.data.total).toBe(42);
    });

    it('rejects non-admin users', async () => {
      mockAuthUser = { id: 'user-patient', role: 'patient' };

      await request(app).get('/services/admin/stats').expect(403);
    });
  });

  describe('POST /services/admin/refresh', () => {
    it('refreshes catalog from database (admin)', async () => {
      mockRefresh.mockResolvedValue(undefined);
      mockGetStats.mockReturnValue({ total: 50, active: 45, categories: 8 });

      const res = await request(app).post('/services/admin/refresh').expect(200);

      expect(res.body.success).toBe(true);
      expect(mockRefresh).toHaveBeenCalled();
    });
  });
});
