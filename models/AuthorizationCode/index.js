const db = require('../../utils/databases/mysql');
const schema = require('./schema');

module.exports = class AuthorizationCode {
  constructor(_id, authorizationCode, user, clientId, expiresAt, redirectUri, scope) {
    this._id = _id;
    this.authorizationCode = authorizationCode;
    this.user = user;
    this.clientId = clientId;
    this.expiresAt = expiresAt;
    this.redirectUri = redirectUri;
    this.scope = scope;
  }

  save() {
    // console.log('INside save')
    const validationResult = schema.validate(this)
    if(validationResult.error) {
      // console.log('------------------------------------------------------------------')
      // console.log('validation error', validationResult.error)
      throw new Error(validationResult.error)
    }
    return db.execute(
      'INSERT INTO authorization_code (_id, access_token, user, clientId, expiresAt, scope) VALUES (?, ?, ?, ?, ?, ?)',
      [this._id, this.access_token, this.user, this.clientId, this.expiresAt, this.scope]
    );
  }

  static deleteById(id) {}

  static fetchAll() {
    return db.execute('SELECT * FROM authorization_code');
  }

  static findById(id) {
    return db.execute('SELECT * FROM authorization_code WHERE authorization_code._id = ?', [id]);
  }
};
