'use strict'

exports.NewClient = (http) => {
  const requestWebForm = async (authorization, bankId) => {
    const data = {
      'bankId': bankId
    }

    const config = {
      headers: {
        'Authorization': authorization,
        'Content-Type': 'application/json'
      },
      validateStatus: status => status === 451
    }

    return http.post('/api/v1/bankConnections/import', data, config).then(response => {
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
        'headers': {
          'Authorization': authorization,
        },
      }
      return http.get('/api/v1/users', params).then(response => response.data)
    },

    registerUser: async (authorization, user) => {
      const config = {
        'headers': {
          'Authorization': authorization,
          'Content-Type': 'application/json'
        }
      }

      return http.post('/api/v1/users', user, config).then(response => response.data)
    },

    fetchWebForm: async (authorization, formId) => {
      const req = {
        headers: {
          'Authorization': authorization,
        },
      }

      const resource = '/api/v1/webForms/' + formId
      return http.get(resource, req).then(response => response.data)
    },

    listBanksByBLZ: async (authorization, blz, pagination = { page: 1, itemsPerPage: 2 }) => {
      const req = {
        'params': {
          'search': blz,
          'page': pagination.page,
          'perPage': pagination.itemsPerPage
        },
        'headers': {
          'Authorization': authorization
        }
      }

      return http.get('/api/v1/banks', req).then(response => response.data)
    },

    importConnection: async (authorization, bankId) => {
      return requestWebForm(authorization, bankId).then(webFormId => {
        const formId = webFormId.formId
        const url = webFormId.location
        const resource = '/api/v1/webForms/' + formId

        const data = {}

        const config = {
          'baseURL': url,
          'headers': {
            'Authorization': authorization
          }
        }

        return http.post(resource, data, config)
          .then(response => [ response.data, formId ]);
      })
    }
  }
}
