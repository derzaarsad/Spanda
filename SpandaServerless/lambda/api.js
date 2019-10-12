// const axios = require('axios')
// const url = 'http://checkip.amazonaws.com/';
let response;

// const authenticationController = authenticationController.NewLambdaController(logger, clientSecrets, authentication, finapi, users)

/**
 *
 * Event doc: https://docs.aws.amazon.com/apigateway/latest/developerguide/set-up-lambda-proxy-integrations.html#api-gateway-simple-proxy-for-lambda-input-format
 * @param {Object} event - API Gateway Lambda Proxy Input Format
 *
 * Context doc: https://docs.aws.amazon.com/lambda/latest/dg/nodejs-prog-model-context.html
 * @param {Object} context
 *
 * Return doc: https://docs.aws.amazon.com/apigateway/latest/developerguide/set-up-lambda-proxy-integrations.html
 * @returns {Object} object - API Gateway Lambda Proxy Output Format
 *
 */
exports.lambdaHandler = async (event, context) => {
  try {
    // const ret = await axios(url);
    response = {
      'statusCode': 200,
      'body': JSON.stringify({
        message: 'hello world',
        // location: ret.data.trim()
      })
    }
  } catch (err) {
    console.log(err);
    return err;
  }

  return response
};


/*
 * Authentication Controller
 * -------------------------
 */

// @Get('/users')
// @Header('Authorization') authorization: string
exports.isUserAuthenticated = async (event, context) => {
  // call authenticationController.isUserAuthenticated
}

// @Post('/users')
// @BodyProp() id: string
// @BodyProp() password
// @BodyProp() email: string
// @BodyProp() phone: string
// @BodyProp() isAutoUpdateEnabled: boolean
exports.register = async (event, context) => {
  // call authenticationController.registerUser
}

// @Post('/oauth/login')
// @BodyProp() username: string,
// @BodyProp() password: string
exports.authenticateAndSave = async (event, context) => {
  // call authenticationController.authenticateAndSave
}

// @Post('/oauth/token')
// @BodyProp() refresh_token: string
exports.updateRefreshToken = async (event, context) => {
  // call authenticationController.updateRefreshToken(refreshToken)
}

/*
 * Bank Controller
 * ---------------
 */

// @Get('/banks/{blz}')
// @Param('blz') blz
exports.getBankByBLZ = async (event, context) => {
}

// @Post('/bankConnections/import')
// @Header('Authorization') authorization: string,
// @BodyProp() bankId: number)
exports.getWebformId = async (event, context) => {
  // call api.importConnection
}

// @Get('/webForms/{webId}')
// @Param('webId') webId
// @Header('Username') username
// @Header('Authorization') authorization: string
exports.fetchWebFormInfo = async (event, context) => {
  // fetch user by id; if non existing, return immediately
  // get the form by the given id
  // create a new bank connection
  // update the user's bank connections
}

// @Get('/allowance')
// @Header('Username') username
// @Header('Authorization') authorization: string
exports.getAllowance = async (event, context) => {
  // fetch the user by id
  // return their allowance { allowance: user.allowance }
}
