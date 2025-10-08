export const pack = {
  key: "pressure-washing",
  getForm: ()=>({ title: "pressure-washing form", type:"object", properties: {} }),
  getPriceBook: ()=>({ skus: { base: 1000 } }),
  estimate: (i:any)=>({ total: 10000, lines:[], warnings:["skeleton"] })
};