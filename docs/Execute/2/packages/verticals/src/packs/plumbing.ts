export const pack = {
  key: "plumbing",
  getForm: ()=>({ title: "plumbing form", type:"object", properties: {} }),
  getPriceBook: ()=>({ skus: { base: 1000 } }),
  estimate: (i:any)=>({ total: 10000, lines:[], warnings:["skeleton"] })
};