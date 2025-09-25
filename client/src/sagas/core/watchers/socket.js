import { eventChannel } from 'redux-saga';
import { all, call, cancelled, put, take, takeEvery } from 'redux-saga/effects';

import api, { socket } from '../../../api';
import EntryActionTypes from '../../../constants/EntryActionTypes';
import entryActions from '../../../entry-actions';
import services from '../services';

const createSocketEventsChannel = () =>
  eventChannel((emit) => {
    const handleDisconnect = () => {
      emit(entryActions.handleSocketDisconnect());
    };

    const handleReconnect = () => {
      emit(entryActions.handleSocketReconnect());
    };

    const handleCoreSettingsUpdate = ({ item }) => {
      emit(entryActions.handleCoreSettingsUpdate(item));
    };

    const handleUserCreate = api.makeHandleUserCreate(({ item }) => {
      emit(entryActions.handleUserCreate(item));
    });

    const handleUserUpdate = api.makeHandleUserUpdate(({ item }) => {
      emit(entryActions.handleUserUpdate(item));
    });

    const handleUserDelete = api.makeHandleUserDelete(({ item }) => {
      emit(entryActions.handleUserDelete(item));
    });

    const handleUserPrefsUpdate = ({ item }) => {
      emit(entryActions.handleUserPrefsUpdate(item));
    };

    const handleProjectCreate = api.makeHandleProjectCreate(({ item }) => {
      emit(entryActions.handleProjectCreate(item));
    });

    const handleProjectUpdate = api.makeHandleProjectUpdate(({ item }) => {
      emit(entryActions.handleProjectUpdate(item));
    });

    const handleProjectDelete = api.makeHandleProjectDelete(({ item }) => {
      emit(entryActions.handleProjectDelete(item));
    });

    const handleUserProjectUpdate = ({ item }) => {
      emit(entryActions.handleUserProjectUpdate(item));
    };

    const handleProjectManagerCreate = ({ item }) => {
      emit(entryActions.handleProjectManagerCreate(item));
    };

    const handleProjectManagerDelete = ({ item }) => {
      emit(entryActions.handleProjectManagerDelete(item));
    };

    const handleBoardCreate = api.makeHandleBoardCreate(({ item, requestId }) => {
      emit(entryActions.handleBoardCreate(item, requestId));
    });

    const handleBoardUpdate = api.makeHandleBoardUpdate(({ item }) => {
      emit(entryActions.handleBoardUpdate(item));
    });

    const handleBoardDelete = api.makeHandleBoardDelete(({ item }) => {
      emit(entryActions.handleBoardDelete(item));
    });

    const handleBoardMembershipCreate = ({ item }) => {
      emit(entryActions.handleBoardMembershipCreate(item));
    };

    const handleBoardMembershipUpdate = ({ item }) => {
      emit(entryActions.handleBoardMembershipUpdate(item));
    };

    const handleBoardMembershipDelete = ({ item }) => {
      emit(entryActions.handleBoardMembershipDelete(item));
    };

    const handleListCreate = api.makeHandleListCreate(({ item }) => {
      emit(entryActions.handleListCreate(item));
    });

    const handleListUpdate = api.makeHandleListUpdate(({ item }) => {
      emit(entryActions.handleListUpdate(item));
    });

    const handleListDelete = api.makeHandleListDelete(({ item }) => {
      emit(entryActions.handleListDelete(item));
    });

    const handleLabelCreate = ({ item }) => {
      emit(entryActions.handleLabelCreate(item));
    };

    const handleLabelUpdate = ({ item }) => {
      emit(entryActions.handleLabelUpdate(item));
    };

    const handleLabelDelete = ({ item }) => {
      emit(entryActions.handleLabelDelete(item));
    };

    const handleCardCreate = api.makeHandleCardCreate(({ item }) => {
      emit(entryActions.handleCardCreate(item));
    });

    const handleCardUpdate = api.makeHandleCardUpdate(({ item }) => {
      emit(entryActions.handleCardUpdate(item));
    });

    const handleCardDelete = api.makeHandleCardDelete(({ item }) => {
      emit(entryActions.handleCardDelete(item));
    });

    const handleCardDuplicate = api.makeHandleCardDuplicate(({ item }) => {
      emit(entryActions.handleCardDuplicate(item));
    });

    const handleUserToCardAdd = ({ item }) => {
      emit(entryActions.handleUserToCardAdd(item));
    };

    const handleUserFromCardRemove = ({ item }) => {
      emit(entryActions.handleUserFromCardRemove(item));
    };

    const handleLabelToCardAdd = ({ item }) => {
      emit(entryActions.handleLabelToCardAdd(item));
    };

    const handleLabelFromCardRemove = ({ item }) => {
      emit(entryActions.handleLabelFromCardRemove(item));
    };

    const handleUserToTaskAdd = ({ item }) => {
      emit(entryActions.handleUserToTaskAdd(item));
    };

    const handleUserFromTaskRemove = ({ item }) => {
      emit(entryActions.handleUserFromTaskRemove(item));
    };

    const handleTaskCreate = api.makeHandleTaskCreate(({ item }) => {
      emit(entryActions.handleTaskCreate(item));
    });

    const handleTaskUpdate = api.makeHandleTaskUpdate(({ item }) => {
      emit(entryActions.handleTaskUpdate(item));
    });

    const handleTaskDuplicate = api.makeHandleTaskDuplicate(({ item }) => {
      emit(entryActions.handleTaskDuplicate(item));
    });

    const handleTaskDelete = api.makeHandleTaskDelete(({ item }) => {
      emit(entryActions.handleTaskDelete(item));
    });

    const handleAttachmentCreate = api.makeHandleAttachmentCreate(({ item, requestId }) => {
      emit(entryActions.handleAttachmentCreate(item, requestId));
    });

    const handleAttachmentUpdate = api.makeHandleAttachmentUpdate(({ item }) => {
      emit(entryActions.handleAttachmentUpdate(item));
    });

    const handleAttachmentDelete = api.makeHandleAttachmentDelete(({ item }) => {
      emit(entryActions.handleAttachmentDelete(item));
    });

    const handleActivityCreate = api.makeHandleActivityCreate(({ item }) => {
      emit(entryActions.handleActivityCreate(item));
    });

    const handleActivityUpdate = api.makeHandleActivityUpdate(({ item }) => {
      emit(entryActions.handleActivityUpdate(item));
    });

    const handleActivityDelete = api.makeHandleActivityDelete(({ item }) => {
      emit(entryActions.handleActivityDelete(item));
    });

    const handleNotificationCreate = api.makeHandleNotificationCreate(({ item }) => {
      emit(entryActions.handleNotificationCreate(item));
    });

    const handleNotificationUpdate = api.makeHandleNotificationUpdate(({ item }) => {
      emit(entryActions.handleNotificationUpdate(item));
    });

    const handleNotificationDelete = api.makeHandleNotificationDelete(({ item }) => {
      emit(entryActions.handleNotificationDelete(item));
    });

    socket.on('disconnect', handleDisconnect);
    socket.onManager('reconnect', handleReconnect);

    socket.on('coreSettingsUpdate', handleCoreSettingsUpdate);

    socket.on('userCreate', handleUserCreate);
    socket.on('userUpdate', handleUserUpdate);
    socket.on('userDelete', handleUserDelete);

    socket.on('userPrefsUpdate', handleUserPrefsUpdate);

    socket.on('projectCreate', handleProjectCreate);
    socket.on('projectUpdate', handleProjectUpdate);
    socket.on('projectDelete', handleProjectDelete);

    socket.on('userProjectUpdate', handleUserProjectUpdate);

    socket.on('projectManagerCreate', handleProjectManagerCreate);
    socket.on('projectManagerDelete', handleProjectManagerDelete);

    socket.on('boardCreate', handleBoardCreate);
    socket.on('boardUpdate', handleBoardUpdate);
    socket.on('boardDelete', handleBoardDelete);

    socket.on('boardMembershipCreate', handleBoardMembershipCreate);
    socket.on('boardMembershipUpdate', handleBoardMembershipUpdate);
    socket.on('boardMembershipDelete', handleBoardMembershipDelete);

    socket.on('listCreate', handleListCreate);
    socket.on('listUpdate', handleListUpdate);
    socket.on('listDelete', handleListDelete);

    socket.on('labelCreate', handleLabelCreate);
    socket.on('labelUpdate', handleLabelUpdate);
    socket.on('labelDelete', handleLabelDelete);

    socket.on('cardCreate', handleCardCreate);
    socket.on('cardUpdate', handleCardUpdate);
    socket.on('cardDelete', handleCardDelete);
    socket.on('cardDuplicate', handleCardDuplicate);

    socket.on('cardMembershipCreate', handleUserToCardAdd);
    socket.on('cardMembershipDelete', handleUserFromCardRemove);

    socket.on('cardLabelCreate', handleLabelToCardAdd);
    socket.on('cardLabelDelete', handleLabelFromCardRemove);

    socket.on('taskMembershipCreate', handleUserToTaskAdd);
    socket.on('taskMembershipDelete', handleUserFromTaskRemove);

    socket.on('taskCreate', handleTaskCreate);
    socket.on('taskUpdate', handleTaskUpdate);
    socket.on('taskDuplicate', handleTaskDuplicate);
    socket.on('taskDelete', handleTaskDelete);

    socket.on('attachmentCreate', handleAttachmentCreate);
    socket.on('attachmentUpdate', handleAttachmentUpdate);
    socket.on('attachmentDelete', handleAttachmentDelete);

    socket.on('actionCreate', handleActivityCreate);
    socket.on('actionUpdate', handleActivityUpdate);
    socket.on('actionDelete', handleActivityDelete);

    socket.on('notificationCreate', handleNotificationCreate);
    socket.on('notificationUpdate', handleNotificationUpdate);
    socket.on('notificationDelete', handleNotificationDelete);

    return () => {
      socket.off('disconnect', handleDisconnect);
      socket.offManager('reconnect', handleReconnect);

      socket.off('coreSettingsUpdate', handleCoreSettingsUpdate);

      socket.off('userCreate', handleUserCreate);
      socket.off('userUpdate', handleUserUpdate);
      socket.off('userDelete', handleUserDelete);

      socket.off('userPrefsUpdate', handleUserPrefsUpdate);

      socket.off('projectCreate', handleProjectCreate);
      socket.off('projectUpdate', handleProjectUpdate);
      socket.off('projectDelete', handleProjectDelete);

      socket.off('userProjectUpdate', handleUserProjectUpdate);

      socket.off('projectManagerCreate', handleProjectManagerCreate);
      socket.off('projectManagerDelete', handleProjectManagerDelete);

      socket.off('boardCreate', handleBoardCreate);
      socket.off('boardUpdate', handleBoardUpdate);
      socket.off('boardDelete', handleBoardDelete);

      socket.off('boardMembershipCreate', handleBoardMembershipCreate);
      socket.off('boardMembershipUpdate', handleBoardMembershipUpdate);
      socket.off('boardMembershipDelete', handleBoardMembershipDelete);

      socket.off('listCreate', handleListCreate);
      socket.off('listUpdate', handleListUpdate);
      socket.off('listDelete', handleListDelete);

      socket.off('labelCreate', handleLabelCreate);
      socket.off('labelUpdate', handleLabelUpdate);
      socket.off('labelDelete', handleLabelDelete);

      socket.off('cardCreate', handleCardCreate);
      socket.off('cardUpdate', handleCardUpdate);
      socket.off('cardDelete', handleCardDelete);
      socket.off('cardDuplicate', handleCardDuplicate);

      socket.off('cardMembershipCreate', handleUserToCardAdd);
      socket.off('cardMembershipDelete', handleUserFromCardRemove);

      socket.off('cardLabelCreate', handleLabelToCardAdd);
      socket.off('cardLabelDelete', handleLabelFromCardRemove);

      socket.off('taskMembershipCreate', handleUserToTaskAdd);
      socket.off('taskMembershipDelete', handleUserFromTaskRemove);

      socket.off('taskCreate', handleTaskCreate);
      socket.off('taskUpdate', handleTaskUpdate);
      socket.off('taskDuplicate', handleTaskDuplicate);
      socket.off('taskDelete', handleTaskDelete);

      socket.off('attachmentCreate', handleAttachmentCreate);
      socket.off('attachmentUpdate', handleAttachmentUpdate);
      socket.off('attachmentDelete', handleAttachmentDelete);

      socket.off('actionCreate', handleActivityCreate);
      socket.off('actionUpdate', handleActivityUpdate);
      socket.off('actionDelete', handleActivityDelete);

      socket.off('notificationCreate', handleNotificationCreate);
      socket.off('notificationUpdate', handleNotificationUpdate);
      socket.off('notificationDelete', handleNotificationDelete);
    };
  });

export default function* socketWatchers() {
  yield all([
    yield takeEvery(EntryActionTypes.SOCKET_DISCONNECT_HANDLE, () => services.handleSocketDisconnect()),
    yield takeEvery(EntryActionTypes.SOCKET_RECONNECT_HANDLE, () => services.handleSocketReconnect()),
  ]);

  const socketEventsChannel = yield call(createSocketEventsChannel);

  try {
    while (true) {
      const action = yield take(socketEventsChannel);

      yield put(action);
    }
  } finally {
    if (yield cancelled()) {
      socketEventsChannel.close();
    }
  }
}
