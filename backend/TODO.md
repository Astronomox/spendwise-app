# Performance Optimization TODO

Target: <100ms response time (p95)

## Steps

- [ ] 1. Add composite indexes to Prisma schema for faster analytics queries
- [x] 2. Optimize Prisma client configuration (connection pooling, logging)
- [x] 3. Add in-memory LRU cache for category keywords in `categoryDetectionService.js`
- [x] 4. Add in-memory LRU cache for merchant keywords in `merchantService.js`

- [ ] 5. Optimize `categoryService.js` to avoid N+1 query with raw SQL CTE
- [x] 6. Add compression, rate limiting, and conditional Swagger to `server.js`

- [ ] 7. Lower slow-request threshold to 100ms in `requestLogger.js`
- [ ] 8. Optimize SMS duplicate check with index/hashed lookup in `smsController.js`
- [x] 9. Install new dependencies (`compression`, `express-rate-limit`)

- [ ] 10. Run Prisma migration and load test

