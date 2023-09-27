const express = require("express");
const verifyToken = require("../middleware/tokenMiddleware");
const projectController = require("../controllers/projectController");
const { saveFile } = require("../Utilities/upload");
const router = express.Router();


//post test
router.post('/test', projectController.test)

//ends
router.post("/projectSave",verifyToken,projectController.saveProject );
router.get("/getClientProjectNoParam", verifyToken, projectController.getClientProjectNoParam);
router.get('/getClientProject/:skip/:type',verifyToken, projectController.getClientProject);
router.post('/saveLanPair', verifyToken,projectController.saveLanPair);
router.get('/getFileDetails/:fId',verifyToken, projectController.getFileDetails);
router.get('/getPartnerFiles', verifyToken, projectController.getPartnerFiles);
router.get('/getLanguages',verifyToken, projectController.getLanguages);
router.get('/getByIds/:id',verifyToken, projectController.getById);
router.post("/validateFiles", verifyToken, projectController.validateFiles);
router.post('/fileUpload', verifyToken, saveFile);
router.post('/saveFinalFile',verifyToken, projectController.saveFinalFile);
router.post('/downloadTarget', verifyToken,projectController.downloadTargetFile);
router.post("/getLanguageCode",verifyToken, projectController.getLanguageCode);
router.get('/getUom/:serviceName', verifyToken, projectController.getUom); //not-tested
router.get('/viewFiles/:id', verifyToken, projectController.viewFiles);
router.post('/acceptTask', verifyToken, projectController.accepttask);//not-tested
router.post('/saveMessage', verifyToken, projectController.saveMessage);//not-tested





module.exports = router;