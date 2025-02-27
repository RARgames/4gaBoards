import React, { useCallback, useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import classNames from 'classnames';
import PropTypes from 'prop-types';

import locales from '../../../locales';
import { Dropdown, DropdownStyle, Radio, RadioSize, Table } from '../../Utils';

import * as gStyles from '../../../globalStyles.module.scss';
import * as sShared from '../SettingsShared.module.scss';
import * as s from './PreferencesSettings.module.scss';

const PreferencesSettings = React.memo(({ subscribeToOwnCards, sidebarCompact, language, onUpdate }) => {
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
      onUpdate({ language: value.id === 'auto' ? null : value.id }); // FIXME: hack
    },
    [onUpdate],
  );

  return (
    <div className={sShared.wrapper}>
      <div className={sShared.header}>
        <h2 className={sShared.headerText}>{t('common.preferences')}</h2>
      </div>
      <Table.Wrapper className={classNames(gStyles.scrollableXY)}>
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
                <Radio size={RadioSize.Size12} checked={subscribeToOwnCards} onChange={handleSubscribeToOwnCardsChange} title={t('common.toggleSubscribeToMyOwnCards')} />
              </Table.Cell>
              <Table.Cell>{subscribeToOwnCards ? t('common.enabled') : t('common.disabled')}</Table.Cell>
              <Table.Cell>{t('common.descriptionSubscribeToMyOwnCards')}</Table.Cell>
            </Table.Row>
            <Table.Row>
              <Table.Cell>{t('common.sidebarCompact')}</Table.Cell>
              <Table.Cell aria-label={t('common.toggleSettings')}>
                <Radio size={RadioSize.Size12} checked={sidebarCompact} onChange={handleCompactSidebarChange} title={t('common.toggleCompactSidebar')} />
              </Table.Cell>
              <Table.Cell>{sidebarCompact ? t('common.enabled') : t('common.disabled')}</Table.Cell>
              <Table.Cell>{t('common.descriptionCompactSidebar')}</Table.Cell>
            </Table.Row>
            <Table.Row>
              <Table.Cell> {t('common.language', { context: 'title' })}</Table.Cell>
              <Table.Cell className={s.languageCell} aria-label={t('common.toggleSettings')}>
                <Dropdown
                  style={DropdownStyle.FullWidth}
                  options={languages}
                  placeholder={selectedLanguage.name}
                  defaultItem={selectedLanguage}
                  isSearchable
                  selectFirstOnSearch
                  forcePlaceholder
                  onChange={handleLanguageChange}
                  className={s.languageDropdown}
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
};

PreferencesSettings.defaultProps = {
  language: undefined,
};

export default PreferencesSettings;
