module.exports = [
  {
    method: "GET",
    path: "/get/dropdown/values",
    handler: "myController.getDropDownData",
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
