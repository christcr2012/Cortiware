export const pack = {
  key: "generic-service",
  getForm: ()=>({ title: "generic-service form", type:"object", properties: {} }),
  getPriceBook: ()=>({ skus: { base: 1000 } }),
  estimate: (i:any)=>({ total: 10000, lines:[], warnings:["skeleton"] })
};