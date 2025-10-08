export const pack = {
  key: "auto-detail",
  getForm: ()=>({ title: "auto-detail form", type:"object", properties: {} }),
  getPriceBook: ()=>({ skus: { base: 1000 } }),
  estimate: (i:any)=>({ total: 10000, lines:[], warnings:["skeleton"] })
};