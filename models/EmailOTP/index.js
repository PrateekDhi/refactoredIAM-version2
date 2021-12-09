const db = require('../../utils/databases/mysql');
const schema = require('./schema');

module.exports = class EmailOTP {
  constructor(_id, otp, userId, type, expiresAt, service, attemptNumber) {
    this._id = _id;
    this.otp = otp;
    this.userId = userId;
    this.type = type;
    this.expiresAt = expiresAt;
    this.service = service;
    this.attemptNumber = attemptNumber;
  }

  save() {
    const validationResult = schema.validate(this)
    if(validationResult.error) throw new Error(validationResult.error);
    return db.executeQuery(
      'INSERT INTO email_otp (_id, otp, userId, type, expiresAt, service, attemptNumber) VALUES (?, ?, ?, ?, ?, ?, ?)',
      [this._id, this.otp, this.userId, this.type, this.expiresAt, this.service, this.attemptNumber]
    );
  }

  static deleteById(id) {
    return db.executeQuery('DELETE FROM email_otp WHERE email_otp._id = ?', [id])
  }

  static fetchAll() {
    return db.executeQuery('SELECT * FROM email_otp');
  }

  static findById(id) {
    return db.executeQuery('SELECT * FROM email_otp WHERE email_otp.id = ?', [id]);
  }

  static findEmailOtpByUserIdAndOtp(id,otp) {
    return db.executeQuery('SELECT * FROM email_otp WHERE email_otp.userId = ? AND email_otp.otp = ?', [id,otp]);
  }
};
