import { fetch } from 'whatwg-fetch';

import Config from '../constants/Config';

const http = {};

['POST', 'GET'].forEach((method) => {
  http[method.toLowerCase()] = (url, data = {}, headers = {}) => {
    const isPostMethod = method === 'POST';
    const options = {
      method,
      headers,
    };

    if (isPostMethod) {
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
