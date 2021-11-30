const db = require('../../utils/databases/mysql');
const schema = require('./schema');

module.exports = class Client {
  constructor(_id, clientType, clientName, clientSecret, clientServices, redirectUri, grantType, accessTokenLifetime, refreshTokenLifetime, creationTime, updationTime) {
    this._id = _id;
    this.clientType = clientType;
    this.clientName = clientName;
    this.clientSecret = clientSecret;
    this.clientServices = clientServices;
    this.redirectUri = redirectUri;
    this.grantType = grantType;
    this.accessTokenLifetime = accessTokenLifetime;
    this.refreshTokenLifetime = refreshTokenLifetime;
    this.creationTime = creationTime;
    this.updationTime = updationTime;
  }

  save() {
    // console.log('INside save')
    const validationResult = schema.validate(this)
    if(validationResult.error) {
      // console.log('------------------------------------------------------------------')
      // console.log('validation error', validationResult.error)
      throw new Error(validationResult.error)
    }
    //TODO: Corrections to be done
    // return db.execute(
    //   'INSERT INTO client (id, firstName, middleName, lastName, email, username, password, countryCode, phoneNumber, dateOfBirth, gender, phoneNumberVerficationStatus, usingDefaultUsername, creationTime, updationTime) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)',
    //   [this.id, this.firstName, this.middleName, this.lastName, this.email, this.username, this.password, this.countryCode, this.phoneNumber, this.dateOfBirth, this.gender, this.phoneNumberVerficationStatus, this.usingDefaultUsername, this.creationTime, this.updationTime]
    // );
  }

  static deleteById(id) {}

  static fetchAll() {
    return db.execute('SELECT * FROM client');
  }

  static findById(id) {
    return db.execute('SELECT * FROM client WHERE client._id = ?', [id]);
  }

  static findSecretById(id) {
    return db.execute('SELECT clientSecret FROM client WHERE client._id = ?', [id]);
  }

  static findGrantTypeById(id){
    return db.execute('SELECT grantType FROM client WHERE client._id = ?', [id]);
  }
};
