const {db} = require('../../utils/databases/mysql');
const schema = require('./schema');

module.exports = class User {
  constructor(_id, firstName, middleName, lastName, email, username, password, countryCode, phoneNumber, dateOfBirth, gender, phoneNumberVerificationStatus, usingDefaultUsername, creationTime, updationTime) {
    this._id = _id;
    this.firstName = firstName;
    this.middleName = middleName || null;
    this.lastName = lastName;
    this.email = email;
    this.username = username;
    this.password = password;
    this.countryCode = countryCode;
    this.phoneNumber = phoneNumber;
    this.dateOfBirth = dateOfBirth || null;
    this.gender = gender || null;
    this.phoneNumberVerificationStatus = phoneNumberVerificationStatus;
    this.usingDefaultUsername = usingDefaultUsername;
    this.creationTime = creationTime;
    this.updationTime = updationTime;
    // console.log(this.middleName)
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
      'INSERT INTO user (_id, firstName, middleName, lastName, email, username, password, countryCode, phoneNumber, dateOfBirth, gender, phoneNumberVerificationStatus, usingDefaultUsername, creationTime, updationTime) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)',
      [this._id, this.firstName, this.middleName, this.lastName, this.email, this.username, this.password, this.countryCode, this.phoneNumber, this.dateOfBirth, this.gender, this.phoneNumberVerificationStatus, this.usingDefaultUsername, this.creationTime, this.updationTime]
    );
  }

  static deleteById(id) {}

  static fetchAll() {
    return db.execute('SELECT * FROM user');
  }

  static findByEmail(email) {
    return db.execute('SELECT * FROM user WHERE user.email = ?', [email]);
  }

  static findByUsername(username) {
    return db.execute('SELECT * FROM user WHERE user.username = ?', [username]);
  }

  static findById(id) {
    return db.execute('SELECT * FROM user WHERE user.id = ?', [id]);
  }

  static findEmailByUsername(username){
    return db.execute('SELECT email FROM user WHERE user.username = ?', [username]);
  }

  static findCountForUsername(username){
    return db.execute('SELECT COUNT(*) FROM user WHERE user.username = ?', [username]);
  }
};
