const path = require("path");
const fs = require("fs");
const JSZip = require("jszip");
const MsgReader = require("@kenjiuno/msgreader").default;
const wiproFile = require("../models/FileDetails");
const { generateEmailTemplate } = require("../Utilities/emailTemplate");
const { sendMail } = require("../Utilities/emailService");
require("dotenv").config({ path: "./config/.env" });
const response = require("../Utilities/response");
const CProject = require("../models/Project");
const srcDir = process.env.SRC_DIR;
const uploadPath = process.env.UPLOAD_PATH;
const Languages = require("../models/languages");
const Archiver = require('archiver');
const Service = require('../models/servicesUom');
const User = require('../models/users');
const {folderUpload} = require('../Utilities/upload')

/**TEST */

const test = async (req,res)=>{
  console.log(req.body.data[0].folderFiles.fileId)
  await res.send(req.body.data[0].folderFiles.fileId)
}

/**ENDS */


/** SAVE NEW PROJECT */

if (!process.env.SRC_DIR) {
  console.error("SRC_DIR environment variable is not set.");
}
const saveCProject = async (body, fileArray, user) => {
  try {
    let data = await CProject.count();

    let newProject = new CProject({
      projectName: body.projectName + data,

      projectType: body.projectType,

      projectStatus: "Init",

      tat: body.tat,

      insFile: body.insFile,

      sourceLanguage: body.sourceLanguage,

      targetLanguage: body.targetLanguage,

      notes: body.notes,

      tnotes: body.tnotes,

      projectFile: body.projectFile[0],

      createdOn: body.createdOn,

      folderFiles: fileArray,

      country: body.country,

      poNumber: body.poNumber,

      priority: body.priority,

      completedFiles: 0,

      userId: user.user._id,

      userName: user.user.name,
    });

    const pro = await newProject.save();

    if (pro) {
      await pro.folderFiles.forEach(async (element) => {
        let emailParams = {
          projectName: body.projectName + data,

          sourceLanguage: body.sourceLanguage,

          targetLanguage: body.targetLanguage,

          userName: user.user.name,

          filesLength: pro.folderFiles.length,
        };

        let html = await generateEmailTemplate("projectSave", emailParams);

        sendMail(
          [
            "karan.dhawan@parexel.com",
            "ritika.trehan@parexel.com",
            "anjana.saklani@parexel.com",
            "vikas.kumar1@parexel.com",
            "amit.kumar3@parexel.com",
          ],
          "parexel@knowledgew.com",
          newProject.projectName + "-Project Created",
          html
        );
      });

      return { statusCode: 200 };
    } else {
      return { success: false, msg: "Failed to create the project" };
    }
  } catch (err) {
    console.error(err);

    let errorResponse = response.generateResponse(
      err,
      "Project Creation Failed",
      500,
      null
    );

    throw errorResponse; // If you want to propagate the error
  }
};

const saveProject = async function (req, res) {
  //console.log("req.body.projectFile",req.body.projectFile);
  try {
    let fileArray = [];
    if (req.body.projectFile) {
      // Construct the source directory path
      let srcDir = path.join(__dirname, req.body.projectFile[0]);
      // console.log("srcDir========>", srcDir);

      // Construct the target directory path
      let tarDir = path.join(__dirname, srcDir);
      let ext = path.extname(srcDir);

      // Count the number of projects
      let data1 = await CProject.count();
      const promises = [];

      if (ext === ".zip") {
        // Read the ZIP file
        const data = await fs.promises.readFile(srcDir);
        const zip = await JSZip.loadAsync(data);
        const files = Object.keys(zip.files);

        for (let i = 0; i < files.length; i++) {
          const fileName = path.basename(files[i + 1]);
          const ggg = {
            fileId: `${req.body.projectName}${data1}_${i + 1}`,
            filePath: fileName,
            fileStatus: "Init",
            fileType: fileName.split(".")[1],
            fileName,
          };
          fileArray.push(ggg);
        }

        // Extract files from the ZIP archive
        await extractAsync(srcDir, { dir: tarDir });
      } else if (ext !== ".zip") {
        const filesProcess = req.body.projectFile;

        for (let i = 0; i < filesProcess.length; i++) {
          const extFile = path.extname(req.body.projectFile[i]);

          if (extFile === ".msg") {
            const data = await fs.promises.readFile(
              path.join(__dirname, srcDir + req.body.projectFile[i])
            );
            const testMsg = new MsgReader(data);
            const testMsgInfo = testMsg.getFileData();

            if (testMsgInfo.attachments.length > 0) {
              await Promise.all(
                testMsgInfo.attachments.map(async (att, index) => {
                  if (att.fileName) {
                    const fileName = `${randomString()}_${att.fileName}`;
                    await fs.promises.writeFile(
                      path.join(__dirname, srcDir + fileName),
                      testMsg.getAttachment(att).content
                    );
                    const extMsg = path.extname(fileName);

                    if (
                      !(
                        extMsg === ".jpeg" ||
                        extMsg === ".jpg" ||
                        extMsg === ".png" ||
                        extMsg === ".msg"
                      )
                    ) {
                      fileArray.push(fileName);
                    }
                  }
                })
              );
            }
          } else if (extFile === ".eml") {
            const eml = await fs.promises.readFile(
              path.join(__dirname, srcDir + req.body.projectFile[i]),
              "utf-8"
            );
            const data = await emlformat.unpackAsync(
              eml,
              path.join(__dirname, srcDir)
            );

            if (data.files.length > 0) {
              data.files.forEach((file) => {
                fileArray.push(`${randomString()}_${file}`);
              });
            } else {
              fileArray.push(req.body.projectFile[i]);
            }
          } else {
            fileArray.push(req.body.projectFile[i]);
          }
        }
      }

      // Create an array of projects
      const noOfProjects = fileArray.map((data, index) => {
        const extFiledata = path.extname(data) || "pdf / docx";
        return {
          fileId: `${req.body.projectName}${data1}_${index + 1}`,
          filePath: data,
          fileStatus: "Init",
          fileType: extFiledata,
          fileName: data,
        };
      });

      // Save the project
      await saveCProject(req.body, noOfProjects, req.user);

      // Send a success response
      res.json({ statusCode: 200 });
    } else {
      // Handle the case where projectFile is undefined
      let errorResponse = response.generateResponse(
        "err",
        "projectFile is missing in the request body",
        500,
        null
      );
      res
        .status(400)
        .send(errorResponse);
    }
  } catch (error) {
    let errorResponse = response.generateResponse(
      error,
      "Project Creation Failed",
      500,
      null
    );
    res.status(500).send(errorResponse);
  }
};

/**ENDS */

/**GET PROJECTS */

function isSortedDescendingByDateTime(data) {
  for (let i = 0; i < data.length - 1; i++) {
    const currentDateTime = new Date(data[i].createdOnDate).getTime();
    const nextDateTime = new Date(data[i + 1].createdOnDate).getTime();

    if (currentDateTime < nextDateTime) {
      return false;
    }
  }
  return true;
}

const getClientProjectNoParam = async (req, res) => {
  try {
    const results = await CProject.aggregate([
      {
        $addFields: {
          createdOnDate: {
            $dateFromString: {
              dateString: "$createdOn",
            },
          },
        },
      },

      {
        $sort: { createdOnDate: -1 }, // Sort by the newly added createdOnDate field
      },

      {
        $skip: req.params.skip ? parseInt(req.params.skip) : 0,
      },

      {
        $limit: 500,
      },

      {
        $project: {
          projects: "$$ROOT",

          createdOn: 1, // Include the original createdOn field if needed

          completed: {
            $filter: {
              input: "$folderFiles",

              as: "file",

              cond: { $eq: ["$$file.fileStatus", "Completed"] },
            },
          },

          errored: {
            $filter: {
              input: "$folderFiles",

              as: "file",

              cond: { $eq: ["$$file.fileStatus", "Error Reported"] },
            },
          },
        },
      },
    ]).exec();

    console.log("results ----->", results);

    res.json(results);

    // Check if the sorted data is in descending order by date

    const isSorted = isSortedDescendingByDateTime(results);

    console.log("Is data sorted correctly by date and time?", isSorted);
  } catch (err) {
    let errorResponse = response.generateResponse(
      err,
      "An error occurred",
      500,
      null
    );
    res.status(500).send(errorResponse); // Respond with an error status and message
  }
};

const getClientProject = async (req, res) => {
  try {
    const type = parseInt(req.params.type) || 0;

    const skip = parseInt(req.params.skip) || 0;

    if (isNaN(type) || isNaN(skip)) {
      return res.status(400).json({ error: "Invalid skip or type parameter" });
    }

    const Pipeline = [
      {
        $match: { projectType: req.params.type },
      },

      {
        $addFields: {
          createdOnDate: {
            $dateFromString: {
              dateString: "$createdOn",
            },
          },
        },
      },

      {
        $sort: { cDate: -1 },
      },

      {
        $skip: req.params.skip ? parseInt(req.params.skip) : 0,
      },

      {
        $limit: 500,
      },

      {
        $project: {
          projects: "$$ROOT",

          createdOn: 1,

          completed: {
            $filter: {
              input: "$folderFiles",

              as: "file",

              cond: { $eq: ["$$file.fileStatus", "Completed"] },
            },
          },

          errored: {
            $filter: {
              input: "$folderFiles",

              as: "file",

              cond: { $eq: ["$$file.fileStatus", "Error Reported"] },
            },
          },
        },
      },
    ];

    const results = await CProject.aggregate(Pipeline);

    if (results.length === 0) {
      return res.status(404).json({ error: "No matching projects found" });
    }

    res.json(results);

    console.log("Result----------------->", results);
  } catch (err) {
    let errorResponse = response.generateResponse(
      err,
      "An error occurred",
      500,
      null
    );
    res.status(500).send(errorResponse);
  }
};

// GET PARTNER FILES

const getPartnerFiles = async (req, res) => {
  try {
    const aggregateQuery = [
      { $unwind: "$folderFiles" },

      { $unwind: "$folderFiles.tasks" },

      { $sort: { "folderFiles.createdOn": -1 } }, // Sort the results by 'createdOn' in descending order

      {
        $match: {
          $or: [
            { "folderFiles.tasks.partnerId": req.user.user.empId },

            { "folderFiles.tasks.closedBy": req.user.user.empId },
          ],
        },
      },

      { $limit: 200 },
    ];

    // Execute the aggregation query using await

    const data = await CProject.aggregate(aggregateQuery);
    if (data) {
      res.json(data);
    } else {

      let errorResponse = response.generateResponse(
        err,
        "No Data Found",
        500,
        null
      );
      res.status(404).send(errorResponse);; // Send a 404 response if no data is found
    }
  } catch (err) {
    let errorResponse = response.generateResponse(
      err,
      "An error occurred",
      500,
      null
    );
    res.status(500).send(errorResponse); // Send a 500 response for internal server error
  }
};

/**ends */

const saveLanPair = async (req, res) => {
  try {
    const { pid, fid, sl, tl } = req.body;

    const updatedProject = await CProject.findOneAndUpdate(
      { _id: pid, "folderFiles._id": fid },
      {
        $set: {
          "folderFiles.$.sl": sl,
          "folderFiles.$.tl": tl,
          "folderFiles.$.fileStatus": "Lang Saved",
        },
      },
      { new: true }
    );

    if (updatedProject) {
      return res.json({ statusCode: 200 });
    }

    return res.status(404).json({ error: "Project or file not found" });
  } catch (err) {
    let errorResponse = response.generateResponse(
      err,
      "An error occurred",
      500,
      null
    );
    res.status(500).send(errorResponse);
  }
};

/**FILE DETAILS */

const getFileDetails = async (req, res) => {
  try {
    const details = await wiproFile.findOne({ fid: req.params.fId });

    if (details) {
      return res.json(details);
    } else {
      return res.status(404).json({ error: "File not found" });
    }
  } catch (err) {
    let errorResponse = response.generateResponse(
      err,
      "An error occurred",
      500,
      null
    );
    res.status(500).send(errorResponse);
  }
};

/**ENDS */

/**GET LANGUAGES */

const getLanguages = async (req, res) => {
  try {
    const languages = await Languages.find({}).sort({ languageName: 1 }).exec();
    res.json(languages);
  } catch (err) {
    let errorResponse = response.generateResponse(
      err,
      "An error occurred",
      500,
      null
    );
    res.send(errorResponse);
  }
};

/**ENDS */

/**GET PROJECTS BY ID */

const getById = async (req, res) => {
  try {
    const projects = await CProject.findById({ _id: req.params.id }).exec();
    res.json(projects);
  } catch (err) {
    let errorResponse = response.generateResponse(
      err,
      "An error occurred",
      500,
      null
    );
    res.send(errorResponse);
  }
};

/**ENDS */

/**VALIDATE FILES */

const validateFiles = async (req, res) => {
  try {
    const validate = () => {
      let invalidFiles = [];

      // Change only here

      let files = req.body.files;

      console.log("TYPEOF", typeof files);

      console.log("req.body.files", req.body.files);

      files.forEach((file, index) => {
        if (file.fileStatus !== "Error Reported") {
          if (
            !fs.existsSync(path.join(__dirname, uploadPath, file.completedFile))
          ) {
            invalidFiles.push({
              file: file.completedFile,

              type: "final",

              fileId: file.fileId,
            });
          }

          if (
            !fs.existsSync(path.join(__dirname, uploadPath, file.signatureFile))
          ) {
            invalidFiles.push({
              file: file.signatureFile,

              type: "sign",

              fileId: file.fileId,
            });
          }

          if (index !== req.body.files - 1) {
            console.log("validate() returning:", invalidFiles);

            return invalidFiles;
          }
        } else {
          return invalidFiles;
        }
      });

      // Change only here

      return invalidFiles; // Return the result here
    };

    const response = await validate();

    res.send(response);

    console.log("response:", response);
  } catch (error) {
    let errorResponse = response.generateResponse(
      error,

      "An error occurred",

      500,

      null
    );

    res.send(errorResponse);

    console.log(error);

    // console.log(files)
  }
};

const validateFiles2 = async (req, res) => {
  try {
    const files = req.body.files;
    console.log(files);
    let invalidFiles = [];

    for (let index = 0; index < files.length; index++) {
      const file = files[index];

      if (file.fileStatus !== "Error Reported") {
        const completedFilePath = path.join(
          __dirname,
          uploadPath,
          file.completedFile
        );
        const signatureFilePath = path.join(
          __dirname,
          uploadPath,
          file.signatureFile
        );

        if (!fs.existsSync(completedFilePath)) {
          invalidFiles.push({
            file: file.completedFile,
            type: "final",
            fileId: file.fileId,
          });
        }
        if (!fs.existsSync(signatureFilePath)) {
          invalidFiles.push({
            file: file.signatureFile,
            type: "sign",
            fileId: file.fileId,
          });
        }
      }
    }

    res.send(invalidFiles);
  } catch (error) {
    let errorResponse = response.generateResponse(
      error,
      "An error occurred",
      500,
      null
    );
    res.status(500).send(errorResponse);
  }
};

/**ENDS */

/**SAVE FINAL FILE */
const saveFinalFile = async (req, res) => {
  try {
    const data = await CProject.updateOne(
      { _id: req.body.pid },
      { $set: { closedOn: req.body.closedOn, projectStatus: "Completed" } }
    );

    if (data) {
      let emailParams = {
        prname: req.body.prname,
      };

      let html = generateEmailTemplate("finalSave", emailParams);
      await sendMail(
        [
          "karan.dhawan@parexel.com",
          "ritika.trehan@parexel.com",
          "anjana.saklani@parexel.com",
          "vikas.kumar1@parexel.com",
          "amit.kumar3@parexel.com",
          "parexel@knowledgew.com",
        ],
        req.user.user.email,
        req.body.prname + "-Project Completed",
        html
      );

      res.json({ statusCode: 200 });
    } else {
      throw new Error("An error occurred");
    }
  } catch (error) {
    let errorResponse = response.generateResponse(error, "An error occurred", 500, null);
    res.status(500).send(errorResponse);
  }
};
/**ENDS */

/**DOWNLOAD TARGET FILE */

const downloadTargetFile = async (req, res) => {
  let archive = await Archiver("zip");
  archive.on("error", function (err) {
    res.status(500).send({ error: err.message });
  });
  archive.pipe(res);
  for (let i = 0; i < req.body.fileName.length; i++) {
    const file1 = path.join(
      process.cwd(), "uploads",
      req.body.fileName[i]
    );
    archive.append(fs.createReadStream(file1), {
      name: req.body.fileName[i].slice(8),
    });
  }
  archive.finalize();
  res.attachment("file-txt.zip");
};

/**ENDS */

/**DOWNLOAD FILE */

const downloadFile = async (req, res) => {
  try {
    const file = await path.join(__dirname, '../public/assets/Upload/', req.body.fileName)
    res.sendFile(file);

  } catch (error) {
    let errorResponse = response.generateResponse(error, "An error occurred", 500, null);

    res.status(500).send(errorResponse);
  }

}

/**ENDS */

/**FINAL FILE DOWNLOAD */

const finalFileDownload = async (req, res) => {
  const file = await CProject.updateOne({ _id: req.body.pid, "folderFiles._id": req.body.fid }, { $set: { "folderFiles.$.fileStatus": "Downloaded" } }, function (err, data) {
    if (data) {
      res.sendFile(path.join(__dirname, '../angular5/src/assets/upload/Translated', req.body.fid + ".pdf"));
    } else {
      console.log(JSON.stringify(err))
    }
  })
}

/**ends */

/**DOWNLOAD FILE */

module.exports.downloadFile = function (req, res) {
  res.sendFile(path.join(__dirname, '../public/assets/Upload/', req.body.fileName));

}

/**ENDS */

/**GET LANGUAGE CODES */

const getLanguageCode = function (req, res) {


  langaugeCodes.findOne({ name: req.body.source }, function (errs, sourcedata) {
    console.log(errs)
    langaugeCodes.findOne({ name: req.body.target }, function (errt, targetdata) {
      console.log(errt)
      res.status(200).send({ sourcedata: sourcedata, targetdata: targetdata })
    })
  })
}

/**Ends */

/**GET UOM */

const getUom = async (req, res) => {
  try {

    const services = await Service.findOne({ servicesName: req.params.serviceName }).sort({ uom: 1 })
    await res.json(services)

  } catch (error) {

    let errorResponse = response.generateResponse(error, "An error occurred", 500, null);
    res.status(500).send(errorResponse);

  }
};

/**Ends */

/**VIEW FILES */

const viewFiles = async (req, res) => {

  try {

    const prodet = await CProject.findOne({ _id: req.params.id }).exec();



    if (prodet) {

      const promises = [];

      prodet.folderFiles.forEach(function (element, index) {

        element.tasks.forEach(function (task) {

          var assignpromise = new Promise(async (resolve, reject) => {

            try {

              const user = await users.findOne({ empId: task.partnerId }).exec();

              if (user !== null) {

                task.assignedName = user.name;

              } else {

                task.assignedName = '';

              }

              resolve(task);

            } catch (error) {

              reject(error);

            }

          });

          promises.push(assignpromise);

        });

      });

      const result = await Promise.all(promises);

      res.send(prodet);

      console.log("result====", result);

    }

  } catch (error) {

    let errorResponse = response.generateResponse(error, "An error occurred", 500, null);

    res.status(500).send(errorResponse);

  }

};

/**ENDS */

/** ACCEPT TASK */

// const accepttask = async (req, res) => {
//   try {

//     var fileId = req.body.folderFiles.fileId;
//     var taskId = req.body.folderFiles.tasks._id;

//     if (req.body.folderFiles.fileId) {
//       const accept = await CProject.updateOne({ _id: req.body._id, "folderFiles.fileId": req.body.folderFiles.fileId }, {
//         $set: {
//           "folderFiles.$[outer].tasks.$[inner]": req.body.folderFiles.tasks,

//         }
//       }, {
//         "arrayFilters": [
//           { "outer.fileId": fileId },
//           { "inner._id": ObjectId(taskId) }
//         ]
//       })

//       console.log(accept)
//       res.json(accept)
//     } else {
//       throw new Error('File Id not found')
//     }

//   } catch (error) {

//     let errorResponse = response.generateResponse(error, "An error occurred", 500, null);

//     res.status(500).send(errorResponse);
//   }

// }

const accepttask = async (req, res) => {
  try {
    let fileId = req.body['folderFiles.fileId'];
    let taskId = req.body['folderFiles.tasks._id'];
    const updatedTasks = req.body['folderFiles.tasks'];
    if (req.body['folderFiles.fileId']) {
      const accept = await CProject.updateOne({ _id: req.body._id, "folderFiles.fileId": fileId }, {
        $set: {
          "folderFiles.$[outer].tasks": updatedTasks
        }
      }, {
        "arrayFilters": [
          { "outer.fileId": fileId },
          { "inner._id": new ObjectId(taskId) }
        ]
      })
      console.log(accept)
      res.json(accept)

    } else {
      throw new Error('File Id not found')
    }
  } catch (error) {
    let errorResponse = response.generateResponse(error, "An error occurred", 500, null);
    res.status(500).send(errorResponse);
    console.log(error)
  }
}

/**ENDS */

/**SAVE MESSAGE */

const saveMessage = async (req,res)=>{
  try {
    let fileId = req.body.folderFiles.fileId;
  let taskId =  req.body .folderFiles.tasks._id
  const update =  {
    "folderFiles.$[outer].tasks.$[inner]":req.body.folderFiles.tasks,
  }

  const filters = { "arrayFilters": [
    { "outer.fileId": fileId},
    { "inner._id": ObjectId(taskId) }
] }

  const updateProject = await CProject.update({ _id: req.body ._id},{$set: update},filters)
  console.log(updateProject)
  await res.status(200)
  } catch (error) {
    let errorResponse = response.generateResponse(error, "An error occurred", 500, null);

    res.status(500).send(errorResponse);
  }  

}

/**ENDS */

/**MERGE ROWS / saveCompletedCSV */

const mergeRows = async (req, res) => {
  let jsonArrayCSV = req.body.folderFiles.tasks.splitRows
  let mergedString = ""
  let translatedMerge = ""
  let csvArrayMerge = []
  let headersCSV
  var dirName = req.body.folderFiles.tasks.serviceType + req.body.folderFiles.fileName
  if (req.body.folderFiles.tasks.serviceType === "Translation") {
    req.body.folderFiles.tasks.translatedFile = dirName
  }
  else {
    req.body.folderFiles.tasks.reviewedFile = dirName
  }

  console.log(req.body.folderFiles.tasks)
  for (let i = 0; i < jsonArrayCSV.length; i++) {
    let extractedKeys = Object.keys(jsonArrayCSV[i])
    if (extractedKeys[0] !== 'symbol') {
      headersCSV = extractedKeys
    }
    mergedString = ""
    translatedMerge = ""
    console.log(extractedKeys)
    let extractSimilar = jsonArrayCSV.filter(similar => {
      if (similar[extractedKeys[3]] === i || similar[extractedKeys[2] == i]) {
        return similar
      }
    }
    )
    // console.log(i + "==========================")
    console.log(extractSimilar)
    if (extractSimilar.length > 1) {
      for (let extractIndex = 0; extractIndex < extractSimilar.length; extractIndex++) {
        if (extractSimilar[extractIndex]) {
          mergedString += extractSimilar[extractIndex][extractedKeys[1]] + extractSimilar[extractIndex][extractedKeys[0]]
          if (extractSimilar[extractIndex][extractedKeys[4]]) {
            translatedMerge += extractSimilar[extractIndex][extractedKeys[4]] + extractSimilar[extractIndex][extractedKeys[0]]
          }

        }
      }
      csvArrayMerge.push({
        [extractedKeys[1]]: mergedString,
        [extractedKeys[2]]: jsonArrayCSV[i][extractedKeys[2]],
        [extractedKeys[4]]: translatedMerge
      })
    }
    else {
      if (extractSimilar.length > 0) {
        csvArrayMerge.push({
          [extractedKeys[1]]: extractSimilar[0][extractedKeys[1]],
          [extractedKeys[2]]: extractSimilar[0][extractedKeys[2]],
          [extractedKeys[4]]: extractSimilar[0][extractedKeys[4]]
        })
      }

    }

  }

  console.log(csvArrayMerge)
  // console.log(headersCSV)
  const fields = [headersCSV[0], headersCSV[1], headersCSV[3]]
  const csv = parse(csvArrayMerge, { fields });
  console.log(csv)
  const jsonexport = require('jsonexport');
  const fs = require('fs');
  const csvData = iconv.encode(csv, "iso-8859-1")
  let taskId = req["body"]["folderFiles"]["tasks"]["_id"]
  fs.writeFile(dirName, csvData, function (err) {
    if (err) return console.error(err);
    CProject.update(
      {
        _id: req.body._id,
        "folderFiles.fileId": req.body.folderFiles.fileId,
      },
      {
        $set: {
          "folderFiles.$[outer].tasks.$[inner]":
            req.body.folderFiles.tasks,
        },
      },
      {
        arrayFilters: [
          { "outer.fileId": req.body.folderFiles.fileId },
          { "inner._id": mongoose.Types.ObjectId(taskId) },
        ],
      },
      function (err, data) {
        if (err) console.log(err);
        res.status(200).send(data)
      }
    );
    console.log('cars.csv saved');
  });

}

/**Ends */

/**GET FILES */

const getFiles = async (req, res) => {

  try {
    const files = await CProject.findOne({ _id: req.body.pid }, { folderFiles: { $elemMatch: { _id: req.body.fid } } })
    await res.json(files)
  } catch (error) {
    let errorResponse = response.generateResponse(error, "An error occurred", 500, null);
    res.status(500).send(errorResponse);
  }
}

/**ENDS */

/**UPLOAD COMPLETE / COMPLETED FILE */

const CompletedFile = async (req,res)=>{
  try {
    await folderUpload(req,res)
    if(req.user.user.designation == 'Translator'){
      let data =  JSON.parse(req.body.data)
         
          
          const update = await CProject.updateOne({ _id: data._id, "folderFiles.fileId": data.folderFiles.fileId }, {
              $set: {
                  "folderFiles.$.fileStatus" : "Completed",
                  "folderFiles.$.completedFile": req.files[0].filename
              }
          }, { new: true })

          if(update){
            res.json({ statusCode: 200 });  
          }
    }
  } catch (error) {
    let errorResponse = response.generateResponse(error, "An error occurred", 500, null);
    res.status(500).send(errorResponse);
  }
}

/**ENDS */

const saveVendor = async (req, res) => {

  try {
    req.body.taskData.assignedBy = req.user.user.name;
    const data = req.body.data[0];
    console.log(req.body.taskData);
     await CProject.aggregate([
      { $unwind: "$folderFiles" },
      { $unwind: "$folderFiles.tasks" },
      {
        $match: {
          $and: [
            { "folderFiles._id": new mongoose.Types.ObjectId(req.body.fid) },
            { "folderFiles.tasks.serviceType": req.body.serviceType },
            { "folderFiles.tasks.closedOn": { $exists: false } },
          ],
        },
      },
    ]).sort({ createdOn: 1 });

    if (data) {
      if (data[0] !== undefined) {
        const fileId = data[0].folderFiles.fileId;
        const taskId = data[0].folderFiles.tasks._id;

        data[0].folderFiles.tasks.isCancelled = true;
        data[0].folderFiles.tasks.closedOn = req.body.taskData.assignedOn;
        data[0].folderFiles.tasks.closedBy = req.user.user.name;
        
         let dataC = await CProject.updateOne(
          {
            _id: req.body.data[0].folderFiles._id,
            // _id: data[0].folderFiles.tasks[0]._id.$oid, //Change

            "folderFiles.fileId": fileId,
          },
          {
            $set: {
              "folderFiles.$[outer].tasks.$[inner]": data[0].folderFiles.tasks,
              // "folderFiles.$[outer].tasks.$[inner]": req.body.data.taskData,
            },
          },
          {
            arrayFilters: [{ "outer.fileId": fileId }, { "inner._id": taskId }],
          }
        );
          console.log("dataC====>",dataC);
         await CProject.updateOne(
          { _id: req.body.pid, "folderFiles._id": req.body.fid },
          {
            $set: {
              projectStatus: "In Progress",

              currentPhase: req.body.serviceType,

              "folderFiles.$.assignedTo": req.body.vId,

              "folderFiles.$.fileStatus": "Assigned",

              "folderFiles.$.assignedDate": new Date(),

              "folderFiles.$.assignedBy": req.user.user.name,

              "folderFiles.$.currentPhase": req.body.serviceType,
            },
            $push: { "folderFiles.$.tasks": req.body.taskData },
          }
          
        );
} 
    }
    
// console.log("req.body.data[0]._id",req.body.data[0].folderFiles._id);
console.log("data[0].folderFiles._id",req.body.data[0].folderFiles._id);

    const userData = await Users.find({ empId: req.body.vId });
    if (userData.length > 0) {
      const emailParams = {
        // fileId: req.body.data.fileId,
        fileId: req.body.data[0].folderFiles.fileId,    // Changer here
        serviceType: req.body.serviceType,
        name: req.user.user.name,
      };
    
      // console.log("fileId", req.body.data[0].folderFiles.fileId)
      let html = generateEmailTemplate("saveVendor", emailParams);
      sendMail(
        data[0].email,
        req.user.user.email,
        req.body.data.fileId + "- Task Assigned",
        html
      );
    };
    res.json({ statusCode: 200 });
  } catch (error) {
    let errorResponse = response.generateResponse(
      error,
      "An error occurred",
      500,
      null
    );
    res.status(500).send(errorResponse);
    console.log(error);
  }
};

/**DELETE TASK */
const deleteAssignedTasks = async (req, res) => {
  console.log(req.body._id)
  try {
    let taskData = await CProject.findOne({ _id: req.body._id }, { folderFiles: { $elemMatch: { _id: req.body.folderId } } })
    console.log("taskData:", taskData); // Log the taskData to check what it contains

    let files = [...taskData.folderFiles]
    let tasks = [...files[0].tasks]
    console.log("Number of tasks:", tasks.length);

    let status = tasks.length == 1 ? "Init" : "Assigned";
    if (files.completeFile) {
      status = "Completed"
    }
   console.log("Status:", status);
    CProject.updateOne({
      _id: req.body._id,
      "folderFiles._id": req.body.folderId,
    }, {
      $set: {
        "folderFiles.$.fileStatus": status,
      },
      $pull: {
        "folderFiles.$.tasks": {
          _id: req.body.taskId,
        }
      }
    })
    .then((result) => {
      console.log("Update Result:", result);
      res.send({ message: "done" });
    }) .catch((error) => {
        let errorResponse = response.generateResponse(error, "An error occurred", 500, null);
        res.status(500).send(errorResponse);
        console.log("Update Error:", error); 
      })
  }catch (error) {
    let errorResponse = response.generateResponse(error, "An error occurred", 500, null);
    res.status(500).send(errorResponse);
    console.log(error)
  }
}
/**ENDS */

/**GET PARTNER */

const getPartner = async (req, res) =>{
  try {
    let data;
  if (req.body.serviceType == 'DTP') {
    data = await Partner.aggregate([{
      $match: {
        "typesOfServices.serviceType": "Desktop Publishing"
      }
    }])
  }
  else if (req.body.serviceType == 'Translation') {
    data = await Partner.aggregate([{
      $match: {
        $and: [{ 'typesOfServices.sourceLanguage': req.body.sl },
        { 'typesOfServices.targetLanguage': req.body.tl },
        { "typesOfServices.serviceType": "Translation" }
        ]
      }
    }])
  }
  else {
    data = await Partner.aggregate([{
      $match: {
        $and: [{ 'typesOfServices.sourceLanguage': req.body.sl },
        { 'typesOfServices.targetLanguage': req.body.tl },
        { $or: [{ "typesOfServices.serviceType": "Proof Reading" }, { "typesOfServices.serviceType": "Translation" }] }
        ]
      }
    }])
    res.json(data);
  }} catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Internal Server Error' });
  }
}

/**ENDS */


/**Add Partner Count */

const addPartnerCount = async (req, res) => {
  console.log(req.body);
  // console.log(req.body.folderFiles.fileId)

  try {
    var fileId = req.body["folderFiles.fileId"];
    var taskId = req.body["folderFiles.tasks._id"];
    const updatedTasks = req.body['folderFiles.tasks'];

    console.log("File ID:", fileId);
    console.log("Task ID:", taskId);

    if (req.body["folderFiles.fileId"]) {
      const data = await CProject.updateOne(
        {
          _id: req.body._id, "folderFiles.fileId": req.body["folderFiles.fileId"],
        },
        {
          $set: {
            "folderFiles.$[outer].tasks": updatedTasks
          },
        },
        {
          arrayFilters: [
            { "outer.fileId": fileId },

            { "inner._id": new ObjectId(taskId) },
          ],
        }
      );
    
        res.json({ statusCode: 200 });
        console.log("data", data);
    }
  } catch (error) {
    let errorResponse = response.generateResponse(
      error,
      "An error occurred",
      500,
      null
    );
    res.status(500).send(errorResponse);
    console.log(error);
  }
};

/**ENDS */

/**Edit File Type */

const editFileType = async (req, res) => {
  try {
   let data = await CProject.updateOne({ _id: req.body.pid, "folderFiles._id": req.body.fid },
   { $set: { "folderFiles.$.fileType": req.body.fileType } }
    )
    res.json({ statusCode: 200 })
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Internal Server Error' });
  }
}

/**ENDS */

/**UPLOAD TEMPLATE */

const uploadTemplate = async (req, res) => {
  try{
    await CProject.updateOne({ _id: req.body.pid, "folderFiles._id": req.body.fid }, 
    { $set: { "folderFiles.$.template": req.body.template } })
      res.json({ statusCode: 200 })
      }catch (err) {
      console.error(err);
      res.status(500).json({ error: 'Internal Server Error' });
    }
  }
  
  /**ENDS */

  /**Assign Bulk Vendor */

const assignBulkVendor = async (req, res) => {
  debugger;
  try {
    var vendorpromises = [];
    var datatoMail = {
      vendorId: req.body.fileData[0].vId,
      fileIds: [],
      serviceType: req.body.fileData[0].serviceType
    };

    for (i = 0; i < req.body.fileData.length; i++) {
      var fileDataTemp = req.body.fileData[i]
      datatoMail.fileIds.push(fileDataTemp.data.fileId)
      fileDataTemp.taskData.assignedBy = req.user.user.name;
      const data = await CProject.aggregate([
        { $unwind: '$folderFiles' },
        { $unwind: '$folderFiles.tasks' },
        { $match: { $and: [{ "folderFiles._id": new mongoose.Types.ObjectId(fileDataTemp.fid) }, { "folderFiles.tasks.serviceType": fileDataTemp.serviceType }, { "folderFiles.tasks.closedOn": { $exists: false } }] } },

      ]).sort({ createdOn: 1 });
      // console.log("data==============>",data);

      if (data && data[0] !== undefined) {
        var fileId = data[0].folderFiles.fileId;
        var taskId = data[0].folderFiles.tasks._id;
        data[0].folderFiles.tasks.isCancelled = true
        data[0].folderFiles.tasks.closedOn = fileDataTemp.taskData.assignedOn
        data[0].folderFiles.tasks.closedBy = req.user.user.name;
  
          let dataUpdate = await CProject.updateOne(
            { _id: data[0]._id, "folderFiles.fileId": data[0].folderFiles.fileId },
             {
            $set: {
              "folderFiles.$[outer].tasks.$[inner]": data[0].folderFiles.tasks,
            }
          }, {
            "arrayFilters": [
              { "outer.fileId": fileId },
              { "inner._id": taskId }
            ]
          },
          )
          console.log("dataUpdate", dataUpdate);
        
      } else {
        let dataUpdateinelse = await CProject.updateOne({ _id: fileDataTemp.pid, "folderFiles._id": fileDataTemp.fid }, {
          $set: {
            projectStatus: "In Progress",
            currentPhase: fileDataTemp.serviceType,
            "folderFiles.$.assignedTo": fileDataTemp.vId,
            "folderFiles.$.fileStatus": "Assigned",
            "folderFiles.$.assignedDate": new Date(),
            "folderFiles.$.assignedBy": req.user.user.name,
            "folderFiles.$.currentPhase": fileDataTemp.serviceType
          },
          $push: { "folderFiles.$.tasks": fileDataTemp.taskData }
        },
        )
        console.log("dataUpdateinelse",dataUpdateinelse);
      }

      vendorpromises.push("resolved") // changesssss
    }

    await Promise.all(vendorpromises);
    var files = datatoMail.fileIds.join();
  
    let vendorMail = await Users.findOne({ empId: datatoMail.vendorId });

    const emailParams = {
      files: datatoMail.fileIds.join(),
      serviceType: req.body.fileData[0].serviceType,
      name: req.user.user.name,
    };
    let html = generateEmailTemplate("assignBulkVendor", emailParams);
    console.log(html);

    sendMail(vendorMail.email, req.user.user.email, "Bulk Assign Files" + "- Task Assigned", html)

    res.json({ statusCode: 200 });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Internal Server Error' });
  }
}


/**ENDS */


/**projectreportpa */

const projectreportpa = async (req, res) => {
  try {
    new Date(req.body.startDate)
    const data = await CProject.aggregate([
      {
        "$unwind": "$folderFiles"
      },
      { $match: { cDate: { $gte: new Date(req.body.startDate), $lt: new Date(req.body.endDate) } } },
      {
        "$group": {
          "_id": "$projectName",
          "total": {
            "$sum": "$folderFiles.wordCount"
          },
          projectName: { $first: "$projectName" },
          projectStatus: { $first: "$projectStatus" },
          tat: { $first: "$tat" },
          sourceLanguage: { $first: "$sourceLanguage" },
          targetLanguage: { $first: "$targetLanguage" },
          createdOn: { $first: "$createdOn" },
          priority: { $first: "$priority" },
          country: { $first: "$country" },
          poNumber: { $first: "$poNumber" },
          closedOn: { $first: "$closedOn" },
          userName: { $first: "$userName" }
        }
      },
    ]);
    res.json({ statusCode: 200 });
  } catch (error) {
    let errorResponse = response.generateResponse(error, "An error occurred", 500, null);
    res.status(500).send(errorResponse);
    console.log(error)
  }
}

/**ENDS */

/**filesReports */

const filesReports = async (req, res) => {
  try{
  await CProject.aggregate([
      { $match: { createdOn: { $gte:req.body.startDate, $lt: req.body.endDate } } },
      { $unwind: "$folderFiles" },
      {
          $project: {
              _id: 0,
              projectName: 1,
              projectStatus:1,
              sourceLanguage: 1,
              fileType:"$folderFiles.fileType",
              targetLanguage: 1,
              tat:1,
              fileId: "$folderFiles.fileId",
              wordCount: {$filter:{input:"$folderFiles.tasks",as:"word_count",cond:{"$cond": [
                  { "$ne": ["$$word_count.wordCount", null] },
                  "$$word_count.wordCount",
                  0
              ]}}},
              completedFile:"$folderFiles.finalSubFile",
              createdOn:1,
              fileName:"$folderFiles.fileName",
              createdBy:"$userName",
              wun:"$folderFiles.tcName",
              country:1,
              closedOn:1,
              poNumber:1
          }
      }
  ])
  res.json( { statusCode : 200} )
}catch (error) {
  let errorResponse = response.generateResponse(error, "An error occurred", 500, null);
  res.status(500).send(errorResponse);
  console.log(error)
}}

/**ENDS */

/**e2bfilesReports */

const e2bfilesReports = async (req, res) => {
  try{
   let aggregateData = await CProject.aggregate(
      [
        {
          $match: {
            cDate: {
              $gte: new Date(req.body.startDate),
              $lte: new Date(req.body.endDate),
            },
            projectStatus: "Completed",
            projectType: "e2b",
          },
        },
        { $unwind: "$folderFiles" },
        {
          $project: {
            _id: 0,
            projectName: 1,
            projectstatus: 1,
            sourceLanguage: 1,
            targetLanguage: 1,
            tat: 1,
            fileId: "$folderFiles.fileId",
            wordCount: {
              $filter: {
                input: "$folderFiles.tasks",
                as: "word_count",
                cond: {
                  $cond: [
                    { $ne: ["$$word_count.wordCount", null] },
                    "$$word_count.wordCount",
                    0,
                  ],
                },
              },
            },
            completedFile: "$folderFiles.finalSubFile",
            createdOn: 1,
            fileName: "$folderFiles.fileName",
            createdBy: "$userName",
            wun: "$folderFiles.tcName",
            country: 1,
            closedOn: 1,
          },
        },
      ])
      console.log(aggregateData);
      res.json( { statusCode : 200 } )
  }catch (error) {
    let errorResponse = response.generateResponse(error, "An error occurred", 500, null);
    res.status(500).send(errorResponse);
    console.log(error)
  }}

  /**Ends */

  /**icsrfilesReports */

const icsrfilesReports = async (req, res) => {
  try{
  let aggregateData = await CProject.aggregate(
    [
      {
        $match: {
          cDate: {
            $gte: new Date(req.body.startDate),
            $lte: new Date(req.body.endDate),
          },
          projectStatus: "Completed",
          projectType: "icsr",
        },
      },
      { $unwind: "$folderFiles" },
      {
        $project: {
          _id: 0,
          projectName: 1,
          projectstatus: 1,
          sourceLanguage: 1,
          targetLanguage: 1,
          tat: 1,
          fileId: "$folderFiles.fileId",
          wordCount: {
            $filter: {
              input: "$folderFiles.tasks",
              as: "word_count",
              cond: {
                $cond: [
                  { $ne: ["$$word_count.wordCount", null] },
                  "$$word_count.wordCount",
                  0,
                ],
              },
            },
          },
          completedFile: "$folderFiles.finalSubFile",
          createdOn: 1,
          fileName: "$folderFiles.fileName",
          createdBy: "$userName",
          wun: "$folderFiles.tcName",
          country: 1,
          closedOn: 1,
        },
      },
    ]
  )
  console.log("aggregateData",aggregateData);
  res.json( { statusCode : 200} )
}catch(error) {
  let errorResponse = response.generateResponse(error, "An error occurred", 500, null);
  res.status(500).send(errorResponse);
  console.log(error)
}};

/**ENDS */

module.exports = {
  test,
  saveProject,
  getClientProjectNoParam,
  getClientProject,
  getFileDetails,
  saveLanPair,
  getPartnerFiles,
  getLanguages,
  getById,
  validateFiles,
  saveFinalFile,
  downloadTargetFile,
  getLanguageCode,
  getUom,
  viewFiles,
  accepttask,
  saveMessage,
  getFiles,
  downloadFile,
  mergeRows,
  CompletedFile,
  saveVendor,
  deleteAssignedTasks,
  getPartner,
  addPartnerCount,
  editFileType,
  uploadTemplate,
  assignBulkVendor,
  projectreportpa,
  filesReports,
  e2bfilesReports,
  icsrfilesReports
};
