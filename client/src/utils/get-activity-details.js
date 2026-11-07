import getMeta from './get-meta';
import { isLocalId } from './local-id';

export default (model, currentUserId, isInNotifications = false) => ({
  ...model.ref,
  ...getMeta(model),
  isPersisted: !isLocalId(model.id),
  isMentionedUser: Boolean(isInNotifications && model.data?.userId === currentUserId),
  user: model.user
    ? {
        ...model.user.ref,
        isCurrent: model.user.id === currentUserId,
      }
    : undefined,
  card: model.card ? { ...model.card.ref } : undefined,
  list: model.list ? { ...model.list.ref } : undefined,
  board: model.board ? { ...model.board.ref } : undefined,
  project: model.project ? { ...model.project.ref } : undefined,
});
