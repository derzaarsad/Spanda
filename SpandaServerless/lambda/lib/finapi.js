'use strict'

exports.NewClient = (client) => {
  const requestWebForm = async (authorization, bankId) => {
    const params = {
      headers: {
        'Authorization': authorization,
        'Content-Type': 'application/json'
      },
      data: {
        'bankId': bankId
      },
      validateStatus: status => status === 451
    }

    return client.post('/api/v1/bankConnections/import', params).then(response => {
      const body = response.data
      const headers = response.headers

      return {
        location: headers['Location'],
        formId: body.errors[0].message
      }
    });
  }

  return {
    userInfo: async (authorization) => {
      const params = {
        headers: {
          'Authorization': authorization,
        },
      }
      return client.get('/api/v1/users', params).then(response => response.data)
    },

    registerUser: async (authorization, user) => {
      const req = {
        data: user,
        headers: {
          'Authorization': authorization,
          'Content-Type': 'application/json'
        }
      }

      return client.post('/api/v1/users', req).then(response => response.data)
    },

    fetchWebForm: async (authorization, formId) => {
      const req = {
        headers: {
          'Authorization': authorization,
        },
        params: {
          'bankId': bankId
        },
      }

      const resource = '/api/v1/webForms/' + formId
      return client.get(resource, req).then(response => response.data)
    },

    listBanksByBLZ: async (authorization, blz, pagination = { page: 1, itemsPerPage: 2 }) => {
      const req = {
        params: {
          search: blz,
          page: pagination.page,
          perPage: pagination.itemsPerPage
        },
        headers: {
          'Authorization': authorization
        }
      }

      return client.get('/api/v1/banks', req).then(response => response.data)
    },

    importConnection: async (authorization, bankId) => {
      return requestWebForm(authorization, bankId).then(webFormId => {
        const formId = webFormId.formId
        const url = webFormId.location
        const resource = '/api/v1/webForms/' + formId

        const params = {
          baseURL: url,
          headers: {
            'Authorization': authorization,
          }
        }

        return client.post(resource, params)
          .then(response => [ response.data, formId ]);
      })
    }
  }
}
