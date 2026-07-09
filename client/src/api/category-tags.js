import socket from './socket';

const getCategoryTags = (headers) => socket.get('/category-tags', {}, headers);

const createCategoryTag = (data, headers) => socket.post('/category-tags', data, headers);

export default {
  getCategoryTags,
  createCategoryTag,
};
