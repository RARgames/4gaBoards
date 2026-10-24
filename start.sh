#!/bin/bash
set -e

# Only applied for custom user (start as root and remap to PUID/PGID)
if [ "$(id -u)" = "0" ]; then
  echo "Root user detected, remapping to PUID/PGID"
  PUID=${PUID:-1000}
  PGID=${PGID:-1000}

  if [ "$PGID" != "$(id -g node)" ]; then
    groupmod -o -g "$PGID" node
  fi
  if [ "$PUID" != "$(id -u node)" ]; then
    usermod -o -u "$PUID" node
  fi

  # Non-recursive for parents (so volumes are not re-chowned every time) - recursive only if the top-level owner is wrong
  chown "$PUID:$PGID" /app /app/public /app/private
  for dir in /app/logs /app/.tmp /app/public/user-avatars /app/public/project-background-images /app/private/attachments; do
    if [ -d "$dir" ] && [ "$(stat -c %u:%g "$dir")" != "$PUID:$PGID" ]; then
      chown -R "$PUID:$PGID" "$dir"
    fi
  done

  export HOME=/home/node
  exec su-exec node "$0" "$@"
fi

echo "Starting 4gaBoards..."
node db/init.js
exec node app.js --prod $@
