'use strict'
const querystring = require('querystring');

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
        location: headers.location,
        formId: body.errors[0].message
      }
    });
  }

  const getTransactionPerPage = async (authorization, accountIds, page, bankPerPage) => {
    const params = {
      headers: {
        'Authorization': authorization,
        'Content-Type': 'application/json'
      }
    }

    const query = {
      view: 'bankView',
      accountIds: accountIds.join('%2C'),
      direction: 'all',
      includeChildCategories: 'true',
      page: page.toString(),
      perPage: bankPerPage.toString(),
      order: 'finapiBookingDate,asc'
    }

    return http.get("/api/v1/transactions?"+ querystring.stringify(query), params).then(response => response.data);
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
      return requestWebForm(authorization, bankId)
    },

    getAllTransactions: async (authorization, accountIds) => {
      const bankPerPage = 400;
      const firstPageResponseJson = await getTransactionPerPage(authorization, accountIds, 1, bankPerPage);
      let transactions = firstPageResponseJson.transactions;

      for (var i = 2; i <= firstPageResponseJson.paging.pageCount; ++i) {
        const pageResponseJson = await getTransactionPerPage(authorization, accountIds, i, bankPerPage);
        transactions = transactions.concat(pageResponseJson.transactions)
      }

      // map the finapi json into database columns
      transactions = transactions.map(function(transaction) {
        return [
          transaction.id,
          transaction.accountId,
          transaction.amount,
          transaction.finapiBookingDate.replace(" ","T") + "Z",
          transaction.purpose,
          transaction.counterpartName,
          transaction.counterpartAccountNumber,
          transaction.counterpartIban,
          transaction.counterpartBlz,
          transaction.counterpartBic,
          transaction.counterpartBankName
        ];
      });

      return transactions;
    }
  }
}
