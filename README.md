## Distributed Dropbox-like Storage

```
Client
↓
API Gateway
↓
Upload Service ──→ MQ ──→ Chunk Workers ──→ Storage
    │                 │
    │                 └──→ Metadata Service (DB)
    │
    └──→ Events → MQ → Sync/Notification/Analytics
```
