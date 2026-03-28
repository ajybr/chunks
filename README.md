## Distributed Dropbox-like Storage

![Demo](./public/demo.png)

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
