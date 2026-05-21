# LRS Kanban (4ga Boards)

## Oracle Cloud Deployment & Operations Runbook

This document explains how to connect to the Oracle VM, back up the PostgreSQL database, update the 4ga Boards (Planka fork) Kanban instance, and recover safely if anything breaks.

This README is intended to be the **single source of truth** for running and maintaining the LRS Kanban board.

---

## 1. Server Access (Oracle Cloud)

### SSH into the Oracle VM

From your local machine:

```bash
ssh -i "~/.ssh/planka-key.pem.key" ubuntu@<ORACLE_PUBLIC_IP>
```

Example:

```bash
ssh -i "~/.ssh/planka-key.pem.key" ubuntu@192.18.146.194
```

---

## 2. Project Structure

```
~/lrs_kanban/
├─ Caddyfile
├─ docker-compose.yml        # Reverse proxy
├─ backups/                  # Database backups
└─ app/                      # 4ga Boards git repository
   ├─ docker-compose.yml     # Main application stack
   ├─ server/
   ├─ client/
   └─ ...
```

⚠️ **Important**
- Only `~/lrs_kanban/app` is a git repository
- All `git` commands must be run from inside the `app` directory

---

## 3. GitHub Authentication

SSH authentication is required and confirmed working.

```bash
ssh -T git@github.com
```

Expected output:

```
Hi LucidRainStudios! You've successfully authenticated, but GitHub does not provide shell access.
```

---

## 4. Environment Overview

### Application URL

```
BASE_URL=http://<ORACLE_PUBLIC_IP>/
```

### PostgreSQL

- Container: `app-db-1`
- Image: `postgres:16-alpine`
- Port: `5432`
- Docker volume: `app_db-data`

### Database Connection

Defined in Docker Compose:

```
postgresql://planka:<PASSWORD>@postgres:5432/planka
```

### Default Admin User

```
DEFAULT_ADMIN_EMAIL=admin@lucidrainstudios.com
DEFAULT_ADMIN_USERNAME=admin
DEFAULT_ADMIN_NAME=Lucid Rain Admin
DEFAULT_ADMIN_PASSWORD=********
```

⚠️ Passwords should ideally be stored in secrets, not committed files.

---

## 5. Build & Deploy Model

> 🚫 **The Oracle server must NOT build the app locally.**
> Builds happen on your **local development PC** and are pushed to Docker Hub.
> The Oracle server only **pulls the finished image** and restarts the container.
>
> Attempting `docker compose up -d --build` on the server will fail with:
> `pull access denied for lrs-4gaboards, repository does not exist or may require 'docker login'`

---

## 6. Updating The Server (Recommended Workflow)

### Step 1 — Build Locally

Run on your **local development PC** (from the repo root):

```bash
docker build -t ricardorheeder/4gaboards:latest .
```

---

### Step 2 — Push Image

Run on your **local development PC**:

(If you haven't logged in: `docker login` first.)

```bash
docker push ricardorheeder/4gaboards:latest
```

---

### Step 3 — Back Up Database

Run on the **Oracle server**:

```bash
cd ~/lrs_kanban
mkdir -p backups

docker compose -f app/docker-compose.yml exec -T db \
  pg_dump -U planka planka | gzip > backups/4gaboards_$(date +%F_%H%M).sql.gz

ls -lh backups
```

Verify the file is non-zero. For extra safety:

```bash
gzip -t backups/4gaboards_*.sql.gz && echo "OK"
```

---

### Step 4 — Pull Latest Image

Run on the **Oracle server**:

```bash
cd ~/lrs_kanban/app
docker compose pull 4gaBoards
```

---

### Step 5 — Restart Containers

```bash
docker compose up -d
```

> ⚠️ Do **not** add `--build`. The server should never build.

---

### Step 6 — Verify Everything Works

```bash
docker compose ps
```

Expected:

```
4gaBoards   Up (healthy)
db          Up (healthy)
```

---

## 7. Useful Commands

### View logs

```bash
docker compose logs --tail=100 4gaBoards
```

### Restart app only

```bash
docker compose restart 4gaBoards
```

### Restart everything

```bash
docker compose up -d
```

### Check running containers

```bash
docker compose ps
```

### Local HTTP check

```bash
curl -I http://localhost:1337
```

---

## 8. Troubleshooting

### 502 Bad Gateway

Usually means the app container crashed. Check logs:

```bash
docker compose logs --tail=100 4gaBoards
```

### `pull access denied for lrs-4gaboards`

You ran a command that tried to build/pull a local image name on the server.
Make sure you are pulling `ricardorheeder/4gaboards:latest` (the published image), not building from source on the server.

### Image didn't update after pull

Force a fresh container:

```bash
docker compose up -d --force-recreate 4gaBoards
```

---

## 9. Database Restore (Emergency)

⚠️ This overwrites current data.

```bash
gunzip -c backups/4gaboards_YYYY-MM-DD_HHMM.sql.gz | \
  docker compose -f app/docker-compose.yml exec -T db psql -U planka -d planka
```

---

## 10. Clean Restart (No Data Loss)

```bash
docker compose down
docker compose up -d
```

🚫 **Do NOT use `-v` unless you intend to delete all data.**
🚫 **Do NOT use `--build` on the server.**

---

## 11. One-Command Update Cheat Sheet

**On your local PC:**

```bash
docker build -t ricardorheeder/4gaboards:latest . && \
docker push ricardorheeder/4gaboards:latest
```

**On the Oracle server:**

```bash
cd ~/lrs_kanban && \
mkdir -p backups && \
docker compose -f app/docker-compose.yml exec -T db pg_dump -U planka planka | gzip > backups/4gaboards_$(date +%F_%H%M).sql.gz && \
cd app && \
docker compose pull 4gaBoards && \
docker compose up -d && \
docker compose ps
```

---

## 12. Known Gotchas

- Builds happen **locally only**; the server pulls prebuilt images from Docker Hub
- Never run `docker compose up -d --build` on the server (will fail with `pull access denied`)
- `.env` does not exist at repo root, config is injected via Docker Compose
- Only `app/` is a git repository
- SSH deploy keys avoid passphrase issues
- Docker volumes persist database data
- `docker compose down -v` = total data loss

---

## 13. Current Status

- GitHub SSH authenticated
- Database backups working
- Containers healthy
- Board accessible externally

---

This README should be kept up to date whenever deployment details change.

