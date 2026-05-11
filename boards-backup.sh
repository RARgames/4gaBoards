#!/bin/bash
set -e
echo "Make sure that you execute this script from docker-compose directory"

HOST_PWD="$(if [[ "$OSTYPE" == "msys" || "$OSTYPE" == "win32" ]]; then pwd -W; else pwd; fi)"
DB_PASSWD=$(grep POSTGRES_PASSWORD docker-compose.yml | awk '{print $2}' | sed 's/"//g')
TIMESTAMP="$(date +%FT%H-%M-%SZ)"
BACKUP_DIR="4gaBoards-backup-$TIMESTAMP"
BASE_LOWERCASE=$(basename "$HOST_PWD" | awk '{print tolower($0)}')
POSTGRES="$BASE_LOWERCASE-db-1"
BOARDS="$BASE_LOWERCASE-4gaBoards-1"

echo "Checking $POSTGRES: if there is no message below, $POSTGRES is not running"
docker ps | grep $POSTGRES

mkdir -p $BACKUP_DIR
echo "Exporting db..."
{ 
    for i in {1..4}; do
        echo $DB_PASSWD
        sleep 0.2
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