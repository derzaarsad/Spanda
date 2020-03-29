import { FinAPIModel } from "dinodime-lib";

const importConnectionResponse = {
  id: 1,
  bankId: 277672,
  name: "Bank Connection",
  bankingUserId: "XXXXX",
  bankingCustomerId: "XXXXX",
  bankingPin: "XXXXX",
  type: "DEMO",
  updateStatus: "READY",
  categorizationStatus: "READY",
  lastManualUpdate: {
    result: "INTERNAL_SERVER_ERROR",
    errorMessage: "Internal server error",
    errorType: "TECHNICAL",
    timestamp: "2018-01-01 00:00:00.000"
  },
  lastAutoUpdate: {
    result: "INTERNAL_SERVER_ERROR",
    errorMessage: "Internal server error",
    errorType: "TECHNICAL",
    timestamp: "2018-01-01 00:00:00.000"
  },
  ibanOnlyMoneyTransferSupported: true,
  ibanOnlyDirectDebitSupported: true,
  collectiveMoneyTransferSupported: true,
  defaultTwoStepProcedureId: "955",
  twoStepProcedures: [
    {
      procedureId: "955",
      procedureName: "mobileTAN",
      procedureChallengeType: "TEXT",
      implicitExecute: true
    }
  ],
  interfaces: [
    {
      interface: "FINTS_SERVER",
      loginCredentials: [
        {
          label: "Customer ID",
          value: "string"
        }
      ],
      defaultTwoStepProcedureId: "955",
      twoStepProcedures: [
        {
          procedureId: "955",
          procedureName: "mobileTAN",
          procedureChallengeType: "TEXT",
          implicitExecute: true
        }
      ],
      aisConsent: {
        status: "PRESENT",
        expiresAt: "2019-07-20 09:05:10.546"
      },
      lastManualUpdate: {
        result: "INTERNAL_SERVER_ERROR",
        errorMessage: "Internal server error",
        errorType: "TECHNICAL",
        timestamp: "2018-01-01 00:00:00.000"
      },
      lastAutoUpdate: {
        result: "INTERNAL_SERVER_ERROR",
        errorMessage: "Internal server error",
        errorType: "TECHNICAL",
        timestamp: "2018-01-01 00:00:00.000"
      }
    }
  ],
  accountIds: [1, 2, 3],
  owners: [
    {
      firstName: "Max",
      lastName: "Mustermann",
      salutation: "Herr",
      title: "Dr.",
      email: "email@localhost.de",
      dateOfBirth: "1980-01-01",
      postCode: "80000",
      country: "Deutschland",
      city: "München",
      street: "Musterstraße",
      houseNumber: "99"
    }
  ],
  bank: {
    id: 277672,
    name: "FinAPI Test Bank",
    loginHint: "Bitte geben Sie Ihre Online-Identifikation und Ihre PIN ein.",
    bic: "TESTBANKING",
    blzs: [],
    blz: "00000000",
    location: "DE",
    city: "München",
    isSupported: true,
    isTestBank: true,
    popularity: 95,
    health: 100,
    loginFieldUserId: "Onlinebanking-ID",
    loginFieldCustomerId: "Kunden-ID",
    loginFieldPin: "PIN",
    pinsAreVolatile: true,
    isCustomerIdPassword: true,
    supportedDataSources: ["FINTS_SERVER", "WEB_SCRAPER"],
    interfaces: [
      {
        interface: "FINTS_SERVER",
        tppAuthenticationGroup: {
          id: 1,
          name: "AirBank XS2A CZ"
        },
        loginCredentials: [
          {
            label: "Nutzerkennung",
            isSecret: true,
            isVolatile: true
          }
        ],
        properties: ["REDIRECT_APPROACH"],
        loginHint: "Bitte geben Sie nur die ersten fünf Stellen Ihrer PIN ein.",
        health: 100,
        lastCommunicationAttempt: "2018-01-01 00:00:00.000",
        lastSuccessfulCommunication: "2018-01-01 00:00:00.000"
      }
    ],
    bankGroup: {
      id: 1,
      name: "FinAPI Test Bank Group"
    },
    lastCommunicationAttempt: "2018-01-01 00:00:00.000",
    lastSuccessfulCommunication: "2018-01-01 00:00:00.000"
  },
  furtherLoginNotRecommended: true
};

const encodedImportConnectionResponse = JSON.stringify(importConnectionResponse);

const transactionsPerAccountId = {
  1: {
    transactions: [
      {
        id: 1,
        parentId: 2,
        accountId: 1,
        valueDate: "2018-01-01 00:00:00.000",
        bankBookingDate: "2018-01-01 00.00.00.000",
        finapiBookingDate: "2018-01-01 00:00:00.000",
        amount: -99.99,
        purpose: "Restaurantbesuch",
        counterpartName: "Bar Centrale",
        counterpartAccountNumber: "0061110500",
        counterpartIban: "DE13700800000061110500",
        counterpartBlz: "70080000",
        counterpartBic: "DRESDEFF700",
        counterpartBankName: "Commerzbank vormals Dresdner Bank",
        counterpartMandateReference: "MR123",
        counterpartCustomerReference: "CUR123",
        counterpartCreditorId: "CRI123",
        counterpartDebitorId: "CRI098",
        type: "Überweisungsauftrag",
        typeCodeZka: "999",
        typeCodeSwift: "RAPRDE51",
        sepaPurposeCode: "OTHR",
        primanota: "Primanota",
        category: {
          id: 378,
          name: "Sport & Fitness",
          parentId: 373,
          parentName: "Freizeit, Hobbys & Soziales",
          isCustom: true,
          children: [1, 2, 3]
        },
        labels: [],
        isPotentialDuplicate: true,
        isAdjustingEntry: true,
        isNew: true,
        importDate: "2018-01-01 00:00:00.000",
        children: [],
        paypalData: {
          invoiceNumber: "INV2-KXVU-7Z64-DT6W-MG2X",
          fee: -0.99,
          net: 9.99,
          auctionSite: "eBay"
        },
        endToEndReference: "001100550526",
        compensationAmount: -1.11,
        originalAmount: -9.99,
        differentDebitor: "DIFD70204",
        differentCreditor: "DIFC98450"
      }
    ],
    paging: {
      page: 1,
      perPage: 20,
      pageCount: 1,
      totalCount: 1
    },
    income: 0,
    spending: 0,
    balance: 0
  },
  2: {
    transactions: [],
    paging: {
      page: 1,
      perPage: 20,
      pageCount: 1,
      totalCount: 0
    },
    income: 0,
    spending: 0,
    balance: 0
  },
  3: {
    transactions: [],
    paging: {
      page: 1,
      perPage: 20,
      pageCount: 1,
      totalCount: 0
    },
    income: 0,
    spending: 0,
    balance: 0
  }
};

const Constants = {
  authenticatedUserToken: "abc.def.xyz",

  authenticatedUser: {
    id: "demo",
    password: "XXXXX",
    email: "demo@localhost.de",
    phone: "+49 99 999999-999",
    isAutoUpdateEnabled: true
  },

  webFormRedirectResponse: {
    errors: [
      {
        message: "909408",
        code: FinAPIModel.ErrorDetails.CodeEnum.WEBFORMREQUIRED,
        type: FinAPIModel.ErrorDetails.TypeEnum.BUSINESS
      }
    ],
    date: "2020-03-29 18:22:29.983",
    requestId: "selfgen-de387543-ed50-4a2f-a1ec-68e0abf48580",
    endpoint: "POST /api/v1/bankConnections/import",
    authContext: "3461/966184",
    bank: "00000000 - FinAPI Test Bank"
  },

  webFormResponse: {
    id: 1,
    token:
      "03FhQiom8CJUL7rkRgBMCOF9KXlGL9p7kPpW4puMKDD5QbeRm9E9Vzr1xBcokaxZt5PGRscn8HI8xuL8voLkirocxgFIF7wU8B240R5ccSjfPru9vXTBHBEycmBs8Rk2",
    status: FinAPIModel.WebForm.StatusEnum.COMPLETED,
    serviceResponseCode: 200,
    serviceResponseBody: encodedImportConnectionResponse
  },

  transactionsPerAccountId: transactionsPerAccountId
};

export default Constants;
