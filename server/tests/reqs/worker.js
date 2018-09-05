const request = require('supertest-as-promised');
const app = require('../../../index');
const queryString = require('query-string');

module.exports = {
  get: ({ accessToken, query = {} }) => request(app)
    .get(`/api/workers${queryString.stringify(query)}`)
    .set('Authorization', `bearer ${accessToken}`),
  getById: ({ accessToken, workerId }) => request(app)
    .get(`/api/workers/${workerId}`)
    .set('Authorization', `bearer ${accessToken}`),
  create: ({ data, accessToken }) => request(app)
    .post('/api/workers')
    .set('Authorization', `bearer ${accessToken}`)
    .send(data),
  update: ({ workerId, data, accessToken }) => request(app)
    .put(`/api/workers/${workerId}`)
    .set('Authorization', `bearer ${accessToken}`)
    .send(data),
  delete: ({ workerId, accessToken }) => request(app)
    .delete(`/api/workers/${workerId}`)
    .set('Authorization', `bearer ${accessToken}`)
};
