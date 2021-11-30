const db = require('../../utils/databases/mysql');
const schema = require('./schema');

module.exports = class RefreshToken {
  constructor(_id, refresh_token, user, clientId, expiresAt, accessTokenId) {
    this._id = _id;
    this.refresh_token = refresh_token;
    this.user = user;
    this.clientId = clientId;
    this.expiresAt = expiresAt;
    this.accessTokenId = accessTokenId;
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
      'INSERT INTO refresh_token (_id, refresh_token, user, clientId, expiresAt, accessTokenId) VALUES (?, ?, ?, ?, ?, ?)',
      [this._id, this.refresh_token, this.user, this.clientId, this.expiresAt, this.accessTokenId]
    );
  }

  static deleteById(id) {}

  static fetchAll() {
    return db.execute('SELECT * FROM refresh_token');
  }

  static findById(id) {
    return db.execute('SELECT * FROM refresh_token WHERE refresh_token._id = ?', [id]);
  }
};
