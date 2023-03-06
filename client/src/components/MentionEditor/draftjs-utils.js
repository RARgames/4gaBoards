import { convertToRaw } from 'draft-js';

const getTextWithoutPrefix = (editorState) => {
  const contentState = editorState.getCurrentContent();
  return contentState.getPlainText().trim();
};

const getTextWithPrefix = (editorState) => {
  const contentState = editorState.getCurrentContent();
  const rawContentState = convertToRaw(contentState);
  let text = '';
  let lastOffset = 0;
  rawContentState.blocks.forEach((block) => {
    // Get the text of the block
    const blockText = block.text;
    // Iterate over the entity ranges in the block
    block.entityRanges.forEach((entityRange) => {
      // Get the entity object
      const entity = rawContentState.entityMap[entityRange.key];
      // If the entity is a mention, replace it with its corresponding text and prefix
      if (entity.type === '#mention' || entity.type === 'mention') {
        const { prefix, name } = entity.data.mention;
        const mentionText = `${prefix}${name}`;
        text += `${blockText.slice(lastOffset, entityRange.offset)}${mentionText}`;
        lastOffset = entityRange.offset + entityRange.length;
      }
    });
    // Add the remaining text of the block to the result
    text += `${blockText.slice(lastOffset)}\n`;
    lastOffset = 0;
  });

  return text;
};

const getMentionsData = (editorState) => {
  const contentState = editorState.getCurrentContent();
  const { entityMap } = convertToRaw(contentState);

  const keys = Object.keys(entityMap);
  const mentionsData = {
    users: [],
    labels: [],
  };

  keys.forEach((key) => {
    const mentionObj = entityMap[key];
    const { id } = mentionObj.data.mention;
    if (mentionObj.type === 'mention') {
      mentionsData.users.push(id);
    } else if (mentionObj.type === '#mention') {
      mentionsData.labels.push(id);
    }
  });

  return mentionsData;
};

export { getTextWithPrefix, getTextWithoutPrefix, getMentionsData };
