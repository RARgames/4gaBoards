import { fetch } from 'whatwg-fetch';

import Config from '../constants/Config';

const http = {};

['POST', 'GET', 'PATCH', 'DELETE'].forEach((method) => {
  http[method.toLowerCase()] = (url, data = {}, headers = {}) => {
    const hasBody = method === 'POST' || method === 'PATCH';
    const options = {
      method,
      credentials: 'include',
      headers: { ...headers, 'X-4gaBoards-Request': '1' },
    };

    if (hasBody) {
      const formData = new FormData();

      Object.keys(data).forEach((key) => {
        formData.append(key, data[key]);
      });

      options.body = formData;
    }

    return fetch(`${Config.SERVER_BASE_URL}/api${url}`, options)
      .then((response) =>
        response.json().then((body) => ({
          body,
          isError: response.status !== 200,
        })),
      )
      .then(({ body, isError }) => {
        if (isError) {
          throw body;
        }

        return body;
      });
  };
});

export default http;
