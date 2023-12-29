#!/bin/bash
set -e

POSTGRES="4gaboards-postgres-1"
BOARDS="4gaboards-4gaBoards-1"

BACKUP_FILE=$1
BACKUP_DIR=$(basename $BACKUP_FILE .tgz)
HOST_PWD=""
if [[ "$OSTYPE" == "msys" || "$OSTYPE" == "win32" ]]; then
    HOST_PWD="$(pwd -W)"
else
    HOST_PWD="$(pwd)"
fi

echo "Extracting $BACKUP_FILE..."
tar -xzf $BACKUP_FILE
echo "Importing db..."
cat $BACKUP_DIR/postgres.sql | docker exec -i $POSTGRES psql -U postgres
echo "Importing attachments ... "
docker run --rm --volumes-from $BOARDS -v $HOST_PWD/$BACKUP_DIR:/backup alpine sh -c 'cp -rf /backup/attachments /app/private/'
echo "Importing user-avatars..."
docker run --rm --volumes-from $BOARDS -v $HOST_PWD/$BACKUP_DIR:/backup alpine sh -c 'cp -rf /backup/user-avatars /app/public/'
echo "Importing project-background-images..."
docker run --rm --volumes-from $BOARDS -v $HOST_PWD/$BACKUP_DIR:/backup alpine sh -c 'cp -rf /backup/project-background-images /app/public/'

echo "Cleaning up temp files..."
rm -rf $BACKUP_DIR
echo "Backup restored from $BACKUP_FILE"