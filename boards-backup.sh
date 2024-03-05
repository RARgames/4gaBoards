#!/bin/bash
set -e

if [ "$#" -ne 1 ]; then
    echo "Usage: $0 DATABASE_PASSWORD"
    exit 1
fi

cd "$(dirname "$0")" #Docker compose dir
HOST_PWD=""
if [[ "$OSTYPE" == "msys" || "$OSTYPE" == "win32" ]]; then
    HOST_PWD="$(pwd -W)"
else
    HOST_PWD="$(pwd)"
fi

DB_PASSWD=$1
TIMESTAMP="$(date --utc +%FT%H-%M-%SZ)"
BACKUP_DIR="4gaBoards-backup-$TIMESTAMP"
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
cd $BACKUP_DIR && tar -czf $BACKUP_DIR.tgz postgres.sql attachments user-avatars project-background-images && cd -
mv $BACKUP_DIR/$BACKUP_DIR.tgz $HOST_PWD

echo "Cleaning up temp files..."
rm -rf $BACKUP_DIR
echo "Backup created at $BACKUP_DIR.tgz"