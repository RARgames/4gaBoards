import React from 'react';
import { useTranslation } from 'react-i18next';
import PropTypes from 'prop-types';

import { Button, ButtonStyle, Icon, IconType, IconSize } from '../../Utils';
import DocumentActionsPopup from './DocumentActionsPopup';

import * as gs from '../../../global.module.scss';
import * as s from './DocumentsGridView.module.scss';

const DocumentsGridView = React.memo(({ documents, folders, currentUserId, isAdmin, isManager, canManage, onUpdate, onDelete }) => {
  const [t] = useTranslation();

  return (
    <div className={gs.scrollableY}>
      <div className={s.grid}>
        {documents.map((document) => {
          const canDelete = isAdmin || isManager || document.createdById === currentUserId;
          const isImage = !!document.image;

          return (
            <div key={document.id} className={s.card}>
              <div className={s.thumbnail} style={isImage ? { backgroundImage: `url(${document.coverUrl})` } : undefined}>
                {!isImage && <Icon type={IconType.Attach} size={IconSize.Size20} />}
              </div>
              <div className={s.cardBody}>
                <div className={s.name} title={document.name}>
                  {document.name}
                </div>
                {document.folder && <div className={s.folder}>{document.folder}</div>}
              </div>
              <DocumentActionsPopup
                document={document}
                folders={folders}
                canDelete={canManage && canDelete}
                onUpdate={(data) => onUpdate(document.id, data)}
                onDelete={() => onDelete(document.id)}
                offset={5}
                position="bottom-end"
              >
                <Button style={ButtonStyle.Icon} title={t('common.documentActions', { context: 'title' })} className={s.actionsButton}>
                  <Icon type={IconType.EllipsisVertical} size={IconSize.Size14} />
                </Button>
              </DocumentActionsPopup>
            </div>
          );
        })}
      </div>
    </div>
  );
});

DocumentsGridView.propTypes = {
  documents: PropTypes.array.isRequired, // eslint-disable-line react/forbid-prop-types
  folders: PropTypes.array.isRequired, // eslint-disable-line react/forbid-prop-types
  currentUserId: PropTypes.string.isRequired,
  isAdmin: PropTypes.bool.isRequired,
  isManager: PropTypes.bool.isRequired,
  canManage: PropTypes.bool.isRequired,
  onUpdate: PropTypes.func.isRequired,
  onDelete: PropTypes.func.isRequired,
};

export default DocumentsGridView;
