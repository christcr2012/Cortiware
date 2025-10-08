export const pack = {
  key: "landscaping",
  getForm: ()=>({ title: "landscaping form", type:"object", properties: {} }),
  getPriceBook: ()=>({ skus: { base: 1000 } }),
  estimate: (i:any)=>({ total: 10000, lines:[], warnings:["skeleton"] })
};