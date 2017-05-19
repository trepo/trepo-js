const {Kind} = require('graphql/language');

const parse = ast => {
  switch (ast.kind) {
    case Kind.STRING:
    case Kind.BOOLEAN:
      return ast.value;
    case Kind.INT:
    case Kind.FLOAT:
      return parseFloat(ast.value);
    case Kind.OBJECT: {
      const value = Object.create(null);
      ast.fields.forEach(field => {
        value[field.name.value] = parse(field.value);
      });
      return value;
    }
    case Kind.LIST:
      return ast.values.map(parse);
    default:
      return null;
  }
};

module.exports = {
  __parseLiteral: parse,
  __serialize: value => value,
  __parseValue: value => value,
};
