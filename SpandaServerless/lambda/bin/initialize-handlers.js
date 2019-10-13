'use strict'

const handlers = require('../lib/ControllerProvider')
const services = handlers(process.env)

const bankController = services.bankController

bankController.getBankByBLZ('66070024').then(resp => console.log(resp))
