import React from 'react';
import { useTranslation } from 'react-i18next';
import { formatDistanceToNowStrict } from 'date-fns';
import clsx from 'clsx';
import PropTypes from 'prop-types';

import User from '../../User';
import { Button, ButtonStyle, Icon, IconType, IconSize, Table } from '../../Utils';
import DocumentActionsPopup from './DocumentActionsPopup';

import * as gs from '../../../global.module.scss';
import * as s from './DocumentsListView.module.scss';

const DocumentsListView = React.memo(({ documents, folders, currentUserId, isAdmin, isManager, canManage, onUpdate, onDelete }) => {
  const [t] = useTranslation();

  return (
    <Table.Container className={s.container}>
      <Table.Wrapper className={gs.scrollableY}>
        <table className={s.table}>
          <tbody>
            {documents.map((document) => {
              const canDelete = isAdmin || isManager || document.createdById === currentUserId;
              const isImage = !!document.image;

              return (
                <tr key={document.id} className={s.row}>
                  <td className={s.thumbnailCell}>
                    {isImage ? (
                      <div className={s.thumbnail} style={{ backgroundImage: `url(${document.coverUrl})` }} />
                    ) : (
                      <div className={s.thumbnail}>
                        <Icon type={IconType.Attach} size={IconSize.Size16} />
                      </div>
                    )}
                  </td>
                  <td className={s.nameCell}>
                    <div className={s.name}>{document.name}</div>
                    {document.description && <div className={s.description}>{document.description}</div>}
                  </td>
                  <td className={s.folderCell}>{document.folder || '—'}</td>
                  <td className={s.userCell}>
                    {document.createdBy && (
                      <div className={s.user}>
                        <User name={document.createdBy.name} avatarUrl={document.createdBy.avatarUrl} size="small" />
                        <span className={s.userName}>{document.createdBy.name}</span>
                      </div>
                    )}
                  </td>
                  <td className={s.dateCell}>{document.createdAt && formatDistanceToNowStrict(new Date(document.createdAt), { addSuffix: true })}</td>
                  <td className={clsx(s.actionsCell, gs.cursorPointer)}>
                    <DocumentActionsPopup
                      document={document}
                      folders={folders}
                      canDelete={canManage && canDelete}
                      onUpdate={(data) => onUpdate(document.id, data)}
                      onDelete={() => onDelete(document.id)}
                      offset={5}
                      position="bottom-end"
                    >
                      <Button style={ButtonStyle.Icon} title={t('common.documentActions', { context: 'title' })}>
                        <Icon type={IconType.EllipsisVertical} size={IconSize.Size14} />
                      </Button>
                    </DocumentActionsPopup>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </Table.Wrapper>
    </Table.Container>
  );
});

DocumentsListView.propTypes = {
  documents: PropTypes.array.isRequired, // eslint-disable-line react/forbid-prop-types
  folders: PropTypes.array.isRequired, // eslint-disable-line react/forbid-prop-types
  currentUserId: PropTypes.string.isRequired,
  isAdmin: PropTypes.bool.isRequired,
  isManager: PropTypes.bool.isRequired,
  canManage: PropTypes.bool.isRequired,
  onUpdate: PropTypes.func.isRequired,
  onDelete: PropTypes.func.isRequired,
};

export default DocumentsListView;
