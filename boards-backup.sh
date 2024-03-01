#!/bin/bash
set -e

if [ "$#" -ne 1 ]; then
    echo "Usage: $0 DATABASE_PASSWORD"
    exit 1
fi

DB_PASSWD=$1
TIMESTAMP=$(date --utc +%FT%H-%M-%SZ)
BACKUP_DIR="4gaBoards-backup-$TIMESTAMP"
HOST_PWD=""
if [[ "$OSTYPE" == "msys" || "$OSTYPE" == "win32" ]]; then
    HOST_PWD="$(pwd -W)"
else
    HOST_PWD="$(pwd)"
fi
POSTGRES="$(basename $HOST_PWD)-db-1"
BOARDS="$(basename $HOST_PWD)-4gaBoards-1"

mkdir -p $BACKUP_DIR
echo "Exporting db..."
{ 
    for i in {1..4}; do
        echo $DB_PASSWD
        sleep 0.1
    done
} | docker exec -i $POSTGRES pg_dumpall -c -U postgres > $BACKUP_DIR/postgres.sql
echo "Exporting attachments..."
docker run --rm --volumes-from $BOARDS -v $HOST_PWD/$BACKUP_DIR:/backup alpine sh -c 'cp -r /app/private/attachments /backup/attachments'
echo "Exporting user-avatars..."
docker run --rm --volumes-from $BOARDS -v $HOST_PWD/$BACKUP_DIR:/backup alpine sh -c 'cp -r /app/public/user-avatars /backup/user-avatars'
echo "Exporting project-background-images..."
docker run --rm --volumes-from $BOARDS -v $HOST_PWD/$BACKUP_DIR:/backup alpine sh -c 'cp -r /app/public/project-background-images /backup/project-background-images'
echo "Compressing backup..."
tar -czf $BACKUP_DIR.tgz $BACKUP_DIR/postgres.sql $BACKUP_DIR/attachments $BACKUP_DIR/user-avatars $BACKUP_DIR/project-background-images

echo "Cleaning up temp files..."
rm -rf $BACKUP_DIR
echo "Backup created at $BACKUP_DIR.tgz"