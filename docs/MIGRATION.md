# How to switch from planka:

Rename database using: 

```
ALTER DATABASE "planka" RENAME TO "4gaBoards";
```
Change `planka` to `4gaBoards` in `server/.env`

Init the new db: 
```
npm run server:db:init
```

Check if there are required migrations at: `server/db/migrations/` (run those that are not available in Planka using `knex migrate`)

Start 4ga Boards as usual (with/without docker/dev)
