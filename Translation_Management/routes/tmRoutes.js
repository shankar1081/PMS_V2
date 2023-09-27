var express = require("express");
var router = express.Router();

const tmCtrl = require("../controller/tmController");
//Elastic Search Indexing
router.post("/createIndex", tmCtrl.createIndex);
router.post("/updateIndex", tmCtrl.updateIndex);
router.post("/searchIndex", tmCtrl.searchIndexResults);
router.get("/getAllIndexes",tmCtrl.getAllIndexes)
router.get("/retrieveDocuments",tmCtrl.retrieveDocuments)
router.post("/deleteDocument",tmCtrl.deleteDocument)
module.exports = router;