const express = require("express");
const verifyToken = require("../middleware/tokenMiddleware");
const projectController = require("../controllers/projectController");
const { saveFile } = require("../Utilities/upload");
const router = express.Router();


//post test
router.get("/test/:id", projectController.test)

//ends
router.post("/projectSave",verifyToken,projectController.saveProject );
router.get("/getClientProjectNoParam", verifyToken, projectController.getClientProjectNoParam);
router.get("/getClientProject/:skip/:type",verifyToken, projectController.getClientProject);
router.post("/saveLanPair", verifyToken,projectController.saveLanPair);
router.get("/getFileDetails/:fId",verifyToken, projectController.getFileDetails);
router.get("/getPartnerFiles/:skip", verifyToken, projectController.getPartnerFiles);
router.get("/getLanguages",verifyToken, projectController.getLanguages);
router.get("/getByIds/:id",verifyToken, projectController.getById);
router.post("/validateFiles", verifyToken, projectController.validateFiles);
router.post("/fileUpload", verifyToken, saveFile);
router.post("/saveFinalFile",verifyToken, projectController.saveFinalFile);
router.post("/downloadTarget", verifyToken,projectController.downloadTargetFile);
// router.post("/getLanguageCode",verifyToken, projectController.getLanguageCode);
// router.get("/getUom/:serviceName", verifyToken, projectController.getUom); //not-tested
router.get("/viewFiles/:id", verifyToken, projectController.viewFiles);
router.post("/acceptTask", verifyToken, projectController.accepttask);//not-tested
router.post("/saveMessage", verifyToken, projectController.saveMessage);//not-tested
router.post("/getFiles", verifyToken,projectController.getFiles);
router.post('/finalFileDownload', verifyToken,projectController.finalFileDownload);
router.post("/downloadFile",verifyToken,projectController.downloadFile);
router.post("/mergeRows",verifyToken,projectController.mergeRows)
router.post("/uploadCompleted",verifyToken,projectController.CompletedFile);
router.post("/saveVendor",verifyToken,projectController.saveVendor); // needs more testing
router.post("/deleteTask",verifyToken,projectController.deleteAssignedTasks);
router.post("/getPartner",verifyToken,projectController.getPartner);
router.post("/savePartnerWordCount", verifyToken,projectController.addPartnerCount);
router.post("/editFileType",verifyToken,projectController.editFileType);
router.post("/uploadTemplate",verifyToken,projectController.uploadTemplate);
router.post("/assignBulkVendor",verifyToken,projectController.assignBulkVendor);
router.post("/projectreportpa",verifyToken,projectController.projectreportpa);
router.post("/filesReports",verifyToken,projectController.filesReports);
router.post("/e2bfilesReports", verifyToken,projectController.e2bfilesReports);
router.post("/icsrfilesReports", verifyToken,projectController.icsrfilesReports);
router.post("/getFilesCountReport",verifyToken,projectController.getFilesCountReport);
router.post("/getFullFilesCount",verifyToken,projectController.getFullCountFilesReport);
router.post("/getProjectsCountReport", verifyToken,projectController.getProjectsCount);
router.post("/getFullProjectsCount",verifyToken,projectController.getFullProjectsCount);
// router.post('/UploadTCFile',verifyToken,projectController.UploadTCFile); // not-tested
router.post("/getDailyReport",verifyToken,projectController.getDailyReport);
router.post("/getLanguageWordCount",verifyToken,projectController.getWordCountByLanguage);
module.exports = router;
