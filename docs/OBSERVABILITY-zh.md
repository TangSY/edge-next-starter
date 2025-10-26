# 观测与分析（Analytics Engine 示例）

本文档提供如何在 Cloudflare Analytics Engine 上进行简单查询与聚合的示例，基于本项目的事件写入约定：

- blobs: [b0=type, b1=method, b2=path, b3=errorType, b4=operation]
- doubles: [d0=timestamp, d1=duration_ms, d2=statusCode]
- indexes: [i0=requestId, i1=traceId, i2=table, i3=userId]

## 近 24 小时各路由平均耗时

示例查询思路：过滤 `type = 'http.request'`，时间范围过去 24 小时，按 `path` 聚合 `avg(duration_ms)`。

> 注意：实际查询语法以 Cloudflare Analytics Engine 的查询语言与 UI 为准，这里仅提供字段映射与统计思路。

关键字段：

- 路由路径：`blobs[2]`（path）
- 耗时：`doubles[1]`（duration_ms）
- 时间：`doubles[0]`（timestamp，毫秒）

## 按路由错误率统计（HTTP 4xx/5xx）

示例查询思路：过滤 `type = 'http.request'`，按 `path` 统计 `statusCode >= 400` 的比例：

- 总请求数：按 `path` 计数
- 错误请求数：按 `path` 且 `statusCode >= 400` 计数
- 错误率：错误请求数 / 总请求数

关键字段：

- 路由路径：`blobs[2]`（path）
- 状态码：`doubles[2]`（statusCode）

## 数据库慢查询排行

示例查询思路：过滤 `type = 'database.query'` 或 `type = 'database.slow_query'`，按 `operation` 或 `table` 聚合 `avg(duration_ms)` 并排序。

关键字段：

- 操作名：`blobs[4]`（operation）
- 表名：`indexes[2]`（table）
- 耗时：`doubles[1]`（duration_ms）

## Trace/请求级联路定位

示例查询思路：通过 `requestId` 或 `traceId`（`indexes[0]`/`indexes[1]`）过滤同一条链路的事件，观察跨路由、跨资源的时序与耗时，辅助问题排查。

---

建议在生产环境中：

- 为关键事件类型建立标准化的可视化看板（请求量、错误率、耗时分布）
- 按路径与操作做聚合统计，结合时间维度查看趋势
- 对慢查询、错误集中的路由设定阈值告警
