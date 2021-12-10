const db = require('../../utils/databases/mysql');
const schema = require('./schema');

module.exports = class AccessToken {
  constructor(_id, access_token, user, clientId, expiresAt, scope) {
    this._id = _id;
    this.access_token = access_token;
    this.user = user;
    this.clientId = clientId;
    this.expiresAt = expiresAt;
    this.scope = scope || null;
  }

  save() {
    // console.log('INside save')
    const validationResult = schema.validate(this)
    if(validationResult.error) {
      // console.log('------------------------------------------------------------------')
      // console.log('validation error', validationResult.error)
      throw new Error(validationResult.error)
    }
    return db.executeQuery(
      'INSERT INTO access_token (_id, access_token, user, clientId, expiresAt, scope) VALUES (?, ?, ?, ?, ?, ?)',
      [this._id, this.access_token, this.user, this.clientId, this.expiresAt, this.scope]
    );
  }

  static deleteById(id) {}

  static fetchAll() {
    return db.executeQuery('SELECT * FROM access_token');
  }

  static findById(id) {
    return db.executeQuery('SELECT * FROM access_token WHERE access_token._id = ?', [id]);
  }
};
