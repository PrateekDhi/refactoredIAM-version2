const schema = require('./schema');

module.exports = class OauthResponseClient {
  constructor(id,grants,accessTokenLifetime,refreshTokenLifetime,redirectUrisArray,clientName,clientType,clientServices) {
    this.id = id;
    this.grants = JSON.parse(grants);
    this.accessTokenLifetime = accessTokenLifetime;
    this.refreshTokenLifetime = refreshTokenLifetime;
    this.redirectUris = redirectUrisArray;
    this.clientName = clientName;
    this.clientType = clientType;
    this.clientServices = clientServices;
  }

  fetch(){
      return {
          id: this.id,
          grants: this.grants,
          accessTokenLifetime: this.accessTokenLifetime,
          refreshTokenLifetime: this.refreshTokenLifetime,
          redirectUris: this.redirectUris,
          clientName: this.clientName,
          clientType: this.clientType,
          clientServices: this.clientServices
      }
  }
};