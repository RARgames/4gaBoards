<div align="center">
  <a href="https://4gaboards.com">
    <img src="https://github.com/user-attachments/assets/443e9bd8-df6f-4cf3-a8e7-9a79592cb618" alt="4ga Boards">
  </a>
  </br>
  </br>
  <div>
    <img src="https://img.shields.io/github/v/release/RARgames/4gaBoards?color=orange&style=flat-square)" alt="GitHub release (latest by date)">
    <img src="https://img.shields.io/github/license/rargames/4gaBoards?style=flat-square" alt="GitHub">
    <img src="https://img.shields.io/github/contributors/rargames/4gaboards?style=flat-square" alt="GitHub contributors">
  </div>
  </br>
  The realtime kanban boards for groups inspired by discontinued GitKraken Glo Boards.
  </br>
  </br>
</div>

![4gaBoards_gif](https://github.com/user-attachments/assets/1f6f1e41-a60d-4529-8cff-964b0d63962f)

# 4ga Boards

## Features

- Full dark mode
- Intuitive UI/UX
- Advanced Markdown Editor _(card description and comments)_
- App design - no need to reload page
- Multitasking capabilities _(while editing a card, you can still scroll, filter and review other cards. You can exit the card at any time, the description changes will be saved locally for you.)_
- Projects/Boards sidebar _(easier navigation for many complex projects and boards)_
- SSO Login/Register _(Google SSO + Github/Microsoft [Coming soon])_
- App uses full screen _(no wasted screen space)_
- Simplistic design _(No useless buttons/options, everything included by default)_
- Automation of common actions with shortucts
- Internationalization _(EN, PL, FR - 100%, other languages - partial support)_
- Github 2-way sync [Coming soon]
- Collapsable lists _(saves screen space for complex projects)_

### Boards Structure

- Projects -> Boards -> Lists -> Cards -> Tasks
- Project: Title, Boards
- Board: Title, Lists, Board Members(Editor, Commenter, Viewer), Card Filters
- List: Title, Cards
- Card: Description, Members, Labels, Due Date, Timer, Notifications, Tasks, Attachments, Comments
- Task: Title, Members, Due Date

### Basic Features

- Real-time updates
- Filter by members and labels
- Customizable project backgrounds
- User notifications

## Demo

Check out 4ga Boards using our [demo](https://demo.4gaboards.com).

**Recommended: Create a new account** - You can use fake email (no email confirmations).

_or use: Demo user: `demo` Demo password: `demo` (please note that many users might be using it at the same time causing disturbed experience e.g. changing user preferences)._

### Demo mode - changed features:

- Disabled changing instance settings
- Disabled changing other users data
- Every new user receives admin privileges
- Data is cleared every day at 1:55 CET

## Documentation

[English](https://docs.4gaboards.com/en/home) | [Polski](https://docs.4gaboards.com/pl/home)

## Roadmap

Our main priority is to finish all tasks from the [#1](https://github.com/RARgames/4gaBoards/issues/1) issue.

All tasks from [#1](https://github.com/RARgames/4gaBoards/issues/1) issue are described in separate issues.

## Deploy

There are 2 types of installation:

1. [Dockerized](#1-docker-compose)
2. [Without Docker](#2-without-docker)

### 1. Docker Compose

[![](https://d207aa93qlcgug.cloudfront.net/1.95.5.qa/img/nav/docker-logo-loggedout.png)](https://github.com/RARgames/4gaBoards/pkgs/container/4gaBoards)

- Make sure you have [Docker](https://docs.docker.com/install/) and [Docker Compose](https://docs.docker.com/compose/install/) installed and operational.
- Create `docker-compose.yml` based on [the example](https://raw.githubusercontent.com/RARgames/4gaBoards/main/docker-compose.yml). This is the ONLY file you will need. You can create this file on your machine by copying and pasting the content or download it:

```
curl -L https://raw.githubusercontent.com/RARgames/4gaBoards/main/docker-compose.yml -o docker-compose.yml
```

- Edit `BASE_URL` to match your domain name or IP address.
- Edit `SECRET_KEY` with random value. You can generate it by `openssl rand -hex 64`.
- Replace 2 occurrences of `notpassword` with generated db password in `POSTGRES_PASSWORD` and `DATABASE_URL`.

Pull images and start services:

```
docker compose up -d
```

Default url: http://localhost:3000 Demo user: `demo` Demo password: `demo`

### 2. Without Docker

Installing without Docker is a bit more complicated, here's what you need to do:

1. Clone this repository into a directory of your choice. (e.g. `/var/www/4gaBoards`)

```bash
mkdir -p /var/www/4gaBoards
cd /var/www/4gaBoards
git clone https://github.com/RARgames/4gaBoards.git .
```

2. Install dependencies, build client, copy build to the `server` directory.

```bash
npm i
npm run client:build

cp -r client/build server/public
cp client/build/index.html server/views/index.ejs
```

**Note**: You can use `yarn` or `pnpm` instead of `npm`.

3. Configure environment variables.

```bash
cp server/.env.sample server/.env

# Edit .env file (You could use nano, vim, etc.)
nano server/.env
```

**Note**: Before continuing, make sure you have your selected database created and running.

4. Copy start script from the root directory to the `server` directory and start the server.

```bash
cp start.sh server
cd server
./start.sh
```

**Note**: You can use `pm2` or `systemd` to run the server in the background.

Default url: http://localhost:1337 Demo user: `demo` Demo password: `demo`

## [Additional information (Google SSO, Nginx Configuration, Logging, Rotating Logs, Fail2ban, Helm Chart)](https://github.com/RARgames/4gaBoards/blob/main/docs/ADDITIONAL_INFO.md)

## Backup and Restore

Before executing backup/restore scripts, change current directory to the directory where docker-compose is located.

To backup your data use: `./boards-backup.sh`

To restore it use: `./boards-restore.sh 4gaBoards-backup.tgz` You can use any relative path.

When restoring, the password has to match docker-compose password (If you don't remember it, you can set new password in docker-compose, but you have to skip altering the default user in backup.tgz/postgres.sql file e.g. comment line `ALTER ROLE postgres WITH SUPERUSER INHERIT CREATEROLE CREATEDB LOGIN REPLICATION BYPASSRLS PASSWORD 'XXX'` before restoring the backup).

## Import from Trello

It's already available in 4ga Boards. Just add a project, then click Import while creating a new board.

## [Migration from Planka](https://github.com/RARgames/4gaBoards/blob/main/docs/MIGRATION.md)

## Development

Clone the repository into a directory of your choice, install dependencies, copy .env:

```bash
git clone https://github.com/RARgames/4gaBoards.git .
npm i
cp server/.env.sample server/.env
```

_Optional: Build client, copy build to the `server` directory to suppress startup warnings_

```bash
npm run client:build
cp -r client/build server/public
cp client/build/index.html server/views/index.ejs
```

Either use a local database or start the provided development database:

```bash
docker compose -f docker-compose-dev.yml up
```

Edit `DATABASE_URL` in `server/.env` if needed, then initialize the database:

```bash
npm run server:db:init
```

Start the development server:

```bash
npm start
```

Demo user: `demo` Demo password: `demo`

## [Contributing](https://github.com/RARgames/4gaBoards/blob/main/docs/CONTRIBUTING.md)

## [Security](https://github.com/RARgames/4gaBoards/blob/main/docs/SECURITY.md)

## Tech stack

- React, Redux, Redux-Saga, Redux-ORM, react-beautiful-dnd
- Sails.js, Knex.js
- PostgreSQL

## License

[MIT license](https://github.com/RARgames/4gaBoards/blob/main/LICENSE)

## Main maintainers

[![RARgames](https://github.com/RARgames.png?size=100)](https://github.com/RARgames)
[![wilkobyl](https://github.com/wilkobyl.png?size=100)](https://github.com/wilkobyl)
