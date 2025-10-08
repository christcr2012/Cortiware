export const pack = {
  key: "snow-removal",
  getForm: ()=>({ title: "snow-removal form", type:"object", properties: {} }),
  getPriceBook: ()=>({ skus: { base: 1000 } }),
  estimate: (i:any)=>({ total: 10000, lines:[], warnings:["skeleton"] })
};