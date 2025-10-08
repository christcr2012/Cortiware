export const pack = {
  key: "pest-control",
  getForm: ()=>({ title: "pest-control form", type:"object", properties: {} }),
  getPriceBook: ()=>({ skus: { base: 1000 } }),
  estimate: (i:any)=>({ total: 10000, lines:[], warnings:["skeleton"] })
};