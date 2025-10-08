export const pack = {
  key: "generic-project",
  getForm: ()=>({ title: "generic-project form", type:"object", properties: {} }),
  getPriceBook: ()=>({ skus: { base: 1000 } }),
  estimate: (i:any)=>({ total: 10000, lines:[], warnings:["skeleton"] })
};