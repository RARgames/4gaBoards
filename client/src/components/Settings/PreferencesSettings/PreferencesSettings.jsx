import React, { useCallback, useMemo } from 'react';
import PropTypes from 'prop-types';
import { useTranslation } from 'react-i18next';
import classNames from 'classnames';
import { Dropdown, Radio, RadioSize, Table } from '../../Utils';
import locales from '../../../locales';

import styles from './PreferencesSettings.module.scss';
import sShared from '../SettingsShared.module.scss';
import gStyles from '../../../globalStyles.module.scss';

const PreferencesSettings = React.memo(({ subscribeToOwnCards, sidebarCompact, language, onUpdate, onLanguageUpdate }) => {
  const [t] = useTranslation();
  const languages = useMemo(
    () => [
      {
        id: 'auto',
        name: t('common.detectAutomatically'),
      },
      ...locales.map((locale) => ({
        id: locale.language,
        flag: locale.country.toUpperCase(),
        name: locale.name,
      })),
    ],
    [t],
  );
  const selectedLanguage = useMemo(() => languages.find((lang) => lang.id === (language || 'auto')), [languages, language]);

  const handleSubscribeToOwnCardsChange = useCallback(() => {
    onUpdate({
      subscribeToOwnCards: !subscribeToOwnCards,
    });
  }, [subscribeToOwnCards, onUpdate]);

  const handleCompactSidebarChange = useCallback(() => {
    onUpdate({
      sidebarCompact: !sidebarCompact,
    });
  }, [sidebarCompact, onUpdate]);

  const handleLanguageChange = useCallback(
    (value) => {
      onLanguageUpdate(value.id === 'auto' ? null : value.id); // FIXME: hack
    },
    [onLanguageUpdate],
  );

  return (
    <div className={sShared.wrapper}>
      <div className={sShared.header}>
        <h2 className={sShared.headerText}>{t('common.preferences')}</h2>
      </div>
      <Table.Wrapper className={classNames(sShared.contentWrapper, gStyles.scrollableXY)}>
        <Table>
          <Table.Header>
            <Table.HeaderRow>
              <Table.HeaderCell>{t('common.preferences')}</Table.HeaderCell>
              <Table.HeaderCell>{t('common.modifySettings')}</Table.HeaderCell>
              <Table.HeaderCell>{t('common.currentValue')}</Table.HeaderCell>
              <Table.HeaderCell>{t('common.description')}</Table.HeaderCell>
            </Table.HeaderRow>
          </Table.Header>
          <Table.Body>
            <Table.Row>
              <Table.Cell>{t('common.subscribeToMyOwnCards')}</Table.Cell>
              <Table.Cell aria-label={t('common.toggleSettings')}>
                <Radio size={RadioSize.Size12} checked={subscribeToOwnCards} onChange={handleSubscribeToOwnCardsChange} />
              </Table.Cell>
              <Table.Cell>{subscribeToOwnCards ? t('common.enabled') : t('common.disabled')}</Table.Cell>
              <Table.Cell>{t('common.descriptionSubscribeToMyOwnCards')}</Table.Cell>
            </Table.Row>
            <Table.Row>
              <Table.Cell>{t('common.sidebarCompact')}</Table.Cell>
              <Table.Cell aria-label={t('common.toggleSettings')}>
                <Radio size={RadioSize.Size12} checked={sidebarCompact} onChange={handleCompactSidebarChange} />
              </Table.Cell>
              <Table.Cell>{sidebarCompact ? t('common.enabled') : t('common.disabled')}</Table.Cell>
              <Table.Cell>{t('common.descriptionCompactSidebar')}</Table.Cell>
            </Table.Row>
            <Table.Row>
              <Table.Cell> {t('common.language', { context: 'title' })}</Table.Cell>
              <Table.Cell className={styles.languageCell} aria-label={t('common.toggleSettings')}>
                <Dropdown
                  options={languages}
                  placeholder={selectedLanguage.name}
                  defaultItem={selectedLanguage}
                  isSearchable
                  selectFirstOnSearch
                  onChange={handleLanguageChange}
                  className={styles.languageDropdown}
                />
              </Table.Cell>
              <Table.Cell>{selectedLanguage.name}</Table.Cell>
              <Table.Cell>{t('common.descriptionSLanguage')}</Table.Cell>
            </Table.Row>
          </Table.Body>
        </Table>
      </Table.Wrapper>
    </div>
  );
});

PreferencesSettings.propTypes = {
  subscribeToOwnCards: PropTypes.bool.isRequired,
  sidebarCompact: PropTypes.bool.isRequired,
  language: PropTypes.string,
  onUpdate: PropTypes.func.isRequired,
  onLanguageUpdate: PropTypes.func.isRequired,
};

PreferencesSettings.defaultProps = {
  language: undefined,
};

export default PreferencesSettings;
