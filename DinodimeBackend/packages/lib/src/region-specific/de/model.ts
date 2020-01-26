export namespace Model {
  /**
   * User access token info
   */
  export class AccessToken {
    /**
     * Token type (it's always 'bearer')
     */
    "tokenType": string;
    /**
     * Expiration time in seconds. A value of 0 means that the token never expires (unless it is explicitly invalidated, e.g. by revocation, or when a user gets locked).
     */
    "expiresIn": number;
    /**
     * Requested scopes (it's always 'all')
     */
    "scope": string;
    /**
     * Refresh token. Only set in case of grant_type='password'. Token has a length of up to 128 characters.
     */
    "refreshToken"?: string;
    /**
     * Access token. Token has a length of up to 128 characters.
     */
    "accessToken": string;

    static discriminator: string | undefined = undefined;

    static attributeTypeMap: Array<{ name: string; baseName: string; type: string }> = [
      {
        name: "tokenType",
        baseName: "token_type",
        type: "string"
      },
      {
        name: "expiresIn",
        baseName: "expires_in",
        type: "number"
      },
      {
        name: "scope",
        baseName: "scope",
        type: "string"
      },
      {
        name: "refreshToken",
        baseName: "refresh_token",
        type: "string"
      },
      {
        name: "accessToken",
        baseName: "access_token",
        type: "string"
      }
    ];

    static getAttributeTypeMap() {
      return AccessToken.attributeTypeMap;
    }
  }

  /**
   * Container for a bank account's data
   */
  export class Account {
    /**
     * Account identifier
     */
    "id": number;
    /**
     * Identifier of the bank connection that this account belongs to
     */
    "bankConnectionId": number;
    /**
     * Account name
     */
    "accountName"?: string;
    /**
     * Account's IBAN. Note that this field can change from 'null' to a value - or vice versa - any time when the account is being updated. This is subject to changes within the bank's internal account management.
     */
    "iban"?: string;
    /**
     * (National) account number. Note that this value might change whenever the account is updated (for example, leading zeros might be added or removed).
     */
    "accountNumber": string;
    /**
     * Account's sub-account-number. Note that this field can change from 'null' to a value - or vice versa - any time when the account is being updated. This is subject to changes within the bank's internal account management.
     */
    "subAccountNumber"?: string;
    /**
     * Name of the account holder
     */
    "accountHolderName"?: string;
    /**
     * Bank's internal identification of the account holder. Note that if your client has no license for processing this field, it will always be 'XXXXX'
     */
    "accountHolderId"?: string;
    /**
     * Account's currency
     */
    "accountCurrency"?: string;
    /**
     * Identifier of the account's type. Note that, in general, the type of an account can change any time when the account is being updated. This is subject to changes within the bank's internal account management. However, if the account's type has previously been changed explicitly (via the PATCH method), then the explicitly set type will NOT be automatically changed anymore, even if the type has changed on the bank side. <br/>Note: this field is deprecated and would be removed at some point. Please refer to new field in 'accountType' instead.<br/>1 = Checking,<br/>2 = Savings,<br/>3 = CreditCard,<br/>4 = Security,<br/>5 = Loan,<br/>6 = Pocket (DEPRECATED; will not be returned for any account unless this type has explicitly been set via PATCH),<br/>7 = Membership,<br/>8 = Bausparen<br/>
     */
    "accountTypeId": number;
    /**
     * Name of the account's type<br/>Note: this field is deprecated and would be removed at some point. Please refer to new field in 'accountType' instead.
     */
    "accountTypeName": string;
    /**
     * An account type.<br/><br/>Checking,<br/>Savings,<br/>CreditCard,<br/>Security,<br/>Loan,<br/>Pocket (DEPRECATED; will not be returned for any account unless this type has explicitly been set via PATCH),<br/>Membership,<br/>Bausparen<br/><br/>
     */
    "accountType"?: Account.AccountTypeEnum;
    /**
     * Current account balance
     */
    "balance"?: number;
    /**
     * Current overdraft
     */
    "overdraft"?: number;
    /**
     * Overdraft limit
     */
    "overdraftLimit"?: number;
    /**
     * Current available funds. Note that this field is only set if finAPI can make a definite statement about the current available funds. This might not always be the case, for example if there is not enough information available about the overdraft limit and current overdraft.
     */
    "availableFunds"?: number;
    /**
     * THIS FIELD IS DEPRECATED AND WILL BE REMOVED. Refer to the corresponding field in 'interfaces' instead.<br/><br/>Timestamp of when the account was last successfully updated (or initially imported); more precisely: time when the account data (balance and positions) has been stored into the finAPI databases. The value is returned in the format 'YYYY-MM-DD HH:MM:SS.SSS' (german time).
     */
    "lastSuccessfulUpdate"?: string;
    /**
     * THIS FIELD IS DEPRECATED AND WILL BE REMOVED. Refer to the corresponding field in 'interfaces' instead.<br/><br/>Timestamp of when the account was last tried to be updated (or initially imported); more precisely: time when the update (or initial import) was triggered. The value is returned in the format 'YYYY-MM-DD HH:MM:SS.SSS' (german time).
     */
    "lastUpdateAttempt"?: string;
    /**
     * Indicating whether this account is 'new' or not. Any newly imported account will have this flag initially set to true, and remain so until you set it to false (see PATCH /accounts/<id>). How you use this field is up to your interpretation, however it is recommended to set the flag to false for all accounts right after the initial import of the bank connection. This way, you will be able recognize accounts that get newly imported during a later update of the bank connection, by checking for any accounts with the flag set to true right after an update.
     */
    "isNew": boolean;
    /**
     * THIS FIELD IS DEPRECATED AND WILL BE REMOVED. Refer to the 'status' field in 'interfaces' instead.<br/><br/>The current status of the account. Possible values are:<br/>&bull; <code>UPDATED</code> means that the account is up to date from finAPI's point of view. This means that no current import/update is running, and the previous import/update could successfully update the account's data (e.g. transactions and securities), and the bank given balance matched the transaction's calculated sum, meaning that no adjusting entry ('Zwischensaldo' transaction) was inserted.<br/>&bull; <code>UPDATED_FIXED</code> means that the account is up to date from finAPI's point of view (no current import/update is running, and the previous import/update could successfully update the account's data), BUT there was a deviation in the bank given balance which was fixed by adding an adjusting entry ('Zwischensaldo' transaction).<br/>&bull; <code>DOWNLOAD_IN_PROGRESS</code> means that the account's data is currently being imported/updated.<br/>&bull; <code>DOWNLOAD_FAILED</code> means that the account data could not get successfully imported or updated. Possible reasons: finAPI could not get the account's balance, or it could not parse all transactions/securities, or some internal error has occurred. Also, it could mean that finAPI could not even get to the point of receiving the account data from the bank server, for example because of incorrect login credentials or a network problem. Note however that when we get a balance and just an empty list of transactions or securities, then this is regarded as valid and successful download. The reason for this is that for some accounts that have little activity, we may actually get no recent transactions but only a balance.<br/>&bull; <code>DEPRECATED</code> means that the account could no longer get matched with any account from the bank server. This can mean either that the account was terminated by the user and is no longer sent by the bank server, or that finAPI could no longer match it because the account's data (name, type, iban, account number, etc.) has been changed by the bank.
     */
    "status": Account.StatusEnum;
    /**
     * THIS FIELD IS DEPRECATED AND WILL BE REMOVED. Refer to the 'capabilities' in 'interfaces' field instead.<br/><br/>List of orders that this account supports. Possible values are:<br/><br/>&bull; <code>SEPA_MONEY_TRANSFER</code> - single money transfer<br/>&bull; <code>SEPA_COLLECTIVE_MONEY_TRANSFER</code> - collective money transfer<br/>&bull; <code>SEPA_BASIC_DIRECT_DEBIT</code> - single basic direct debit<br/>&bull; <code>SEPA_BASIC_COLLECTIVE_DIRECT_DEBIT</code> - collective basic direct debit<br/>&bull; <code>SEPA_B2B_DIRECT_DEBIT</code> - single Business-To-Business direct debit<br/>&bull; <code>SEPA_B2B_COLLECTIVE_DIRECT_DEBIT</code> - collective Business-To-Business direct debit<br/><br/>Note that this list may be empty if the account is not supporting any of the above orders. Also note that the list is refreshed each time the account is being updated, so available orders may get added or removed in the course of an account update.
     */
    "supportedOrders": Array<Account.SupportedOrdersEnum>;
    /**
     * Set of interfaces to which this account is connected
     */
    "interfaces"?: Array<AccountInterface>;
    /**
     * List of clearing accounts that relate to this account. Clearing accounts can be used for money transfers (see field 'clearingAccountId' of the 'Request SEPA Money Transfer' service).<br><br>NOTE: This field is deprecated and will be removed at some point.
     */
    "clearingAccounts"?: Array<ClearingAccountData>;

    static discriminator: string | undefined = undefined;

    static attributeTypeMap: Array<{ name: string; baseName: string; type: string }> = [
      {
        name: "id",
        baseName: "id",
        type: "number"
      },
      {
        name: "bankConnectionId",
        baseName: "bankConnectionId",
        type: "number"
      },
      {
        name: "accountName",
        baseName: "accountName",
        type: "string"
      },
      {
        name: "iban",
        baseName: "iban",
        type: "string"
      },
      {
        name: "accountNumber",
        baseName: "accountNumber",
        type: "string"
      },
      {
        name: "subAccountNumber",
        baseName: "subAccountNumber",
        type: "string"
      },
      {
        name: "accountHolderName",
        baseName: "accountHolderName",
        type: "string"
      },
      {
        name: "accountHolderId",
        baseName: "accountHolderId",
        type: "string"
      },
      {
        name: "accountCurrency",
        baseName: "accountCurrency",
        type: "string"
      },
      {
        name: "accountTypeId",
        baseName: "accountTypeId",
        type: "number"
      },
      {
        name: "accountTypeName",
        baseName: "accountTypeName",
        type: "string"
      },
      {
        name: "accountType",
        baseName: "accountType",
        type: "Account.AccountTypeEnum"
      },
      {
        name: "balance",
        baseName: "balance",
        type: "number"
      },
      {
        name: "overdraft",
        baseName: "overdraft",
        type: "number"
      },
      {
        name: "overdraftLimit",
        baseName: "overdraftLimit",
        type: "number"
      },
      {
        name: "availableFunds",
        baseName: "availableFunds",
        type: "number"
      },
      {
        name: "lastSuccessfulUpdate",
        baseName: "lastSuccessfulUpdate",
        type: "string"
      },
      {
        name: "lastUpdateAttempt",
        baseName: "lastUpdateAttempt",
        type: "string"
      },
      {
        name: "isNew",
        baseName: "isNew",
        type: "boolean"
      },
      {
        name: "status",
        baseName: "status",
        type: "Account.StatusEnum"
      },
      {
        name: "supportedOrders",
        baseName: "supportedOrders",
        type: "Array<Account.SupportedOrdersEnum>"
      },
      {
        name: "interfaces",
        baseName: "interfaces",
        type: "Array<AccountInterface>"
      },
      {
        name: "clearingAccounts",
        baseName: "clearingAccounts",
        type: "Array<ClearingAccountData>"
      }
    ];

    static getAttributeTypeMap() {
      return Account.attributeTypeMap;
    }
  }

  export namespace Account {
    export enum AccountTypeEnum {
      Checking = <any>"Checking",
      Savings = <any>"Savings",
      CreditCard = <any>"CreditCard",
      Security = <any>"Security",
      Loan = <any>"Loan",
      Pocket = <any>"Pocket",
      Membership = <any>"Membership",
      Bausparen = <any>"Bausparen"
    }
    export enum StatusEnum {
      UPDATED = <any>"UPDATED",
      UPDATEDFIXED = <any>"UPDATED_FIXED",
      DOWNLOADINPROGRESS = <any>"DOWNLOAD_IN_PROGRESS",
      DOWNLOADFAILED = <any>"DOWNLOAD_FAILED",
      DEPRECATED = <any>"DEPRECATED"
    }
    export enum SupportedOrdersEnum {
      MONEYTRANSFER = <any>"SEPA_MONEY_TRANSFER",
      COLLECTIVEMONEYTRANSFER = <any>"SEPA_COLLECTIVE_MONEY_TRANSFER",
      BASICDIRECTDEBIT = <any>"SEPA_BASIC_DIRECT_DEBIT",
      BASICCOLLECTIVEDIRECTDEBIT = <any>"SEPA_BASIC_COLLECTIVE_DIRECT_DEBIT",
      B2BDIRECTDEBIT = <any>"SEPA_B2B_DIRECT_DEBIT",
      B2BCOLLECTIVEDIRECTDEBIT = <any>"SEPA_B2B_COLLECTIVE_DIRECT_DEBIT"
    }
  }
  /**
   * Account interface details
   */
  export class AccountInterface {
    /**
     * Bank interface. Possible values:<br><br>&bull; <code>FINTS_SERVER</code> - finAPI will download account data via the bank's FinTS interface.<br>&bull; <code>WEB_SCRAPER</code> - finAPI will parse account data from the bank's online banking website.<br>&bull; <code>XS2A</code> - finAPI will download account data via the bank's XS2A interface.<br>
     */
    "_interface": AccountInterface.InterfaceEnum;
    /**
     * The current status of the account from the perspective of this interface. Possible values are:<br/>&bull; <code>UPDATED</code> means that the account is up to date from finAPI's point of view. This means that no current import/update is running, and the previous import/update had successfully updated the account's data (e.g. transactions and securities), and the bank given balance matched the transaction's calculated sum, meaning that no adjusting entry ('Zwischensaldo' transaction) was inserted.<br/>&bull; <code>UPDATED_FIXED</code> means that the account is up to date from finAPI's point of view (no current import/update is running, and the previous import/update had successfully updated the account's data), BUT there was a deviation in the bank given balance which was fixed by adding an adjusting entry ('Zwischensaldo' transaction).<br/>&bull; <code>DOWNLOAD_IN_PROGRESS</code> means that the account's data is currently being imported/updated.<br/>&bull; <code>DOWNLOAD_FAILED</code> means that the account data was not successfully imported or updated. Possible reasons: finAPI could not get the account's balance, or it could not parse all transactions/securities, or some internal error has occurred. Also, it could mean that finAPI could not even get to the point of receiving the account data from the bank server, for example because of incorrect login credentials or a network problem. Note however that when we get a balance and just an empty list of transactions or securities, then this is regarded as valid and successful download. The reason for this is that for some accounts that have little activity, we may actually get no recent transactions but only a balance.<br/>&bull; <code>DEPRECATED</code> means that the account could no longer be matched with any account from the bank server. This can mean either that the account was terminated by the user and is no longer sent by the bank server, or that finAPI could no longer match it because the account's data (name, type, iban, account number, etc.) has been changed by the bank.
     */
    "status": AccountInterface.StatusEnum;
    /**
     * List of account capabilities that this interface supports. Possible values are:<br/><br/>&bull; <code>DATA_DOWNLOAD</code> - download of balance and transactions/securities<br/>&bull; <code>IBAN_ONLY_SEPA_MONEY_TRANSFER</code> - money transfer where the recipient's account is defined just by the IBAN<br/>&bull; <code>IBAN_ONLY_SEPA_DIRECT_DEBIT</code> - direct debit where the debitor's account is defined just by the IBAN<br/>&bull; <code>SEPA_MONEY_TRANSFER</code> - single money transfer<br/>&bull; <code>SEPA_COLLECTIVE_MONEY_TRANSFER</code> - collective money transfer<br/>&bull; <code>SEPA_BASIC_DIRECT_DEBIT</code> - single basic direct debit<br/>&bull; <code>SEPA_BASIC_COLLECTIVE_DIRECT_DEBIT</code> - collective basic direct debit<br/>&bull; <code>SEPA_B2B_DIRECT_DEBIT</code> - single Business-To-Business direct debit<br/>&bull; <code>SEPA_B2B_COLLECTIVE_DIRECT_DEBIT</code> - collective Business-To-Business direct debit<br/><br/>Note that this list may be empty if the interface is not supporting any of the above capabilities. Also note that the list may be refreshed each time the account is being updated though this interface, so available capabilities may get added or removed in the course of an account update.<br/><br/>
     */
    "capabilities": Array<AccountInterface.CapabilitiesEnum>;
    /**
     * Timestamp of when the account was last successfully updated using this interface (or initially imported); more precisely: time when the account data (balance and positions) has been stored into the finAPI databases. The value is returned in the format 'YYYY-MM-DD HH:MM:SS.SSS' (german time).
     */
    "lastSuccessfulUpdate"?: string;
    /**
     * Timestamp of when the account was last tried to be updated using this interface (or initially imported); more precisely: time when the update (or initial import) was triggered. The value is returned in the format 'YYYY-MM-DD HH:MM:SS.SSS' (german time).
     */
    "lastUpdateAttempt"?: string;

    static discriminator: string | undefined = undefined;

    static attributeTypeMap: Array<{ name: string; baseName: string; type: string }> = [
      {
        name: "_interface",
        baseName: "interface",
        type: "AccountInterface.InterfaceEnum"
      },
      {
        name: "status",
        baseName: "status",
        type: "AccountInterface.StatusEnum"
      },
      {
        name: "capabilities",
        baseName: "capabilities",
        type: "Array<AccountInterface.CapabilitiesEnum>"
      },
      {
        name: "lastSuccessfulUpdate",
        baseName: "lastSuccessfulUpdate",
        type: "string"
      },
      {
        name: "lastUpdateAttempt",
        baseName: "lastUpdateAttempt",
        type: "string"
      }
    ];

    static getAttributeTypeMap() {
      return AccountInterface.attributeTypeMap;
    }
  }

  export namespace AccountInterface {
    export enum InterfaceEnum {
      WEBSCRAPER = <any>"WEB_SCRAPER",
      FINTSSERVER = <any>"FINTS_SERVER",
      XS2A = <any>"XS2A"
    }
    export enum StatusEnum {
      UPDATED = <any>"UPDATED",
      UPDATEDFIXED = <any>"UPDATED_FIXED",
      DOWNLOADINPROGRESS = <any>"DOWNLOAD_IN_PROGRESS",
      DOWNLOADFAILED = <any>"DOWNLOAD_FAILED",
      DEPRECATED = <any>"DEPRECATED"
    }
    export enum CapabilitiesEnum {
      DATADOWNLOAD = <any>"DATA_DOWNLOAD",
      IBANONLYSEPAMONEYTRANSFER = <any>"IBAN_ONLY_SEPA_MONEY_TRANSFER",
      IBANONLYSEPADIRECTDEBIT = <any>"IBAN_ONLY_SEPA_DIRECT_DEBIT",
      SEPAMONEYTRANSFER = <any>"SEPA_MONEY_TRANSFER",
      SEPACOLLECTIVEMONEYTRANSFER = <any>"SEPA_COLLECTIVE_MONEY_TRANSFER",
      SEPABASICDIRECTDEBIT = <any>"SEPA_BASIC_DIRECT_DEBIT",
      SEPABASICCOLLECTIVEDIRECTDEBIT = <any>"SEPA_BASIC_COLLECTIVE_DIRECT_DEBIT",
      SEPAB2BDIRECTDEBIT = <any>"SEPA_B2B_DIRECT_DEBIT",
      SEPAB2BCOLLECTIVEDIRECTDEBIT = <any>"SEPA_B2B_COLLECTIVE_DIRECT_DEBIT"
    }
  }
  /**
   * Container for data of multiple bank accounts
   */
  export class AccountList {
    /**
     * List of bank accounts
     */
    "accounts"?: Array<Account>;

    static discriminator: string | undefined = undefined;

    static attributeTypeMap: Array<{ name: string; baseName: string; type: string }> = [
      {
        name: "accounts",
        baseName: "accounts",
        type: "Array<Account>"
      }
    ];

    static getAttributeTypeMap() {
      return AccountList.attributeTypeMap;
    }
  }

  /**
   * Container for an account's name, type and 'isNew' flag'.
   */
  export class AccountParams {
    /**
     * Account name. Maximum length is 512.
     */
    "accountName"?: string;
    /**
     * Identifier of account type.<br/><br/>1 = Checking,<br/>2 = Savings,<br/>3 = CreditCard,<br/>4 = Security,<br/>5 = Loan,<br/>6 = Pocket (DEPRECATED; will not be returned for any account unless this type has explicitly been set via PATCH),<br/>7 = Membership,<br/>8 = Bausparen<br/><br/><br/> Note: this field is deprecated and will be removed at some point. Please refer to the accountType field instead.
     */
    "accountTypeId"?: number;
    /**
     * An account type.<br/><br/>Checking,<br/>Savings,<br/>CreditCard,<br/>Security,<br/>Loan,<br/>Pocket (DEPRECATED; will not be returned for any account unless this type has explicitly been set via PATCH),<br/>Membership,<br/>Bausparen<br/><br/>
     */
    "accountType"?: AccountParams.AccountTypeEnum;
    /**
     * Whether this account should be flagged as 'new' or not. Any newly imported account will have this flag initially set to true, and remain so until you set it to false (see PATCH /accounts/<id>). How you use this field is up to your interpretation, however it is recommended to set the flag to false for all accounts right after the initial import of the bank connection. This way, you will be able recognize accounts that get newly imported during a later update of the bank connection, by checking for any accounts with the flag set to true after every update of the bank connection.
     */
    "isNew"?: boolean;

    static discriminator: string | undefined = undefined;

    static attributeTypeMap: Array<{ name: string; baseName: string; type: string }> = [
      {
        name: "accountName",
        baseName: "accountName",
        type: "string"
      },
      {
        name: "accountTypeId",
        baseName: "accountTypeId",
        type: "number"
      },
      {
        name: "accountType",
        baseName: "accountType",
        type: "AccountParams.AccountTypeEnum"
      },
      {
        name: "isNew",
        baseName: "isNew",
        type: "boolean"
      }
    ];

    static getAttributeTypeMap() {
      return AccountParams.attributeTypeMap;
    }
  }

  export namespace AccountParams {
    export enum AccountTypeEnum {
      Checking = <any>"Checking",
      Savings = <any>"Savings",
      CreditCard = <any>"CreditCard",
      Security = <any>"Security",
      Loan = <any>"Loan",
      Pocket = <any>"Pocket",
      Membership = <any>"Membership",
      Bausparen = <any>"Bausparen"
    }
  }
  /**
   * Account reference data
   */
  export class AccountReference {
    /**
     * The account's IBAN
     */
    "iban": string;

    static discriminator: string | undefined = undefined;

    static attributeTypeMap: Array<{ name: string; baseName: string; type: string }> = [
      {
        name: "iban",
        baseName: "iban",
        type: "string"
      }
    ];

    static getAttributeTypeMap() {
      return AccountReference.attributeTypeMap;
    }
  }

  export class BadCredentialsError {
    /**
     * Error type
     */
    "error": string;
    /**
     * Error description
     */
    "errorDescription": string;

    static discriminator: string | undefined = undefined;

    static attributeTypeMap: Array<{ name: string; baseName: string; type: string }> = [
      {
        name: "error",
        baseName: "error",
        type: "string"
      },
      {
        name: "errorDescription",
        baseName: "error_description",
        type: "string"
      }
    ];

    static getAttributeTypeMap() {
      return BadCredentialsError.attributeTypeMap;
    }
  }

  /**
   * Container for a bank's data
   */
  export class Bank {
    /**
     * Bank identifier.<br/><br/>NOTE: Do NOT assume that the identifiers of banks are the same across different finAPI environments. In fact, the identifiers may change whenever a new finAPI version is released, even within the same environment. The identifiers are meant to be used for references within the finAPI services only, but not for hard-coding them in your application. If you need to hard-code the usage of a certain bank within your application, please instead refer to the BLZ.
     */
    "id": number;
    /**
     * Name of bank
     */
    "name": string;
    /**
     * THIS FIELD IS DEPRECATED AND WILL BE REMOVED. Refer to the 'loginHint' in the 'interfaces' instead.<br/><br/>Login hint. Contains a German message for the user that explains what kind of credentials are expected.<br/><br/>Please note that it is strongly recommended to always show the login hint to the user if there is one, as the credentials that finAPI requires for the bank might be different to the credentials that the user knows from the bank's website.<br/><br/>Also note that the contents of this field should always be interpreted as HTML, as the text might contain HTML tags for highlighted words, paragraphs, etc.
     */
    "loginHint"?: string;
    /**
     * BIC of bank
     */
    "bic"?: string;
    /**
     * THIS FIELD IS DEPRECATED AND WILL BE REMOVED. Refer to the 'blz' field instead.
     */
    "blzs": Array<string>;
    /**
     * BLZ of bank
     */
    "blz": string;
    /**
     * Bank location (two-letter country code; ISO 3166 ALPHA-2). Note that when this field is not set, it means that this bank depicts an international institute which is not bound to any specific country.
     */
    "location"?: string;
    /**
     * City that this bank is located in. Note that this field may not be set for some banks.
     */
    "city"?: string;
    /**
     * THIS FIELD IS DEPRECATED AND WILL BE REMOVED. Please refer to field 'interfaces' instead.<br/><br/>Whether this bank is supported by finAPI, i.e. whether you can import/update a bank connection of this bank.
     */
    "isSupported": boolean;
    /**
     * If true, then this bank does not depict a real bank, but rather a testing endpoint provided by a bank or by finAPI. You probably want to regard these banks only during the development of your application, but not in production. You can filter out these banks in production by making sure that the 'isTestBank' parameter is always set to 'false' whenever your application is calling the 'Get and search all banks' service.
     */
    "isTestBank": boolean;
    /**
     * Popularity of this bank with your users (mandator-wide, i.e. across all of your clients). The value equals the number of bank connections that are currently imported for this bank across all of your users (which means it is a constantly adjusting value). You can use this field for statistical evaluation, and also for ordering bank search results (see service 'Get and search all banks').
     */
    "popularity": number;
    /**
     * THIS FIELD IS DEPRECATED AND WILL BE REMOVED. Refer to the 'health' in the 'interfaces' instead. <br/><br/>The health status of this bank. This is a value between 0 and 100, depicting the percentage of successful communication attempts with this bank during the latest couple of bank connection imports or updates (across the entire finAPI system). Note that 'successful' means that there was no technical error trying to establish a communication with the bank. Non-technical errors (like incorrect credentials) are regarded successful communication attempts.
     */
    "health": number;
    /**
     * THIS FIELD IS DEPRECATED AND WILL BE REMOVED. Refer to the 'loginCredentials' in the 'interfaces' instead.<br/><br/>Label for the user ID login field, as it is called on the bank's website (e.g. \"Nutzerkennung\"). If this field is set (i.e. not null) then you should prompt your users to enter the required data in a text field which you can label with this field's value.
     */
    "loginFieldUserId"?: string;
    /**
     * THIS FIELD IS DEPRECATED AND WILL BE REMOVED. Refer to the 'loginCredentials' in the 'interfaces' instead.<br/><br/>Label for the customer ID login field, as it is called on the bank's website (e.g. \"Kundennummer\"). If this field is set (i.e. not null) then you should prompt your users to enter the required data in a text field which you can label with this field's value.
     */
    "loginFieldCustomerId"?: string;
    /**
     * THIS FIELD IS DEPRECATED AND WILL BE REMOVED. Refer to the 'loginCredentials' in the 'interfaces' instead.<br/><br/>Label for the PIN field, as it is called on the bank's website (mostly \"PIN\"). If this field is set (i.e. not null) then you should prompt your users to enter the required data in a text field which you can label with this field's value.
     */
    "loginFieldPin"?: string;
    /**
     * THIS FIELD IS DEPRECATED AND WILL BE REMOVED. Refer to the 'isVolatile' field of the 'loginCredentials' in 'interfaces' instead.<br/><br/>Whether the PINs that are used for authentication with the bank are volatile. If the PINs are volatile, it means that a PIN is usually valid only for a single authentication, and is then invalidated. If a bank uses volatile PINs, it is strongly inadvisable to store PINs in finAPI, as a stored PIN will not work for future authentications.<br><br>NOTE: This field is deprecated and will be removed at some point.
     */
    "pinsAreVolatile": boolean;
    /**
     * THIS FIELD IS DEPRECATED AND WILL BE REMOVED. Refer to the 'isSecret' field of the 'loginCredentials' in 'interfaces' instead.<br/><br/>Whether the banking customer ID has to be treated like a password. Certain banks require a second password (besides the PIN) for the user to login. In this case your application should use a password input field when prompting users for their credentials.<br><br>NOTE: This field is deprecated and will be removed at some point.
     */
    "isCustomerIdPassword": boolean;
    /**
     * THIS FIELD IS DEPRECATED AND WILL BE REMOVED. Refer to the 'interfaces' instead.<br/><br/>List of the data sources that finAPI will use for data download for this bank. Possible values:<br><br>&bull; <code>FINTS_SERVER</code> - means that finAPI will download data via the bank's FinTS interface.<br>&bull; <code>WEB_SCRAPER</code> - means that finAPI will parse data from the bank's online banking website.<br><br>Note that this list will be empty for non-supported banks. Note also that web scraping might be disabled for your client (see GET /clientConfiguration). When this is the case, then finAPI will not use the web scraper for data download, and if the web scraper is the only supported data source of this bank, then finAPI will not allow to download any data for this bank at all (for details, see POST /bankConnections/import and POST /bankConnections/update).
     */
    "supportedDataSources": Array<Bank.SupportedDataSourcesEnum>;
    /**
     * Set of interfaces that finAPI can use to connect to the bank. Note that this set will be empty for non-supported banks. Note also that the WEB_SCRAPER interface might be disabled for your client (see GET /clientConfiguration). When this is the case, then finAPI will not use the web scraper for data download, and if the web scraper is the only supported interface of this bank, then finAPI will not allow to download any data for this bank at all (for details, see POST /bankConnections/import and POST /bankConnections/update).
     */
    "interfaces"?: Array<BankInterface>;
    /**
     * THIS FIELD IS DEPRECATED AND WILL BE REMOVED. Refer to the 'lastCommunicationAttempt' in the 'interfaces' instead. <br/><br/>Time of the last communication attempt with this bank during a bank connection import or update (across the entire finAPI system). The value is returned in the format 'YYYY-MM-DD HH:MM:SS.SSS' (german time).
     */
    "lastCommunicationAttempt"?: string;
    /**
     * THIS FIELD IS DEPRECATED AND WILL BE REMOVED. Refer to the 'lastSuccessfulCommunication' in the 'interfaces' instead. <br/><br/>Time of the last successful communication with this bank during a bank connection import or update (across the entire finAPI system). The value is returned in the format 'YYYY-MM-DD HH:MM:SS.SSS' (german time).
     */
    "lastSuccessfulCommunication"?: string;

    static discriminator: string | undefined = undefined;

    static attributeTypeMap: Array<{ name: string; baseName: string; type: string }> = [
      {
        name: "id",
        baseName: "id",
        type: "number"
      },
      {
        name: "name",
        baseName: "name",
        type: "string"
      },
      {
        name: "loginHint",
        baseName: "loginHint",
        type: "string"
      },
      {
        name: "bic",
        baseName: "bic",
        type: "string"
      },
      {
        name: "blzs",
        baseName: "blzs",
        type: "Array<string>"
      },
      {
        name: "blz",
        baseName: "blz",
        type: "string"
      },
      {
        name: "location",
        baseName: "location",
        type: "string"
      },
      {
        name: "city",
        baseName: "city",
        type: "string"
      },
      {
        name: "isSupported",
        baseName: "isSupported",
        type: "boolean"
      },
      {
        name: "isTestBank",
        baseName: "isTestBank",
        type: "boolean"
      },
      {
        name: "popularity",
        baseName: "popularity",
        type: "number"
      },
      {
        name: "health",
        baseName: "health",
        type: "number"
      },
      {
        name: "loginFieldUserId",
        baseName: "loginFieldUserId",
        type: "string"
      },
      {
        name: "loginFieldCustomerId",
        baseName: "loginFieldCustomerId",
        type: "string"
      },
      {
        name: "loginFieldPin",
        baseName: "loginFieldPin",
        type: "string"
      },
      {
        name: "pinsAreVolatile",
        baseName: "pinsAreVolatile",
        type: "boolean"
      },
      {
        name: "isCustomerIdPassword",
        baseName: "isCustomerIdPassword",
        type: "boolean"
      },
      {
        name: "supportedDataSources",
        baseName: "supportedDataSources",
        type: "Array<Bank.SupportedDataSourcesEnum>"
      },
      {
        name: "interfaces",
        baseName: "interfaces",
        type: "Array<BankInterface>"
      },
      {
        name: "lastCommunicationAttempt",
        baseName: "lastCommunicationAttempt",
        type: "string"
      },
      {
        name: "lastSuccessfulCommunication",
        baseName: "lastSuccessfulCommunication",
        type: "string"
      }
    ];

    static getAttributeTypeMap() {
      return Bank.attributeTypeMap;
    }
  }

  export namespace Bank {
    export enum SupportedDataSourcesEnum {
      WEBSCRAPER = <any>"WEB_SCRAPER",
      FINTSSERVER = <any>"FINTS_SERVER"
    }
  }
  /**
   * Container for a bank connection's data
   */
  export class BankConnection {
    /**
     * Bank connection identifier
     */
    "id": number;
    /**
     * Identifier of the bank that this connection belongs to. NOTE: This field is DEPRECATED and will get removed at some point. Please refer to the 'bank' field instead.
     */
    "bankId": number;
    /**
     * Custom name for the bank connection. You can set this field with the 'Edit a bank connection' service, as well as during the initial import of the bank connection. Maximum length is 64.
     */
    "name"?: string;
    /**
     * NOTE: This field is deprecated and will be removed at some point. Please refer to the 'loginCredentials' in the 'interfaces' field instead.<br><br>Stored online banking user ID credential. This field may be null for the 'demo connection'. If your client has no license for processing banking credentials then a banking user ID will always be 'XXXXX'
     */
    "bankingUserId"?: string;
    /**
     * NOTE: This field is deprecated and will be removed at some point. Please refer to the 'loginCredentials' in the 'interfaces' field instead.<br><br>Stored online banking customer ID credential. If your client has no license for processing banking credentials or if this field contains a value that requires password protection (see field ‘isCustomerIdPassword’ in Bank Resource) then the banking customer ID will always be 'XXXXX
     */
    "bankingCustomerId"?: string;
    /**
     * NOTE: This field is deprecated and will be removed at some point. Please refer to the 'loginCredentials' in the 'interfaces' field instead.<br><br>Stored online banking PIN. If a PIN is stored, this will always be 'XXXXX'
     */
    "bankingPin"?: string;
    /**
     * Bank connection type
     */
    "type": BankConnection.TypeEnum;
    /**
     * Current status of data download (account balances and transactions/securities). The POST /bankConnections/import and POST /bankConnections/<id>/update services will set this flag to IN_PROGRESS before they return. Once the import or update has finished, the status will be changed to READY.
     */
    "updateStatus": BankConnection.UpdateStatusEnum;
    /**
     * Current status of transactions categorization. The asynchronous download process that is triggered by a call of the POST /bankConnections/import and POST /bankConnections/<id>/update services (and also by finAPI's auto update, if enabled) will set this flag to PENDING once the download has finished and a categorization is scheduled for the imported transactions. A separate categorization thread will then start to categorize the transactions (during this process, the status is IN_PROGRESS). When categorization has finished, the status will be (re-)set to READY. Note that the current categorization status should only be queried after the download has finished, i.e. once the download status has switched from IN_PROGRESS to READY.
     */
    "categorizationStatus": BankConnection.CategorizationStatusEnum;
    /**
     * NOTE: This field is deprecated and will be removed at some point. Please refer to corresponding field in 'interfaces' instead.<br><br>Result of the last manual update of this bank connection. If no manual update has ever been done so far, then this field will not be set.
     */
    "lastManualUpdate"?: UpdateResult;
    /**
     * NOTE: This field is deprecated and will be removed at some point. Please refer to corresponding field in 'interfaces' instead.<br><br>Result of the last auto update of this bank connection (ran by finAPI's automatic batch update process). If no auto update has ever been done so far, then this field will not be set.
     */
    "lastAutoUpdate"?: UpdateResult;
    /**
     * NOTE: This field is deprecated and will be removed at some point. Please refer to the account capabilities instead.<br><br>Whether this bank connection accepts money transfer requests where the recipient's account is defined just by the IBAN (without an additional BIC). This field is re-evaluated each time this bank connection is updated. <br/>See also: /accounts/requestSepaMoneyTransfer
     */
    "ibanOnlyMoneyTransferSupported": boolean;
    /**
     * NOTE: This field is deprecated and will be removed at some point. Please refer to the account capabilities instead.<br><br>Whether this bank connection accepts direct debit requests where the debitor's account is defined just by the IBAN (without an additional BIC). This field is re-evaluated each time this bank connection is updated. <br/>See also: /accounts/requestSepaDirectDebit
     */
    "ibanOnlyDirectDebitSupported": boolean;
    /**
     * NOTE: This field is deprecated and will be removed at some point. Please refer to the account capabilities instead.<br><br>Whether this bank connection supports submitting collective money transfers. This field is re-evaluated each time this bank connection is updated. <br/>See also: /accounts/requestSepaMoneyTransfer
     */
    "collectiveMoneyTransferSupported": boolean;
    /**
     * NOTE: This field is deprecated and will be removed at some point. Please refer to corresponding field in 'interfaces' instead.<br><br>The default two-step-procedure. Must match one of the available 'procedureId's from the 'twoStepProcedures' list. When this field is set, then finAPI will automatically try to select the procedure wherever applicable. Note that the list of available procedures of a bank connection may change as a result of an update of the connection, and if this field references a procedure that is no longer available after an update, finAPI will automatically clear the default procedure (set it to null).
     */
    "defaultTwoStepProcedureId"?: string;
    /**
     * NOTE: This field is deprecated and will be removed at some point. Please refer to corresponding field in 'interfaces' instead.<br><br>Available two-step-procedures for this bank connection, used for submitting a money transfer or direct debit request (see /accounts/requestSepaMoneyTransfer or /requestSepaDirectDebit). The available two-step-procedures are re-evaluated each time this bank connection is updated (/bankConnections/update). This means that this list may change as a result of an update.
     */
    "twoStepProcedures"?: Array<TwoStepProcedure>;
    /**
     * Set of interfaces that are connected for this bank connection.
     */
    "interfaces"?: Array<BankConnectionInterface>;
    /**
     * Identifiers of the accounts that belong to this bank connection
     */
    "accountIds": Array<number>;
    /**
     * Information about the owner(s) of the bank connection
     */
    "owners"?: Array<BankConnectionOwner>;
    /**
     * Bank that this connection belongs to
     */
    "bank": Bank;
    /**
     * This field indicates whether the last communication with the bank failed with an error that requires the user's attention or multi-step authentication error. If 'furtherLoginNotRecommended' is true, finAPI will stop auto updates of this bank connection to mitigate the risk of the user's bank account getting locked by the bank. Every communication with the bank (via updates, money_transfers, direct debits. etc.) can change the value of this flag. If this field is true, we recommend the user to check his credentials and try a manual update of the bank connection. If the update is successful without any multi-step authentication error, the 'furtherLoginNotRecommended' field will be set to false and the bank connection will be reincluded in the next batch update process. A manual update of the bank connection with incorrect credentials or if multi-step authentication error happens will set this field to true and lead to the exclusion of the bank connection from the following batch updates.
     */
    "furtherLoginNotRecommended": boolean;

    static discriminator: string | undefined = undefined;

    static attributeTypeMap: Array<{ name: string; baseName: string; type: string }> = [
      {
        name: "id",
        baseName: "id",
        type: "number"
      },
      {
        name: "bankId",
        baseName: "bankId",
        type: "number"
      },
      {
        name: "name",
        baseName: "name",
        type: "string"
      },
      {
        name: "bankingUserId",
        baseName: "bankingUserId",
        type: "string"
      },
      {
        name: "bankingCustomerId",
        baseName: "bankingCustomerId",
        type: "string"
      },
      {
        name: "bankingPin",
        baseName: "bankingPin",
        type: "string"
      },
      {
        name: "type",
        baseName: "type",
        type: "BankConnection.TypeEnum"
      },
      {
        name: "updateStatus",
        baseName: "updateStatus",
        type: "BankConnection.UpdateStatusEnum"
      },
      {
        name: "categorizationStatus",
        baseName: "categorizationStatus",
        type: "BankConnection.CategorizationStatusEnum"
      },
      {
        name: "lastManualUpdate",
        baseName: "lastManualUpdate",
        type: "UpdateResult"
      },
      {
        name: "lastAutoUpdate",
        baseName: "lastAutoUpdate",
        type: "UpdateResult"
      },
      {
        name: "ibanOnlyMoneyTransferSupported",
        baseName: "ibanOnlyMoneyTransferSupported",
        type: "boolean"
      },
      {
        name: "ibanOnlyDirectDebitSupported",
        baseName: "ibanOnlyDirectDebitSupported",
        type: "boolean"
      },
      {
        name: "collectiveMoneyTransferSupported",
        baseName: "collectiveMoneyTransferSupported",
        type: "boolean"
      },
      {
        name: "defaultTwoStepProcedureId",
        baseName: "defaultTwoStepProcedureId",
        type: "string"
      },
      {
        name: "twoStepProcedures",
        baseName: "twoStepProcedures",
        type: "Array<TwoStepProcedure>"
      },
      {
        name: "interfaces",
        baseName: "interfaces",
        type: "Array<BankConnectionInterface>"
      },
      {
        name: "accountIds",
        baseName: "accountIds",
        type: "Array<number>"
      },
      {
        name: "owners",
        baseName: "owners",
        type: "Array<BankConnectionOwner>"
      },
      {
        name: "bank",
        baseName: "bank",
        type: "Bank"
      },
      {
        name: "furtherLoginNotRecommended",
        baseName: "furtherLoginNotRecommended",
        type: "boolean"
      }
    ];

    static getAttributeTypeMap() {
      return BankConnection.attributeTypeMap;
    }
  }

  export namespace BankConnection {
    export enum TypeEnum {
      ONLINE = <any>"ONLINE",
      DEMO = <any>"DEMO"
    }
    export enum UpdateStatusEnum {
      INPROGRESS = <any>"IN_PROGRESS",
      READY = <any>"READY"
    }
    export enum CategorizationStatusEnum {
      INPROGRESS = <any>"IN_PROGRESS",
      PENDING = <any>"PENDING",
      READY = <any>"READY"
    }
  }
  /**
   * Resource representing a bank connection interface
   */
  export class BankConnectionInterface {
    /**
     * Bank interface. Possible values:<br><br>&bull; <code>FINTS_SERVER</code> - means that finAPI will download data via the bank's FinTS interface.<br>&bull; <code>WEB_SCRAPER</code> - means that finAPI will parse data from the bank's online banking website.<br>&bull; <code>XS2A</code> - means that finAPI will download data via the bank's XS2A interface.<br>
     */
    "_interface": BankConnectionInterface.InterfaceEnum;
    /**
     * Login fields for this interface, in the order that we suggest to show them to the user.
     */
    "loginCredentials"?: Array<LoginCredentialResource>;
    /**
     * The default two-step-procedure for this interface. Must match one of the available 'procedureId's from the 'twoStepProcedures' list. When this field is set, then finAPI will automatically try to select the procedure wherever applicable. Note that the list of available procedures of a bank connection may change as a result of an update of the connection, and if this field references a procedure that is no longer available after an update, finAPI will automatically clear the default procedure (set it to null).
     */
    "defaultTwoStepProcedureId"?: string;
    /**
     * Available two-step-procedures in this interface, used for submitting a money transfer or direct debit request (see /accounts/requestSepaMoneyTransfer or /requestSepaDirectDebit),or for multi-step-authentication during bank connection import or update. The available two-step-procedures mya be re-evaluated each time this bank connection is updated (/bankConnections/update). This means that this list may change as a result of an update.
     */
    "twoStepProcedures"?: Array<TwoStepProcedure>;
    /**
     * If this field is set, it means that this interface is handing out a consent to finAPI in exchange for the login credentials. finAPI needs to use this consent to get access to the account list and account data (i.e. Account Information Services, AIS). If this field is not set, it means that this interface does not use such consents.
     */
    "aisConsent"?: BankConsent;
    /**
     * Result of the last manual update of the associated bank connection using this interface. If no manual update has ever been done so far with this interface, then this field will not be set.
     */
    "lastManualUpdate"?: UpdateResult;
    /**
     * Result of the last auto update of the associated bank connection using this interface (ran by finAPI's automatic batch update process). If no auto update has ever been done so far with this interface, then this field will not be set.
     */
    "lastAutoUpdate"?: UpdateResult;

    static discriminator: string | undefined = undefined;

    static attributeTypeMap: Array<{ name: string; baseName: string; type: string }> = [
      {
        name: "_interface",
        baseName: "interface",
        type: "BankConnectionInterface.InterfaceEnum"
      },
      {
        name: "loginCredentials",
        baseName: "loginCredentials",
        type: "Array<LoginCredentialResource>"
      },
      {
        name: "defaultTwoStepProcedureId",
        baseName: "defaultTwoStepProcedureId",
        type: "string"
      },
      {
        name: "twoStepProcedures",
        baseName: "twoStepProcedures",
        type: "Array<TwoStepProcedure>"
      },
      {
        name: "aisConsent",
        baseName: "aisConsent",
        type: "BankConsent"
      },
      {
        name: "lastManualUpdate",
        baseName: "lastManualUpdate",
        type: "UpdateResult"
      },
      {
        name: "lastAutoUpdate",
        baseName: "lastAutoUpdate",
        type: "UpdateResult"
      }
    ];

    static getAttributeTypeMap() {
      return BankConnectionInterface.attributeTypeMap;
    }
  }

  export namespace BankConnectionInterface {
    export enum InterfaceEnum {
      WEBSCRAPER = <any>"WEB_SCRAPER",
      FINTSSERVER = <any>"FINTS_SERVER",
      XS2A = <any>"XS2A"
    }
  }
  /**
   * Container for data of multiple bank connections
   */
  export class BankConnectionList {
    /**
     * List of bank connections
     */
    "connections": Array<BankConnection>;

    static discriminator: string | undefined = undefined;

    static attributeTypeMap: Array<{ name: string; baseName: string; type: string }> = [
      {
        name: "connections",
        baseName: "connections",
        type: "Array<BankConnection>"
      }
    ];

    static getAttributeTypeMap() {
      return BankConnectionList.attributeTypeMap;
    }
  }

  /**
   * Container for a bank connection owner's data
   */
  export class BankConnectionOwner {
    /**
     * First name
     */
    "firstName"?: string;
    /**
     * Last name
     */
    "lastName"?: string;
    /**
     * Salutation
     */
    "salutation"?: string;
    /**
     * Title
     */
    "title"?: string;
    /**
     * Email
     */
    "email"?: string;
    /**
     * Date of birth (in format 'YYYY-MM-DD')
     */
    "dateOfBirth"?: string;
    /**
     * Post code
     */
    "postCode"?: string;
    /**
     * Country
     */
    "country"?: string;
    /**
     * City
     */
    "city"?: string;
    /**
     * Street
     */
    "street"?: string;
    /**
     * House number
     */
    "houseNumber"?: string;

    static discriminator: string | undefined = undefined;

    static attributeTypeMap: Array<{ name: string; baseName: string; type: string }> = [
      {
        name: "firstName",
        baseName: "firstName",
        type: "string"
      },
      {
        name: "lastName",
        baseName: "lastName",
        type: "string"
      },
      {
        name: "salutation",
        baseName: "salutation",
        type: "string"
      },
      {
        name: "title",
        baseName: "title",
        type: "string"
      },
      {
        name: "email",
        baseName: "email",
        type: "string"
      },
      {
        name: "dateOfBirth",
        baseName: "dateOfBirth",
        type: "string"
      },
      {
        name: "postCode",
        baseName: "postCode",
        type: "string"
      },
      {
        name: "country",
        baseName: "country",
        type: "string"
      },
      {
        name: "city",
        baseName: "city",
        type: "string"
      },
      {
        name: "street",
        baseName: "street",
        type: "string"
      },
      {
        name: "houseNumber",
        baseName: "houseNumber",
        type: "string"
      }
    ];

    static getAttributeTypeMap() {
      return BankConnectionOwner.attributeTypeMap;
    }
  }

  /**
   * Bank consent information
   */
  export class BankConsent {
    /**
     * Status of the consent. If <code>PRESENT</code>, it means that finAPI has a consent stored and can use it to connect to the bank. If <code>NOT_PRESENT</code>, finAPI will need to acquire a consent when connecting to the bank, which may require login credentials (either passed by the client, or stored in finAPI), and/or user involvement. Note that even when a consent is <code>PRESENT</code>, it may no longer be valid and finAPI will still have to acquire a new consent.
     */
    "status": BankConsent.StatusEnum;
    /**
     * Expiration time of the consent in the format 'YYYY-MM-DD HH:MM:SS.SSS' (german time).
     */
    "expiresAt": string;

    static discriminator: string | undefined = undefined;

    static attributeTypeMap: Array<{ name: string; baseName: string; type: string }> = [
      {
        name: "status",
        baseName: "status",
        type: "BankConsent.StatusEnum"
      },
      {
        name: "expiresAt",
        baseName: "expiresAt",
        type: "string"
      }
    ];

    static getAttributeTypeMap() {
      return BankConsent.attributeTypeMap;
    }
  }

  export namespace BankConsent {
    export enum StatusEnum {
      PRESENT = <any>"PRESENT",
      NOTPRESENT = <any>"NOT_PRESENT"
    }
  }
  /**
   * Interface used to connect to a bank
   */
  export class BankInterface {
    /**
     * Bank interface. Possible values:<br><br>&bull; <code>FINTS_SERVER</code> - means that finAPI will download data via the bank's FinTS server.<br>&bull; <code>WEB_SCRAPER</code> - means that finAPI will parse data from the bank's online banking website.<br>&bull; <code>XS2A</code> - means that finAPI will download data via the bank's XS2A interface.<br>
     */
    "_interface": BankInterface.InterfaceEnum;
    /**
     * TPP Authentication Group which the bank interface is connected to
     */
    "tppAuthenticationGroup"?: TppAuthenticationGroup;
    /**
     * Login credentials fields which should be shown to the user.
     */
    "loginCredentials": Array<BankInterfaceLoginField>;
    /**
     * Set of interface properties/specifics. Possible values:<br><br>&bull; <code>REDIRECT_APPROACH</code> - means that the interface uses a redirect approach when authorizing the user. It requires you to pass the 'redirectUrl' field in all services which define the field. If the user already has imported a bank connection of the same bank that he is about to import, we recommend to confront the user with the question: <blockquote>For the selected bank you have already imported successfully the following accounts: &lt;account list&gt;. Are you sure that you want to import another bank connection from &lt;bank name&gt;? </blockquote>&bull; <code>DECOUPLED_APPROACH</code> - means that the interface uses a decoupled approach when authorizing the user.<br/><br/>&bull; <code>DETAILED_CONSENT</code> - means that the interface requires a list of account references when authorizing the user. It requires you to pass the 'accountReferences' field in all services which define the field.<br/><br/>Note that this set can be empty, if the interface does not have any specific properties.
     */
    "properties"?: Array<BankInterface.PropertiesEnum>;
    /**
     * Login hint. Contains a German message for the user that explains what kind of credentials are expected.<br/><br/>Please note that it is essential to always show the login hint to the user if there is one, as the credentials that finAPI requires for the bank might be different to the credentials that the user knows from his online banking.<br/><br/>Also note that the contents of this field should always be interpreted as HTML, as the text might contain HTML tags for highlighted words, paragraphs, etc.
     */
    "loginHint"?: string;
    /**
     * The health status of this interface. This is a value between 0 and 100, depicting the percentage of successful communication attempts with the bank via this interface during the latest couple of bank connection imports or updates (across the entire finAPI system). Note that 'successful' means that there was no technical error trying to establish a communication with the bank. Non-technical errors (like incorrect credentials) are regarded successful communication attempts.
     */
    "health": number;
    /**
     * Time of the last communication attempt with this interface during an import, update or connect interface (across the entire finAPI system). The value is returned in the format 'YYYY-MM-DD HH:MM:SS.SSS' (german time).
     */
    "lastCommunicationAttempt"?: string;
    /**
     * Time of the last successful communication with this interface during an import, update or connect interface (across the entire finAPI system). The value is returned in the format 'YYYY-MM-DD HH:MM:SS.SSS' (german time).
     */
    "lastSuccessfulCommunication"?: string;

    static discriminator: string | undefined = undefined;

    static attributeTypeMap: Array<{ name: string; baseName: string; type: string }> = [
      {
        name: "_interface",
        baseName: "interface",
        type: "BankInterface.InterfaceEnum"
      },
      {
        name: "tppAuthenticationGroup",
        baseName: "tppAuthenticationGroup",
        type: "TppAuthenticationGroup"
      },
      {
        name: "loginCredentials",
        baseName: "loginCredentials",
        type: "Array<BankInterfaceLoginField>"
      },
      {
        name: "properties",
        baseName: "properties",
        type: "Array<BankInterface.PropertiesEnum>"
      },
      {
        name: "loginHint",
        baseName: "loginHint",
        type: "string"
      },
      {
        name: "health",
        baseName: "health",
        type: "number"
      },
      {
        name: "lastCommunicationAttempt",
        baseName: "lastCommunicationAttempt",
        type: "string"
      },
      {
        name: "lastSuccessfulCommunication",
        baseName: "lastSuccessfulCommunication",
        type: "string"
      }
    ];

    static getAttributeTypeMap() {
      return BankInterface.attributeTypeMap;
    }
  }

  export namespace BankInterface {
    export enum InterfaceEnum {
      WEBSCRAPER = <any>"WEB_SCRAPER",
      FINTSSERVER = <any>"FINTS_SERVER",
      XS2A = <any>"XS2A"
    }
    export enum PropertiesEnum {
      REDIRECTAPPROACH = <any>"REDIRECT_APPROACH",
      DECOUPLEDAPPROACH = <any>"DECOUPLED_APPROACH",
      DETAILEDCONSENT = <any>"DETAILED_CONSENT"
    }
  }
  /**
   * Container for a bank's login credential field
   */
  export class BankInterfaceLoginField {
    /**
     * Contains a German label for the input field that you should provide to the user. Also, these labels are used to identify login fields on the API-level, when you pass credentials to the service.
     */
    "label": string;
    /**
     * Whether this field has to be treated as a secret. In this case your application should use a password input field instead of a cleartext field.
     */
    "isSecret": boolean;
    /**
     * Whether this field depicts a credential that is volatile. If a field is volatile, it means that the value for the field, as provided by the user, is usually valid only for a single authentication, and is then invalidated on bank-side. If a bank uses volatile login credentials, it is strongly inadvisable to store the credentials in finAPI, as stored credentials will not work for future authentications.
     */
    "isVolatile": boolean;

    static discriminator: string | undefined = undefined;

    static attributeTypeMap: Array<{ name: string; baseName: string; type: string }> = [
      {
        name: "label",
        baseName: "label",
        type: "string"
      },
      {
        name: "isSecret",
        baseName: "isSecret",
        type: "boolean"
      },
      {
        name: "isVolatile",
        baseName: "isVolatile",
        type: "boolean"
      }
    ];

    static getAttributeTypeMap() {
      return BankInterfaceLoginField.attributeTypeMap;
    }
  }

  /**
   * Container for data of multiple banks
   */
  export class BankList {
    /**
     * Banks
     */
    "banks": Array<Bank>;

    static discriminator: string | undefined = undefined;

    static attributeTypeMap: Array<{ name: string; baseName: string; type: string }> = [
      {
        name: "banks",
        baseName: "banks",
        type: "Array<Bank>"
      }
    ];

    static getAttributeTypeMap() {
      return BankList.attributeTypeMap;
    }
  }

  /**
   * Cash flow
   */
  export class CashFlow {
    /**
     * Category of this cash flow. When null, then this is the cash flow of transactions that do not have a category.
     */
    "category"?: Category;
    /**
     * The total calculated income for the given category
     */
    "income": number;
    /**
     * The total calculated spending for the given category
     */
    "spending": number;
    /**
     * The calculated balance for the given category
     */
    "balance": number;
    /**
     * The total count of income transactions for the given category
     */
    "countIncomeTransactions": number;
    /**
     * The total count of spending transactions for the given category
     */
    "countSpendingTransactions": number;
    /**
     * The total count of all transactions for the given category
     */
    "countAllTransactions": number;

    static discriminator: string | undefined = undefined;

    static attributeTypeMap: Array<{ name: string; baseName: string; type: string }> = [
      {
        name: "category",
        baseName: "category",
        type: "Category"
      },
      {
        name: "income",
        baseName: "income",
        type: "number"
      },
      {
        name: "spending",
        baseName: "spending",
        type: "number"
      },
      {
        name: "balance",
        baseName: "balance",
        type: "number"
      },
      {
        name: "countIncomeTransactions",
        baseName: "countIncomeTransactions",
        type: "number"
      },
      {
        name: "countSpendingTransactions",
        baseName: "countSpendingTransactions",
        type: "number"
      },
      {
        name: "countAllTransactions",
        baseName: "countAllTransactions",
        type: "number"
      }
    ];

    static getAttributeTypeMap() {
      return CashFlow.attributeTypeMap;
    }
  }

  /**
   * Cash flows
   */
  export class CashFlowList {
    /**
     * Array of cash flows
     */
    "cashFlows": Array<CashFlow>;
    /**
     * The total income
     */
    "totalIncome": number;
    /**
     * The total spending
     */
    "totalSpending": number;
    /**
     * The total balance
     */
    "totalBalance": number;

    static discriminator: string | undefined = undefined;

    static attributeTypeMap: Array<{ name: string; baseName: string; type: string }> = [
      {
        name: "cashFlows",
        baseName: "cashFlows",
        type: "Array<CashFlow>"
      },
      {
        name: "totalIncome",
        baseName: "totalIncome",
        type: "number"
      },
      {
        name: "totalSpending",
        baseName: "totalSpending",
        type: "number"
      },
      {
        name: "totalBalance",
        baseName: "totalBalance",
        type: "number"
      }
    ];

    static getAttributeTypeMap() {
      return CashFlowList.attributeTypeMap;
    }
  }

  export class CategorizationCheckResult {
    /**
     * Transaction identifier
     */
    "transactionId": string;
    /**
     * Category
     */
    "category"?: Category;

    static discriminator: string | undefined = undefined;

    static attributeTypeMap: Array<{ name: string; baseName: string; type: string }> = [
      {
        name: "transactionId",
        baseName: "transactionId",
        type: "string"
      },
      {
        name: "category",
        baseName: "category",
        type: "Category"
      }
    ];

    static getAttributeTypeMap() {
      return CategorizationCheckResult.attributeTypeMap;
    }
  }

  export class CategorizationCheckResults {
    /**
     * List of results
     */
    "categorizationCheckResult": Array<CategorizationCheckResult>;

    static discriminator: string | undefined = undefined;

    static attributeTypeMap: Array<{ name: string; baseName: string; type: string }> = [
      {
        name: "categorizationCheckResult",
        baseName: "categorizationCheckResult",
        type: "Array<CategorizationCheckResult>"
      }
    ];

    static getAttributeTypeMap() {
      return CategorizationCheckResults.attributeTypeMap;
    }
  }

  /**
   * Category data
   */
  export class Category {
    /**
     * Category identifier.<br/><br/>NOTE: Do NOT assume that the identifiers of the global finAPI categories are the same across different finAPI environments. In fact, the identifiers may change whenever a new finAPI version is released, even within the same environment. The identifiers are meant to be used for references within the finAPI services only, but not for hard-coding them in your application. If you need to hard-code the usage of a certain global category within your application, please instead refer to the category name. Also, please make sure to check the 'isCustom' flag, which is false for all global categories (if you are not regarding this flag, you might end up referring to a user-specific category, and not the global category).
     */
    "id": number;
    /**
     * Category name
     */
    "name": string;
    /**
     * Identifier of the parent category (if a parent category exists)
     */
    "parentId"?: number;
    /**
     * Name of the parent category (if a parent category exists)
     */
    "parentName"?: string;
    /**
     * Whether the category is a finAPI global category (in which case this field will be false), or the category was created by a user (in which case this field will be true)
     */
    "isCustom": boolean;
    /**
     * List of sub-categories identifiers (if any exist)
     */
    "children"?: Array<number>;

    static discriminator: string | undefined = undefined;

    static attributeTypeMap: Array<{ name: string; baseName: string; type: string }> = [
      {
        name: "id",
        baseName: "id",
        type: "number"
      },
      {
        name: "name",
        baseName: "name",
        type: "string"
      },
      {
        name: "parentId",
        baseName: "parentId",
        type: "number"
      },
      {
        name: "parentName",
        baseName: "parentName",
        type: "string"
      },
      {
        name: "isCustom",
        baseName: "isCustom",
        type: "boolean"
      },
      {
        name: "children",
        baseName: "children",
        type: "Array<number>"
      }
    ];

    static getAttributeTypeMap() {
      return Category.attributeTypeMap;
    }
  }

  /**
   * Container for data of multiple categories
   */
  export class CategoryList {
    /**
     * Categories
     */
    "categories": Array<Category>;

    static discriminator: string | undefined = undefined;

    static attributeTypeMap: Array<{ name: string; baseName: string; type: string }> = [
      {
        name: "categories",
        baseName: "categories",
        type: "Array<Category>"
      }
    ];

    static getAttributeTypeMap() {
      return CategoryList.attributeTypeMap;
    }
  }

  /**
   * Category parameters
   */
  export class CategoryParams {
    /**
     * Name of the category. Maximum length is 128.
     */
    "name": string;
    /**
     * Identifier of the parent category, if the new category should be created as a sub-category. Must point to a main category in this case. If the new category should be a main category itself, this field must remain unset.
     */
    "parentId"?: number;

    static discriminator: string | undefined = undefined;

    static attributeTypeMap: Array<{ name: string; baseName: string; type: string }> = [
      {
        name: "name",
        baseName: "name",
        type: "string"
      },
      {
        name: "parentId",
        baseName: "parentId",
        type: "number"
      }
    ];

    static getAttributeTypeMap() {
      return CategoryParams.attributeTypeMap;
    }
  }

  /**
   * Parameters for changing client credentials
   */
  export class ChangeClientCredentialsParams {
    /**
     * client_id of the client that you want to change the secret for
     */
    "clientId": string;
    /**
     * Old (=current) client_secret
     */
    "oldClientSecret": string;
    /**
     * New client_secret. Required length is 36. Allowed symbols: Digits (0 through 9), lower-case and upper-case letters (A through Z), and the dash symbol (\"-\").
     */
    "newClientSecret": string;

    static discriminator: string | undefined = undefined;

    static attributeTypeMap: Array<{ name: string; baseName: string; type: string }> = [
      {
        name: "clientId",
        baseName: "clientId",
        type: "string"
      },
      {
        name: "oldClientSecret",
        baseName: "oldClientSecret",
        type: "string"
      },
      {
        name: "newClientSecret",
        baseName: "newClientSecret",
        type: "string"
      }
    ];

    static getAttributeTypeMap() {
      return ChangeClientCredentialsParams.attributeTypeMap;
    }
  }

  /**
   * Transactions data for categorization check
   */
  export class CheckCategorizationData {
    /**
     * Set of transaction data
     */
    "transactionData": Array<CheckCategorizationTransactionData>;

    static discriminator: string | undefined = undefined;

    static attributeTypeMap: Array<{ name: string; baseName: string; type: string }> = [
      {
        name: "transactionData",
        baseName: "transactionData",
        type: "Array<CheckCategorizationTransactionData>"
      }
    ];

    static getAttributeTypeMap() {
      return CheckCategorizationData.attributeTypeMap;
    }
  }

  /**
   * Transaction data for categorization check
   */
  export class CheckCategorizationTransactionData {
    /**
     * Identifier of transaction. This can be any arbitrary string that will be passed back in the response so that you can map the results to the given transactions. Note that the identifier must be unique within the given list of transactions.
     */
    "transactionId": string;
    /**
     * Identifier of account type.<br/><br/>1 = Checking,<br/>2 = Savings,<br/>3 = CreditCard,<br/>4 = Security,<br/>5 = Loan,<br/>6 = Pocket (DEPRECATED; will not be returned for any account unless this type has explicitly been set via PATCH),<br/>7 = Membership,<br/>8 = Bausparen<br/><br/>
     */
    "accountTypeId": number;
    /**
     * Amount
     */
    "amount": number;
    /**
     * Purpose. Any symbols are allowed. Maximum length is 2000. Default value: null.
     */
    "purpose"?: string;
    /**
     * Counterpart. Any symbols are allowed. Maximum length is 80. Default value: null.
     */
    "counterpart"?: string;
    /**
     * Counterpart IBAN. Default value: null.
     */
    "counterpartIban"?: string;
    /**
     * Counterpart account number. Default value: null.
     */
    "counterpartAccountNumber"?: string;
    /**
     * Counterpart BLZ. Default value: null.
     */
    "counterpartBlz"?: string;
    /**
     * Counterpart BIC. Default value: null.
     */
    "counterpartBic"?: string;
    /**
     * Merchant category code (for credit card transactions only). May only contain up to 4 digits. Default value: null.
     */
    "mcCode"?: string;
    /**
     * ZKA business transaction code which relates to the transaction's type (Number from 0 through 999). Default value: null.
     */
    "typeCodeZka"?: string;

    static discriminator: string | undefined = undefined;

    static attributeTypeMap: Array<{ name: string; baseName: string; type: string }> = [
      {
        name: "transactionId",
        baseName: "transactionId",
        type: "string"
      },
      {
        name: "accountTypeId",
        baseName: "accountTypeId",
        type: "number"
      },
      {
        name: "amount",
        baseName: "amount",
        type: "number"
      },
      {
        name: "purpose",
        baseName: "purpose",
        type: "string"
      },
      {
        name: "counterpart",
        baseName: "counterpart",
        type: "string"
      },
      {
        name: "counterpartIban",
        baseName: "counterpartIban",
        type: "string"
      },
      {
        name: "counterpartAccountNumber",
        baseName: "counterpartAccountNumber",
        type: "string"
      },
      {
        name: "counterpartBlz",
        baseName: "counterpartBlz",
        type: "string"
      },
      {
        name: "counterpartBic",
        baseName: "counterpartBic",
        type: "string"
      },
      {
        name: "mcCode",
        baseName: "mcCode",
        type: "string"
      },
      {
        name: "typeCodeZka",
        baseName: "typeCodeZka",
        type: "string"
      }
    ];

    static getAttributeTypeMap() {
      return CheckCategorizationTransactionData.attributeTypeMap;
    }
  }

  export class ClearingAccountData {
    /**
     * Technical identifier of the clearing account
     */
    "clearingAccountId": string;
    /**
     * Name of the clearing account
     */
    "clearingAccountName": string;

    static discriminator: string | undefined = undefined;

    static attributeTypeMap: Array<{ name: string; baseName: string; type: string }> = [
      {
        name: "clearingAccountId",
        baseName: "clearingAccountId",
        type: "string"
      },
      {
        name: "clearingAccountName",
        baseName: "clearingAccountName",
        type: "string"
      }
    ];

    static getAttributeTypeMap() {
      return ClearingAccountData.attributeTypeMap;
    }
  }

  /**
   * Client configuration parameters
   */
  export class ClientConfiguration {
    /**
     * Whether finAPI performs a regular automatic update of your users' bank connections. To find out how the automatic batch update is configured for your client, i.e. which bank connections get updated, and at which time and interval, please contact your Sys-Admin. Note that even if the automatic batch update is enabled for your client, individual users can still disable the feature for their own bank connections.
     */
    "isAutomaticBatchUpdateEnabled": boolean;
    /**
     * Callback URL to which finAPI sends the notification messages that are triggered from the automatic batch update of the users' bank connections. This field is only relevant if the automatic batch update is enabled for your client. For details about what the notification messages look like, please see the documentation in the 'Notification Rules' section. finAPI will call this URL with HTTP method POST. Note that the response of the call is not processed by finAPI. Also note that while the callback URL may be a non-secured (http) URL on the finAPI sandbox or alpha environment, it MUST be a SSL-secured (https) URL on the finAPI live system.
     */
    "userNotificationCallbackUrl"?: string;
    /**
     * Callback URL for user synchronization. This field should be set if you - as a finAPI customer - have multiple clients using finAPI. In such case, all of your clients will share the same user base, making it possible for a user to be created in one client, but then deleted in another. To keep the client-side user data consistent in all clients, you should set a callback URL for each client. finAPI will send a notification to the callback URL of each client whenever a user of your user base gets deleted. Note that finAPI will send a deletion notification to ALL clients, including the one that made the user deletion request to finAPI. So when deleting a user in finAPI, a client should rely on the callback to delete the user on its own side. <p>The notification that finAPI sends to the clients' callback URLs will be a POST request, with this body: <pre>{    \"userId\" : string // contains the identifier of the deleted user    \"event\" : string // this will always be \"DELETED\" }</pre><br/>Note that finAPI does not process the response of this call. Also note that while the callback URL may be a non-secured (http) URL on the finAPI sandbox or alpha environment, it MUST be a SSL-secured (https) URL on the finAPI live system.</p>As long as you have just one client, you can ignore this field and let it be null. However keep in mind that in this case your client will not receive any callback when a user gets deleted - so the deletion of the user on the client-side must not be forgotten. Of course you may still use the callback URL even for just one client, if you want to implement the deletion of the user on the client-side via the callback from finAPI.
     */
    "userSynchronizationCallbackUrl"?: string;
    /**
     * The validity period that newly requested refresh tokens initially have (in seconds). A value of 0 means that the tokens never expire (Unless explicitly invalidated, e.g. by revocation, or when a user gets locked, or when the password is reset for a user).
     */
    "refreshTokensValidityPeriod"?: number;
    /**
     * The validity period that newly requested access tokens for users initially have (in seconds). A value of 0 means that the tokens never expire (Unless explicitly invalidated, e.g. by revocation, or when a user gets locked, or when the password is reset for a user).
     */
    "userAccessTokensValidityPeriod"?: number;
    /**
     * The validity period that newly requested access tokens for clients initially have (in seconds). A value of 0 means that the tokens never expire (Unless explicitly invalidated, e.g. by revocation).
     */
    "clientAccessTokensValidityPeriod"?: number;
    /**
     * Number of consecutive failed login attempts of a user into his finAPI account that is allowed before finAPI locks the user's account. When a user's account is locked, finAPI will invalidate all user's tokens and it will deny any service call in the context of this user (i.e. any call to a service using one of the user's authorization tokens, as well as the service for requesting a new token for this user). To unlock a user's account, a new password must be set for the account by the client (see the services /users/requestPasswordChange and /users/executePasswordChange). Once a new password has been set, all services will be available again for this user and the user's failed login attempts counter is reset to 0. The user's failed login attempts counter is also reset whenever a new authorization token has been successfully retrieved, or whenever the user himself changes his password.<br/><br/>Note that when this field has a value of 0, it means that there is no limit for user login attempts, i.e. finAPI will never lock user accounts.
     */
    "maxUserLoginAttempts": number;
    /**
     * Whether users that are created with this client are automatically verified on creation. If this field is set to 'false', then any user that is created with this client must first be verified with the \"Verify a user\" service before he can be authorized. If the field is 'true', then no verification is required by the client and the user can be authorized immediately after creation.
     */
    "isUserAutoVerificationEnabled": boolean;
    /**
     * Whether this client is a 'Mandator Admin'. Mandator Admins are special clients that can access the 'Mandator Administration' section of finAPI. If you do not yet have credentials for a Mandator Admin, please contact us at support@finapi.io. For further information, please refer to <a href='https://finapi.zendesk.com/hc/en-us/articles/115003661827-Difference-between-app-clients-and-mandator-admin-client' target='_blank'>this article</a> on our Dev Portal.
     */
    "isMandatorAdmin": boolean;
    /**
     * Whether finAPI is allowed to use the WEB_SCRAPER interface for data download. If this field is set to 'true', then finAPI might download data from the online banking websites of banks (either in addition to other interfaces, or as the sole data source for the download). If this field is set to 'false', then finAPI will not use any web scrapers. For banks where no other interface except WEB_SCRAPER is available, finAPI will not allow any data download at all if web scraping is disabled for your client. Please contact your Sys-Admin if you want to change this setting.
     */
    "isWebScrapingEnabled": boolean;
    /**
     * NOTE: This field is deprecated and will be removed at some point.<br><br>Whether this client is allowed to access XS2A services.
     */
    "isXs2aEnabled": boolean;
    /**
     * List of bank groups that are available to this client. A bank group is a collection of all banks that are located in a certain country, and is defined by the country's ISO 3166 ALPHA-2 code (see also field 'location' of Bank resource). If you want to extend or limit the available bank groups for your client, please contact your Sys-Admin.<br/><br/>Note: There is no bank group for international institutes (i.e. institutes that are not bound to any specific country). Instead, those institutes are always available. If this list is empty, it means that ONLY international institutes are available.
     */
    "availableBankGroups": Array<string>;
    /**
     * Application name. When an application name is set (e.g. \"My App\"), then <a href='https://finapi.zendesk.com/hc/en-us/articles/360002596391' target='_blank'>finAPI's web form</a> will display a text to the user \"Weiterleitung auf finAPI von ...\" (e.g. \"Weiterleitung auf finAPI von MyApp\").
     */
    "applicationName"?: string;
    /**
     * The FinTS product registration number. If a value is stored, this will always be 'XXXXX'.
     */
    "finTSProductRegistrationNumber"?: string;
    /**
     * Whether <a href='https://finapi.zendesk.com/hc/en-us/articles/360002596391' target='_blank'>finAPI's web form</a> will provide a checkbox for the user allowing him to choose whether to store login secrets (like a PIN) in finAPI. If this field is set to false, then the user won't have an option to store this data.
     */
    "storeSecretsAvailableInWebForm": boolean;
    /**
     * Whether this client is allowed to do payments
     */
    "paymentsEnabled": boolean;
    /**
     * Whether <a href='https://finapi.zendesk.com/hc/en-us/articles/360002596391' target='_blank'>finAPI's web form</a> will provide a checkbox for the user allowing him to choose whether to store his banking PIN in finAPI. If this field is set to false, then the user won't have an option to store his PIN.<br><br>NOTE: This field is deprecated and will be removed at some point. Refer to field 'storeSecretsAvailableInWebForm' instead.
     */
    "pinStorageAvailableInWebForm": boolean;

    static discriminator: string | undefined = undefined;

    static attributeTypeMap: Array<{ name: string; baseName: string; type: string }> = [
      {
        name: "isAutomaticBatchUpdateEnabled",
        baseName: "isAutomaticBatchUpdateEnabled",
        type: "boolean"
      },
      {
        name: "userNotificationCallbackUrl",
        baseName: "userNotificationCallbackUrl",
        type: "string"
      },
      {
        name: "userSynchronizationCallbackUrl",
        baseName: "userSynchronizationCallbackUrl",
        type: "string"
      },
      {
        name: "refreshTokensValidityPeriod",
        baseName: "refreshTokensValidityPeriod",
        type: "number"
      },
      {
        name: "userAccessTokensValidityPeriod",
        baseName: "userAccessTokensValidityPeriod",
        type: "number"
      },
      {
        name: "clientAccessTokensValidityPeriod",
        baseName: "clientAccessTokensValidityPeriod",
        type: "number"
      },
      {
        name: "maxUserLoginAttempts",
        baseName: "maxUserLoginAttempts",
        type: "number"
      },
      {
        name: "isUserAutoVerificationEnabled",
        baseName: "isUserAutoVerificationEnabled",
        type: "boolean"
      },
      {
        name: "isMandatorAdmin",
        baseName: "isMandatorAdmin",
        type: "boolean"
      },
      {
        name: "isWebScrapingEnabled",
        baseName: "isWebScrapingEnabled",
        type: "boolean"
      },
      {
        name: "isXs2aEnabled",
        baseName: "isXs2aEnabled",
        type: "boolean"
      },
      {
        name: "availableBankGroups",
        baseName: "availableBankGroups",
        type: "Array<string>"
      },
      {
        name: "applicationName",
        baseName: "applicationName",
        type: "string"
      },
      {
        name: "finTSProductRegistrationNumber",
        baseName: "finTSProductRegistrationNumber",
        type: "string"
      },
      {
        name: "storeSecretsAvailableInWebForm",
        baseName: "storeSecretsAvailableInWebForm",
        type: "boolean"
      },
      {
        name: "paymentsEnabled",
        baseName: "paymentsEnabled",
        type: "boolean"
      },
      {
        name: "pinStorageAvailableInWebForm",
        baseName: "pinStorageAvailableInWebForm",
        type: "boolean"
      }
    ];

    static getAttributeTypeMap() {
      return ClientConfiguration.attributeTypeMap;
    }
  }

  /**
   * Client configuration parameters
   */
  export class ClientConfigurationParams {
    /**
     * Callback URL to which finAPI sends the notification messages that are triggered from the automatic batch update of the users' bank connections. This field is only relevant if the automatic batch update is enabled for your client. For details about what the notification messages look like, please see the documentation in the 'Notification Rules' section. finAPI will call this URL with HTTP method POST. Note that the response of the call is not processed by finAPI. Also note that while the callback URL may be a non-secured (http) URL on the finAPI sandbox or alpha environment, it MUST be a SSL-secured (https) URL on the finAPI live system.<p>The maximum allowed length of the URL is 512. If you have previously set a callback URL and now want to clear it (thus disabling user-related notifications altogether), you can pass an empty string (\"\").
     */
    "userNotificationCallbackUrl"?: string;
    /**
     * Callback URL for user synchronization. This field should be set if you - as a finAPI customer - have multiple clients using finAPI. In such case, all of your clients will share the same user base, making it possible for a user to be created in one client, but then deleted in another. To keep the client-side user data consistent in all clients, you should set a callback URL for each client. finAPI will send a notification to the callback URL of each client whenever a user of your user base gets deleted. Note that finAPI will send a deletion notification to ALL clients, including the one that made the user deletion request to finAPI. So when deleting a user in finAPI, a client should rely on the callback to delete the user on its own side. <p>The notification that finAPI sends to the clients' callback URLs will be a POST request, with this body: <pre>{    \"userId\" : string // contains the identifier of the deleted user    \"event\" : string // this will always be \"DELETED\" }</pre><br/>Note that finAPI does not process the response of this call. Also note that while the callback URL may be a non-secured (http) URL on the finAPI sandbox or alpha system, it MUST be a SSL-secured (https) URL on the live system.</p>As long as you have just one client, you can ignore this field and let it be null. However keep in mind that in this case your client will not receive any callback when a user gets deleted - so the deletion of the user on the client-side must not be forgotten. Of course you may still use the callback URL even for just one client, if you want to implement the deletion of the user on the client-side via the callback from finAPI.<p> The maximum allowed length of the URL is 512. If you have previously set a callback URL and now want to clear it (thus disabling user synchronization related notifications for this client), you can pass an empty string (\"\").
     */
    "userSynchronizationCallbackUrl"?: string;
    /**
     * The validity period that newly requested refresh tokens initially have (in seconds). The value must be greater than or equal to 60, or 0. A value of 0 means that the tokens never expire (Unless explicitly invalidated, e.g. by revocation , or when a user gets locked, or when the password is reset for a user).
     */
    "refreshTokensValidityPeriod"?: number;
    /**
     * The validity period that newly requested access tokens for users initially have (in seconds). The value must be greater than or equal to 60, or 0. A value of 0 means that the tokens never expire.
     */
    "userAccessTokensValidityPeriod"?: number;
    /**
     * The validity period that newly requested access tokens for clients initially have (in seconds). The value must be greater than or equal to 60, or 0. A value of 0 means that the tokens never expire.
     */
    "clientAccessTokensValidityPeriod"?: number;
    /**
     * Whether <a href='https://finapi.zendesk.com/hc/en-us/articles/360002596391' target='_blank'>finAPI's web form</a> should provide a checkbox for the user allowing him to choose whether to store his banking PIN in finAPI. If this field is set to false, then the user won't have an option to store his PIN.<br><br>NOTE: This field is deprecated and will be removed at some point. Use 'storeSecretsAvailableInWebForm' instead.
     */
    "isPinStorageAvailableInWebForm"?: boolean;
    /**
     * Whether <a href='https://finapi.zendesk.com/hc/en-us/articles/360002596391' target='_blank'>finAPI's web form</a> will provide a checkbox for the user allowing him to choose whether to store login secrets (like a PIN) in finAPI. If this field is set to false, then the user won't have an option to store this data.
     */
    "storeSecretsAvailableInWebForm"?: boolean;
    /**
     * When an application name is set (e.g. \"My App\"), then <a href='https://finapi.zendesk.com/hc/en-us/articles/360002596391' target='_blank'>finAPI's web form</a> will display a text to the user \"Weiterleitung auf finAPI von ...\" (e.g. \"Weiterleitung auf finAPI von My App\"). If you have previously set a application name and now want to clear it, you can pass an empty string (\"\"). Maximum length: 64
     */
    "applicationName"?: string;
    /**
     * The FinTS product registration number. Please follow <a href='https://www.hbci-zka.de/register/prod_register.htm' target='_blank'>this link</a> to apply for a registration number. Only customers who have an AISP or PISP license must define their FinTS product registration number. Customers who are relying on the finAPI web form will be assigned to finAPI's FinTS product registration number automatically and do not have to register themselves. During a batch update, finAPI is using the FinTS product registration number of the client, that was used to create the user. If you have previously set a FinTS product registration number and now want to clear it, you can pass an empty string (\"\"). Only hexa decimal characters in capital case with a maximum length of 25 characters are allowed. E.g. 'ABCDEF1234567890ABCDEF123'
     */
    "finTSProductRegistrationNumber"?: string;

    static discriminator: string | undefined = undefined;

    static attributeTypeMap: Array<{ name: string; baseName: string; type: string }> = [
      {
        name: "userNotificationCallbackUrl",
        baseName: "userNotificationCallbackUrl",
        type: "string"
      },
      {
        name: "userSynchronizationCallbackUrl",
        baseName: "userSynchronizationCallbackUrl",
        type: "string"
      },
      {
        name: "refreshTokensValidityPeriod",
        baseName: "refreshTokensValidityPeriod",
        type: "number"
      },
      {
        name: "userAccessTokensValidityPeriod",
        baseName: "userAccessTokensValidityPeriod",
        type: "number"
      },
      {
        name: "clientAccessTokensValidityPeriod",
        baseName: "clientAccessTokensValidityPeriod",
        type: "number"
      },
      {
        name: "isPinStorageAvailableInWebForm",
        baseName: "isPinStorageAvailableInWebForm",
        type: "boolean"
      },
      {
        name: "storeSecretsAvailableInWebForm",
        baseName: "storeSecretsAvailableInWebForm",
        type: "boolean"
      },
      {
        name: "applicationName",
        baseName: "applicationName",
        type: "string"
      },
      {
        name: "finTSProductRegistrationNumber",
        baseName: "finTSProductRegistrationNumber",
        type: "string"
      }
    ];

    static getAttributeTypeMap() {
      return ClientConfigurationParams.attributeTypeMap;
    }
  }

  /**
   * Container for interface connection parameters
   */
  export class ConnectInterfaceParams {
    /**
     * Bank connection identifier
     */
    "bankConnectionId": number;
    /**
     * The interface to use for connecting with the bank.
     */
    "_interface"?: ConnectInterfaceParams.InterfaceEnum;
    /**
     * Set of login credentials. Must be passed in combination with the 'interface' field. For mandators requiring a web form, no matter the passed login credentials, the web form will contain all login fields defined by the bank for the respective interface.
     */
    "loginCredentials"?: Array<LoginCredential>;
    /**
     * Whether to store the secret login fields. If the secret fields are stored, then updates can be triggered without the involvement of the users, as long as the credentials remain valid and the bank consent has not expired. Note that bank consent will be stored regardless of the field value. Default value is false.<br/><br/>NOTES:<br/> - this field is ignored in case when the user will need to use finAPI's web form. The user will be able to decide whether to store the secrets or not in the web form, depending on the 'storeSecretsAvailableInWebForm' setting (see Client Configuration).
     */
    "storeSecrets"?: boolean;
    /**
     * Whether to skip the download of transactions and securities or not. If set to true, then finAPI will download just the accounts list with the accounts' information (like account name, number, holder, etc), as well as the accounts' balances (if possible), but skip the download of transactions and securities. Default is false.<br/><br/>NOTES:<br/>&bull; If you skip the download of transactions and securities during an import or update, you can still download them on a later update (though you might not get all positions at a later point, because the date range in which the bank servers provide this data is usually limited). However, once finAPI has downloaded the transactions or securities for the first time, you will not be able to go back to skipping the download of transactions and securities! In other words: Once you make your first request with skipPositionsDownload=false for a certain bank connection, you will no longer be able to make a request with skipPositionsDownload=true for that same bank connection.<br/>&bull; If this bank connection is updated via finAPI's automatic batch update, then transactions and security positions <u>will</u> be downloaded in any case!<br/>&bull; For security accounts, skipping the downloading of the securities might result in the account's balance also not being downloaded.<br/>&bull; For Bausparen accounts, this field is ignored. finAPI will always download transactions for Bausparen accounts.<br/>
     */
    "skipPositionsDownload"?: boolean;
    /**
     * Whether to load information about the bank connection owner(s) - see field 'owners'. Default value is 'false'.<br><br>NOTE: This feature is supported only by the WEB_SCRAPER interface.
     */
    "loadOwnerData"?: boolean;
    /**
     * List of accounts for which access is requested from the bank. It must only be passed if the bank interface has the DETAILED_CONSENT property set.
     */
    "accountReferences"?: Array<AccountReference>;
    /**
     * Container for multi-step authentication data
     */
    "multiStepAuthentication"?: MultiStepAuthenticationCallback;
    /**
     * Must only be passed when the used interface has the property REDIRECT_APPROACH and no web form flow is used. The user will be redirected to the given URL from the bank's website after having entered his credentials. Must use HTTPS protocol.
     */
    "redirectUrl"?: string;

    static discriminator: string | undefined = undefined;

    static attributeTypeMap: Array<{ name: string; baseName: string; type: string }> = [
      {
        name: "bankConnectionId",
        baseName: "bankConnectionId",
        type: "number"
      },
      {
        name: "_interface",
        baseName: "interface",
        type: "ConnectInterfaceParams.InterfaceEnum"
      },
      {
        name: "loginCredentials",
        baseName: "loginCredentials",
        type: "Array<LoginCredential>"
      },
      {
        name: "storeSecrets",
        baseName: "storeSecrets",
        type: "boolean"
      },
      {
        name: "skipPositionsDownload",
        baseName: "skipPositionsDownload",
        type: "boolean"
      },
      {
        name: "loadOwnerData",
        baseName: "loadOwnerData",
        type: "boolean"
      },
      {
        name: "accountReferences",
        baseName: "accountReferences",
        type: "Array<AccountReference>"
      },
      {
        name: "multiStepAuthentication",
        baseName: "multiStepAuthentication",
        type: "MultiStepAuthenticationCallback"
      },
      {
        name: "redirectUrl",
        baseName: "redirectUrl",
        type: "string"
      }
    ];

    static getAttributeTypeMap() {
      return ConnectInterfaceParams.attributeTypeMap;
    }
  }

  export namespace ConnectInterfaceParams {
    export enum InterfaceEnum {
      FINTSSERVER = <any>"FINTS_SERVER",
      WEBSCRAPER = <any>"WEB_SCRAPER",
      XS2A = <any>"XS2A"
    }
  }
  /**
   * Balance data for a single day
   */
  export class DailyBalance {
    /**
     * Date in the format 'YYYY-MM-DD HH:MM:SS.SSS' (german time).
     */
    "date": string;
    /**
     * Calculated balance at the end of day (aggregation of all regarded accounts).
     */
    "balance": number;
    /**
     * The sum of income of the given day (aggregation of all regarded accounts).
     */
    "income": number;
    /**
     * The sum of spending of the given day (aggregation of all regarded accounts).
     */
    "spending": number;
    /**
     * Identifiers of the transactions for the given day
     */
    "transactions": Array<number>;

    static discriminator: string | undefined = undefined;

    static attributeTypeMap: Array<{ name: string; baseName: string; type: string }> = [
      {
        name: "date",
        baseName: "date",
        type: "string"
      },
      {
        name: "balance",
        baseName: "balance",
        type: "number"
      },
      {
        name: "income",
        baseName: "income",
        type: "number"
      },
      {
        name: "spending",
        baseName: "spending",
        type: "number"
      },
      {
        name: "transactions",
        baseName: "transactions",
        type: "Array<number>"
      }
    ];

    static getAttributeTypeMap() {
      return DailyBalance.attributeTypeMap;
    }
  }

  /**
   * Contains a list of daily balances
   */
  export class DailyBalanceList {
    /**
     * The latestCommonBalanceTimestamp is the latest timestamp at which all regarded  accounts have been up to date. Only balances with their date being smaller than the latestCommonBalanceTimestamp are reliable. Example: A user has two accounts: A (last update today, so balance from today) and B (last update yesterday, so balance from yesterday). The service /accounts/dailyBalances will return a balance for yesterday and for today, with the info latestCommonBalanceTimestamp=yesterday. Since account B might have received transactions this morning, today's balance might be wrong. So either make sure that all regarded accounts are up to date before calling this service, or use the results carefully in combination with the latestCommonBalanceTimestamp. The format is 'YYYY-MM-DD HH:MM:SS.SSS' (german time).
     */
    "latestCommonBalanceTimestamp"?: string;
    /**
     * List of daily balances for the requested period and account(s)
     */
    "dailyBalances": Array<DailyBalance>;
    /**
     * Information for pagination
     */
    "paging": Paging;

    static discriminator: string | undefined = undefined;

    static attributeTypeMap: Array<{ name: string; baseName: string; type: string }> = [
      {
        name: "latestCommonBalanceTimestamp",
        baseName: "latestCommonBalanceTimestamp",
        type: "string"
      },
      {
        name: "dailyBalances",
        baseName: "dailyBalances",
        type: "Array<DailyBalance>"
      },
      {
        name: "paging",
        baseName: "paging",
        type: "Paging"
      }
    ];

    static getAttributeTypeMap() {
      return DailyBalanceList.attributeTypeMap;
    }
  }

  /**
   * Bank server's response to a direct debit order request
   */
  export class DirectDebitOrderingResponse {
    /**
     * Technical message from the bank server, confirming the success of the request. Typically, you would not want to present this message to the user. Note that this field may not be set. However if it is not set, it does not necessarily mean that there was an error in processing the request.
     */
    "successMessage"?: string;
    /**
     * In some cases, a bank server may accept the requested order, but return a warn message. This message may be of technical nature, but could also be of interest to the user.
     */
    "warnMessage"?: string;
    /**
     * Payment identifier. Can be used to retrieve the status of the payment (see 'Get payments' service).
     */
    "paymentId": number;
    /**
     * Message from the bank server containing information or instructions on how to retrieve the TAN that is needed to execute the requested order. This message should be presented to the user. Note that some bank servers may limit the message to just the most crucial information, e.g. the message may contain just a single number that depicts the target TAN number on a user's TAN list. You may want to parse the challenge message for such cases and extend it with more detailed information before showing it to the user.
     */
    "challengeMessage"?: string;
    /**
     * Suggestion from the bank server on how you can label your input field where the user must enter his TAN. A typical value that many bank servers give is 'TAN-Nummer'.
     */
    "answerFieldLabel"?: string;
    /**
     * In case that the bank server has instructed the user to look up a TAN from a TAN list, this field may contain the identification number of the TAN list. However in most cases, this field is only set (i.e. not null) when the user has multiple active TAN lists.
     */
    "tanListNumber"?: string;
    /**
     * In case that the bank server has instructed the user to scan a flicker code, then this field will contain the raw data for the flicker animation as a BASE-64 string. Otherwise, this field will be not set (i.e. null). For more information on how to process the flicker code data, please address the <a href='https://finapi.zendesk.com' target='_blank'>finAPI Developer Portal</a>.
     */
    "opticalData"?: string;
    /**
     * In case that the 'photoTanData' field is set (i.e. not null), this field contains the MIME type to use for interpreting the photo data (e.g.: 'image/png')
     */
    "photoTanMimeType"?: string;
    /**
     * In case that the bank server has instructed the user to scan a photo (or more generally speaking, any kind of QR-code-like data), then this field will contain the raw data of the photo as a BASE-64 string. Otherwise, this field will be not set (i.e. null). For more information on how to process the photo data, please address the <a href='https://finapi.zendesk.com' target='_blank'>finAPI Developer Portal</a>.
     */
    "photoTanData"?: string;

    static discriminator: string | undefined = undefined;

    static attributeTypeMap: Array<{ name: string; baseName: string; type: string }> = [
      {
        name: "successMessage",
        baseName: "successMessage",
        type: "string"
      },
      {
        name: "warnMessage",
        baseName: "warnMessage",
        type: "string"
      },
      {
        name: "paymentId",
        baseName: "paymentId",
        type: "number"
      },
      {
        name: "challengeMessage",
        baseName: "challengeMessage",
        type: "string"
      },
      {
        name: "answerFieldLabel",
        baseName: "answerFieldLabel",
        type: "string"
      },
      {
        name: "tanListNumber",
        baseName: "tanListNumber",
        type: "string"
      },
      {
        name: "opticalData",
        baseName: "opticalData",
        type: "string"
      },
      {
        name: "photoTanMimeType",
        baseName: "photoTanMimeType",
        type: "string"
      },
      {
        name: "photoTanData",
        baseName: "photoTanData",
        type: "string"
      }
    ];

    static getAttributeTypeMap() {
      return DirectDebitOrderingResponse.attributeTypeMap;
    }
  }

  /**
   * Container for bank connection edit params
   */
  export class EditBankConnectionParams {
    /**
     * New name for the bank connection. Maximum length is 64. If you do not want to change the current name let this field remain unset. If you want to clear the current name, set the field's value to an empty string (\"\").
     */
    "name"?: string;
    /**
     * NOTE: This field is deprecated and will be removed at some point. Use 'loginCredentials' + 'interface' instead. If any of those two fields is used, then the value of this field will be ignored.<br><br>New online banking user ID. If you do not want to change the current user ID let this field remain unset. In case you need to use finAPI's web form to let the user update the field, just set the field to any value, so that the service recognizes that you wish to use the web form flow. Note that you cannot clear the current user ID, i.e. a bank connection must always have a user ID (except for when it is a 'demo connection'). Max length: 170.
     */
    "bankingUserId"?: string;
    /**
     * NOTE: This field is deprecated and will be removed at some point. Use 'loginCredentials' + 'interface' instead. If any of those two fields is used, then the value of this field will be ignored.<br><br>New online banking customer ID. If you do not want to change the current customer ID let this field remain unset. In case you need to use finAPI's web form to let the user update the field, just set the field to non-empty value, so that the service recognizes that you wish to use the web form flow. If you want to clear the current customer ID, set the field's value to an empty string (\"\"). Max length: 170.
     */
    "bankingCustomerId"?: string;
    /**
     * NOTE: This field is deprecated and will be removed at some point. Use 'loginCredentials' + 'interface' instead. If any of those two fields is used, then the value of this field will be ignored.<br><br>New online banking PIN. If you do not want to change the current PIN let this field remain unset. In case you need to use finAPI's web form to let the user update the field, just set the field to non-empty value, so that the service recognizes that you wish to use the web form flow. If you want to clear the current PIN, set the field's value to an empty string (\"\").<br/><br/>Any symbols are allowed. Max length: 170.
     */
    "bankingPin"?: string;
    /**
     * The interface for which you want to edit data. Must be given when you pass 'loginCredentials' and/or a 'defaultTwoStepProcedureId'.
     */
    "_interface"?: EditBankConnectionParams.InterfaceEnum;
    /**
     * Set of login credentials that you want to edit. Must be passed in combination with the 'interface' field. The labels that you pass must match with the login credential labels that the respective interface defines. If you want to clear the stored value for a credential, you can pass an empty string (\"\") as value.In case you need to use finAPI's web form to let the user update the login credentials, send all fields the user wishes to update with a non-empty value.In case all fields contain an empty string (\"\"), no webform will be generated. Note that any change in the credentials will automatically remove the saved consent data associated with those credentials.<br><br>NOTE: When you pass this field, then the fields 'bankingUserId','bankingCustomerId' and 'bankingPin' will be ignored.
     */
    "loginCredentials"?: Array<LoginCredential>;
    /**
     * NOTE: In the future, this field will work only in combination with the 'interface' field.<br><br>New default two-step-procedure. Must match the 'procedureId' of one of the procedures that are listed in the bank connection. If you do not want to change this field let it remain unset. If you want to clear the current default two-step-procedure, set the field's value to an empty string (\"\").
     */
    "defaultTwoStepProcedureId"?: string;

    static discriminator: string | undefined = undefined;

    static attributeTypeMap: Array<{ name: string; baseName: string; type: string }> = [
      {
        name: "name",
        baseName: "name",
        type: "string"
      },
      {
        name: "bankingUserId",
        baseName: "bankingUserId",
        type: "string"
      },
      {
        name: "bankingCustomerId",
        baseName: "bankingCustomerId",
        type: "string"
      },
      {
        name: "bankingPin",
        baseName: "bankingPin",
        type: "string"
      },
      {
        name: "_interface",
        baseName: "interface",
        type: "EditBankConnectionParams.InterfaceEnum"
      },
      {
        name: "loginCredentials",
        baseName: "loginCredentials",
        type: "Array<LoginCredential>"
      },
      {
        name: "defaultTwoStepProcedureId",
        baseName: "defaultTwoStepProcedureId",
        type: "string"
      }
    ];

    static getAttributeTypeMap() {
      return EditBankConnectionParams.attributeTypeMap;
    }
  }

  export namespace EditBankConnectionParams {
    export enum InterfaceEnum {
      FINTSSERVER = <any>"FINTS_SERVER",
      WEBSCRAPER = <any>"WEB_SCRAPER",
      XS2A = <any>"XS2A"
    }
  }
  /**
   * Container for category edit params
   */
  export class EditCategoryParams {
    /**
     * New name of the category. Maximum length is 128.
     */
    "name": string;

    static discriminator: string | undefined = undefined;

    static attributeTypeMap: Array<{ name: string; baseName: string; type: string }> = [
      {
        name: "name",
        baseName: "name",
        type: "string"
      }
    ];

    static getAttributeTypeMap() {
      return EditCategoryParams.attributeTypeMap;
    }
  }

  /**
   * A container for editing TPP client credentials data
   */
  export class EditTppCredentialParams {
    /**
     * The TPP Authentication Group Id for which the credentials can be used
     */
    "tppAuthenticationGroupId"?: number;
    /**
     * Optional label for credentials
     */
    "label"?: string;
    /**
     * ID of the TPP accessing the ASPSP API, as provided by the ASPSP as the result of registration
     */
    "tppClientId"?: string;
    /**
     * Secret of the TPP accessing the ASPSP API, as provided by the ASPSP as the result of registration
     */
    "tppClientSecret"?: string;
    /**
     * API Key provided by ASPSP  as the result of registration
     */
    "tppApiKey"?: string;
    /**
     * Credentials \"valid from\" date in the format 'YYYY-MM-DD'. Default is today's date
     */
    "validFromDate"?: string;
    /**
     * Credentials \"valid until\" date in the format 'YYYY-MM-DD'. Default is null which means \"indefinite\" (no limit)
     */
    "validUntilDate"?: string;

    static discriminator: string | undefined = undefined;

    static attributeTypeMap: Array<{ name: string; baseName: string; type: string }> = [
      {
        name: "tppAuthenticationGroupId",
        baseName: "tppAuthenticationGroupId",
        type: "number"
      },
      {
        name: "label",
        baseName: "label",
        type: "string"
      },
      {
        name: "tppClientId",
        baseName: "tppClientId",
        type: "string"
      },
      {
        name: "tppClientSecret",
        baseName: "tppClientSecret",
        type: "string"
      },
      {
        name: "tppApiKey",
        baseName: "tppApiKey",
        type: "string"
      },
      {
        name: "validFromDate",
        baseName: "validFromDate",
        type: "string"
      },
      {
        name: "validUntilDate",
        baseName: "validUntilDate",
        type: "string"
      }
    ];

    static getAttributeTypeMap() {
      return EditTppCredentialParams.attributeTypeMap;
    }
  }

  /**
   * Error details
   */
  export class ErrorDetails {
    /**
     * Error message
     */
    "message"?: string;
    /**
     * Error code. See the documentation of the individual services for details about what values may be returned.
     */
    "code": ErrorDetails.CodeEnum;
    /**
     * Error type. BUSINESS errors depict error messages in the language of the bank (or the preferred language) for the user, e.g. from a bank server. TECHNICAL errors are meant to be read by developers and depict internal errors.
     */
    "type": ErrorDetails.TypeEnum;
    /**
     * This field is set when a multi-step authentication is required, i.e. when you need to repeat the original service call and provide additional data. The field contains information about what additional data is required.
     */
    "multiStepAuthentication"?: MultiStepAuthenticationChallenge;

    static discriminator: string | undefined = undefined;

    static attributeTypeMap: Array<{ name: string; baseName: string; type: string }> = [
      {
        name: "message",
        baseName: "message",
        type: "string"
      },
      {
        name: "code",
        baseName: "code",
        type: "ErrorDetails.CodeEnum"
      },
      {
        name: "type",
        baseName: "type",
        type: "ErrorDetails.TypeEnum"
      },
      {
        name: "multiStepAuthentication",
        baseName: "multiStepAuthentication",
        type: "MultiStepAuthenticationChallenge"
      }
    ];

    static getAttributeTypeMap() {
      return ErrorDetails.attributeTypeMap;
    }
  }

  export namespace ErrorDetails {
    export enum CodeEnum {
      MISSINGFIELD = <any>"MISSING_FIELD",
      UNKNOWNENTITY = <any>"UNKNOWN_ENTITY",
      METHODNOTALLOWED = <any>"METHOD_NOT_ALLOWED",
      ENTITYEXISTS = <any>"ENTITY_EXISTS",
      ILLEGALENTITYSTATE = <any>"ILLEGAL_ENTITY_STATE",
      UNEXPECTEDERROR = <any>"UNEXPECTED_ERROR",
      ILLEGALFIELDVALUE = <any>"ILLEGAL_FIELD_VALUE",
      UNAUTHORIZEDACCESS = <any>"UNAUTHORIZED_ACCESS",
      BADREQUEST = <any>"BAD_REQUEST",
      UNSUPPORTEDORDER = <any>"UNSUPPORTED_ORDER",
      ILLEGALPAGESIZE = <any>"ILLEGAL_PAGE_SIZE",
      INVALIDFILTEROPTIONS = <any>"INVALID_FILTER_OPTIONS",
      TOOMANYIDS = <any>"TOO_MANY_IDS",
      BANKSERVERREJECTION = <any>"BANK_SERVER_REJECTION",
      IBANONLYMONEYTRANSFERNOTSUPPORTED = <any>"IBAN_ONLY_MONEY_TRANSFER_NOT_SUPPORTED",
      IBANONLYDIRECTDEBITNOTSUPPORTED = <any>"IBAN_ONLY_DIRECT_DEBIT_NOT_SUPPORTED",
      COLLECTIVEMONEYTRANSFERNOTSUPPORTED = <any>"COLLECTIVE_MONEY_TRANSFER_NOT_SUPPORTED",
      INVALIDTWOSTEPPROCEDURE = <any>"INVALID_TWO_STEP_PROCEDURE",
      MISSINGTWOSTEPPROCEDURE = <any>"MISSING_TWO_STEP_PROCEDURE",
      UNSUPPORTEDMEDIATYPE = <any>"UNSUPPORTED_MEDIA_TYPE",
      UNSUPPORTEDBANK = <any>"UNSUPPORTED_BANK",
      USERNOTVERIFIED = <any>"USER_NOT_VERIFIED",
      USERALREADYVERIFIED = <any>"USER_ALREADY_VERIFIED",
      INVALIDTOKEN = <any>"INVALID_TOKEN",
      LOCKED = <any>"LOCKED",
      NOACCOUNTSFORTYPELIST = <any>"NO_ACCOUNTS_FOR_TYPE_LIST",
      FORBIDDEN = <any>"FORBIDDEN",
      NOEXISTINGCHALLENGE = <any>"NO_EXISTING_CHALLENGE",
      ADDITIONALAUTHENTICATIONREQUIRED = <any>"ADDITIONAL_AUTHENTICATION_REQUIRED",
      WEBFORMREQUIRED = <any>"WEB_FORM_REQUIRED",
      WEBFORMABORTED = <any>"WEB_FORM_ABORTED",
      INVALIDCONSENT = <any>"INVALID_CONSENT",
      NOCERTIFICATE = <any>"NO_CERTIFICATE",
      NOTPPCLIENTCREDENTIALS = <any>"NO_TPP_CLIENT_CREDENTIALS"
    }
    export enum TypeEnum {
      BUSINESS = <any>"BUSINESS",
      TECHNICAL = <any>"TECHNICAL"
    }
  }
  /**
   * Response type when a service call was not successful. Contains details about the error(s) that occurred.
   */
  export class ErrorMessage {
    /**
     * List of errors
     */
    "errors": Array<ErrorDetails>;
    /**
     * Server date of when the error(s) occurred, in the format YYYY-MM-DD HH:MM:SS.SSS
     */
    "date": string;
    /**
     * ID of the request that caused this error. This is either what you have passed for the header 'X-REQUEST-ID', or an auto-generated ID in case you didn't pass any value for that header.
     */
    "requestId"?: string;
    /**
     * The service endpoint that was called
     */
    "endpoint": string;
    /**
     * Information about the authorization context of the service call
     */
    "authContext": string;
    /**
     * BLZ and name (in format \"<BLZ> - <name>\") of a bank that was used for the original request
     */
    "bank"?: string;

    static discriminator: string | undefined = undefined;

    static attributeTypeMap: Array<{ name: string; baseName: string; type: string }> = [
      {
        name: "errors",
        baseName: "errors",
        type: "Array<ErrorDetails>"
      },
      {
        name: "date",
        baseName: "date",
        type: "string"
      },
      {
        name: "requestId",
        baseName: "requestId",
        type: "string"
      },
      {
        name: "endpoint",
        baseName: "endpoint",
        type: "string"
      },
      {
        name: "authContext",
        baseName: "authContext",
        type: "string"
      },
      {
        name: "bank",
        baseName: "bank",
        type: "string"
      }
    ];

    static getAttributeTypeMap() {
      return ErrorMessage.attributeTypeMap;
    }
  }

  /**
   * Execute password change parameters
   */
  export class ExecutePasswordChangeParams {
    /**
     * User identifier
     */
    "userId": string;
    /**
     * User's new password. Minimum length is 6, and maximum length is 128.
     */
    "password": string;
    /**
     * Decrypted password change token (the token that you received from the /users/requestPasswordChange service, decrypted with your data decryption key)
     */
    "passwordChangeToken": string;

    static discriminator: string | undefined = undefined;

    static attributeTypeMap: Array<{ name: string; baseName: string; type: string }> = [
      {
        name: "userId",
        baseName: "userId",
        type: "string"
      },
      {
        name: "password",
        baseName: "password",
        type: "string"
      },
      {
        name: "passwordChangeToken",
        baseName: "passwordChangeToken",
        type: "string"
      }
    ];

    static getAttributeTypeMap() {
      return ExecutePasswordChangeParams.attributeTypeMap;
    }
  }

  /**
   * Container for parameters for the execution of a submitted SEPA direct debit order
   */
  export class ExecuteSepaDirectDebitParams {
    /**
     * Identifier of the bank account that you want to transfer money to
     */
    "accountId": number;
    /**
     * Banking TAN that the user received from the bank for executing the direct debit order. The field is required if you are licensed to perform SEPA direct debits yourself. Otherwise, i.e. when finAPI's web form flow is required, the web form will deal with executing the service itself.
     */
    "bankingTan"?: string;

    static discriminator: string | undefined = undefined;

    static attributeTypeMap: Array<{ name: string; baseName: string; type: string }> = [
      {
        name: "accountId",
        baseName: "accountId",
        type: "number"
      },
      {
        name: "bankingTan",
        baseName: "bankingTan",
        type: "string"
      }
    ];

    static getAttributeTypeMap() {
      return ExecuteSepaDirectDebitParams.attributeTypeMap;
    }
  }

  /**
   * Container for parameters for the execution of a submitted SEPA money transfer order
   */
  export class ExecuteSepaMoneyTransferParams {
    /**
     * Identifier of the bank account that you want to transfer money from
     */
    "accountId": number;
    /**
     * Banking TAN that the user received from the bank for executing the money transfer order. The field is required if you are licensed to perform SEPA money transfers yourself. Otherwise, i.e. when finAPI's web form flow is required, the web form will deal with executing the service itself.
     */
    "bankingTan"?: string;

    static discriminator: string | undefined = undefined;

    static attributeTypeMap: Array<{ name: string; baseName: string; type: string }> = [
      {
        name: "accountId",
        baseName: "accountId",
        type: "number"
      },
      {
        name: "bankingTan",
        baseName: "bankingTan",
        type: "string"
      }
    ];

    static getAttributeTypeMap() {
      return ExecuteSepaMoneyTransferParams.attributeTypeMap;
    }
  }

  /**
   * Container for an IBAN rule
   */
  export class IbanRule {
    /**
     * Rule identifier
     */
    "id": number;
    /**
     * The category that this rule assigns to the transactions that it matches
     */
    "category": Category;
    /**
     * Direction for the rule. 'Income' means that the rule applies to transactions with a positive amount only, 'Spending' means it applies to transactions with a negative amount only.
     */
    "direction": IbanRule.DirectionEnum;
    /**
     * Timestamp of when the rule was created, in the format 'YYYY-MM-DD HH:MM:SS.SSS' (german time)
     */
    "creationDate": string;
    /**
     * The IBAN for this rule
     */
    "iban": string;

    static discriminator: string | undefined = undefined;

    static attributeTypeMap: Array<{ name: string; baseName: string; type: string }> = [
      {
        name: "id",
        baseName: "id",
        type: "number"
      },
      {
        name: "category",
        baseName: "category",
        type: "Category"
      },
      {
        name: "direction",
        baseName: "direction",
        type: "IbanRule.DirectionEnum"
      },
      {
        name: "creationDate",
        baseName: "creationDate",
        type: "string"
      },
      {
        name: "iban",
        baseName: "iban",
        type: "string"
      }
    ];

    static getAttributeTypeMap() {
      return IbanRule.attributeTypeMap;
    }
  }

  export namespace IbanRule {
    export enum DirectionEnum {
      Income = <any>"Income",
      Spending = <any>"Spending"
    }
  }
  /**
   * Identifiers params
   */
  export class IbanRuleIdentifiersParams {
    /**
     * List of identifiers
     */
    "ids": Array<number>;

    static discriminator: string | undefined = undefined;

    static attributeTypeMap: Array<{ name: string; baseName: string; type: string }> = [
      {
        name: "ids",
        baseName: "ids",
        type: "Array<number>"
      }
    ];

    static getAttributeTypeMap() {
      return IbanRuleIdentifiersParams.attributeTypeMap;
    }
  }

  /**
   * Container for IBAN rules
   */
  export class IbanRuleList {
    /**
     * List of IBAN rules
     */
    "ibanRules": Array<IbanRule>;

    static discriminator: string | undefined = undefined;

    static attributeTypeMap: Array<{ name: string; baseName: string; type: string }> = [
      {
        name: "ibanRules",
        baseName: "ibanRules",
        type: "Array<IbanRule>"
      }
    ];

    static getAttributeTypeMap() {
      return IbanRuleList.attributeTypeMap;
    }
  }

  /**
   * Parameters of IBAN rule
   */
  export class IbanRuleParams {
    /**
     * IBAN (case-insensitive)
     */
    "iban": string;
    /**
     * ID of the category that this rule should assign to the matching transactions
     */
    "categoryId": number;
    /**
     * Direction for the rule. 'Income' means that the rule applies to transactions with a positive amount only, 'Spending' means it applies to transactions with a negative amount only. 'Both' means that it applies to both kind of transactions. Note that in case of 'Both', finAPI will create two individual rules (one with direction 'Income' and one with direction 'Spending').
     */
    "direction": IbanRuleParams.DirectionEnum;

    static discriminator: string | undefined = undefined;

    static attributeTypeMap: Array<{ name: string; baseName: string; type: string }> = [
      {
        name: "iban",
        baseName: "iban",
        type: "string"
      },
      {
        name: "categoryId",
        baseName: "categoryId",
        type: "number"
      },
      {
        name: "direction",
        baseName: "direction",
        type: "IbanRuleParams.DirectionEnum"
      }
    ];

    static getAttributeTypeMap() {
      return IbanRuleParams.attributeTypeMap;
    }
  }

  export namespace IbanRuleParams {
    export enum DirectionEnum {
      Income = <any>"Income",
      Spending = <any>"Spending",
      Both = <any>"Both"
    }
  }
  /**
   * Params for creation IBAN rules
   */
  export class IbanRulesParams {
    /**
     * IBAN rule definitions. The minimum number of rule definitions is 1. The maximum number of rule definitions is 100.
     */
    "ibanRules": Array<IbanRuleParams>;

    static discriminator: string | undefined = undefined;

    static attributeTypeMap: Array<{ name: string; baseName: string; type: string }> = [
      {
        name: "ibanRules",
        baseName: "ibanRules",
        type: "Array<IbanRuleParams>"
      }
    ];

    static getAttributeTypeMap() {
      return IbanRulesParams.attributeTypeMap;
    }
  }

  /**
   * Set of identifiers (in ascending order)
   */
  export class IdentifierList {
    /**
     * Set of identifiers (in ascending order)
     */
    "identifiers"?: Array<number>;

    static discriminator: string | undefined = undefined;

    static attributeTypeMap: Array<{ name: string; baseName: string; type: string }> = [
      {
        name: "identifiers",
        baseName: "identifiers",
        type: "Array<number>"
      }
    ];

    static getAttributeTypeMap() {
      return IdentifierList.attributeTypeMap;
    }
  }

  /**
   * Container for bank connection import parameters
   */
  export class ImportBankConnectionParams {
    /**
     * Bank Identifier
     */
    "bankId": number;
    /**
     * Custom name for the bank connection. Maximum length is 64. If you do not want to set a name, you can leave this field unset.
     */
    "name"?: string;
    /**
     * NOTE: This field is deprecated and will be removed at some point. Use 'loginCredentials' + 'interface' instead. If any of those two fields is used, then the value of this field will be ignored.<br><br>Online banking user ID credential. Max length: 170. NOTES:<br/>- if you import the 'demo connection', this field can be left unset;<br/> - if the user will need to enter his credentials in finAPI's web form, this field can contain any value. It will be ignored.
     */
    "bankingUserId"?: string;
    /**
     * NOTE: This field is deprecated and will be removed at some point. Use 'loginCredentials' + 'interface' instead. If any of those two fields is used, then the value of this field will be ignored.<br><br>Online banking customer ID credential (for most banks this field can remain unset). Max length: 170. NOTES:<br/>- if the user will need to enter his credentials in finAPI's web form, this field can contain any value. It will be ignored.
     */
    "bankingCustomerId"?: string;
    /**
     * NOTE: This field is deprecated and will be removed at some point. Use 'loginCredentials' + 'interface' instead. If any of those two fields is used, then the value of this field will be ignored.<br><br>Online banking PIN. Max length: 170. Any symbols are allowed. NOTES:<br/>- if you import the 'demo connection', this field can be left unset;<br/> - if the user will need to enter his credentials in finAPI's web form, this field can be left unset or contain any value. It will be ignored.
     */
    "bankingPin"?: string;
    /**
     * NOTE: This field is deprecated and will be removed at some point. Use 'storeSecrets' instead.<br><br>Whether to store the PIN. If the PIN is stored, it is not required to pass the PIN again when updating this bank connection or when executing orders (like money transfers). Default is false. <br/><br/>NOTES:<br/> - before you set this field to true, please regard the 'pinsAreVolatile' flag of this connection's bank;<br/> - this field is ignored in case when the user will need to use finAPI's web form. The user will be able to decide whether to store the PIN or not in the web form, depending on the 'storeSecretsAvailableInWebForm' setting (see Client Configuration).
     */
    "storePin"?: boolean;
    /**
     * The interface to use for connecting with the bank.
     */
    "_interface"?: ImportBankConnectionParams.InterfaceEnum;
    /**
     * Set of login credentials. Must be passed in combination with the 'interface' field. For mandators requiring a web form, no matter the passed login credentials, the web form will contain all login fields defined by the bank for the respective interface.
     */
    "loginCredentials"?: Array<LoginCredential>;
    /**
     * Whether to store the secret login fields. If the secret fields are stored, then updates can be triggered without the involvement of the users, as long as the credentials remain valid and the bank consent has not expired. Note that bank consent will be stored regardless of the field value. Default value is false.<br/><br/>NOTES:<br/> - this field is ignored in case when the user will need to use finAPI's web form. The user will be able to decide whether to store the secrets or not in the web form, depending on the 'storeSecretsAvailableInWebForm' setting (see Client Configuration).
     */
    "storeSecrets"?: boolean;
    /**
     * Whether to skip the download of transactions and securities or not. If set to true, then finAPI will download just the accounts list with the accounts' information (like account name, number, holder, etc), as well as the accounts' balances (if possible), but skip the download of transactions and securities. Default is false.<br/><br/>NOTES:<br/>&bull; If you skip the download of transactions and securities during an import or update, you can still download them on a later update (though you might not get all positions at a later point, because the date range in which the bank servers provide this data is usually limited). However, once finAPI has downloaded the transactions or securities for the first time, you will not be able to go back to skipping the download of transactions and securities! In other words: Once you make your first request with skipPositionsDownload=false for a certain bank connection, you will no longer be able to make a request with skipPositionsDownload=true for that same bank connection.<br/>&bull; If this bank connection is updated via finAPI's automatic batch update, then transactions and security positions <u>will</u> be downloaded in any case!<br/>&bull; For security accounts, skipping the downloading of the securities might result in the account's balance also not being downloaded.<br/>&bull; For Bausparen accounts, this field is ignored. finAPI will always download transactions for Bausparen accounts.<br/>
     */
    "skipPositionsDownload"?: boolean;
    /**
     * Whether to load information about the bank connection owner(s) - see field 'owners'. Default value is 'false'.<br><br>NOTE: This feature is supported only by the WEB_SCRAPER interface.
     */
    "loadOwnerData"?: boolean;
    /**
     * Use this parameter if you want to limit the date range for transactions download. The value depicts the number of days that finAPI will download transactions for, starting from - and including - today. For example, if you want to download only transactions from within the past 30 days (including today), then pass the value 30. The minimum allowed value is 14, the maximum value is 3650. You may also pass the value 0 though (which is also the default value when you do not specify this parameter), in which case there will be no limit to the transactions download and finAPI will try to get all transactions that it can. Please note that when you specify the parameter there is no guarantee that finAPI will actually download transactions for the entire given date range, as the bank servers may limit the date range on their own. Also note that this parameter only applies to transactions, not to security positions; finAPI will always download all positions that it can get.<br/><br/><b>Please note: If you are not limiting the maxDaysForDownload with a value smaller than 90 days, the bank is more likely to trigger a strong customer authentication request for the user.</b>
     */
    "maxDaysForDownload"?: number;
    /**
     * A set of account types of finAPI account types that are considered for the import. Only accounts whose type matches with one of the given types will be imported. Note that when the bank connection does not contain any accounts of the given types, the import will fail with error code NO_ACCOUNTS_FOR_TYPE_LIST. If no values is given, then all accounts will be imported.<br/><br/><br/>Checking,<br/>Savings,<br/>CreditCard,<br/>Security,<br/>Loan,<br/>Pocket (DEPRECATED; will not be returned for any account unless this type has explicitly been set via PATCH),<br/>Membership,<br/>Bausparen<br/><br/><b>This flag is currently not guaranteed to work for all banks!</b>
     */
    "accountTypes"?: Array<ImportBankConnectionParams.AccountTypesEnum>;
    /**
     * Whitelist of identifiers of finAPI account types that are considered for the import. Only accounts whose type matches with one of the given types will be imported. Note that when the bank connection does not contain any accounts of the given types, the import will fail with error code NO_ACCOUNTS_FOR_TYPE_LIST. If no whitelist is given, then all accounts will be imported.<br/><br/>NOTE: This field is deprecated and would be removed at some point. Please refer to the accountTypes field instead.<br/><br/><br/>1 = Checking,<br/>2 = Savings,<br/>3 = CreditCard,<br/>4 = Security,<br/>5 = Loan,<br/>6 = Pocket (DEPRECATED; will not be returned for any account unless this type has explicitly been set via PATCH),<br/>7 = Membership,<br/>8 = Bausparen<br/><br/><b>This flag is currently not guaranteed to work for all banks!</b>
     */
    "accountTypeIds"?: Array<number>;
    /**
     * List of accounts for which access is requested from the bank. It must only be passed if the bank interface has the DETAILED_CONSENT property set.
     */
    "accountReferences"?: Array<AccountReference>;
    /**
     * NOTE: This field is DEPRECATED and will get removed at some point. Please refer to the 'multiStepAuthentication' field instead.<br/><br/>Challenge response. This field should be set only when the previous attempt of importing the bank connection failed with HTTP code 510, i.e. the bank sent a challenge for the user for an additional authentication. In this case, this field must contain the response to the bank's challenge. Note that in the context of finAPI's web form flow, finAPI will automatically deal with getting the challenge response from the user via the web form.
     */
    "challengeResponse"?: string;
    /**
     * Container for multi-step authentication data. Required when a previous service call initiated a multi-step authentication.
     */
    "multiStepAuthentication"?: MultiStepAuthenticationCallback;
    /**
     * Must only be passed when the used interface has the property REDIRECT_APPROACH and no web form flow is used. The user will be redirected to the given URL from the bank's website after having entered his credentials. Must use HTTPS protocol.
     */
    "redirectUrl"?: string;

    static discriminator: string | undefined = undefined;

    static attributeTypeMap: Array<{ name: string; baseName: string; type: string }> = [
      {
        name: "bankId",
        baseName: "bankId",
        type: "number"
      },
      {
        name: "name",
        baseName: "name",
        type: "string"
      },
      {
        name: "bankingUserId",
        baseName: "bankingUserId",
        type: "string"
      },
      {
        name: "bankingCustomerId",
        baseName: "bankingCustomerId",
        type: "string"
      },
      {
        name: "bankingPin",
        baseName: "bankingPin",
        type: "string"
      },
      {
        name: "storePin",
        baseName: "storePin",
        type: "boolean"
      },
      {
        name: "_interface",
        baseName: "interface",
        type: "ImportBankConnectionParams.InterfaceEnum"
      },
      {
        name: "loginCredentials",
        baseName: "loginCredentials",
        type: "Array<LoginCredential>"
      },
      {
        name: "storeSecrets",
        baseName: "storeSecrets",
        type: "boolean"
      },
      {
        name: "skipPositionsDownload",
        baseName: "skipPositionsDownload",
        type: "boolean"
      },
      {
        name: "loadOwnerData",
        baseName: "loadOwnerData",
        type: "boolean"
      },
      {
        name: "maxDaysForDownload",
        baseName: "maxDaysForDownload",
        type: "number"
      },
      {
        name: "accountTypes",
        baseName: "accountTypes",
        type: "Array<ImportBankConnectionParams.AccountTypesEnum>"
      },
      {
        name: "accountTypeIds",
        baseName: "accountTypeIds",
        type: "Array<number>"
      },
      {
        name: "accountReferences",
        baseName: "accountReferences",
        type: "Array<AccountReference>"
      },
      {
        name: "challengeResponse",
        baseName: "challengeResponse",
        type: "string"
      },
      {
        name: "multiStepAuthentication",
        baseName: "multiStepAuthentication",
        type: "MultiStepAuthenticationCallback"
      },
      {
        name: "redirectUrl",
        baseName: "redirectUrl",
        type: "string"
      }
    ];

    static getAttributeTypeMap() {
      return ImportBankConnectionParams.attributeTypeMap;
    }
  }

  export namespace ImportBankConnectionParams {
    export enum InterfaceEnum {
      FINTSSERVER = <any>"FINTS_SERVER",
      WEBSCRAPER = <any>"WEB_SCRAPER",
      XS2A = <any>"XS2A"
    }
    export enum AccountTypesEnum {
      Checking = <any>"Checking",
      Savings = <any>"Savings",
      CreditCard = <any>"CreditCard",
      Security = <any>"Security",
      Loan = <any>"Loan",
      Pocket = <any>"Pocket",
      Membership = <any>"Membership",
      Bausparen = <any>"Bausparen"
    }
  }
  /**
   * Container for a keyword rule
   */
  export class KeywordRule {
    /**
     * Rule identifier
     */
    "id": number;
    /**
     * The category that this rule assigns to the transactions that it matches
     */
    "category": Category;
    /**
     * Direction for the rule. 'Income' means that the rule applies to transactions with a positive amount only, 'Spending' means it applies to transactions with a negative amount only.
     */
    "direction": KeywordRule.DirectionEnum;
    /**
     * Timestamp of when the rule was created, in the format 'YYYY-MM-DD HH:MM:SS.SSS' (german time)
     */
    "creationDate": string;
    /**
     * Set of keywords that this rule defines.
     */
    "keywords": Array<string>;

    static discriminator: string | undefined = undefined;

    static attributeTypeMap: Array<{ name: string; baseName: string; type: string }> = [
      {
        name: "id",
        baseName: "id",
        type: "number"
      },
      {
        name: "category",
        baseName: "category",
        type: "Category"
      },
      {
        name: "direction",
        baseName: "direction",
        type: "KeywordRule.DirectionEnum"
      },
      {
        name: "creationDate",
        baseName: "creationDate",
        type: "string"
      },
      {
        name: "keywords",
        baseName: "keywords",
        type: "Array<string>"
      }
    ];

    static getAttributeTypeMap() {
      return KeywordRule.attributeTypeMap;
    }
  }

  export namespace KeywordRule {
    export enum DirectionEnum {
      Income = <any>"Income",
      Spending = <any>"Spending"
    }
  }
  /**
   * Identifiers params
   */
  export class KeywordRuleIdentifiersParams {
    /**
     * List of identifiers
     */
    "ids": Array<number>;

    static discriminator: string | undefined = undefined;

    static attributeTypeMap: Array<{ name: string; baseName: string; type: string }> = [
      {
        name: "ids",
        baseName: "ids",
        type: "Array<number>"
      }
    ];

    static getAttributeTypeMap() {
      return KeywordRuleIdentifiersParams.attributeTypeMap;
    }
  }

  /**
   * Container for keyword rules
   */
  export class KeywordRuleList {
    /**
     * List of keyword rules
     */
    "keywordRules": Array<KeywordRule>;

    static discriminator: string | undefined = undefined;

    static attributeTypeMap: Array<{ name: string; baseName: string; type: string }> = [
      {
        name: "keywordRules",
        baseName: "keywordRules",
        type: "Array<KeywordRule>"
      }
    ];

    static getAttributeTypeMap() {
      return KeywordRuleList.attributeTypeMap;
    }
  }

  /**
   * Parameters of keyword rule
   */
  export class KeywordRuleParams {
    /**
     * ID of the category that this rule should assign to the matching transactions
     */
    "categoryId": number;
    /**
     * Direction for the rule. 'Income' means that the rule applies to transactions with a positive amount only, 'Spending' means it applies to transactions with a negative amount only. 'Both' means that it applies to both kind of transactions. Note that in case of 'Both', finAPI will create two individual rules (one with direction 'Income' and one with direction 'Spending').
     */
    "direction": KeywordRuleParams.DirectionEnum;
    /**
     * Set of keywords for the rule (Keywords are regarded case-insensitive). The minimum number of keywords is 1. The maximum number of keywords is 100.
     */
    "keywords": Array<string>;

    static discriminator: string | undefined = undefined;

    static attributeTypeMap: Array<{ name: string; baseName: string; type: string }> = [
      {
        name: "categoryId",
        baseName: "categoryId",
        type: "number"
      },
      {
        name: "direction",
        baseName: "direction",
        type: "KeywordRuleParams.DirectionEnum"
      },
      {
        name: "keywords",
        baseName: "keywords",
        type: "Array<string>"
      }
    ];

    static getAttributeTypeMap() {
      return KeywordRuleParams.attributeTypeMap;
    }
  }

  export namespace KeywordRuleParams {
    export enum DirectionEnum {
      Income = <any>"Income",
      Spending = <any>"Spending",
      Both = <any>"Both"
    }
  }
  /**
   * Params for creation keyword rules
   */
  export class KeywordRulesParams {
    /**
     * Keyword rule definitions. The minimum number of rule definitions is 1. The maximum number of rule definitions is 100.
     */
    "keywordRules": Array<KeywordRuleParams>;

    static discriminator: string | undefined = undefined;

    static attributeTypeMap: Array<{ name: string; baseName: string; type: string }> = [
      {
        name: "keywordRules",
        baseName: "keywordRules",
        type: "Array<KeywordRuleParams>"
      }
    ];

    static getAttributeTypeMap() {
      return KeywordRulesParams.attributeTypeMap;
    }
  }

  /**
   * Container for a label's data
   */
  export class Label {
    /**
     * Label identifier
     */
    "id": number;
    /**
     * Label name
     */
    "name": string;

    static discriminator: string | undefined = undefined;

    static attributeTypeMap: Array<{ name: string; baseName: string; type: string }> = [
      {
        name: "id",
        baseName: "id",
        type: "number"
      },
      {
        name: "name",
        baseName: "name",
        type: "string"
      }
    ];

    static getAttributeTypeMap() {
      return Label.attributeTypeMap;
    }
  }

  /**
   * Container for labels
   */
  export class LabelList {
    /**
     * Labels
     */
    "labels": Array<Label>;

    static discriminator: string | undefined = undefined;

    static attributeTypeMap: Array<{ name: string; baseName: string; type: string }> = [
      {
        name: "labels",
        baseName: "labels",
        type: "Array<Label>"
      }
    ];

    static getAttributeTypeMap() {
      return LabelList.attributeTypeMap;
    }
  }

  /**
   * Label's name
   */
  export class LabelParams {
    /**
     * Label's name. Maximum length is 288.
     */
    "name": string;

    static discriminator: string | undefined = undefined;

    static attributeTypeMap: Array<{ name: string; baseName: string; type: string }> = [
      {
        name: "name",
        baseName: "name",
        type: "string"
      }
    ];

    static getAttributeTypeMap() {
      return LabelParams.attributeTypeMap;
    }
  }

  /**
   * Login credential
   */
  export class LoginCredential {
    /**
     * The login field label, as defined by the respective bank interface.
     */
    "label": string;
    /**
     * The value for the login field
     */
    "value": string;

    static discriminator: string | undefined = undefined;

    static attributeTypeMap: Array<{ name: string; baseName: string; type: string }> = [
      {
        name: "label",
        baseName: "label",
        type: "string"
      },
      {
        name: "value",
        baseName: "value",
        type: "string"
      }
    ];

    static getAttributeTypeMap() {
      return LoginCredential.attributeTypeMap;
    }
  }

  /**
   * Container for a bank login credential
   */
  export class LoginCredentialResource {
    /**
     * Label for this login credential, as we suggest to show it to the user.
     */
    "label"?: string;
    /**
     * Stored value for this login credential. Please NOTE:<br/>&bull; If a PIN is stored, this will always be 'XXXXX'.<br/>&bull; If your client has no license for processing banking credentials or if this field contains a value that requires password protection then this field will always be 'XXXXX'.
     */
    "value"?: string;

    static discriminator: string | undefined = undefined;

    static attributeTypeMap: Array<{ name: string; baseName: string; type: string }> = [
      {
        name: "label",
        baseName: "label",
        type: "string"
      },
      {
        name: "value",
        baseName: "value",
        type: "string"
      }
    ];

    static getAttributeTypeMap() {
      return LoginCredentialResource.attributeTypeMap;
    }
  }

  /**
   * Mock account data
   */
  export class MockAccountData {
    /**
     * Account identifier
     */
    "accountId": number;
    /**
     * The balance that this account should be set to. Note that when the balance does not add up to the current balance plus the sum of the transactions you pass in the 'newTransactions' field, finAPI will fix the balance deviation with the insertion of an adjusting entry ('Zwischensaldo' transaction).
     */
    "accountBalance": number;
    /**
     * New transactions that should be imported into the account (maximum 1000 transactions at once). Please make sure that the value you pass in the 'accountBalance' field equals the current account balance plus the sum of the new transactions that you pass here, otherwise finAPI will detect a deviation in the balance and fix it with the insertion of an adjusting entry ('Zwischensaldo' transaction). Please also note that it is not guaranteed that all transactions that you pass here will actually get imported. More specifically, finAPI will ignore any transactions whose booking date is prior to the booking date of the latest currently existing transactions minus 10 days (which is the 'update window' that finAPI uses when importing new transactions). Also, finAPI will ignore any transactions that are considered duplicates of already existing transactions within the update window. This is the case for instance when you try to import a new transaction with the same booking date and same amount as an already existing transaction. In such cases, you might get an adjusting entry too ('Zwischensaldo' transaction), as your given balance might not add up to the transactions that will exist in the account after the update.
     */
    "newTransactions"?: Array<NewTransaction>;

    static discriminator: string | undefined = undefined;

    static attributeTypeMap: Array<{ name: string; baseName: string; type: string }> = [
      {
        name: "accountId",
        baseName: "accountId",
        type: "number"
      },
      {
        name: "accountBalance",
        baseName: "accountBalance",
        type: "number"
      },
      {
        name: "newTransactions",
        baseName: "newTransactions",
        type: "Array<NewTransaction>"
      }
    ];

    static getAttributeTypeMap() {
      return MockAccountData.attributeTypeMap;
    }
  }

  /**
   * Data for a mock bank connection update
   */
  export class MockBankConnectionUpdate {
    /**
     * Bank connection identifier
     */
    "bankConnectionId": number;
    /**
     * Banking interface to update. If not specified, then first available interface in bank connection will be used.
     */
    "_interface"?: MockBankConnectionUpdate.InterfaceEnum;
    /**
     * Whether to simulate the case that the update fails due to incorrect banking credentials. Note that there is no real communication to any bank server involved, so you won't lock your accounts when enabling this flag. Default value is 'false'.
     */
    "simulateBankLoginError"?: boolean;
    /**
     * Mock accounts data. Note that for accounts that exist in a bank connection but that you do not specify in this list, the service will act like those accounts are not received by the bank servers. This means that any accounts that you do not specify here will be marked as deprecated. If you do not specify this list at all, all accounts in the bank connection will be marked as deprecated.
     */
    "mockAccountsData"?: Array<MockAccountData>;

    static discriminator: string | undefined = undefined;

    static attributeTypeMap: Array<{ name: string; baseName: string; type: string }> = [
      {
        name: "bankConnectionId",
        baseName: "bankConnectionId",
        type: "number"
      },
      {
        name: "_interface",
        baseName: "interface",
        type: "MockBankConnectionUpdate.InterfaceEnum"
      },
      {
        name: "simulateBankLoginError",
        baseName: "simulateBankLoginError",
        type: "boolean"
      },
      {
        name: "mockAccountsData",
        baseName: "mockAccountsData",
        type: "Array<MockAccountData>"
      }
    ];

    static getAttributeTypeMap() {
      return MockBankConnectionUpdate.attributeTypeMap;
    }
  }

  export namespace MockBankConnectionUpdate {
    export enum InterfaceEnum {
      FINTSSERVER = <any>"FINTS_SERVER",
      WEBSCRAPER = <any>"WEB_SCRAPER",
      XS2A = <any>"XS2A"
    }
  }
  /**
   * Data for mock bank connection updates
   */
  export class MockBatchUpdateParams {
    /**
     * List of mock bank connection updates
     */
    "mockBankConnectionUpdates": Array<MockBankConnectionUpdate>;
    /**
     * Whether this call should trigger the dispatching of notifications. Default is 'false'.
     */
    "triggerNotifications"?: boolean;

    static discriminator: string | undefined = undefined;

    static attributeTypeMap: Array<{ name: string; baseName: string; type: string }> = [
      {
        name: "mockBankConnectionUpdates",
        baseName: "mockBankConnectionUpdates",
        type: "Array<MockBankConnectionUpdate>"
      },
      {
        name: "triggerNotifications",
        baseName: "triggerNotifications",
        type: "boolean"
      }
    ];

    static getAttributeTypeMap() {
      return MockBatchUpdateParams.attributeTypeMap;
    }
  }

  /**
   * Bank server's response to a money transfer order request
   */
  export class MoneyTransferOrderingResponse {
    /**
     * Technical message from the bank server, confirming the success of the request. Typically, you would not want to present this message to the user. Note that this field may not be set. However if it is not set, it does not necessarily mean that there was an error in processing the request.
     */
    "successMessage"?: string;
    /**
     * In some cases, a bank server may accept the requested order, but return a warn message. This message may be of technical nature, but could also be of interest to the user.
     */
    "warnMessage"?: string;
    /**
     * Payment identifier. Can be used to retrieve the status of the payment (see 'Get payments' service).
     */
    "paymentId": number;
    /**
     * Message from the bank server containing information or instructions on how to retrieve the TAN that is needed to execute the requested order. This message should be presented to the user. Note that some bank servers may limit the message to just the most crucial information, e.g. the message may contain just a single number that depicts the target TAN number on a user's TAN list. You may want to parse the challenge message for such cases and extend it with more detailed information before showing it to the user.
     */
    "challengeMessage"?: string;
    /**
     * Suggestion from the bank server on how you can label your input field where the user must enter his TAN. A typical value that many bank servers give is 'TAN-Nummer'.
     */
    "answerFieldLabel"?: string;
    /**
     * In case that the bank server has instructed the user to look up a TAN from a TAN list, this field may contain the identification number of the TAN list. However in most cases, this field is only set (i.e. not null) when the user has multiple active TAN lists.
     */
    "tanListNumber"?: string;
    /**
     * In case that the bank server has instructed the user to scan a flicker code, then this field will contain the raw data for the flicker animation as a BASE-64 string. Otherwise, this field will be not set (i.e. null). For more information on how to process the flicker code data, please address the <a href='https://finapi.zendesk.com' target='_blank'>finAPI Developer Portal</a>.
     */
    "opticalData"?: string;
    /**
     * In case that the 'photoTanData' field is set (i.e. not null), this field contains the MIME type to use for interpreting the photo data (e.g.: 'image/png')
     */
    "photoTanMimeType"?: string;
    /**
     * In case that the bank server has instructed the user to scan a photo (or more generally speaking, any kind of QR-code-like data), then this field will contain the raw data of the photo as a BASE-64 string. Otherwise, this field will be not set (i.e. null). For more information on how to process the photo data, please address the <a href='https://finapi.zendesk.com' target='_blank'>finAPI Developer Portal</a>.
     */
    "photoTanData"?: string;

    static discriminator: string | undefined = undefined;

    static attributeTypeMap: Array<{ name: string; baseName: string; type: string }> = [
      {
        name: "successMessage",
        baseName: "successMessage",
        type: "string"
      },
      {
        name: "warnMessage",
        baseName: "warnMessage",
        type: "string"
      },
      {
        name: "paymentId",
        baseName: "paymentId",
        type: "number"
      },
      {
        name: "challengeMessage",
        baseName: "challengeMessage",
        type: "string"
      },
      {
        name: "answerFieldLabel",
        baseName: "answerFieldLabel",
        type: "string"
      },
      {
        name: "tanListNumber",
        baseName: "tanListNumber",
        type: "string"
      },
      {
        name: "opticalData",
        baseName: "opticalData",
        type: "string"
      },
      {
        name: "photoTanMimeType",
        baseName: "photoTanMimeType",
        type: "string"
      },
      {
        name: "photoTanData",
        baseName: "photoTanData",
        type: "string"
      }
    ];

    static getAttributeTypeMap() {
      return MoneyTransferOrderingResponse.attributeTypeMap;
    }
  }

  /**
   * Information about a user's data or activities for a certain month
   */
  export class MonthlyUserStats {
    /**
     * The month that the contained information applies to, in the format 'YYYY-MM'.
     */
    "month": string;
    /**
     * Minimum count of bank connections that this user has had at any point during the month.
     */
    "minBankConnectionCount": number;
    /**
     * Maximum count of bank connections that this user has had at any point during the month.
     */
    "maxBankConnectionCount": number;

    static discriminator: string | undefined = undefined;

    static attributeTypeMap: Array<{ name: string; baseName: string; type: string }> = [
      {
        name: "month",
        baseName: "month",
        type: "string"
      },
      {
        name: "minBankConnectionCount",
        baseName: "minBankConnectionCount",
        type: "number"
      },
      {
        name: "maxBankConnectionCount",
        baseName: "maxBankConnectionCount",
        type: "number"
      }
    ];

    static getAttributeTypeMap() {
      return MonthlyUserStats.attributeTypeMap;
    }
  }

  /**
   * Container for multi-step authentication data, as passed by the client to finAPI
   */
  export class MultiStepAuthenticationCallback {
    /**
     * Hash that was returned in the previous multi-step authentication error.
     */
    "hash": string;
    /**
     * Challenge response. Must be set when the previous multi-step authentication error had status 'CHALLENGE_RESPONSE_REQUIRED.
     */
    "challengeResponse"?: string;
    /**
     * The bank-given ID of the two-step-procedure that should be used for authentication. Must be set when the previous multi-step authentication error had status 'TWO_STEP_PROCEDURE_REQUIRED.
     */
    "twoStepProcedureId"?: string;
    /**
     * Must be passed when the previous multi-step authentication error had status 'REDIRECT_REQUIRED'. The value must consist of the complete query parameter list that was contained in the received redirect from the bank.
     */
    "redirectCallback"?: string;
    /**
     * Must be passed when the previous multi-step authentication error had status 'DECOUPLED_AUTH_REQUIRED' or 'DECOUPLED_AUTH_IN_PROGRESS'. The field represents the state of the decoupled authentication meaning that when it's set to 'true', the end-user has completed the authentication process on bank's side.
     */
    "decoupledCallback"?: boolean;

    static discriminator: string | undefined = undefined;

    static attributeTypeMap: Array<{ name: string; baseName: string; type: string }> = [
      {
        name: "hash",
        baseName: "hash",
        type: "string"
      },
      {
        name: "challengeResponse",
        baseName: "challengeResponse",
        type: "string"
      },
      {
        name: "twoStepProcedureId",
        baseName: "twoStepProcedureId",
        type: "string"
      },
      {
        name: "redirectCallback",
        baseName: "redirectCallback",
        type: "string"
      },
      {
        name: "decoupledCallback",
        baseName: "decoupledCallback",
        type: "boolean"
      }
    ];

    static getAttributeTypeMap() {
      return MultiStepAuthenticationCallback.attributeTypeMap;
    }
  }

  /**
   * Container for multi-step authentication data, as returned by finAPI to the client
   */
  export class MultiStepAuthenticationChallenge {
    /**
     * Hash for this multi-step authentication flow. Must be passed back to finAPI when continuing the flow.
     */
    "hash": string;
    /**
     * Indicates the current status of the multi-step authentication flow:<br/><br/>TWO_STEP_PROCEDURE_REQUIRED means that the bank has requested an SCA method selection for the user. In this case, the service should be recalled with a chosen TSP-ID set to the 'twoStepProcedureId' field.<br/>When the web form flow is used, the user is forwarded to finAPI's web form to prompt for his credentials (if they are not stored in finAPI) and to select the preferred SCA method.<br/><br/>CHALLENGE_RESPONSE_REQUIRED means that the bank has requested a challenge code for the previously given TSP (SCA). This status can be completed by setting the 'challengeResponse' field.<br/>When the web form flow is used, the user should submit the challenge response for the challenge message shown by the web form.<br/><br/>REDIRECT_REQUIRED means that the user must be redirected to the bank's website, where the authentication can be finished.<br/>When the web form flow is used, the user should visit the web form, get a redirect to the bank's website, complete the authentication and will then be redirected back to the web form.<br/><br/>DECOUPLED_AUTH_REQUIRED means that the bank has asked for the decoupled authentication. In this case, the 'decoupledCallback' field must be set to true to complete the authentication.<br/><br/>DECOUPLED_AUTH_IN_PROGRESS means that the bank is waiting for the completion of the decoupled authentication by the user. Until this is done, the service should be recalled with the 'decoupledCallback' field set to ‘true’. Once the decoupled authentication is completed by the user, the service returns a successful response.
     */
    "status": MultiStepAuthenticationChallenge.StatusEnum;
    /**
     * In case of status = CHALLENGE_RESPONSE_REQUIRED, this field contains a message from the bank containing instructions for the user on how to proceed with the authorization.
     */
    "challengeMessage"?: string;
    /**
     * Suggestion from the bank on how you can label your input field where the user should enter his challenge response.
     */
    "answerFieldLabel"?: string;
    /**
     * In case of status = REDIRECT_REQUIRED, this field contains the URL to which you must direct the user. It already includes the redirect URL back to your client that you have passed when initiating the service call.
     */
    "redirectUrl"?: string;
    /**
     * Set in case of status = REDIRECT_REQUIRED. When the bank redirects the user back to your client, the redirect URL will contain this string, which you must process to identify the user context for the callback on your side.
     */
    "redirectContext"?: string;
    /**
     * Set in case of status = REDIRECT_REQUIRED. This field is set to the name of the query parameter that contains the 'redirectContext' in the redirect URL from the bank back to your client.
     */
    "redirectContextField"?: string;
    /**
     * In case of status = TWO_STEP_PROCEDURE_REQUIRED, this field contains the available two-step procedures. Note that this set does not necessarily match the set that is stored in the respective bank connection interface. You should always use the set from this field for the multi-step authentication flow.
     */
    "twoStepProcedures"?: Array<TwoStepProcedure>;
    /**
     * In case that the bank server has instructed the user to scan a flicker code, then this field will contain the raw data for the flicker animation as a BASE-64 string.
     */
    "opticalData"?: string;
    /**
     * In case that the 'photoTanData' field is set (i.e. not null), this field contains the MIME type to use for interpreting the photo data (e.g.: 'image/png')
     */
    "photoTanMimeType"?: string;
    /**
     * In case that the bank server has instructed the user to scan a photo (or more generally speaking, any kind of QR-code-like data), then this field will contain the raw data of the photo as a BASE-64 string.
     */
    "photoTanData"?: string;

    static discriminator: string | undefined = undefined;

    static attributeTypeMap: Array<{ name: string; baseName: string; type: string }> = [
      {
        name: "hash",
        baseName: "hash",
        type: "string"
      },
      {
        name: "status",
        baseName: "status",
        type: "MultiStepAuthenticationChallenge.StatusEnum"
      },
      {
        name: "challengeMessage",
        baseName: "challengeMessage",
        type: "string"
      },
      {
        name: "answerFieldLabel",
        baseName: "answerFieldLabel",
        type: "string"
      },
      {
        name: "redirectUrl",
        baseName: "redirectUrl",
        type: "string"
      },
      {
        name: "redirectContext",
        baseName: "redirectContext",
        type: "string"
      },
      {
        name: "redirectContextField",
        baseName: "redirectContextField",
        type: "string"
      },
      {
        name: "twoStepProcedures",
        baseName: "twoStepProcedures",
        type: "Array<TwoStepProcedure>"
      },
      {
        name: "opticalData",
        baseName: "opticalData",
        type: "string"
      },
      {
        name: "photoTanMimeType",
        baseName: "photoTanMimeType",
        type: "string"
      },
      {
        name: "photoTanData",
        baseName: "photoTanData",
        type: "string"
      }
    ];

    static getAttributeTypeMap() {
      return MultiStepAuthenticationChallenge.attributeTypeMap;
    }
  }

  export namespace MultiStepAuthenticationChallenge {
    export enum StatusEnum {
      CHALLENGERESPONSEREQUIRED = <any>"CHALLENGE_RESPONSE_REQUIRED",
      TWOSTEPPROCEDUREREQUIRED = <any>"TWO_STEP_PROCEDURE_REQUIRED",
      REDIRECTREQUIRED = <any>"REDIRECT_REQUIRED",
      DECOUPLEDAUTHREQUIRED = <any>"DECOUPLED_AUTH_REQUIRED",
      DECOUPLEDAUTHINPROGRESS = <any>"DECOUPLED_AUTH_IN_PROGRESS"
    }
  }
  /**
   * Mock transaction data
   */
  export class NewTransaction {
    /**
     * Amount. Required.
     */
    "amount": number;
    /**
     * Purpose. Any symbols are allowed. Maximum length is 2000. Optional. Default value: null.
     */
    "purpose"?: string;
    /**
     * Counterpart. Any symbols are allowed. Maximum length is 80. Optional. Default value: null.
     */
    "counterpart"?: string;
    /**
     * Counterpart IBAN. Optional. Default value: null.
     */
    "counterpartIban"?: string;
    /**
     * Counterpart BLZ. Optional. Default value: null.
     */
    "counterpartBlz"?: string;
    /**
     * Counterpart BIC. Optional. Default value: null.
     */
    "counterpartBic"?: string;
    /**
     * Counterpart account number. Maximum length is 34. Optional. Default value: null.
     */
    "counterpartAccountNumber"?: string;
    /**
     * Booking date in the format 'YYYY-MM-DD'.<br/><br/>If the date lies back more than 10 days from the booking date of the latest transaction that currently exists in the account, then this transaction will be ignored and not imported. If the date depicts a date in the future, then finAPI will deal with it the same way as it does with real transactions during a real update (see fields 'bankBookingDate' and 'finapiBookingDate' in the Transaction Resource for explanation).<br/><br/>This field is optional, default value is the current date.
     */
    "bookingDate"?: string;
    /**
     * Value date in the format 'YYYY-MM-DD'. Optional. Default value: Same as the booking date.
     */
    "valueDate"?: string;

    static discriminator: string | undefined = undefined;

    static attributeTypeMap: Array<{ name: string; baseName: string; type: string }> = [
      {
        name: "amount",
        baseName: "amount",
        type: "number"
      },
      {
        name: "purpose",
        baseName: "purpose",
        type: "string"
      },
      {
        name: "counterpart",
        baseName: "counterpart",
        type: "string"
      },
      {
        name: "counterpartIban",
        baseName: "counterpartIban",
        type: "string"
      },
      {
        name: "counterpartBlz",
        baseName: "counterpartBlz",
        type: "string"
      },
      {
        name: "counterpartBic",
        baseName: "counterpartBic",
        type: "string"
      },
      {
        name: "counterpartAccountNumber",
        baseName: "counterpartAccountNumber",
        type: "string"
      },
      {
        name: "bookingDate",
        baseName: "bookingDate",
        type: "string"
      },
      {
        name: "valueDate",
        baseName: "valueDate",
        type: "string"
      }
    ];

    static getAttributeTypeMap() {
      return NewTransaction.attributeTypeMap;
    }
  }

  /**
   * Data of notification rule
   */
  export class NotificationRule {
    /**
     * Notification rule identifier
     */
    "id": number;
    /**
     * Trigger event type
     */
    "triggerEvent": NotificationRule.TriggerEventEnum;
    /**
     * Additional parameters that are specific to the trigger event type. Please refer to the documentation for details.
     */
    "params"?: { [key: string]: string };
    /**
     * The string that finAPI includes into the notifications that it sends based on this rule.
     */
    "callbackHandle"?: string;
    /**
     * Whether the notification messages that will be sent based on this rule contain encrypted detailed data or not
     */
    "includeDetails": boolean;

    static discriminator: string | undefined = undefined;

    static attributeTypeMap: Array<{ name: string; baseName: string; type: string }> = [
      {
        name: "id",
        baseName: "id",
        type: "number"
      },
      {
        name: "triggerEvent",
        baseName: "triggerEvent",
        type: "NotificationRule.TriggerEventEnum"
      },
      {
        name: "params",
        baseName: "params",
        type: "{ [key: string]: string; }"
      },
      {
        name: "callbackHandle",
        baseName: "callbackHandle",
        type: "string"
      },
      {
        name: "includeDetails",
        baseName: "includeDetails",
        type: "boolean"
      }
    ];

    static getAttributeTypeMap() {
      return NotificationRule.attributeTypeMap;
    }
  }

  export namespace NotificationRule {
    export enum TriggerEventEnum {
      NEWACCOUNTBALANCE = <any>"NEW_ACCOUNT_BALANCE",
      NEWTRANSACTIONS = <any>"NEW_TRANSACTIONS",
      BANKLOGINERROR = <any>"BANK_LOGIN_ERROR",
      FOREIGNMONEYTRANSFER = <any>"FOREIGN_MONEY_TRANSFER",
      LOWACCOUNTBALANCE = <any>"LOW_ACCOUNT_BALANCE",
      HIGHTRANSACTIONAMOUNT = <any>"HIGH_TRANSACTION_AMOUNT",
      CATEGORYCASHFLOW = <any>"CATEGORY_CASH_FLOW",
      NEWTERMSANDCONDITIONS = <any>"NEW_TERMS_AND_CONDITIONS"
    }
  }
  /**
   * Container for notification rules
   */
  export class NotificationRuleList {
    /**
     * List of notification rules
     */
    "notificationRules"?: Array<NotificationRule>;

    static discriminator: string | undefined = undefined;

    static attributeTypeMap: Array<{ name: string; baseName: string; type: string }> = [
      {
        name: "notificationRules",
        baseName: "notificationRules",
        type: "Array<NotificationRule>"
      }
    ];

    static getAttributeTypeMap() {
      return NotificationRuleList.attributeTypeMap;
    }
  }

  /**
   * Parameters of notification rule
   */
  export class NotificationRuleParams {
    /**
     * Trigger event type
     */
    "triggerEvent": NotificationRuleParams.TriggerEventEnum;
    /**
     * Additional parameters that are specific to the chosen trigger event type. Please refer to the documentation for details.
     */
    "params"?: { [key: string]: string };
    /**
     * An arbitrary string that finAPI will include into the notifications that it sends based on this rule and that you can use to identify the notification in your application. For instance, you could include the identifier of the user that you create this rule for. Maximum allowed length of the string is 512 characters.<br/><br/>Note that for this parameter, you can pass the symbols '/', '=', '%' and '\"' in addition to the symbols that are generally allowed in finAPI (see https://finapi.zendesk.com/hc/en-us/articles/222013148). This was done to enable you to set Base64 encoded strings and JSON structures for the callback handle.
     */
    "callbackHandle"?: string;
    /**
     * Whether the notification messages that will be sent based on this rule should contain encrypted detailed data or not
     */
    "includeDetails"?: boolean;

    static discriminator: string | undefined = undefined;

    static attributeTypeMap: Array<{ name: string; baseName: string; type: string }> = [
      {
        name: "triggerEvent",
        baseName: "triggerEvent",
        type: "NotificationRuleParams.TriggerEventEnum"
      },
      {
        name: "params",
        baseName: "params",
        type: "{ [key: string]: string; }"
      },
      {
        name: "callbackHandle",
        baseName: "callbackHandle",
        type: "string"
      },
      {
        name: "includeDetails",
        baseName: "includeDetails",
        type: "boolean"
      }
    ];

    static getAttributeTypeMap() {
      return NotificationRuleParams.attributeTypeMap;
    }
  }

  export namespace NotificationRuleParams {
    export enum TriggerEventEnum {
      NEWACCOUNTBALANCE = <any>"NEW_ACCOUNT_BALANCE",
      NEWTRANSACTIONS = <any>"NEW_TRANSACTIONS",
      BANKLOGINERROR = <any>"BANK_LOGIN_ERROR",
      FOREIGNMONEYTRANSFER = <any>"FOREIGN_MONEY_TRANSFER",
      LOWACCOUNTBALANCE = <any>"LOW_ACCOUNT_BALANCE",
      HIGHTRANSACTIONAMOUNT = <any>"HIGH_TRANSACTION_AMOUNT",
      CATEGORYCASHFLOW = <any>"CATEGORY_CASH_FLOW",
      NEWTERMSANDCONDITIONS = <any>"NEW_TERMS_AND_CONDITIONS"
    }
  }
  /**
   * Container for banks with paging info
   */
  export class PageableBankList {
    /**
     * Banks
     */
    "banks": Array<Bank>;
    /**
     * Information for pagination
     */
    "paging": Paging;

    static discriminator: string | undefined = undefined;

    static attributeTypeMap: Array<{ name: string; baseName: string; type: string }> = [
      {
        name: "banks",
        baseName: "banks",
        type: "Array<Bank>"
      },
      {
        name: "paging",
        baseName: "paging",
        type: "Paging"
      }
    ];

    static getAttributeTypeMap() {
      return PageableBankList.attributeTypeMap;
    }
  }

  /**
   * Container for categories with paging info
   */
  export class PageableCategoryList {
    /**
     * Categories
     */
    "categories": Array<Category>;
    /**
     * Information for pagination
     */
    "paging": Paging;

    static discriminator: string | undefined = undefined;

    static attributeTypeMap: Array<{ name: string; baseName: string; type: string }> = [
      {
        name: "categories",
        baseName: "categories",
        type: "Array<Category>"
      },
      {
        name: "paging",
        baseName: "paging",
        type: "Paging"
      }
    ];

    static getAttributeTypeMap() {
      return PageableCategoryList.attributeTypeMap;
    }
  }

  /**
   * Container for IBAN rule information with paging info
   */
  export class PageableIbanRuleList {
    /**
     * List of iban rules information
     */
    "ibanRules": Array<IbanRule>;
    /**
     * Information for pagination
     */
    "paging": Paging;

    static discriminator: string | undefined = undefined;

    static attributeTypeMap: Array<{ name: string; baseName: string; type: string }> = [
      {
        name: "ibanRules",
        baseName: "ibanRules",
        type: "Array<IbanRule>"
      },
      {
        name: "paging",
        baseName: "paging",
        type: "Paging"
      }
    ];

    static getAttributeTypeMap() {
      return PageableIbanRuleList.attributeTypeMap;
    }
  }

  /**
   * Container for keyword rule information with paging info
   */
  export class PageableKeywordRuleList {
    /**
     * List of keyword rules
     */
    "keywordRules": Array<KeywordRule>;
    /**
     * Information for pagination
     */
    "paging": Paging;

    static discriminator: string | undefined = undefined;

    static attributeTypeMap: Array<{ name: string; baseName: string; type: string }> = [
      {
        name: "keywordRules",
        baseName: "keywordRules",
        type: "Array<KeywordRule>"
      },
      {
        name: "paging",
        baseName: "paging",
        type: "Paging"
      }
    ];

    static getAttributeTypeMap() {
      return PageableKeywordRuleList.attributeTypeMap;
    }
  }

  /**
   * Label resources with paging information
   */
  export class PageableLabelList {
    /**
     * Labels
     */
    "labels": Array<Label>;
    /**
     * Information for pagination
     */
    "paging": Paging;

    static discriminator: string | undefined = undefined;

    static attributeTypeMap: Array<{ name: string; baseName: string; type: string }> = [
      {
        name: "labels",
        baseName: "labels",
        type: "Array<Label>"
      },
      {
        name: "paging",
        baseName: "paging",
        type: "Paging"
      }
    ];

    static getAttributeTypeMap() {
      return PageableLabelList.attributeTypeMap;
    }
  }

  /**
   * Payment resources with paging information
   */
  export class PageablePaymentResources {
    /**
     * List of received account payments
     */
    "payments": Array<Payment>;
    /**
     * Information for pagination
     */
    "paging": Paging;

    static discriminator: string | undefined = undefined;

    static attributeTypeMap: Array<{ name: string; baseName: string; type: string }> = [
      {
        name: "payments",
        baseName: "payments",
        type: "Array<Payment>"
      },
      {
        name: "paging",
        baseName: "paging",
        type: "Paging"
      }
    ];

    static getAttributeTypeMap() {
      return PageablePaymentResources.attributeTypeMap;
    }
  }

  /**
   * Container for page of securities
   */
  export class PageableSecurityList {
    /**
     * List of securities
     */
    "securities": Array<Security>;
    /**
     * Information for pagination
     */
    "paging": Paging;

    static discriminator: string | undefined = undefined;

    static attributeTypeMap: Array<{ name: string; baseName: string; type: string }> = [
      {
        name: "securities",
        baseName: "securities",
        type: "Array<Security>"
      },
      {
        name: "paging",
        baseName: "paging",
        type: "Paging"
      }
    ];

    static getAttributeTypeMap() {
      return PageableSecurityList.attributeTypeMap;
    }
  }

  /**
   * TPP Authentication groups with paging information
   */
  export class PageableTppAuthenticationGroupResources {
    /**
     * List of received TPP authentication groups
     */
    "tppAuthenticationGroups": Array<TppAuthenticationGroup>;
    /**
     * Information for pagination
     */
    "paging": Paging;

    static discriminator: string | undefined = undefined;

    static attributeTypeMap: Array<{ name: string; baseName: string; type: string }> = [
      {
        name: "tppAuthenticationGroups",
        baseName: "tppAuthenticationGroups",
        type: "Array<TppAuthenticationGroup>"
      },
      {
        name: "paging",
        baseName: "paging",
        type: "Paging"
      }
    ];

    static getAttributeTypeMap() {
      return PageableTppAuthenticationGroupResources.attributeTypeMap;
    }
  }

  /**
   * Container for bank certificate information with paging info
   */
  export class PageableTppCertificateList {
    /**
     * List of certificates
     */
    "tppCertificates": Array<TppCertificate>;
    /**
     * Information for pagination
     */
    "paging": Paging;

    static discriminator: string | undefined = undefined;

    static attributeTypeMap: Array<{ name: string; baseName: string; type: string }> = [
      {
        name: "tppCertificates",
        baseName: "tppCertificates",
        type: "Array<TppCertificate>"
      },
      {
        name: "paging",
        baseName: "paging",
        type: "Paging"
      }
    ];

    static getAttributeTypeMap() {
      return PageableTppCertificateList.attributeTypeMap;
    }
  }

  /**
   * Container for TPP client credentials information with paging info
   */
  export class PageableTppCredentialResources {
    /**
     * List of TPP client credentials
     */
    "tppCredentials": Array<TppCredentials>;
    /**
     * Information for pagination
     */
    "paging": Paging;

    static discriminator: string | undefined = undefined;

    static attributeTypeMap: Array<{ name: string; baseName: string; type: string }> = [
      {
        name: "tppCredentials",
        baseName: "tppCredentials",
        type: "Array<TppCredentials>"
      },
      {
        name: "paging",
        baseName: "paging",
        type: "Paging"
      }
    ];

    static getAttributeTypeMap() {
      return PageableTppCredentialResources.attributeTypeMap;
    }
  }

  /**
   * Container for a page of transactions, with data about the total count of transactions and their balance
   */
  export class PageableTransactionList {
    /**
     * Array of transactions (for the requested page)
     */
    "transactions": Array<Transaction>;
    /**
     * Information for pagination
     */
    "paging": Paging;
    /**
     * The total income of all transactions (across all pages)
     */
    "income": number;
    /**
     * The total spending of all transactions (across all pages)
     */
    "spending": number;
    /**
     * The total sum of all transactions (across all pages)
     */
    "balance": number;

    static discriminator: string | undefined = undefined;

    static attributeTypeMap: Array<{ name: string; baseName: string; type: string }> = [
      {
        name: "transactions",
        baseName: "transactions",
        type: "Array<Transaction>"
      },
      {
        name: "paging",
        baseName: "paging",
        type: "Paging"
      },
      {
        name: "income",
        baseName: "income",
        type: "number"
      },
      {
        name: "spending",
        baseName: "spending",
        type: "number"
      },
      {
        name: "balance",
        baseName: "balance",
        type: "number"
      }
    ];

    static getAttributeTypeMap() {
      return PageableTransactionList.attributeTypeMap;
    }
  }

  /**
   * Container for users information with paging info
   */
  export class PageableUserInfoList {
    /**
     * List of users information
     */
    "users": Array<UserInfo>;
    /**
     * Information for pagination
     */
    "paging": Paging;

    static discriminator: string | undefined = undefined;

    static attributeTypeMap: Array<{ name: string; baseName: string; type: string }> = [
      {
        name: "users",
        baseName: "users",
        type: "Array<UserInfo>"
      },
      {
        name: "paging",
        baseName: "paging",
        type: "Paging"
      }
    ];

    static getAttributeTypeMap() {
      return PageableUserInfoList.attributeTypeMap;
    }
  }

  /**
   * Container for pagination information
   */
  export class Paging {
    /**
     * Current page number
     */
    "page": number;
    /**
     * Current page size (number of entries in this page)
     */
    "perPage": number;
    /**
     * Total number of pages
     */
    "pageCount": number;
    /**
     * Total number of entries across all pages
     */
    "totalCount": number;

    static discriminator: string | undefined = undefined;

    static attributeTypeMap: Array<{ name: string; baseName: string; type: string }> = [
      {
        name: "page",
        baseName: "page",
        type: "number"
      },
      {
        name: "perPage",
        baseName: "perPage",
        type: "number"
      },
      {
        name: "pageCount",
        baseName: "pageCount",
        type: "number"
      },
      {
        name: "totalCount",
        baseName: "totalCount",
        type: "number"
      }
    ];

    static getAttributeTypeMap() {
      return Paging.attributeTypeMap;
    }
  }

  /**
   * Password changing details
   */
  export class PasswordChangingResource {
    /**
     * User identifier
     */
    "userId": string;
    /**
     * User's email, encrypted. Decrypt with your data decryption key. If the user has no email set, then this field will be null.
     */
    "userEmail"?: string;
    /**
     * Encrypted password change token. Decrypt this token with your data decryption key, and pass the decrypted token to the /users/executePasswordChange service in order to set a new password for the user.
     */
    "passwordChangeToken": string;

    static discriminator: string | undefined = undefined;

    static attributeTypeMap: Array<{ name: string; baseName: string; type: string }> = [
      {
        name: "userId",
        baseName: "userId",
        type: "string"
      },
      {
        name: "userEmail",
        baseName: "userEmail",
        type: "string"
      },
      {
        name: "passwordChangeToken",
        baseName: "passwordChangeToken",
        type: "string"
      }
    ];

    static getAttributeTypeMap() {
      return PasswordChangingResource.attributeTypeMap;
    }
  }

  /**
   * Container for a payment's data
   */
  export class Payment {
    /**
     * Payment identifier
     */
    "id": number;
    /**
     * Identifier of the account to which this payment relates
     */
    "accountId": number;
    /**
     * Payment type
     */
    "type": Payment.TypeEnum;
    /**
     * Total money amount of the payment order(s), as absolute value
     */
    "amount": number;
    /**
     * Total count of orders included in this payment
     */
    "orderCount": number;
    /**
     * Current payment status:<br/> &bull; OPEN: means that this payment has been created in finAPI, but not yet submitted to the bank.<br/> &bull; PENDING: means that this payment has been requested at the bank, but not yet executed.<br/> &bull; SUCCESSFUL: means that this payment has been successfully executed.<br/> &bull; NOT_SUCCESSFUL: means that this payment could not be executed successfully.<br/> &bull; DISCARDED: means that this payment was discarded, either because another payment was requested for the same account before this payment was executed and the bank does not support this, or because the bank has rejected the payment even before the execution.
     */
    "status": Payment.StatusEnum;
    /**
     * Contains the bank's response to the execution of this payment. This field is not set until the payment gets executed. Note that even after the execution of the payment, the field might still not be set, if the bank did not send any response message.
     */
    "bankMessage"?: string;
    /**
     * Time of when this payment was requested, in the format 'YYYY-MM-DD HH:MM:SS.SSS' (german time)
     */
    "requestDate"?: string;
    /**
     * Time of when this payment was executed, in the format 'YYYY-MM-DD HH:MM:SS.SSS' (german time)
     */
    "executionDate"?: string;

    static discriminator: string | undefined = undefined;

    static attributeTypeMap: Array<{ name: string; baseName: string; type: string }> = [
      {
        name: "id",
        baseName: "id",
        type: "number"
      },
      {
        name: "accountId",
        baseName: "accountId",
        type: "number"
      },
      {
        name: "type",
        baseName: "type",
        type: "Payment.TypeEnum"
      },
      {
        name: "amount",
        baseName: "amount",
        type: "number"
      },
      {
        name: "orderCount",
        baseName: "orderCount",
        type: "number"
      },
      {
        name: "status",
        baseName: "status",
        type: "Payment.StatusEnum"
      },
      {
        name: "bankMessage",
        baseName: "bankMessage",
        type: "string"
      },
      {
        name: "requestDate",
        baseName: "requestDate",
        type: "string"
      },
      {
        name: "executionDate",
        baseName: "executionDate",
        type: "string"
      }
    ];

    static getAttributeTypeMap() {
      return Payment.attributeTypeMap;
    }
  }

  export namespace Payment {
    export enum TypeEnum {
      MONEYTRANSFER = <any>"MONEY_TRANSFER",
      DIRECTDEBIT = <any>"DIRECT_DEBIT"
    }
    export enum StatusEnum {
      OPEN = <any>"OPEN",
      PENDING = <any>"PENDING",
      SUCCESSFUL = <any>"SUCCESSFUL",
      NOTSUCCESSFUL = <any>"NOT_SUCCESSFUL",
      DISCARDED = <any>"DISCARDED"
    }
  }
  /**
   * Bank server's response to Money Transfer / Direct Debit execution
   */
  export class PaymentExecutionResponse {
    /**
     * Technical message from the bank server, confirming the success of the request. Typically, you would not want to present this message to the user. Note that this field may not be set. However if it is not set, it does not necessarily mean that there was an error in processing the request.
     */
    "successMessage"?: string;
    /**
     * In some cases, a bank server may accept the requested order, but return a warn message. This message may be of technical nature, but could also be of interest to the user.
     */
    "warnMessage"?: string;
    /**
     * Payment identifier. Can be used to retrieve the status of the payment (see 'Get payments' service).
     */
    "paymentId": number;

    static discriminator: string | undefined = undefined;

    static attributeTypeMap: Array<{ name: string; baseName: string; type: string }> = [
      {
        name: "successMessage",
        baseName: "successMessage",
        type: "string"
      },
      {
        name: "warnMessage",
        baseName: "warnMessage",
        type: "string"
      },
      {
        name: "paymentId",
        baseName: "paymentId",
        type: "number"
      }
    ];

    static getAttributeTypeMap() {
      return PaymentExecutionResponse.attributeTypeMap;
    }
  }

  /**
   * Additional, PayPal-specific transaction data. This field is only set for transactions that belong to an account of the 'PayPal' bank (BLZ 'PAYPAL').
   */
  export class PaypalTransactionData {
    /**
     * Invoice Number.<br/>NOTE: This field is deprecated as the bank with blz 'PAYPAL' is no longer supported. Do not use this field, as it will be removed at some point.
     */
    "invoiceNumber"?: string;
    /**
     * Fee value.<br/>NOTE: This field is deprecated as the bank with blz 'PAYPAL' is no longer supported. Do not use this field, as it will be removed at some point.
     */
    "fee"?: number;
    /**
     * Net value.<br/>NOTE: This field is deprecated as the bank with blz 'PAYPAL' is no longer supported. Do not use this field, as it will be removed at some point.
     */
    "net"?: number;
    /**
     * Auction Site.<br/>NOTE: This field is deprecated as the bank with blz 'PAYPAL' is no longer supported. Do not use this field, as it will be removed at some point.
     */
    "auctionSite"?: string;

    static discriminator: string | undefined = undefined;

    static attributeTypeMap: Array<{ name: string; baseName: string; type: string }> = [
      {
        name: "invoiceNumber",
        baseName: "invoiceNumber",
        type: "string"
      },
      {
        name: "fee",
        baseName: "fee",
        type: "number"
      },
      {
        name: "net",
        baseName: "net",
        type: "number"
      },
      {
        name: "auctionSite",
        baseName: "auctionSite",
        type: "string"
      }
    ];

    static getAttributeTypeMap() {
      return PaypalTransactionData.attributeTypeMap;
    }
  }

  /**
   * Container for interface removal parameters
   */
  export class RemoveInterfaceParams {
    /**
     * Bank connection identifier
     */
    "bankConnectionId": number;
    /**
     * The interface which you want to remove.
     */
    "_interface"?: RemoveInterfaceParams.InterfaceEnum;

    static discriminator: string | undefined = undefined;

    static attributeTypeMap: Array<{ name: string; baseName: string; type: string }> = [
      {
        name: "bankConnectionId",
        baseName: "bankConnectionId",
        type: "number"
      },
      {
        name: "_interface",
        baseName: "interface",
        type: "RemoveInterfaceParams.InterfaceEnum"
      }
    ];

    static getAttributeTypeMap() {
      return RemoveInterfaceParams.attributeTypeMap;
    }
  }

  export namespace RemoveInterfaceParams {
    export enum InterfaceEnum {
      FINTSSERVER = <any>"FINTS_SERVER",
      WEBSCRAPER = <any>"WEB_SCRAPER",
      XS2A = <any>"XS2A"
    }
  }
  /**
   * Request password change parameters
   */
  export class RequestPasswordChangeParams {
    /**
     * User identifier
     */
    "userId": string;

    static discriminator: string | undefined = undefined;

    static attributeTypeMap: Array<{ name: string; baseName: string; type: string }> = [
      {
        name: "userId",
        baseName: "userId",
        type: "string"
      }
    ];

    static getAttributeTypeMap() {
      return RequestPasswordChangeParams.attributeTypeMap;
    }
  }

  /**
   * Parameters for a single or collective SEPA direct debit order request
   */
  export class RequestSepaDirectDebitParams {
    /**
     * Identifier of the bank account to which you want to transfer the money.
     */
    "accountId": number;
    /**
     * Online banking PIN. Any symbols are allowed. Max length: 170. If a PIN is stored in the bank connection, then this field may remain unset. If finAPI's web form is not required and the field is set though then it will always be used (even if there is some other PIN stored in the bank connection). If you want the user to enter a PIN in finAPI's web form even when a PIN is stored, then just set the field to any value, so that the service recognizes that you wish to use the web form flow.
     */
    "bankingPin"?: string;
    /**
     * Whether to store the PIN. If the PIN is stored, it is not required to pass the PIN again when executing SEPA orders. Default value is 'false'. <br/><br/>NOTES:<br/> - before you set this field to true, please regard the 'pinsAreVolatile' flag of the bank connection that the account belongs to;<br/> - this field is ignored in case when the user will need to use finAPI's web form. The user will be able to decide whether to store the PIN or not in the web form, depending on the 'storeSecretsAvailableInWebForm' setting (see Client Configuration).
     */
    "storeSecrets"?: boolean;
    /**
     * The bank-given ID of the two-step-procedure that should be used for the order. For a list of available two-step-procedures, see the corresponding bank connection (GET /bankConnections). If this field is not set, then the bank connection's default two-step-procedure will be used. Note that in this case, when the bank connection has no default two-step-procedure set, then the response of the service depends on whether you need to use finAPI's web form or not. If you need to use the web form, the user will be prompted to select the two-step-procedure within the web form. If you don't need to use the web form, then the service will return an error (passing a value for this field is required in this case).
     */
    "twoStepProcedureId"?: string;
    /**
     * Type of the direct debit; either <code>BASIC</code> or <code>B2B</code> (Business-To-Business). Please note that an account which supports the basic type must not necessarily support B2B (or vice versa). Check the source account's 'supportedOrders' field to find out which types of direct debit it supports.<br/><br/>
     */
    "directDebitType": RequestSepaDirectDebitParams.DirectDebitTypeEnum;
    /**
     * Sequence type of the direct debit. Possible values:<br/><br/>&bull; <code>OOFF</code> - means that this is a one-time direct debit order<br/>&bull; <code>FRST</code> - means that this is the first in a row of multiple direct debit orders<br/>&bull; <code>RCUR</code> - means that this is one (but not the first or final) within a row of multiple direct debit orders<br/>&bull; <code>FNAL</code> - means that this is the final in a row of multiple direct debit orders<br/><br/>
     */
    "sequenceType": RequestSepaDirectDebitParams.SequenceTypeEnum;
    /**
     * Execution date for the direct debit(s), in the format 'YYYY-MM-DD'.
     */
    "executionDate": string;
    /**
     * This field is only regarded when you pass multiple orders. It determines whether the orders should be processed by the bank as one collective booking (in case of 'false'), or as single bookings (in case of 'true'). Default value is 'false'.
     */
    "singleBooking"?: boolean;
    /**
     * List of the direct debits that you want to execute (may contain at most 15000 items). Please check the account's 'supportedOrders' field to find out whether you can pass multiple direct debits or just one.
     */
    "directDebits": Array<SingleDirectDebitData>;
    /**
     * Whether the finAPI web form should hide transaction details when prompting the caller for the second factor. Default value is false.
     */
    "hideTransactionDetailsInWebForm"?: boolean;
    /**
     * Container for multi-step authentication data. Required when a previous service call initiated a multi-step authentication.
     */
    "multiStepAuthentication"?: MultiStepAuthenticationCallback;
    /**
     * Whether to store the PIN. If the PIN is stored, it is not required to pass the PIN again when executing SEPA orders. Default value is 'false'. <br/><br/>NOTES:<br/> - before you set this field to true, please regard the 'pinsAreVolatile' flag of the bank connection that the account belongs to;<br/> - this field is ignored in case when the user will need to use finAPI's web form. The user will be able to decide whether to store the PIN or not in the web form, depending on the 'storeSecretsAvailableInWebForm' setting (see Client Configuration).<br><br>NOTE: This field is deprecated and will be removed at some point. Use 'storeSecrets' instead.
     */
    "storePin"?: boolean;

    static discriminator: string | undefined = undefined;

    static attributeTypeMap: Array<{ name: string; baseName: string; type: string }> = [
      {
        name: "accountId",
        baseName: "accountId",
        type: "number"
      },
      {
        name: "bankingPin",
        baseName: "bankingPin",
        type: "string"
      },
      {
        name: "storeSecrets",
        baseName: "storeSecrets",
        type: "boolean"
      },
      {
        name: "twoStepProcedureId",
        baseName: "twoStepProcedureId",
        type: "string"
      },
      {
        name: "directDebitType",
        baseName: "directDebitType",
        type: "RequestSepaDirectDebitParams.DirectDebitTypeEnum"
      },
      {
        name: "sequenceType",
        baseName: "sequenceType",
        type: "RequestSepaDirectDebitParams.SequenceTypeEnum"
      },
      {
        name: "executionDate",
        baseName: "executionDate",
        type: "string"
      },
      {
        name: "singleBooking",
        baseName: "singleBooking",
        type: "boolean"
      },
      {
        name: "directDebits",
        baseName: "directDebits",
        type: "Array<SingleDirectDebitData>"
      },
      {
        name: "hideTransactionDetailsInWebForm",
        baseName: "hideTransactionDetailsInWebForm",
        type: "boolean"
      },
      {
        name: "multiStepAuthentication",
        baseName: "multiStepAuthentication",
        type: "MultiStepAuthenticationCallback"
      },
      {
        name: "storePin",
        baseName: "storePin",
        type: "boolean"
      }
    ];

    static getAttributeTypeMap() {
      return RequestSepaDirectDebitParams.attributeTypeMap;
    }
  }

  export namespace RequestSepaDirectDebitParams {
    export enum DirectDebitTypeEnum {
      B2B = <any>"B2B",
      BASIC = <any>"BASIC"
    }
    export enum SequenceTypeEnum {
      OOFF = <any>"OOFF",
      FRST = <any>"FRST",
      RCUR = <any>"RCUR",
      FNAL = <any>"FNAL"
    }
  }
  /**
   * Parameters for a single or collective SEPA money transfer order request
   */
  export class RequestSepaMoneyTransferParams {
    /**
     * Name of the recipient. Note: Neither finAPI nor the involved bank servers are guaranteed to validate the recipient name. Even if the recipient name does not depict the actual registered account holder of the specified recipient account, the money transfer request might still be successful. This field is optional only when you pass a clearing account as the recipient. Otherwise, this field is required.
     */
    "recipientName"?: string;
    /**
     * IBAN of the recipient's account. This field is optional only when you pass a clearing account as the recipient. Otherwise, this field is required.
     */
    "recipientIban"?: string;
    /**
     * BIC of the recipient's account. Note: This field is optional when you pass a clearing account as the recipient or if the bank connection of the account that you want to transfer money from supports the IBAN-Only money transfer. You can find this out via GET /bankConnections/<id>. If no BIC is given, finAPI will try to recognize it using the given recipientIban value (if it's given). And then if the result value is not empty, it will be used for the money transfer request independent of whether it is required or not (unless you pass a clearing account, in which case the value will always be ignored).
     */
    "recipientBic"?: string;
    /**
     * Identifier of a clearing account. If this field is set, then the fields 'recipientName', 'recipientIban' and 'recipientBic' will be ignored and the recipient account will be the specified clearing account.
     */
    "clearingAccountId"?: string;
    /**
     * End-To-End ID for the transfer transaction
     */
    "endToEndId"?: string;
    /**
     * The amount to transfer. Must be a positive decimal number with at most two decimal places (e.g. 99.99)
     */
    "amount": number;
    /**
     * The purpose of the transfer transaction
     */
    "purpose"?: string;
    /**
     * SEPA purpose code, according to ISO 20022, external codes set.
     */
    "sepaPurposeCode"?: string;
    /**
     * Identifier of the bank account that you want to transfer money from
     */
    "accountId": number;
    /**
     * Online banking PIN. Any symbols are allowed. Max length: 170. If a PIN is stored in the bank connection, then this field may remain unset. If finAPI's web form is not required and the field is set though then it will always be used (even if there is some other PIN stored in the bank connection). If you want the user to enter a PIN in finAPI's web form even when a PIN is stored, then just set the field to any value, so that the service recognizes that you wish to use the web form flow.
     */
    "bankingPin"?: string;
    /**
     * Whether to store the PIN. If the PIN is stored, it is not required to pass the PIN again when executing SEPA orders. Default value is 'false'. <br/><br/>NOTES:<br/> - before you set this field to true, please regard the 'pinsAreVolatile' flag of the bank connection that the account belongs to;<br/> - this field is ignored in case when the user will need to use finAPI's web form. The user will be able to decide whether to store the PIN or not in the web form, depending on the 'storeSecretsAvailableInWebForm' setting (see Client Configuration).
     */
    "storeSecrets"?: boolean;
    /**
     * The bank-given ID of the two-step-procedure that should be used for the order. For a list of available two-step-procedures, see the corresponding bank connection (GET /bankConnections). If this field is not set, then the bank connection's default two-step-procedure will be used. Note that in this case, when the bank connection has no default two-step-procedure set, then the response of the service depends on whether you need to use finAPI's web form or not. If you need to use the web form, the user will be prompted to select the two-step-procedure within the web form. If you don't need to use the web form, then the service will return an error (passing a value for this field is required in this case).
     */
    "twoStepProcedureId"?: string;
    /**
     * Execution date for the money transfer(s), in the format 'YYYY-MM-DD'. If not specified, then the current date will be used.
     */
    "executionDate"?: string;
    /**
     * This field is only regarded when you pass multiple orders. It determines whether the orders should be processed by the bank as one collective booking (in case of 'false'), or as single bookings (in case of 'true'). Default value is 'false'.
     */
    "singleBooking"?: boolean;
    /**
     * In case that you want to submit not just a single money transfer, but do a collective money transfer, use this field to pass a list of additional money transfer orders. The service will then pass a collective money transfer request to the bank, including both the money transfer specified on the top-level, as well as all money transfers specified in this list. The maximum count of money transfers that you can pass (in total) is 15000. Note that you should check the account's 'supportedOrders' field to find out whether or not it is supporting collective money transfers.
     */
    "additionalMoneyTransfers"?: Array<SingleMoneyTransferRecipientData>;
    /**
     * NOTE: This field is DEPRECATED and will get removed at some point. Please refer to the 'multiStepAuthentication' field instead.<br/><br/>Challenge response. This field should be set only when the previous attempt to request a SEPA money transfer failed with HTTP code 510, i.e. the bank sent a challenge for the user for an additional authentication. In this case, this field must contain the response to the bank's challenge. Please note that in case of using finAPI's web form you have to leave this field unset and the application will automatically recognize that the user has to input challenge response and then a web form will be shown to the user.
     */
    "challengeResponse"?: string;
    /**
     * Container for multi-step authentication data. Required when a previous service call initiated a multi-step authentication.
     */
    "multiStepAuthentication"?: MultiStepAuthenticationCallback;
    /**
     * Whether the finAPI web form should hide transaction details when prompting the caller for the second factor. Default value is false.
     */
    "hideTransactionDetailsInWebForm"?: boolean;
    /**
     * Whether to store the PIN. If the PIN is stored, it is not required to pass the PIN again when executing SEPA orders. Default value is 'false'. <br/><br/>NOTES:<br/> - before you set this field to true, please regard the 'pinsAreVolatile' flag of the bank connection that the account belongs to;<br/> - this field is ignored in case when the user will need to use finAPI's web form. The user will be able to decide whether to store the PIN or not in the web form, depending on the 'storeSecretsAvailableInWebForm' setting (see Client Configuration).<br><br>NOTE: This field is deprecated and will be removed at some point. Use 'storeSecrets' instead.
     */
    "storePin"?: boolean;

    static discriminator: string | undefined = undefined;

    static attributeTypeMap: Array<{ name: string; baseName: string; type: string }> = [
      {
        name: "recipientName",
        baseName: "recipientName",
        type: "string"
      },
      {
        name: "recipientIban",
        baseName: "recipientIban",
        type: "string"
      },
      {
        name: "recipientBic",
        baseName: "recipientBic",
        type: "string"
      },
      {
        name: "clearingAccountId",
        baseName: "clearingAccountId",
        type: "string"
      },
      {
        name: "endToEndId",
        baseName: "endToEndId",
        type: "string"
      },
      {
        name: "amount",
        baseName: "amount",
        type: "number"
      },
      {
        name: "purpose",
        baseName: "purpose",
        type: "string"
      },
      {
        name: "sepaPurposeCode",
        baseName: "sepaPurposeCode",
        type: "string"
      },
      {
        name: "accountId",
        baseName: "accountId",
        type: "number"
      },
      {
        name: "bankingPin",
        baseName: "bankingPin",
        type: "string"
      },
      {
        name: "storeSecrets",
        baseName: "storeSecrets",
        type: "boolean"
      },
      {
        name: "twoStepProcedureId",
        baseName: "twoStepProcedureId",
        type: "string"
      },
      {
        name: "executionDate",
        baseName: "executionDate",
        type: "string"
      },
      {
        name: "singleBooking",
        baseName: "singleBooking",
        type: "boolean"
      },
      {
        name: "additionalMoneyTransfers",
        baseName: "additionalMoneyTransfers",
        type: "Array<SingleMoneyTransferRecipientData>"
      },
      {
        name: "challengeResponse",
        baseName: "challengeResponse",
        type: "string"
      },
      {
        name: "multiStepAuthentication",
        baseName: "multiStepAuthentication",
        type: "MultiStepAuthenticationCallback"
      },
      {
        name: "hideTransactionDetailsInWebForm",
        baseName: "hideTransactionDetailsInWebForm",
        type: "boolean"
      },
      {
        name: "storePin",
        baseName: "storePin",
        type: "boolean"
      }
    ];

    static getAttributeTypeMap() {
      return RequestSepaMoneyTransferParams.attributeTypeMap;
    }
  }

  /**
   * Container for a security position's data
   */
  export class Security {
    /**
     * Identifier. Note: Whenever a security account is being updated, its security positions will be internally re-created, meaning that the identifier of a security position might change over time.
     */
    "id": number;
    /**
     * Security account identifier
     */
    "accountId": number;
    /**
     * Name
     */
    "name"?: string;
    /**
     * ISIN
     */
    "isin"?: string;
    /**
     * WKN
     */
    "wkn"?: string;
    /**
     * Quote
     */
    "quote"?: number;
    /**
     * Currency of quote
     */
    "quoteCurrency"?: string;
    /**
     * Type of quote. 'PERC' if quote is a percentage value, 'ACTU' if quote is the actual amount
     */
    "quoteType"?: Security.QuoteTypeEnum;
    /**
     * Quote date in the format 'YYYY-MM-DD HH:MM:SS.SSS' (german time).
     */
    "quoteDate"?: string;
    /**
     * Value of quantity or nominal
     */
    "quantityNominal"?: number;
    /**
     * Type of quantity or nominal value. 'UNIT' if value is a quantity, 'FAMT' if value is the nominal amount
     */
    "quantityNominalType"?: Security.QuantityNominalTypeEnum;
    /**
     * Market value
     */
    "marketValue"?: number;
    /**
     * Currency of market value
     */
    "marketValueCurrency"?: string;
    /**
     * Entry quote
     */
    "entryQuote"?: number;
    /**
     * Currency of entry quote
     */
    "entryQuoteCurrency"?: string;
    /**
     * Current profit or loss
     */
    "profitOrLoss"?: number;

    static discriminator: string | undefined = undefined;

    static attributeTypeMap: Array<{ name: string; baseName: string; type: string }> = [
      {
        name: "id",
        baseName: "id",
        type: "number"
      },
      {
        name: "accountId",
        baseName: "accountId",
        type: "number"
      },
      {
        name: "name",
        baseName: "name",
        type: "string"
      },
      {
        name: "isin",
        baseName: "isin",
        type: "string"
      },
      {
        name: "wkn",
        baseName: "wkn",
        type: "string"
      },
      {
        name: "quote",
        baseName: "quote",
        type: "number"
      },
      {
        name: "quoteCurrency",
        baseName: "quoteCurrency",
        type: "string"
      },
      {
        name: "quoteType",
        baseName: "quoteType",
        type: "Security.QuoteTypeEnum"
      },
      {
        name: "quoteDate",
        baseName: "quoteDate",
        type: "string"
      },
      {
        name: "quantityNominal",
        baseName: "quantityNominal",
        type: "number"
      },
      {
        name: "quantityNominalType",
        baseName: "quantityNominalType",
        type: "Security.QuantityNominalTypeEnum"
      },
      {
        name: "marketValue",
        baseName: "marketValue",
        type: "number"
      },
      {
        name: "marketValueCurrency",
        baseName: "marketValueCurrency",
        type: "string"
      },
      {
        name: "entryQuote",
        baseName: "entryQuote",
        type: "number"
      },
      {
        name: "entryQuoteCurrency",
        baseName: "entryQuoteCurrency",
        type: "string"
      },
      {
        name: "profitOrLoss",
        baseName: "profitOrLoss",
        type: "number"
      }
    ];

    static getAttributeTypeMap() {
      return Security.attributeTypeMap;
    }
  }

  export namespace Security {
    export enum QuoteTypeEnum {
      ACTU = <any>"ACTU",
      PERC = <any>"PERC"
    }
    export enum QuantityNominalTypeEnum {
      UNIT = <any>"UNIT",
      FAMT = <any>"FAMT"
    }
  }
  /**
   * Container for securities resources
   */
  export class SecurityList {
    /**
     * List of securities
     */
    "securities": Array<Security>;

    static discriminator: string | undefined = undefined;

    static attributeTypeMap: Array<{ name: string; baseName: string; type: string }> = [
      {
        name: "securities",
        baseName: "securities",
        type: "Array<Security>"
      }
    ];

    static getAttributeTypeMap() {
      return SecurityList.attributeTypeMap;
    }
  }

  /**
   * Data for a single direct debit
   */
  export class SingleDirectDebitData {
    /**
     * Name of the debitor. Note: Neither finAPI nor the involved bank servers are guaranteed to validate the debitor name. Even if the debitor name does not depict the actual registered account holder of the specified debitor account, the direct debit request might still be successful.
     */
    "debitorName": string;
    /**
     * IBAN of the debitor's account
     */
    "debitorIban": string;
    /**
     * BIC of the debitor's account. Note: This field is optional if - and only if - the bank connection of the account that you want to transfer money to supports the IBAN-Only direct debit. You can find this out via GET /bankConnections/<id>. If no BIC is given, finAPI will try to recognize it using the given debitorIban value (if it's given). And then if the result value is not empty, it will be used for the direct debit request independent of whether it is required or not.
     */
    "debitorBic"?: string;
    /**
     * The amount to transfer. Must be a positive decimal number with at most two decimal places (e.g. 99.99)
     */
    "amount": number;
    /**
     * The purpose of the transfer transaction
     */
    "purpose"?: string;
    /**
     * SEPA purpose code, according to ISO 20022, external codes set.
     */
    "sepaPurposeCode"?: string;
    /**
     * Mandate ID that this direct debit order is based on.
     */
    "mandateId": string;
    /**
     * Date of the mandate that this direct debit order is based on, in the format 'YYYY-MM-DD'
     */
    "mandateDate": string;
    /**
     * Creditor ID of the source account's holder
     */
    "creditorId"?: string;
    /**
     * End-To-End ID for the transfer transaction
     */
    "endToEndId"?: string;

    static discriminator: string | undefined = undefined;

    static attributeTypeMap: Array<{ name: string; baseName: string; type: string }> = [
      {
        name: "debitorName",
        baseName: "debitorName",
        type: "string"
      },
      {
        name: "debitorIban",
        baseName: "debitorIban",
        type: "string"
      },
      {
        name: "debitorBic",
        baseName: "debitorBic",
        type: "string"
      },
      {
        name: "amount",
        baseName: "amount",
        type: "number"
      },
      {
        name: "purpose",
        baseName: "purpose",
        type: "string"
      },
      {
        name: "sepaPurposeCode",
        baseName: "sepaPurposeCode",
        type: "string"
      },
      {
        name: "mandateId",
        baseName: "mandateId",
        type: "string"
      },
      {
        name: "mandateDate",
        baseName: "mandateDate",
        type: "string"
      },
      {
        name: "creditorId",
        baseName: "creditorId",
        type: "string"
      },
      {
        name: "endToEndId",
        baseName: "endToEndId",
        type: "string"
      }
    ];

    static getAttributeTypeMap() {
      return SingleDirectDebitData.attributeTypeMap;
    }
  }

  /**
   * Recipient data for a single money transfer order
   */
  export class SingleMoneyTransferRecipientData {
    /**
     * Name of the recipient. Note: Neither finAPI nor the involved bank servers are guaranteed to validate the recipient name. Even if the recipient name does not depict the actual registered account holder of the specified recipient account, the money transfer request might still be successful. This field is optional only when you pass a clearing account as the recipient. Otherwise, this field is required.
     */
    "recipientName"?: string;
    /**
     * IBAN of the recipient's account. This field is optional only when you pass a clearing account as the recipient. Otherwise, this field is required.
     */
    "recipientIban"?: string;
    /**
     * BIC of the recipient's account. Note: This field is optional when you pass a clearing account as the recipient or if the bank connection of the account that you want to transfer money from supports the IBAN-Only money transfer. You can find this out via GET /bankConnections/<id>. If no BIC is given, finAPI will try to recognize it using the given recipientIban value (if it's given). And then if the result value is not empty, it will be used for the money transfer request independent of whether it is required or not (unless you pass a clearing account, in which case the value will always be ignored).
     */
    "recipientBic"?: string;
    /**
     * Identifier of a clearing account. If this field is set, then the fields 'recipientName', 'recipientIban' and 'recipientBic' will be ignored and the recipient account will be the specified clearing account.
     */
    "clearingAccountId"?: string;
    /**
     * End-To-End ID for the transfer transaction
     */
    "endToEndId"?: string;
    /**
     * The amount to transfer. Must be a positive decimal number with at most two decimal places (e.g. 99.99)
     */
    "amount": number;
    /**
     * The purpose of the transfer transaction
     */
    "purpose"?: string;
    /**
     * SEPA purpose code, according to ISO 20022, external codes set.
     */
    "sepaPurposeCode"?: string;

    static discriminator: string | undefined = undefined;

    static attributeTypeMap: Array<{ name: string; baseName: string; type: string }> = [
      {
        name: "recipientName",
        baseName: "recipientName",
        type: "string"
      },
      {
        name: "recipientIban",
        baseName: "recipientIban",
        type: "string"
      },
      {
        name: "recipientBic",
        baseName: "recipientBic",
        type: "string"
      },
      {
        name: "clearingAccountId",
        baseName: "clearingAccountId",
        type: "string"
      },
      {
        name: "endToEndId",
        baseName: "endToEndId",
        type: "string"
      },
      {
        name: "amount",
        baseName: "amount",
        type: "number"
      },
      {
        name: "purpose",
        baseName: "purpose",
        type: "string"
      },
      {
        name: "sepaPurposeCode",
        baseName: "sepaPurposeCode",
        type: "string"
      }
    ];

    static getAttributeTypeMap() {
      return SingleMoneyTransferRecipientData.attributeTypeMap;
    }
  }

  /**
   * Set of logical sub-transactions that a transaction should get split into
   */
  export class SplitTransactionsParams {
    /**
     * List of sub-transactions
     */
    "subTransactions": Array<SubTransactionParams>;

    static discriminator: string | undefined = undefined;

    static attributeTypeMap: Array<{ name: string; baseName: string; type: string }> = [
      {
        name: "subTransactions",
        baseName: "subTransactions",
        type: "Array<SubTransactionParams>"
      }
    ];

    static getAttributeTypeMap() {
      return SplitTransactionsParams.attributeTypeMap;
    }
  }

  /**
   * Data of a sub-transaction
   */
  export class SubTransactionParams {
    /**
     * Amount
     */
    "amount": number;
    /**
     * Category identifier. If not specified, the original transaction's category will be applied. If you explicitly want the sub-transaction to have no category, then pass this field with value '0' (zero).
     */
    "categoryId"?: number;
    /**
     * Purpose. Maximum length is 2000. If not specified, the original transaction's value will be applied.
     */
    "purpose"?: string;
    /**
     * Counterpart. Maximum length is 80. If not specified, the original transaction's value will be applied.
     */
    "counterpart"?: string;
    /**
     * Counterpart account number. If not specified, the original transaction's value will be applied.
     */
    "counterpartAccountNumber"?: string;
    /**
     * Counterpart IBAN. If not specified, the original transaction's value will be applied.
     */
    "counterpartIban"?: string;
    /**
     * Counterpart BIC. If not specified, the original transaction's value will be applied.
     */
    "counterpartBic"?: string;
    /**
     * Counterpart BLZ. If not specified, the original transaction's value will be applied.
     */
    "counterpartBlz"?: string;
    /**
     * List of connected labels. Note that when this field is not specified, then the labels of the original transaction will NOT get applied to the sub-transaction. Instead, the sub-transaction will have no labels assigned to it.
     */
    "labelIds"?: Array<number>;

    static discriminator: string | undefined = undefined;

    static attributeTypeMap: Array<{ name: string; baseName: string; type: string }> = [
      {
        name: "amount",
        baseName: "amount",
        type: "number"
      },
      {
        name: "categoryId",
        baseName: "categoryId",
        type: "number"
      },
      {
        name: "purpose",
        baseName: "purpose",
        type: "string"
      },
      {
        name: "counterpart",
        baseName: "counterpart",
        type: "string"
      },
      {
        name: "counterpartAccountNumber",
        baseName: "counterpartAccountNumber",
        type: "string"
      },
      {
        name: "counterpartIban",
        baseName: "counterpartIban",
        type: "string"
      },
      {
        name: "counterpartBic",
        baseName: "counterpartBic",
        type: "string"
      },
      {
        name: "counterpartBlz",
        baseName: "counterpartBlz",
        type: "string"
      },
      {
        name: "labelIds",
        baseName: "labelIds",
        type: "Array<number>"
      }
    ];

    static getAttributeTypeMap() {
      return SubTransactionParams.attributeTypeMap;
    }
  }

  /**
   * TPP Authentication group to which the bank interface belongs to
   */
  export class TppAuthenticationGroup {
    /**
     * TPP Authentication Group ID
     */
    "id": number;
    /**
     * TPP Authentication Group name
     */
    "name"?: string;

    static discriminator: string | undefined = undefined;

    static attributeTypeMap: Array<{ name: string; baseName: string; type: string }> = [
      {
        name: "id",
        baseName: "id",
        type: "number"
      },
      {
        name: "name",
        baseName: "name",
        type: "string"
      }
    ];

    static getAttributeTypeMap() {
      return TppAuthenticationGroup.attributeTypeMap;
    }
  }

  /**
   * A container for the bank certificate's data
   */
  export class TppCertificate {
    /**
     * A certificate identifier.
     */
    "id": number;
    /**
     * Type of certificate.
     */
    "certificateType": TppCertificate.CertificateTypeEnum;
    /**
     * Optional label of certificate.
     */
    "label"?: string;
    /**
     * Valid from date in the format 'YYYY-MM-DD'.
     */
    "validFrom"?: string;
    /**
     * Valid until date in the format 'YYYY-MM-DD'.
     */
    "validUntil"?: string;

    static discriminator: string | undefined = undefined;

    static attributeTypeMap: Array<{ name: string; baseName: string; type: string }> = [
      {
        name: "id",
        baseName: "id",
        type: "number"
      },
      {
        name: "certificateType",
        baseName: "certificateType",
        type: "TppCertificate.CertificateTypeEnum"
      },
      {
        name: "label",
        baseName: "label",
        type: "string"
      },
      {
        name: "validFrom",
        baseName: "validFrom",
        type: "string"
      },
      {
        name: "validUntil",
        baseName: "validUntil",
        type: "string"
      }
    ];

    static getAttributeTypeMap() {
      return TppCertificate.attributeTypeMap;
    }
  }

  export namespace TppCertificate {
    export enum CertificateTypeEnum {
      QWAC = <any>"QWAC",
      QSEALC = <any>"QSEALC"
    }
  }
  /**
   * A container for the new certificate data
   */
  export class TppCertificateParams {
    /**
     * A type of certificate submitted
     */
    "type": TppCertificateParams.TypeEnum;
    /**
     * A certificate (public key)
     */
    "publicKey": string;
    /**
     * A private key in PKCS #8 or PKCS #1 format. PKCS #1/#8 private keys are typically exchanged in the PEM base64-encoded format (https://support.quovadisglobal.com/kb/a37/what-is-pem-format.aspx)</br></br>NOTE: The certificate should have one of the following headers:</br>- '-----BEGIN RSA PRIVATE KEY-----'<br>- '-----BEGIN PRIVATE KEY-----'</br>- '-----BEGIN ENCRYPTED PRIVATE KEY-----'<br>Any other header denotes that the private key is neither in PKCS #8 nor in PKCS #1 formats!
     */
    "privateKey": string;
    /**
     * Optional passphrase for the private key
     */
    "passphrase"?: string;
    /**
     * A label for certificate to identify in the list of certificates
     */
    "label": string;
    /**
     * Start day of the certificate's validity, in the format 'YYYY-MM-DD'. Default is the passed certificate validFrom date
     */
    "validFromDate"?: string;
    /**
     * Expiration day of the certificate's validity, in the format 'YYYY-MM-DD'. Default is the passed certificate validUntil date
     */
    "validUntilDate"?: string;

    static discriminator: string | undefined = undefined;

    static attributeTypeMap: Array<{ name: string; baseName: string; type: string }> = [
      {
        name: "type",
        baseName: "type",
        type: "TppCertificateParams.TypeEnum"
      },
      {
        name: "publicKey",
        baseName: "publicKey",
        type: "string"
      },
      {
        name: "privateKey",
        baseName: "privateKey",
        type: "string"
      },
      {
        name: "passphrase",
        baseName: "passphrase",
        type: "string"
      },
      {
        name: "label",
        baseName: "label",
        type: "string"
      },
      {
        name: "validFromDate",
        baseName: "validFromDate",
        type: "string"
      },
      {
        name: "validUntilDate",
        baseName: "validUntilDate",
        type: "string"
      }
    ];

    static getAttributeTypeMap() {
      return TppCertificateParams.attributeTypeMap;
    }
  }

  export namespace TppCertificateParams {
    export enum TypeEnum {
      QWAC = <any>"QWAC",
      QSEALC = <any>"QSEALC"
    }
  }
  /**
   * A container for the TPP client credentials data
   */
  export class TppCredentials {
    /**
     * The credential identifier.
     */
    "id": number;
    /**
     * Optional label of tpp client credentials set.
     */
    "label"?: string;
    /**
     * TPP Authentication Group ID
     */
    "tppAuthenticationGroupId"?: number;
    /**
     * Valid from date in the format 'YYYY-MM-DD'.
     */
    "validFrom"?: string;
    /**
     * Valid until date in the format 'YYYY-MM-DD'.
     */
    "validUntil"?: string;

    static discriminator: string | undefined = undefined;

    static attributeTypeMap: Array<{ name: string; baseName: string; type: string }> = [
      {
        name: "id",
        baseName: "id",
        type: "number"
      },
      {
        name: "label",
        baseName: "label",
        type: "string"
      },
      {
        name: "tppAuthenticationGroupId",
        baseName: "tppAuthenticationGroupId",
        type: "number"
      },
      {
        name: "validFrom",
        baseName: "validFrom",
        type: "string"
      },
      {
        name: "validUntil",
        baseName: "validUntil",
        type: "string"
      }
    ];

    static getAttributeTypeMap() {
      return TppCredentials.attributeTypeMap;
    }
  }

  /**
   * A container for new TPP client credentials data
   */
  export class TppCredentialsParams {
    /**
     * The TPP Authentication Group Id for which the credentials can be used
     */
    "tppAuthenticationGroupId": number;
    /**
     * Optional label to credentials
     */
    "label": string;
    /**
     * ID of the TPP accessing the ASPSP API, as provided by the ASPSP as the result of registration
     */
    "tppClientId"?: string;
    /**
     * Secret of the TPP accessing the ASPSP API, as provided by the ASPSP as the result of registration
     */
    "tppClientSecret"?: string;
    /**
     * API Key provided by ASPSP  as the result of registration
     */
    "tppApiKey"?: string;
    /**
     * Credentials \"valid from\" date in the format 'YYYY-MM-DD'. Default is today's date
     */
    "validFromDate"?: string;
    /**
     * Credentials \"valid until\" date in the format 'YYYY-MM-DD'. Default is null which means \"indefinite\" (no limit)
     */
    "validUntilDate"?: string;

    static discriminator: string | undefined = undefined;

    static attributeTypeMap: Array<{ name: string; baseName: string; type: string }> = [
      {
        name: "tppAuthenticationGroupId",
        baseName: "tppAuthenticationGroupId",
        type: "number"
      },
      {
        name: "label",
        baseName: "label",
        type: "string"
      },
      {
        name: "tppClientId",
        baseName: "tppClientId",
        type: "string"
      },
      {
        name: "tppClientSecret",
        baseName: "tppClientSecret",
        type: "string"
      },
      {
        name: "tppApiKey",
        baseName: "tppApiKey",
        type: "string"
      },
      {
        name: "validFromDate",
        baseName: "validFromDate",
        type: "string"
      },
      {
        name: "validUntilDate",
        baseName: "validUntilDate",
        type: "string"
      }
    ];

    static getAttributeTypeMap() {
      return TppCredentialsParams.attributeTypeMap;
    }
  }

  /**
   * Sample data to train categorization
   */
  export class TrainCategorizationData {
    /**
     * Set of transaction data (at most 100 transactions at once)
     */
    "transactionData": Array<TrainCategorizationTransactionData>;
    /**
     * Category identifier
     */
    "categoryId": number;

    static discriminator: string | undefined = undefined;

    static attributeTypeMap: Array<{ name: string; baseName: string; type: string }> = [
      {
        name: "transactionData",
        baseName: "transactionData",
        type: "Array<TrainCategorizationTransactionData>"
      },
      {
        name: "categoryId",
        baseName: "categoryId",
        type: "number"
      }
    ];

    static getAttributeTypeMap() {
      return TrainCategorizationData.attributeTypeMap;
    }
  }

  /**
   * Transaction data for categorization training
   */
  export class TrainCategorizationTransactionData {
    /**
     * Identifier of account type.<br/><br/>1 = Checking,<br/>2 = Savings,<br/>3 = CreditCard,<br/>4 = Security,<br/>5 = Loan,<br/>6 = Pocket (DEPRECATED; will not be returned for any account unless this type has explicitly been set via PATCH),<br/>7 = Membership,<br/>8 = Bausparen<br/><br/>
     */
    "accountTypeId": number;
    /**
     * Amount
     */
    "amount": number;
    /**
     * Purpose. Any symbols are allowed. Maximum length is 2000. Default value: null.
     */
    "purpose"?: string;
    /**
     * Counterpart. Any symbols are allowed. Maximum length is 80. Default value: null.
     */
    "counterpart"?: string;
    /**
     * Counterpart IBAN. Default value: null.
     */
    "counterpartIban"?: string;
    /**
     * Counterpart account number. Default value: null.
     */
    "counterpartAccountNumber"?: string;
    /**
     * Counterpart BLZ. Default value: null.
     */
    "counterpartBlz"?: string;
    /**
     * Counterpart BIC. Default value: null.
     */
    "counterpartBic"?: string;
    /**
     * Merchant category code (for credit card transactions only). Default value: null. NOTE: This field is currently not regarded.
     */
    "mcCode"?: string;

    static discriminator: string | undefined = undefined;

    static attributeTypeMap: Array<{ name: string; baseName: string; type: string }> = [
      {
        name: "accountTypeId",
        baseName: "accountTypeId",
        type: "number"
      },
      {
        name: "amount",
        baseName: "amount",
        type: "number"
      },
      {
        name: "purpose",
        baseName: "purpose",
        type: "string"
      },
      {
        name: "counterpart",
        baseName: "counterpart",
        type: "string"
      },
      {
        name: "counterpartIban",
        baseName: "counterpartIban",
        type: "string"
      },
      {
        name: "counterpartAccountNumber",
        baseName: "counterpartAccountNumber",
        type: "string"
      },
      {
        name: "counterpartBlz",
        baseName: "counterpartBlz",
        type: "string"
      },
      {
        name: "counterpartBic",
        baseName: "counterpartBic",
        type: "string"
      },
      {
        name: "mcCode",
        baseName: "mcCode",
        type: "string"
      }
    ];

    static getAttributeTypeMap() {
      return TrainCategorizationTransactionData.attributeTypeMap;
    }
  }

  /**
   * Container for a transaction's data
   */
  export class Transaction {
    /**
     * Transaction identifier
     */
    "id": number;
    /**
     * Parent transaction identifier
     */
    "parentId"?: number;
    /**
     * Account identifier
     */
    "accountId": number;
    /**
     * Value date in the format 'YYYY-MM-DD HH:MM:SS.SSS' (german time).
     */
    "valueDate": string;
    /**
     * Bank booking date in the format 'YYYY-MM-DD HH:MM:SS.SSS' (german time).
     */
    "bankBookingDate": string;
    /**
     * finAPI Booking date in the format 'YYYY-MM-DD HH:MM:SS.SSS' (german time). NOTE: In some cases, banks may deliver transactions that are booked in future, but already included in the current account balance. To keep the account balance consistent with the set of transactions, such \"future transactions\" will be imported with their finapiBookingDate set to the current date (i.e.: date of import). The finapiBookingDate will automatically get adjusted towards the bankBookingDate each time the associated bank account is updated. Example: A transaction is imported on July, 3rd, with a bank reported booking date of July, 6th. The transaction will be imported with its finapiBookingDate set to July, 3rd. Then, on July 4th, the associated account is updated. During this update, the transaction's finapiBookingDate will be automatically adjusted to July 4th. This adjustment of the finapiBookingDate takes place on each update until the bank account is updated on July 6th or later, in which case the transaction's finapiBookingDate will be adjusted to its final value, July 6th.<br/> The finapiBookingDate is the date that is used by the finAPI PFM services. E.g. when you calculate the spendings of an account for the current month, and have a transaction with finapiBookingDate in the current month but bankBookingDate at the beginning of the next month, then this transaction is included in the calculations (as the bank has this transaction's amount included in the current account balance as well).
     */
    "finapiBookingDate": string;
    /**
     * Transaction amount
     */
    "amount": number;
    /**
     * Transaction purpose. Maximum length: 2000
     */
    "purpose"?: string;
    /**
     * Counterpart name. Maximum length: 80
     */
    "counterpartName"?: string;
    /**
     * Counterpart account number
     */
    "counterpartAccountNumber"?: string;
    /**
     * Counterpart IBAN
     */
    "counterpartIban"?: string;
    /**
     * Counterpart BLZ
     */
    "counterpartBlz"?: string;
    /**
     * Counterpart BIC
     */
    "counterpartBic"?: string;
    /**
     * Counterpart Bank name
     */
    "counterpartBankName"?: string;
    /**
     * The mandate reference of the counterpart
     */
    "counterpartMandateReference"?: string;
    /**
     * The customer reference of the counterpart
     */
    "counterpartCustomerReference"?: string;
    /**
     * The creditor ID of the counterpart. Exists only for SEPA direct debit transactions (\"Lastschrift\").
     */
    "counterpartCreditorId"?: string;
    /**
     * The originator's identification code. Exists only for SEPA money transfer transactions (\"Überweisung\").
     */
    "counterpartDebitorId"?: string;
    /**
     * Transaction type, according to the bank. If set, this will contain a German term that you can display to the user. Some examples of common values are: \"Lastschrift\", \"Auslands&uuml;berweisung\", \"Geb&uuml;hren\", \"Zinsen\". The maximum possible length of this field is 255 characters.
     */
    "type"?: string;
    /**
     * ZKA business transaction code which relates to the transaction's type. Possible values range from 1 through 999. If no information about the ZKA type code is available, then this field will be null.
     */
    "typeCodeZka"?: string;
    /**
     * SWIFT transaction type code. If no information about the SWIFT code is available, then this field will be null.
     */
    "typeCodeSwift"?: string;
    /**
     * SEPA purpose code, according to ISO 20022
     */
    "sepaPurposeCode"?: string;
    /**
     * Transaction primanota (bank side identification number)
     */
    "primanota"?: string;
    /**
     * Transaction category, if any is assigned. Note: Recently imported transactions that have currently no category assigned might still get categorized by the background categorization process. To check the status of the background categorization, see GET /bankConnections. Manual category assignments to a transaction will remove the transaction from the background categorization process (i.e. the background categorization process will never overwrite a manual category assignment).
     */
    "category"?: Category;
    /**
     * Array of assigned labels
     */
    "labels"?: Array<Label>;
    /**
     * While finAPI uses a well-elaborated algorithm for uniquely identifying transactions, there is still the possibility that during an account update, a transaction that was imported previously may be imported a second time as a new transaction. For example, this can happen if some transaction data changes on the bank server side. However, finAPI also includes an algorithm of identifying such \"potential duplicate\" transactions. If this field is set to true, it means that finAPI detected a similar transaction that might actually be the same. It is recommended to communicate this information to the end user, and give him an option to delete the transaction in case he confirms that it really is a duplicate.
     */
    "isPotentialDuplicate": boolean;
    /**
     * Indicating whether this transaction is an adjusting entry ('Zwischensaldo').<br/><br/>Adjusting entries do not originate from the bank, but are added by finAPI during an account update when the bank reported account balance does not add up to the set of transactions that finAPI receives for the account. In this case, the adjusting entry will fix the deviation between the balance and the received transactions so that both adds up again.<br/><br/>Possible causes for such deviations are:<br/>- Inconsistencies in how the bank calculates the balance, for instance when not yet booked transactions are already included in the balance, but not included in the set of transactions<br/>- Gaps in the transaction history that finAPI receives, for instance because the account has not been updated for a while and older transactions are no longer available
     */
    "isAdjustingEntry": boolean;
    /**
     * Indicating whether this transaction is 'new' or not. Any newly imported transaction will have this flag initially set to true. How you use this field is up to your interpretation. For example, you might want to set it to false once a user has clicked on/seen the transaction. You can change this flag to 'false' with the PATCH method.
     */
    "isNew": boolean;
    /**
     * Date of transaction import, in the format 'YYYY-MM-DD HH:MM:SS.SSS' (german time).
     */
    "importDate": string;
    /**
     * Sub-transactions identifiers (if this transaction is split)
     */
    "children"?: Array<number>;
    /**
     * Additional, PayPal-specific transaction data. This field is only set for transactions that belong to an account of the 'PayPal' bank (BLZ 'PAYPAL').<br/>NOTE: This field is deprecated as the bank with blz 'PAYPAL' is no longer supported. Do not use this field, as it will be removed at some point.
     */
    "paypalData"?: PaypalTransactionData;
    /**
     * End-To-End reference
     */
    "endToEndReference"?: string;
    /**
     * Compensation Amount. Sum of reimbursement of out-of-pocket expenses plus processing brokerage in case of a national return / refund debit as well as an optional interest equalisation. Exists predominantly for SEPA direct debit returns.
     */
    "compensationAmount"?: number;
    /**
     * Original Amount of the original direct debit. Exists predominantly for SEPA direct debit returns.
     */
    "originalAmount"?: number;
    /**
     * Payer's/debtor's reference party (in the case of a credit transfer) or payee's/creditor's reference party (in the case of a direct debit)
     */
    "differentDebitor"?: string;
    /**
     * Payee's/creditor's reference party (in the case of a credit transfer) or payer's/debtor's reference party (in the case of a direct debit)
     */
    "differentCreditor"?: string;

    static discriminator: string | undefined = undefined;

    static attributeTypeMap: Array<{ name: string; baseName: string; type: string }> = [
      {
        name: "id",
        baseName: "id",
        type: "number"
      },
      {
        name: "parentId",
        baseName: "parentId",
        type: "number"
      },
      {
        name: "accountId",
        baseName: "accountId",
        type: "number"
      },
      {
        name: "valueDate",
        baseName: "valueDate",
        type: "string"
      },
      {
        name: "bankBookingDate",
        baseName: "bankBookingDate",
        type: "string"
      },
      {
        name: "finapiBookingDate",
        baseName: "finapiBookingDate",
        type: "string"
      },
      {
        name: "amount",
        baseName: "amount",
        type: "number"
      },
      {
        name: "purpose",
        baseName: "purpose",
        type: "string"
      },
      {
        name: "counterpartName",
        baseName: "counterpartName",
        type: "string"
      },
      {
        name: "counterpartAccountNumber",
        baseName: "counterpartAccountNumber",
        type: "string"
      },
      {
        name: "counterpartIban",
        baseName: "counterpartIban",
        type: "string"
      },
      {
        name: "counterpartBlz",
        baseName: "counterpartBlz",
        type: "string"
      },
      {
        name: "counterpartBic",
        baseName: "counterpartBic",
        type: "string"
      },
      {
        name: "counterpartBankName",
        baseName: "counterpartBankName",
        type: "string"
      },
      {
        name: "counterpartMandateReference",
        baseName: "counterpartMandateReference",
        type: "string"
      },
      {
        name: "counterpartCustomerReference",
        baseName: "counterpartCustomerReference",
        type: "string"
      },
      {
        name: "counterpartCreditorId",
        baseName: "counterpartCreditorId",
        type: "string"
      },
      {
        name: "counterpartDebitorId",
        baseName: "counterpartDebitorId",
        type: "string"
      },
      {
        name: "type",
        baseName: "type",
        type: "string"
      },
      {
        name: "typeCodeZka",
        baseName: "typeCodeZka",
        type: "string"
      },
      {
        name: "typeCodeSwift",
        baseName: "typeCodeSwift",
        type: "string"
      },
      {
        name: "sepaPurposeCode",
        baseName: "sepaPurposeCode",
        type: "string"
      },
      {
        name: "primanota",
        baseName: "primanota",
        type: "string"
      },
      {
        name: "category",
        baseName: "category",
        type: "Category"
      },
      {
        name: "labels",
        baseName: "labels",
        type: "Array<Label>"
      },
      {
        name: "isPotentialDuplicate",
        baseName: "isPotentialDuplicate",
        type: "boolean"
      },
      {
        name: "isAdjustingEntry",
        baseName: "isAdjustingEntry",
        type: "boolean"
      },
      {
        name: "isNew",
        baseName: "isNew",
        type: "boolean"
      },
      {
        name: "importDate",
        baseName: "importDate",
        type: "string"
      },
      {
        name: "children",
        baseName: "children",
        type: "Array<number>"
      },
      {
        name: "paypalData",
        baseName: "paypalData",
        type: "PaypalTransactionData"
      },
      {
        name: "endToEndReference",
        baseName: "endToEndReference",
        type: "string"
      },
      {
        name: "compensationAmount",
        baseName: "compensationAmount",
        type: "number"
      },
      {
        name: "originalAmount",
        baseName: "originalAmount",
        type: "number"
      },
      {
        name: "differentDebitor",
        baseName: "differentDebitor",
        type: "string"
      },
      {
        name: "differentCreditor",
        baseName: "differentCreditor",
        type: "string"
      }
    ];

    static getAttributeTypeMap() {
      return Transaction.attributeTypeMap;
    }
  }

  /**
   * Container for data of multiple transactions
   */
  export class TransactionList {
    /**
     * List of transactions
     */
    "transactions": Array<Transaction>;

    static discriminator: string | undefined = undefined;

    static attributeTypeMap: Array<{ name: string; baseName: string; type: string }> = [
      {
        name: "transactions",
        baseName: "transactions",
        type: "Array<Transaction>"
      }
    ];

    static getAttributeTypeMap() {
      return TransactionList.attributeTypeMap;
    }
  }

  /**
   * Trigger categorization parameters
   */
  export class TriggerCategorizationParams {
    /**
     * List of identifiers of the bank connections that you want to trigger categorization for. Leaving the list unset or empty will trigger categorization for all of the user's bank connections. Please note that if there are no bank connections, then the service will return with HTTP code 422.
     */
    "bankConnectionIds"?: Array<number>;

    static discriminator: string | undefined = undefined;

    static attributeTypeMap: Array<{ name: string; baseName: string; type: string }> = [
      {
        name: "bankConnectionIds",
        baseName: "bankConnectionIds",
        type: "Array<number>"
      }
    ];

    static getAttributeTypeMap() {
      return TriggerCategorizationParams.attributeTypeMap;
    }
  }

  /**
   * Two-step-procedure for user authorization on bank-side
   */
  export class TwoStepProcedure {
    /**
     * Bank-given ID of the procedure
     */
    "procedureId": string;
    /**
     * Bank-given name of the procedure
     */
    "procedureName": string;
    /**
     * The challenge type of the procedure. Possible values are:<br/><br/>&bull; <code>TEXT</code> - the challenge will be a text that contains instructions for the user on how to proceed with the authorization.<br/>&bull; <code>PHOTO</code> - the challenge will contain a BASE-64 string depicting a photo (or any kind of QR-code-like data) that must be shown to the user.<br/>&bull; <code>FLICKER_CODE</code> - the challenge will contain a BASE-64 string depicting a flicker code animation that must be shown to the user.<br/><br/>Note that this challenge type information does not originate from the bank, but is determined by finAPI internally. There is no guarantee that the determined challenge type is correct. Note also that this field may not be set, meaning that finAPI could not determine the challenge type of the procedure.
     */
    "procedureChallengeType"?: string;
    /**
     * If 'true', then there is no need for your client to pass back anything to finAPI to continue the authorization when using this procedure. The authorization will be dealt with directly between the user, finAPI, and the bank.
     */
    "implicitExecute": boolean;

    static discriminator: string | undefined = undefined;

    static attributeTypeMap: Array<{ name: string; baseName: string; type: string }> = [
      {
        name: "procedureId",
        baseName: "procedureId",
        type: "string"
      },
      {
        name: "procedureName",
        baseName: "procedureName",
        type: "string"
      },
      {
        name: "procedureChallengeType",
        baseName: "procedureChallengeType",
        type: "string"
      },
      {
        name: "implicitExecute",
        baseName: "implicitExecute",
        type: "boolean"
      }
    ];

    static getAttributeTypeMap() {
      return TwoStepProcedure.attributeTypeMap;
    }
  }

  /**
   * Container for bank connection update parameters
   */
  export class UpdateBankConnectionParams {
    /**
     * Bank connection identifier
     */
    "bankConnectionId": number;
    /**
     * NOTE: This field is deprecated and will be removed at some point. Use 'loginCredentials' + 'interface' instead. If any of those two fields is used, then the value of this field will be ignored.<br><br>Online banking PIN. Any symbols are allowed. Max length: 170. If a PIN is stored in the bank connection, then this field may remain unset. If finAPI's web form is not required and the field is set though then it will always be used (even if there is some other PIN stored in the bank connection). If you want the user to enter a PIN in finAPI's web form even when a PIN is stored, then just set the field to any value, so that the service recognizes that you wish to use the web form flow.
     */
    "bankingPin"?: string;
    /**
     * NOTE: This field is deprecated and will be removed at some point. Use 'storeSecrets' instead.<br><br>Whether to store the PIN. If the PIN is stored, it is not required to pass the PIN again when updating this bank connection or when executing orders (like money transfers). Default is false. <br/><br/>NOTES:<br/> - before you set this field to true, please regard the 'pinsAreVolatile' flag of this connection's bank;<br/> - this field is ignored in case when the user will need to use finAPI's web form. The user will be able to decide whether to store the PIN or not in the web form, depending on the 'storeSecretsAvailableInWebForm' setting (see Client Configuration).
     */
    "storePin"?: boolean;
    /**
     * The interface to use for connecting with the bank.
     */
    "_interface"?: UpdateBankConnectionParams.InterfaceEnum;
    /**
     * Set of login credentials. Must be passed in combination with the 'interface' field. The labels that you pass must match with the login credential labels that the respective interface defines. finAPI will combine the given credentials with any credentials that it has stored. You can leave this field unset in case finAPI has stored all required credentials. When you must use a web form, you can also leave this field unset and the web form will take care of getting the credentials from the user. However, if you do pass credentials in that case, the web form will show only those fields that you have given.
     */
    "loginCredentials"?: Array<LoginCredential>;
    /**
     * Whether to store the secret login fields. If the secret fields are stored, then updates can be triggered without the involvement of the users, as long as the credentials remain valid and the bank consent has not expired. Note that bank consent will be stored regardless of the field value. Default value is false.<br/><br/>NOTES:<br/> - this field is ignored in case when the user will need to use finAPI's web form. The user will be able to decide whether to store the secrets or not in the web form, depending on the 'storeSecretsAvailableInWebForm' setting (see Client Configuration).
     */
    "storeSecrets"?: boolean;
    /**
     * Whether new accounts that have not yet been imported will be imported or not. Default is false. <br/><br/>NOTES:<br/>&bull; For best performance of the bank connection update, you should not enable this flag unless you really expect new accounts to be available in the connection. It is recommended to let your users tell you through your application when they want the service to look for new accounts.<br/>&bull; If you have imported a bank connection using specific <code>accountTypeIds</code> (e.g. <code>1,2</code> to import checking and saving accounts), you would import all other accounts (e.g. security accounts or credit cards) by setting <code>importNewAccounts</code> to <code>true</code>. To avoid importing account types that you are not interested in, make sure this field is undefined or set to false.
     */
    "importNewAccounts"?: boolean;
    /**
     * Whether to skip the download of transactions and securities or not. If set to true, then finAPI will download just the accounts list with the accounts' information (like account name, number, holder, etc), as well as the accounts' balances (if possible), but skip the download of transactions and securities. Default is false.<br/><br/>NOTES:<br/>&bull; If you skip the download of transactions and securities during an import or update, you can still download them on a later update (though you might not get all positions at a later point, because the date range in which the bank servers provide this data is usually limited). However, once finAPI has downloaded the transactions or securities for the first time, you will not be able to go back to skipping the download of transactions and securities! In other words: Once you make your first request with <code>skipPositionsDownload=false</code> for a certain bank connection, you will no longer be able to make a request with <code>skipPositionsDownload=true</code> for that same bank connection.<br/>&bull; If this bank connection is updated via finAPI's automatic batch update, then transactions and security positions <u>will</u> be downloaded in any case!<br/>&bull; For security accounts, skipping the downloading of the securities might result in the account's balance also not being downloaded.<br/>
     */
    "skipPositionsDownload"?: boolean;
    /**
     * Whether to load/refresh information about the bank connection owner(s) - see field 'owners'. Default value is 'false'. Note that owner data is NOT loaded/refreshed during finAPI's automatic bank connection update.
     */
    "loadOwnerData"?: boolean;
    /**
     * List of accounts for which access is requested from the bank. It may only be passed if the bank interface has the DETAILED_CONSENT property set. if omitted, finAPI will use the list of existing accounts. Note that the parameter is still required if you want to import new accounts (i.e. call with importNewAccounts=true).
     */
    "accountReferences"?: Array<AccountReference>;
    /**
     * NOTE: This field is DEPRECATED and will get removed at some point. Please refer to the 'multiStepAuthentication' field instead.<br/><br/>Challenge response. This field should be set only when the previous attempt of update the bank connection failed with HTTP code 510, i.e. the bank sent a challenge for the user for an additional authentication. In this case, this field must contain the response to the bank's challenge. Note that in the context of finAPI's web form flow, finAPI will automatically deal with getting the challenge response from the user via the web form.
     */
    "challengeResponse"?: string;
    /**
     * Container for multi-step authentication data. Required when a previous service call initiated a multi-step authentication.
     */
    "multiStepAuthentication"?: MultiStepAuthenticationCallback;
    /**
     * Must only be passed when the used interface has the property REDIRECT_APPROACH and no web form flow is used. The user will be redirected to the given URL from the bank's website after having entered his credentials. Must use HTTPS protocol.
     */
    "redirectUrl"?: string;

    static discriminator: string | undefined = undefined;

    static attributeTypeMap: Array<{ name: string; baseName: string; type: string }> = [
      {
        name: "bankConnectionId",
        baseName: "bankConnectionId",
        type: "number"
      },
      {
        name: "bankingPin",
        baseName: "bankingPin",
        type: "string"
      },
      {
        name: "storePin",
        baseName: "storePin",
        type: "boolean"
      },
      {
        name: "_interface",
        baseName: "interface",
        type: "UpdateBankConnectionParams.InterfaceEnum"
      },
      {
        name: "loginCredentials",
        baseName: "loginCredentials",
        type: "Array<LoginCredential>"
      },
      {
        name: "storeSecrets",
        baseName: "storeSecrets",
        type: "boolean"
      },
      {
        name: "importNewAccounts",
        baseName: "importNewAccounts",
        type: "boolean"
      },
      {
        name: "skipPositionsDownload",
        baseName: "skipPositionsDownload",
        type: "boolean"
      },
      {
        name: "loadOwnerData",
        baseName: "loadOwnerData",
        type: "boolean"
      },
      {
        name: "accountReferences",
        baseName: "accountReferences",
        type: "Array<AccountReference>"
      },
      {
        name: "challengeResponse",
        baseName: "challengeResponse",
        type: "string"
      },
      {
        name: "multiStepAuthentication",
        baseName: "multiStepAuthentication",
        type: "MultiStepAuthenticationCallback"
      },
      {
        name: "redirectUrl",
        baseName: "redirectUrl",
        type: "string"
      }
    ];

    static getAttributeTypeMap() {
      return UpdateBankConnectionParams.attributeTypeMap;
    }
  }

  export namespace UpdateBankConnectionParams {
    export enum InterfaceEnum {
      FINTSSERVER = <any>"FINTS_SERVER",
      WEBSCRAPER = <any>"WEB_SCRAPER",
      XS2A = <any>"XS2A"
    }
  }
  /**
   * Update specific transactions parameters
   */
  export class UpdateMultipleTransactionsParams {
    /**
     * Whether this transactions should be flagged as 'new' or not. Any newly imported transaction will have this flag initially set to true. How you use this field is up to your interpretation. For example, you might want to set it to false once a user has clicked on/seen the transaction.
     */
    "isNew"?: boolean;
    /**
     * You can set this field only to 'false'. finAPI marks transactions as a potential duplicates  when its internal duplicate detection algorithm is signaling so. Transactions that are flagged as duplicates can be deleted by the user. To prevent the user from deleting original transactions, which might lead to incorrect balances, it is not possible to manually set this flag to 'true'.
     */
    "isPotentialDuplicate"?: boolean;
    /**
     * Identifier of the new category to apply to the transaction. When updating the transaction's category, the category's fields 'id', 'name', 'parentId', 'parentName', and 'isCustom' will all get updated. To clear the category for the transaction, the categoryId field must be passed with value 0.
     */
    "categoryId"?: number;
    /**
     * This field is only regarded when the field 'categoryId' is set. It controls whether finAPI's categorization system should learn from the given categorization(s). If set to 'true', then the user's categorization rules will be updated so that similar transactions will get categorized accordingly in future. If set to 'false', then the service will simply change the category of the given transaction(s), without updating the user's categorization rules. The field defaults to 'true' if not specified.
     */
    "trainCategorization"?: boolean;
    /**
     * Identifiers of labels to apply to the transaction. To clear transactions' labels, pass an empty array of identifiers: '[]'
     */
    "labelIds"?: Array<number>;
    /**
     * A comma-separated list of transaction identifiers. If specified, then only transactions whose identifier match any of the given identifiers will be regarded. The maximum number of identifiers is 100.
     */
    "ids"?: Array<number>;
    /**
     * A comma-separated list of account identifiers. If specified, then only transactions whose account's identifier is included in this list will be regarded.
     */
    "accountIds"?: Array<number>;

    static discriminator: string | undefined = undefined;

    static attributeTypeMap: Array<{ name: string; baseName: string; type: string }> = [
      {
        name: "isNew",
        baseName: "isNew",
        type: "boolean"
      },
      {
        name: "isPotentialDuplicate",
        baseName: "isPotentialDuplicate",
        type: "boolean"
      },
      {
        name: "categoryId",
        baseName: "categoryId",
        type: "number"
      },
      {
        name: "trainCategorization",
        baseName: "trainCategorization",
        type: "boolean"
      },
      {
        name: "labelIds",
        baseName: "labelIds",
        type: "Array<number>"
      },
      {
        name: "ids",
        baseName: "ids",
        type: "Array<number>"
      },
      {
        name: "accountIds",
        baseName: "accountIds",
        type: "Array<number>"
      }
    ];

    static getAttributeTypeMap() {
      return UpdateMultipleTransactionsParams.attributeTypeMap;
    }
  }

  /**
   * Container for a status of bank connection update
   */
  export class UpdateResult {
    /**
     * Note that 'OK' just means that finAPI could successfully connect and log in to the bank server. However, it does not necessarily mean that all accounts could be updated successfully. For the latter, please refer to the 'status' field of the Account resource.
     */
    "result": UpdateResult.ResultEnum;
    /**
     * In case the update result is not <code>OK</code>, this field may contain an error message with details about why the update failed (it is not guaranteed that a message is available though). In case the update result is <code>OK</code>, the field will always be null.
     */
    "errorMessage"?: string;
    /**
     * In case the update result is not <code>OK</code>, this field contains the type of the error that occurred. BUSINESS means that the bank server responded with a non-technical error message for the user. TECHNICAL means that some internal error has occurred in finAPI or at the bank server.
     */
    "errorType"?: UpdateResult.ErrorTypeEnum;
    /**
     * Time of the update. The value is returned in the format 'YYYY-MM-DD HH:MM:SS.SSS' (german time).
     */
    "timestamp": string;

    static discriminator: string | undefined = undefined;

    static attributeTypeMap: Array<{ name: string; baseName: string; type: string }> = [
      {
        name: "result",
        baseName: "result",
        type: "UpdateResult.ResultEnum"
      },
      {
        name: "errorMessage",
        baseName: "errorMessage",
        type: "string"
      },
      {
        name: "errorType",
        baseName: "errorType",
        type: "UpdateResult.ErrorTypeEnum"
      },
      {
        name: "timestamp",
        baseName: "timestamp",
        type: "string"
      }
    ];

    static getAttributeTypeMap() {
      return UpdateResult.attributeTypeMap;
    }
  }

  export namespace UpdateResult {
    export enum ResultEnum {
      OK = <any>"OK",
      BANKSERVERREJECTION = <any>"BANK_SERVER_REJECTION",
      INTERNALSERVERERROR = <any>"INTERNAL_SERVER_ERROR"
    }
    export enum ErrorTypeEnum {
      BUSINESS = <any>"BUSINESS",
      TECHNICAL = <any>"TECHNICAL"
    }
  }
  /**
   * Update transactions parameters
   */
  export class UpdateTransactionsParams {
    /**
     * Whether this transactions should be flagged as 'new' or not. Any newly imported transaction will have this flag initially set to true. How you use this field is up to your interpretation. For example, you might want to set it to false once a user has clicked on/seen the transaction.
     */
    "isNew"?: boolean;
    /**
     * You can set this field only to 'false'. finAPI marks transactions as a potential duplicates  when its internal duplicate detection algorithm is signaling so. Transactions that are flagged as duplicates can be deleted by the user. To prevent the user from deleting original transactions, which might lead to incorrect balances, it is not possible to manually set this flag to 'true'.
     */
    "isPotentialDuplicate"?: boolean;
    /**
     * Identifier of the new category to apply to the transaction. When updating the transaction's category, the category's fields 'id', 'name', 'parentId', 'parentName', and 'isCustom' will all get updated. To clear the category for the transaction, the categoryId field must be passed with value 0.
     */
    "categoryId"?: number;
    /**
     * This field is only regarded when the field 'categoryId' is set. It controls whether finAPI's categorization system should learn from the given categorization(s). If set to 'true', then the user's categorization rules will be updated so that similar transactions will get categorized accordingly in future. If set to 'false', then the service will simply change the category of the given transaction(s), without updating the user's categorization rules. The field defaults to 'true' if not specified.
     */
    "trainCategorization"?: boolean;
    /**
     * Identifiers of labels to apply to the transaction. To clear transactions' labels, pass an empty array of identifiers: '[]'
     */
    "labelIds"?: Array<number>;

    static discriminator: string | undefined = undefined;

    static attributeTypeMap: Array<{ name: string; baseName: string; type: string }> = [
      {
        name: "isNew",
        baseName: "isNew",
        type: "boolean"
      },
      {
        name: "isPotentialDuplicate",
        baseName: "isPotentialDuplicate",
        type: "boolean"
      },
      {
        name: "categoryId",
        baseName: "categoryId",
        type: "number"
      },
      {
        name: "trainCategorization",
        baseName: "trainCategorization",
        type: "boolean"
      },
      {
        name: "labelIds",
        baseName: "labelIds",
        type: "Array<number>"
      }
    ];

    static getAttributeTypeMap() {
      return UpdateTransactionsParams.attributeTypeMap;
    }
  }

  /**
   * Container for a user's data
   */
  export class User {
    /**
     * User identifier
     */
    "id": string;
    /**
     * User's password. Please note that some services may return a distorted password (always 'XXXXX'). See the documentation of individual services to find out whether the password is returned as plain text or as 'XXXXX'.
     */
    "password": string;
    /**
     * User's email address
     */
    "email"?: string;
    /**
     * User's phone number
     */
    "phone"?: string;
    /**
     * Whether the user's bank connections will get updated in the course of finAPI's automatic batch update. Note that the automatic batch update will only update bank connections where all of the following applies:<br><br> - the PIN is stored in finAPI for the bank connection, and the related bank does not have volatile PINs (see the ‘pinsAreVolatile’ flag of the Bank Resource)<br> - the user has accepted the latest Terms and Conditions (this only applies to users whose mandator has PISP license or doesn't have a license at all)<br> - the user has allowed finAPI to use his old stored credentials (this only applies to users which had stored credentials before introducing a web form feature and whose mandator has PISP license or doesn't have a license at all)<br> - the previous update using the stored credentials did not fail due to the credentials being incorrect (or there was no previous update with the stored credentials)<br> - the bank that the bank connection relates to is included in the automatic batch update (please contact your Sys-Admin for details about the batch update configuration)<br> - at least one of the bank's supported data sources can be used by finAPI for your client (i.e.: if a bank supports only web scraping, but web scraping is disabled for your client, then bank connections of that bank will not get updated by the automatic batch update)<br><br>Also note that the automatic batch update must generally be enabled for your client in order for this field to have any effect.<br/><br/>WARNING: The automatic update will always download transactions and security positions for any account that it updates! This means that the user will no longer be able to download just the balances for his accounts once the automatic update has run (The 'skipPositionsDownload' flag in the bankConnections/update service can no longer be set to true).
     */
    "isAutoUpdateEnabled": boolean;

    static discriminator: string | undefined = undefined;

    static attributeTypeMap: Array<{ name: string; baseName: string; type: string }> = [
      {
        name: "id",
        baseName: "id",
        type: "string"
      },
      {
        name: "password",
        baseName: "password",
        type: "string"
      },
      {
        name: "email",
        baseName: "email",
        type: "string"
      },
      {
        name: "phone",
        baseName: "phone",
        type: "string"
      },
      {
        name: "isAutoUpdateEnabled",
        baseName: "isAutoUpdateEnabled",
        type: "boolean"
      }
    ];

    static getAttributeTypeMap() {
      return User.attributeTypeMap;
    }
  }

  /**
   * User details
   */
  export class UserCreateParams {
    /**
     * User's identifier. Max length is 36 symbols. Only the following symbols are allowed: 0-9, A-Z, a-z, -, _, ., +, @. If not specified, then a unique random value will be generated.
     */
    "id"?: string;
    /**
     * User's password. Minimum length is 6, and maximum length is 128. If not specified, then a unique random value will be generated.
     */
    "password"?: string;
    /**
     * User's email address. Maximum length is 320.
     */
    "email"?: string;
    /**
     * User's phone number. Maximum length is 50.
     */
    "phone"?: string;
    /**
     * Whether the user's bank connections will get updated in the course of finAPI's automatic batch update. Note that the automatic batch update will only update bank connections where all of the following applies:<br><br> - the PIN is stored in finAPI for the bank connection<br> - the user has accepted the latest Terms and Conditions (this only applies to users whose mandator has PISP license or doesn't have a license at all)<br> - the user has allowed finAPI to use his old stored credentials (this only applies to users which had stored credentials before introducing a web form feature and whose mandator has PISP license or doesn't have a license at all)<br> - the previous update using the stored credentials did not fail due to the credentials being incorrect (or there was no previous update with the stored credentials)<br> - the bank that the bank connection relates to is included in the automatic batch update (please contact your Sys-Admin for details about the batch update configuration)<br><br>Also note that the automatic batch update must generally be enabled for your client in order for this field to have any effect.<br/><br/>WARNING: The automatic update will always download transactions and security positions for any account that it updates! This means that the user will no longer be able to download just the balances for his accounts once the automatic update has run (The 'skipPositionsDownload' flag in the bankConnections/update service can no longer be set to true).<br/><br/>If not specified, then the automatic update will be disabled by default (false).
     */
    "isAutoUpdateEnabled"?: boolean;

    static discriminator: string | undefined = undefined;

    static attributeTypeMap: Array<{ name: string; baseName: string; type: string }> = [
      {
        name: "id",
        baseName: "id",
        type: "string"
      },
      {
        name: "password",
        baseName: "password",
        type: "string"
      },
      {
        name: "email",
        baseName: "email",
        type: "string"
      },
      {
        name: "phone",
        baseName: "phone",
        type: "string"
      },
      {
        name: "isAutoUpdateEnabled",
        baseName: "isAutoUpdateEnabled",
        type: "boolean"
      }
    ];

    static getAttributeTypeMap() {
      return UserCreateParams.attributeTypeMap;
    }
  }

  /**
   * Container for list of identifiers of deleted users, and not deleted users (in ascending order)
   */
  export class UserIdentifiersList {
    /**
     * List of identifiers of deleted users (in ascending order)
     */
    "deletedUsers": Array<string>;
    /**
     * List of identifiers of not deleted users (in ascending order)
     */
    "nonDeletedUsers": Array<string>;

    static discriminator: string | undefined = undefined;

    static attributeTypeMap: Array<{ name: string; baseName: string; type: string }> = [
      {
        name: "deletedUsers",
        baseName: "deletedUsers",
        type: "Array<string>"
      },
      {
        name: "nonDeletedUsers",
        baseName: "nonDeletedUsers",
        type: "Array<string>"
      }
    ];

    static getAttributeTypeMap() {
      return UserIdentifiersList.attributeTypeMap;
    }
  }

  /**
   * User identifiers params
   */
  export class UserIdentifiersParams {
    /**
     * List of user identifiers
     */
    "userIds": Array<string>;

    static discriminator: string | undefined = undefined;

    static attributeTypeMap: Array<{ name: string; baseName: string; type: string }> = [
      {
        name: "userIds",
        baseName: "userIds",
        type: "Array<string>"
      }
    ];

    static getAttributeTypeMap() {
      return UserIdentifiersParams.attributeTypeMap;
    }
  }

  /**
   * Container for user information
   */
  export class UserInfo {
    /**
     * User's identifier
     */
    "userId": string;
    /**
     * User's registration date, in the format 'YYYY-MM-DD'
     */
    "registrationDate": string;
    /**
     * User's deletion date, in the format 'YYYY-MM-DD'. May be null if the user has not been deleted.
     */
    "deletionDate"?: string;
    /**
     * User's last active date, in the format 'YYYY-MM-DD'. May be null if the user has not yet logged in.
     */
    "lastActiveDate"?: string;
    /**
     * Number of bank connections that currently exist for this user.
     */
    "bankConnectionCount": number;
    /**
     * Latest date of when a bank connection was imported for this user, in the format 'YYYY-MM-DD'. This field is null when there has never been a bank connection import.
     */
    "latestBankConnectionImportDate"?: string;
    /**
     * Latest date of when a bank connection was deleted for this user, in the format 'YYYY-MM-DD'. This field is null when there has never been a bank connection deletion.
     */
    "latestBankConnectionDeletionDate"?: string;
    /**
     * Additional information about the user's data or activities, broken down in months. The list will by default contain an entry for each month starting with the month of when the user was registered, up to the current month. The date range may vary when you have limited it in the request. <br/><br/>Please note:<br/>&bull; this field is only set when 'includeMonthlyStats' = true, otherwise it will be null.<br/>&bull; the list is always ordered from the latest month first, to the oldest month last.<br/>&bull; the list will never contain an entry for a month that was prior to the month of when the user was registered, or after the month of when the user was deleted, even when you have explicitly set a respective date range. This means that the list may be empty if you are requesting a date range where the user didn't exist yet, or didn't exist any longer.
     */
    "monthlyStats"?: Array<MonthlyUserStats>;
    /**
     * Whether the user is currently locked (for further information, see the 'maxUserLoginAttempts' setting in your client's configuration). Note that deleted users will always have this field set to 'false'.
     */
    "isLocked"?: boolean;

    static discriminator: string | undefined = undefined;

    static attributeTypeMap: Array<{ name: string; baseName: string; type: string }> = [
      {
        name: "userId",
        baseName: "userId",
        type: "string"
      },
      {
        name: "registrationDate",
        baseName: "registrationDate",
        type: "string"
      },
      {
        name: "deletionDate",
        baseName: "deletionDate",
        type: "string"
      },
      {
        name: "lastActiveDate",
        baseName: "lastActiveDate",
        type: "string"
      },
      {
        name: "bankConnectionCount",
        baseName: "bankConnectionCount",
        type: "number"
      },
      {
        name: "latestBankConnectionImportDate",
        baseName: "latestBankConnectionImportDate",
        type: "string"
      },
      {
        name: "latestBankConnectionDeletionDate",
        baseName: "latestBankConnectionDeletionDate",
        type: "string"
      },
      {
        name: "monthlyStats",
        baseName: "monthlyStats",
        type: "Array<MonthlyUserStats>"
      },
      {
        name: "isLocked",
        baseName: "isLocked",
        type: "boolean"
      }
    ];

    static getAttributeTypeMap() {
      return UserInfo.attributeTypeMap;
    }
  }

  /**
   * User details
   */
  export class UserUpdateParams {
    /**
     * User's new email address. Maximum length is 320. Pass an empty string (\"\") if you want to clear the current email address.
     */
    "email"?: string;
    /**
     * User's new phone number. Maximum length is 50. Pass an empty string (\"\") if you want to clear the current phone number.
     */
    "phone"?: string;
    /**
     * Whether the user's bank connections will get updated in the course of finAPI's automatic batch update. Note that the automatic batch update will only update bank connections where all of the following applies:<br><br> - the PIN is stored in finAPI for the bank connection<br> - the user has accepted the latest Terms and Conditions (this only applies to users whose mandator has PISP license or doesn't have a license at all)<br> - the user has allowed finAPI to use his old stored credentials (this only applies to users which had stored credentials before introducing a web form feature and whose mandator has PISP license or doesn't have a license at all)<br> - the previous update using the stored credentials did not fail due to the credentials being incorrect (or there was no previous update with the stored credentials)<br> - the bank that the bank connection relates to is included in the automatic batch update (please contact your Sys-Admin for details about the batch update configuration)<br><br>Also note that the automatic batch update must generally be enabled for your client in order for this field to have any effect.<br/><br/>WARNING: The automatic update will always download transactions and security positions for any account that it updates! This means that the user will no longer be able to download just the balances for his accounts once the automatic update has run (The 'skipPositionsDownload' flag in the bankConnections/update service can no longer be set to true).
     */
    "isAutoUpdateEnabled"?: boolean;

    static discriminator: string | undefined = undefined;

    static attributeTypeMap: Array<{ name: string; baseName: string; type: string }> = [
      {
        name: "email",
        baseName: "email",
        type: "string"
      },
      {
        name: "phone",
        baseName: "phone",
        type: "string"
      },
      {
        name: "isAutoUpdateEnabled",
        baseName: "isAutoUpdateEnabled",
        type: "boolean"
      }
    ];

    static getAttributeTypeMap() {
      return UserUpdateParams.attributeTypeMap;
    }
  }

  /**
   * User's verification status
   */
  export class VerificationStatusResource {
    /**
     * User's identifier
     */
    "userId": string;
    /**
     * User's verification status
     */
    "isUserVerified": boolean;

    static discriminator: string | undefined = undefined;

    static attributeTypeMap: Array<{ name: string; baseName: string; type: string }> = [
      {
        name: "userId",
        baseName: "userId",
        type: "string"
      },
      {
        name: "isUserVerified",
        baseName: "isUserVerified",
        type: "boolean"
      }
    ];

    static getAttributeTypeMap() {
      return VerificationStatusResource.attributeTypeMap;
    }
  }

  /**
   * Container for a web form's data
   */
  export class WebForm {
    /**
     * Web form identifier, as returned in the 451 response of the REST service call that initiated the web form flow.
     */
    "id": number;
    /**
     * Token for the finAPI web form page, as contained in the 451 response of the REST service call that initiated the web form flow (in the 'Location' header).
     */
    "token": string;
    /**
     * Status of a web form. Possible values are:<br/>&bull; NOT_YET_OPENED - the web form URL was not yet called;<br/>&bull; IN_PROGRESS - the web form has been opened but not yet submitted by the user;<br/>&bull; COMPLETED - the user has opened and submitted the web form;<br/>&bull; ABORTED - the user has opened but then aborted the web form, or the web form was aborted by the finAPI system because it has expired (this is the case when a web form is opened and then not submitted within 20 minutes)
     */
    "status": WebForm.StatusEnum;
    /**
     * HTTP response code of the REST service call that initiated the web form flow. This field can be queried as soon as the status becomes COMPLETED or ABORTED. Note that it is still not guaranteed in this case that the field has a value, i.e. it might be null.
     */
    "serviceResponseCode"?: number;
    /**
     * HTTP response body of the REST service call that initiated the web form flow. This field can be queried as soon as the status becomes COMPLETED or ABORTED. Note that it is still not guaranteed in this case that the field has a value, i.e. it might be null.
     */
    "serviceResponseBody"?: string;

    static discriminator: string | undefined = undefined;

    static attributeTypeMap: Array<{ name: string; baseName: string; type: string }> = [
      {
        name: "id",
        baseName: "id",
        type: "number"
      },
      {
        name: "token",
        baseName: "token",
        type: "string"
      },
      {
        name: "status",
        baseName: "status",
        type: "WebForm.StatusEnum"
      },
      {
        name: "serviceResponseCode",
        baseName: "serviceResponseCode",
        type: "number"
      },
      {
        name: "serviceResponseBody",
        baseName: "serviceResponseBody",
        type: "string"
      }
    ];

    static getAttributeTypeMap() {
      return WebForm.attributeTypeMap;
    }
  }

  export namespace WebForm {
    export enum StatusEnum {
      NOTYETOPENED = <any>"NOT_YET_OPENED",
      INPROGRESS = <any>"IN_PROGRESS",
      COMPLETED = <any>"COMPLETED",
      ABORTED = <any>"ABORTED"
    }
  }
}
