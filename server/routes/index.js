module.exports = [
  {
    method: "GET",
    path: "/get/dropdown/values",
    handler: "myController.getDropDownData",
  },
  {
    method: "GET",
    path: "/get/content-type/schema/:uid",
    handler: "myController.getContentTypeSchema",
  },
  {
    method: "GET",
    path: "/get/table/data",
    handler: "myController.getTableData",
  },
  {
    method: "GET",
    path: "/download/excel",
    handler: "myController.downloadExcel",
  },
];
