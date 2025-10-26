# Observability (Analytics Engine Examples)

This document shows example queries and aggregations on Cloudflare Analytics Engine, based on this project’s event schema:

- blobs: [b0=type, b1=method, b2=path, b3=errorType, b4=operation]
- doubles: [d0=timestamp, d1=duration_ms, d2=statusCode]
- indexes: [i0=requestId, i1=traceId, i2=table, i3=userId]

## Average Latency per Route (Last 24h)

Approach: filter `type = 'http.request'`, time range last 24h, group by `path`, aggregate `avg(duration_ms)`.

Note: Actual query syntax depends on Cloudflare Analytics Engine; below is a mapping and reasoning aid.

Key fields:

- Route path: `blobs[2]` (path)
- Duration: `doubles[1]` (duration_ms)
- Time: `doubles[0]` (timestamp, ms)

## Error Rate by Route (HTTP 4xx/5xx)

Approach: filter `type = 'http.request'`, group by `path`, compute share where `statusCode >= 400`.

- Total requests: count by `path`
- Error requests: count by `path` with `statusCode >= 400`
- Error rate: error / total

Key fields:

- Route path: `blobs[2]` (path)
- Status code: `doubles[2]` (statusCode)

## Slow DB Query Ranking

Approach: filter `type = 'database.query'` or `type = 'database.slow_query'`, group by `operation` or `table`, aggregate `avg(duration_ms)`, then sort.

Key fields:

- Operation: `blobs[4]` (operation)
- Table: `indexes[2]` (table)
- Duration: `doubles[1]` (duration_ms)

## Trace/Request Chain Diagnostics

Approach: filter by `requestId` or `traceId` (`indexes[0]`/`indexes[1]`) to gather events in the same chain, inspect timing across routes/resources.

---

Production tips:

- Build standard dashboards for key event types (traffic, error rate, latency)
- Aggregate by path and operation, review trends over time
- Set alerts for slow queries and routes with concentrated errors
