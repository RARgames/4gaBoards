import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import clsx from 'clsx';
import PropTypes from 'prop-types';

import ProjectNavContainer from '../../../containers/Project/ProjectNavContainer';
import { Button, ButtonStyle, FilePicker, Icon, IconType, IconSize, Input, InputStyle } from '../../Utils';
import DocumentsAddZone from './DocumentsAddZone';
import DocumentsGridView from './DocumentsGridView';
import DocumentsListView from './DocumentsListView';

import * as s from './Documents.module.scss';

const ViewModes = {
  LIST: 'list',
  GRID: 'grid',
};

const Documents = React.memo(({ projectId, documents, currentUserId, isAdmin, isManager, canManage, onDocumentsFetch, onCreate, onUpdate, onDelete }) => {
  const [t] = useTranslation();
  const [search, setSearch] = useState('');
  const [activeFolder, setActiveFolder] = useState(null);
  const [viewMode, setViewMode] = useState(ViewModes.LIST);

  useEffect(() => {
    onDocumentsFetch(projectId);
  }, [projectId, onDocumentsFetch]);

  const folders = useMemo(() => {
    const set = new Set();
    documents.forEach((document) => {
      if (document.folder) {
        set.add(document.folder);
      }
    });
    return Array.from(set).sort();
  }, [documents]);

  const cleanSearch = search.trim().toLowerCase();
  const filteredDocuments = useMemo(
    () =>
      documents.filter((document) => {
        if (activeFolder !== null && document.folder !== activeFolder) {
          return false;
        }

        if (!cleanSearch) {
          return true;
        }

        return document.name.toLowerCase().includes(cleanSearch) || (document.description && document.description.toLowerCase().includes(cleanSearch));
      }),
    [documents, activeFolder, cleanSearch],
  );

  const handleUpload = useCallback(
    (file) => {
      onCreate(projectId, {
        file,
        ...(activeFolder && { folder: activeFolder }),
      });
    },
    [projectId, onCreate, activeFolder],
  );

  const handleUpdate = useCallback(
    (id, data) => {
      onUpdate(id, data);
    },
    [onUpdate],
  );

  const handleDelete = useCallback(
    (id) => {
      onDelete(id);
    },
    [onDelete],
  );

  const viewProps = {
    documents: filteredDocuments,
    folders,
    currentUserId,
    isAdmin,
    isManager,
    canManage,
    onUpdate: handleUpdate,
    onDelete: handleDelete,
  };

  const renderContent = () => {
    if (documents.length === 0) {
      return (
        <div className={s.empty}>
          <Icon type={IconType.Attach} size={IconSize.Size20} className={s.emptyIcon} />
          <h1 className={s.emptyTitle}>{t('common.noDocumentsYet_title')}</h1>
          {canManage && (
            <FilePicker multiple onSelect={handleUpload}>
              <Button style={ButtonStyle.Submit} content={t('action.uploadFirstDocument')} />
            </FilePicker>
          )}
        </div>
      );
    }

    if (filteredDocuments.length === 0) {
      return (
        <div className={s.empty}>
          <h1 className={s.emptyTitle}>{t('common.noMatchingDocuments_title')}</h1>
        </div>
      );
    }

    // eslint-disable-next-line react/jsx-props-no-spreading
    return viewMode === ViewModes.LIST ? <DocumentsListView {...viewProps} /> : <DocumentsGridView {...viewProps} />;
  };

  return (
    <div className={s.wrapper}>
      <ProjectNavContainer />
      <DocumentsAddZone disabled={!canManage} onCreate={handleUpload}>
        <div className={s.body}>
          <div className={s.header}>
            <div className={s.folderChips}>
              <Button style={ButtonStyle.NoBackground} className={clsx(s.chip, activeFolder === null && s.chipActive)} onClick={() => setActiveFolder(null)}>
                {t('common.allDocuments')}
              </Button>
              {folders.map((folder) => (
                <Button key={folder} style={ButtonStyle.NoBackground} className={clsx(s.chip, activeFolder === folder && s.chipActive)} onClick={() => setActiveFolder(folder)}>
                  {folder}
                </Button>
              ))}
            </div>
            <div className={s.headerActions}>
              <Input style={InputStyle.Default} value={search} placeholder={t('common.searchDocuments')} onChange={(e) => setSearch(e.target.value)} className={s.searchInput} />
              <Button style={ButtonStyle.Icon} title={t('common.listView')} className={clsx(viewMode === ViewModes.LIST && s.viewButtonActive)} onClick={() => setViewMode(ViewModes.LIST)}>
                <Icon type={IconType.List} size={IconSize.Size14} />
              </Button>
              <Button style={ButtonStyle.Icon} title={t('common.gridView')} className={clsx(viewMode === ViewModes.GRID && s.viewButtonActive)} onClick={() => setViewMode(ViewModes.GRID)}>
                <Icon type={IconType.Image} size={IconSize.Size14} />
              </Button>
              {canManage && (
                <FilePicker multiple onSelect={handleUpload}>
                  <Button style={ButtonStyle.Submit} content={t('action.upload', { context: 'title' })} />
                </FilePicker>
              )}
            </div>
          </div>
          {renderContent()}
        </div>
      </DocumentsAddZone>
    </div>
  );
});

Documents.propTypes = {
  projectId: PropTypes.string.isRequired,
  documents: PropTypes.array.isRequired, // eslint-disable-line react/forbid-prop-types
  currentUserId: PropTypes.string.isRequired,
  isAdmin: PropTypes.bool.isRequired,
  isManager: PropTypes.bool.isRequired,
  canManage: PropTypes.bool.isRequired,
  onDocumentsFetch: PropTypes.func.isRequired,
  onCreate: PropTypes.func.isRequired,
  onUpdate: PropTypes.func.isRequired,
  onDelete: PropTypes.func.isRequired,
};

export default Documents;
