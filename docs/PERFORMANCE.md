# Performance Benchmarks & Budgets

This document defines performance budgets and provides locally reproducible benchmarks.

## Performance Budgets

### Routing Engine
- **1000 stops**: < 5 seconds (tested in routing_optimization.test.ts)
- **100 stops**: < 500ms
- **10 stops**: < 50ms

### Agreements Evaluation
- **100 rules**: < 100ms
- **10 rules**: < 10ms
- **Single rule**: < 1ms

### Importers
- **10,000 rows**: < 10 seconds
- **1,000 rows**: < 1 second
- **100 rows**: < 100ms

### Wallet Operations
- **Balance check**: < 10ms
- **Debit transaction**: < 50ms
- **Transaction history (100 entries)**: < 100ms

## Running Benchmarks

### Routing Performance
```bash
npm run test:unit
# Look for routing.optimization test results
# Performance smoke test runs 1000 stops
```

### Importer Performance
```bash
# Generate large test file
node -e "console.log('id,type,size,idTag'); for(let i=0;i<10000;i++) console.log(\`A\${i},rolloff,30yd,TAG\${i}\`)" > /tmp/large_assets.csv

# Time the import
time node importers/excel/import_assets.mjs /tmp/large_assets.csv test-org
```

### Agreements Performance
```bash
# Create large agreement with 100 rules
node scripts/agreements/benchmark_eval.ts
```

## Optimization Guidelines

### Routing
- Use nearest-neighbor heuristic (O(n²) acceptable for n < 1000)
- Avoid complex optimization algorithms (TSP solvers) for Phase-1
- Cache landfill distances when possible
- Batch dump insertions

### Agreements
- Keep rule evaluation pure (no I/O)
- Use early-exit filters (check event type first)
- Avoid regex in hot paths
- Cache compiled rule predicates

### Importers
- Stream large files instead of loading into memory
- Use batch inserts for database operations
- Validate schema before processing rows
- Report progress for files > 1000 rows

### Wallet
- Use in-memory store for dev/testing
- Batch transaction writes for production
- Index by orgId for fast lookups
- Implement read-through cache for balances

## Profiling

### CPU Profiling
```bash
node --cpu-prof scripts/agreements/eval_and_settle.ts ...
# Analyze with Chrome DevTools
```

### Memory Profiling
```bash
node --heap-prof importers/excel/import_assets.mjs large_file.csv
# Analyze with Chrome DevTools
```

### Flame Graphs
```bash
npm install -g 0x
0x scripts/routing/plan_route.ts
```

## Performance Regression Detection

Run benchmarks in CI:
```bash
npm run test:unit
# Fails if routing.optimization performance smoke exceeds 5s
```

Track metrics over time:
```bash
tsx scripts/perf/track_metrics.ts >> out/perf_history.log
```

## Known Bottlenecks

1. **Routing with 10,000+ stops**: O(n²) becomes slow
   - Mitigation: Split into multiple routes (maxStops option)
   
2. **Large CSV imports**: Memory usage grows linearly
   - Mitigation: Stream processing (future enhancement)
   
3. **Agreement evaluation with 1000+ rules**: Linear scan
   - Mitigation: Index rules by event type (future enhancement)

## Future Optimizations

- [ ] Implement streaming CSV parser
- [ ] Add rule indexing by event type
- [ ] Cache geocoding results
- [ ] Implement route plan caching
- [ ] Add database query optimization
- [ ] Implement connection pooling

