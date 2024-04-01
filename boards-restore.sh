#!/bin/bash
set -e
echo "Make sure that you execute this script from docker-compose directory"

if [ "$#" -ne 1 ]; then
    echo "Usage: $0 BACKUP_FILE_LOCATION"
    exit 1
fi

HOST_PWD="$(if [[ "$OSTYPE" == "msys" || "$OSTYPE" == "win32" ]]; then pwd -W; else pwd; fi)"
DB_PASSWD=$(grep POSTGRES_PASSWORD docker-compose.yml | awk '{print $2}' | sed 's/"//g')
BACKUP_FILE=$1
BACKUP_DIR="$(basename $BACKUP_FILE .tgz)"
BASE_LOWERCASE=$(basename "$HOST_PWD" | awk '{print tolower($0)}')
POSTGRES="$BASE_LOWERCASE-db-1"
BOARDS="$BASE_LOWERCASE-4gaBoards-1"

echo "Extracting $BACKUP_FILE..."
mkdir -p $BACKUP_DIR
tar -xzf $BACKUP_FILE -C $BACKUP_DIR

echo "Importing db..."
{ 
    echo $DB_PASSWD
    sleep 0.2
    echo "\i $(<"$BACKUP_DIR/postgres.sql")"
} | docker exec -i $POSTGRES psql -U postgres
echo "Importing attachments ... "
docker run --rm --volumes-from $BOARDS -v $HOST_PWD/$BACKUP_DIR:/backup alpine sh -c 'cp -rf /backup/attachments /app/private/'
echo "Importing user-avatars..."
docker run --rm --volumes-from $BOARDS -v $HOST_PWD/$BACKUP_DIR:/backup alpine sh -c 'cp -rf /backup/user-avatars /app/public/'
echo "Importing project-background-images..."
docker run --rm --volumes-from $BOARDS -v $HOST_PWD/$BACKUP_DIR:/backup alpine sh -c 'cp -rf /backup/project-background-images /app/public/'

echo "Cleaning up temp files..."
rm -rf $BACKUP_DIR
echo "Backup restored from $BACKUP_FILE"