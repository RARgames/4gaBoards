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

Start 4ga Boards as usual (with/without docker/dev)
