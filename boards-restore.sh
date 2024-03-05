#!/bin/bash
set -e

if [ "$#" -ne 2 ]; then
    echo "Usage: $0 DATABASE_PASSWORD BACKUP_FILE_LOCATION"
    exit 1
fi

DB_PASSWD=$1
BACKUP_FILE=$2
BACKUP_DIR="$(basename $BACKUP_FILE .tgz)"
TMP_DIR="$(dirname "$0")/$BACKUP_DIR"
echo "Extracting $BACKUP_FILE..."
mkdir -p $TMP_DIR
tar -xzf $BACKUP_FILE -C $TMP_DIR

cd "$(dirname "$0")" #Docker compose dir
HOST_PWD=""
if [[ "$OSTYPE" == "msys" || "$OSTYPE" == "win32" ]]; then
    HOST_PWD="$(pwd -W)"
else
    HOST_PWD="$(pwd)"
fi
POSTGRES="$(basename $HOST_PWD)-db-1"
BOARDS="$(basename $HOST_PWD)-4gaBoards-1"

echo "Importing db..."
{ 
    echo $DB_PASSWD
    sleep 0.1
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