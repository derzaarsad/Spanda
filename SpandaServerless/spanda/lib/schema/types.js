'use strict'

const types = require('pg').types;

const parseNumeric = val => {
  return val === null ? null : parseFloat(val);
}

types.setTypeParser(types.builtins.NUMERIC, parseNumeric)

module.exports = types
