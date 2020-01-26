import pg from "pg";

const types = pg.types;

const parseNumeric = (val: any) => {
  return val === null ? null : parseFloat(val);
};

types.setTypeParser(types.builtins.NUMERIC, parseNumeric);

export default types;
