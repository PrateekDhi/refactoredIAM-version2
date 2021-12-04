const schema = require('./schema');

module.exports = class TokenClaim {
  constructor(sub, cid, services, scope) {
    this.sub = sub;
    this.cid = cid;
    this.services = services;
    this.scope = scope;
  }

  fetch(){
    if(this.scope != null){
        return {
            sub: this.sub,
            cid: this.cid,
            services: this.services,
            scope: this.scope
        }
    }else{
        return {
            sub: this.sub,
            cid: this.cid,
            services: this.services,
        }
    }
  }
};