<div align="center">
  <a href="https://4gaboards.com">
    <img src="https://github.com/user-attachments/assets/443e9bd8-df6f-4cf3-a8e7-9a79592cb618" alt="4ga Boards">
  </a>
  </br>
  </br>
  <div>
    <img src="https://img.shields.io/github/v/release/RARgames/4gaBoards?color=orange" alt="4ga Boards Latest Release" />
    <img src="https://img.shields.io/github/license/rargames/4gaBoards" alt="4ga Boards License" />
    <img src="https://img.shields.io/github/contributors/rargames/4gaboards" alt="4ga Boards Contributors" />
  </div>
    <h1>4ga Boards</h1>
  Straightforward boards system for realtime project management
  </br>
  </br>
</div>

![4gaBoards_gif](https://github.com/user-attachments/assets/4724f221-9b07-4f01-9d7a-3348a11a029e)

## Features

- **Dark Mode**
- **Intuitive UI/UX**
- **Advanced Markdown Editor**
- **Export/Import Boards**
- **Web App Design** - realtime updates without reloading page
- **Multitasking Capabilities** - simultaneously edit/review cards and filter/rearrange the board, while keeping local description changes
- **Google/GitHub/Microsoft SSO Login/Register**
- **Simplistic Wide Screen Design** - minimal clutter and no wasted space
- **Powerful Shortcuts**
- **Multiple Language Support** _(EN, PL, FR, PT - 100%, other languages - partial support)_
- **Collapsable Lists and Sidebar** - saves screen space and allows for easier navigation in complex projects
- **Multi-level Hierarchy** - projects -> boards -> lists -> cards -> tasks
- **Github 2-way sync** - Coming soon

[More Features](https://4gaboards.com/features)

## Demo

[Try 4ga Boards now!](https://4gaboards.com/try)

## Documentation

[English](https://docs.4gaboards.com) | [Polski](https://docs.4gaboards.com/pl)

## Website

[4ga Boards Website](https://4gaboards.com)

Don't want to get your hands dirty?\
Check [4ga Boards Professional Hosting](https://4gaboards.com/pricing).

## Roadmap

[4ga Boards Roadmap](https://github.com/RARgames/4gaBoards/issues/472)

## Deploy

1. [Docker Compose (Recommended)](https://docs.4gaboards.com/docs/dev/install/docker-install)
2. [Kubernetes](https://docs.4gaboards.com/docs/dev/install/k8s-install)
3. [TrueNAS](https://docs.4gaboards.com/docs/dev/install/truenas-install)
4. [Manual](https://docs.4gaboards.com/docs/dev/install/manual)

### Docker Compose (Recommended)

Requirements: [Docker](https://docs.docker.com/install), [Docker Compose](https://docs.docker.com/compose/install)

**Download `docker-compose.yml`** _(or create `docker-compose.yml` based on [the example](https://github.com/RARgames/4gaBoards/blob/main/docker-compose.yml))_

```bash
curl -L https://raw.githubusercontent.com/RARgames/4gaBoards/main/docker-compose.yml -o docker-compose.yml
```

**Configure 4ga Boards instance variables**

Configure `environment` sections in `docker-compose.yml`:

Edit `BASE_URL` to match your domain name or IP address.\
Edit `SECRET_KEY` with a random value. You can generate it by `openssl rand -hex 64`.\
Edit `POSTGRES_PASSWORD` and `DATABASE_URL` replacing `notpassword` with randomly generated db password.\
[4ga Boards instance variables](https://docs.4gaboards.com/docs/dev/install/docker-vars)

**Pull images and start 4ga Boards**

```bash
docker compose up -d
```

Default 4ga Boards url: http://localhost:3000 \
Default user: `demo`\
Default password: `demo`

## Backup and Restore

Before executing backup/restore scripts, change current directory to the directory where `docker-compose.yml` is located.

**Backup 4ga Boards instance data**

```bash
./boards-backup.sh
```

**Restore 4ga Boards instance data**

```bash
./boards-restore.sh 4gaBoards-backup.tgz
```

_You can use any relative path._

When restoring, the password has to match docker-compose password (If you don't remember it, you can set new password in docker-compose, but you have to skip altering the default user in backup.tgz/postgres.sql file e.g. comment line `ALTER ROLE postgres WITH SUPERUSER INHERIT CREATEROLE CREATEDB LOGIN REPLICATION BYPASSRLS PASSWORD 'XXX'` before restoring the backup).

## Import from Trello

It's already available in 4ga Boards. Just add a project, then click Import while creating a new board.

## Development

Requirements: [Node.js](https://nodejs.org/en/download)\
Optional requirements: [Docker](https://docs.docker.com/install/), [Docker Compose](https://docs.docker.com/compose/install/)

**Clone 4ga Boards repository into a directory of your choice**

```bash
git clone https://github.com/RARgames/4gaBoards.git .
```

**Install dependencies**

```bash
npm i
```

**Copy .env**

```bash
cp server/.env.sample server/.env
```

_Optional: Build client, copy build to the `server` directory to suppress startup warnings_

```bash
npm run client:build
```

```bash
cp -r client/build server/public
```

```bash
cp client/build/index.html server/views/index.ejs
```

**Start the provided development database** _(Optionally, use your own database)_

```bash
docker compose -f docker-compose-dev.yml up -d
```

_If using your own database, edit `DATABASE_URL` in `server/.env`._

**Initialize the database**

```bash
npm run server:db:init
```

**Start the development server**

```bash
npm start
```

Default 4ga Boards url: http://localhost:3000 \
Default user: `demo`\
Default password: `demo`

## Web Server Configuration

[Web Server Configuration](https://docs.4gaboards.com/docs/dev/web-server-config)

## SSO (Single Sign-On)

[SSO](https://docs.4gaboards.com/docs/dev/sso)

## Contributing

[Full 4ga Boards Contribution Guidelines](https://4gaboards.com/contribute)

## Security

[Full 4ga Boards Security Information](https://4gaboards.com/security)

## Tech Stack

- React, Redux, Redux-Saga, Redux-ORM, react-beautiful-dnd, floating-ui
- Sails.js, Knex.js
- PostgreSQL

## License

[MIT license](https://github.com/RARgames/4gaBoards/blob/main/LICENSE)

## Main Maintainers

[![RARgames](https://github.com/RARgames.png?size=100)](https://github.com/RARgames)
[![wilkobyl](https://github.com/wilkobyl.png?size=100)](https://github.com/wilkobyl)