const db = require('../../utils/databases/mysql');
const schema = require('./schema');

module.exports = class TemporaryUser {
  constructor(_id, firstName, lastName, email, password, countryCode, phoneNumber, client_id, creationTime, updationTime) {
    this._id = _id;
    this.firstName = firstName;
    this.lastName = lastName;
    this.email = email;
    this.password = password;
    this.countryCode = countryCode;
    this.phoneNumber = phoneNumber;
    this.client_id = client_id;
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
    return db.execute(
      'INSERT INTO temporary_user (_id,firstName,lastName,email,password,countryCode,phoneNumber,client_id, creationTime, updationTime) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)',
      [this._id, this.firstName,this.lastName,this.email,this.password,this.countryCode,this.phoneNumber,this.client_id,this.creationTime,this.updationTime]
    );
  }

  static deleteById(id) {
    return db.execute('DELETE FROM temporary_user WHERE temporary_user._id = ?', [id])
  }

  static fetchAll() {
    return db.execute('SELECT * FROM temporary_user');
  }

  static findByEmail(email) {
    return db.execute('SELECT * FROM temporary_user WHERE temporary_user.email = ?', [email]);
  }

  static findById(id) {
    return db.execute('SELECT * FROM temporary_user WHERE temporary_user._id = ?', [id]);
  }

  static findCountrForId(id) {
    return db.execute('SELECT COUNT(*) AS count FROM temporary_user WHERE temporary_user._id = ?', [id]);
  }
};
