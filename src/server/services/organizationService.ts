export class ServiceError extends Error{statusCode:number;code:string;details?:any;constructor(statusCode:number,code:string,message:string,details?:any){super(message);this.statusCode=statusCode;this.code=code;this.details=details;}}

type OrgInput={name?:string;domain?:string};

export const organizationService={
  async list(_orgId:string,_opts:any){return{items:[],page:1,limit:20,total:0}},
  async create(_orgId:string,_userId:string,input:OrgInput){return{ id:'org_'+Math.random().toString(36).slice(2,8), ...input}},
  async getById(_orgId:string,id:string){return{ id, name:'Placeholder Org'}},
  async update(_orgId:string,_userId:string,id:string,input:OrgInput){return{ id, ...input}},
  async delete(_orgId:string,_userId:string,_id:string){return{ ok:true }},
};

