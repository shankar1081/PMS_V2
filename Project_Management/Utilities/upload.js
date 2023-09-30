const multer = require("multer");
const MsgReader = require("@kenjiuno/msgreader").default;
const path = require("path");
const fs = require("fs").promises;
const { randomString } = require("../Utilities/generateRandomString");
const { spawn } = require("child_process");
const util = require("util");
const spawnAsync = util.promisify(spawn);
require('dotenv').config();

const uploadPath = process.env.UTILITIES_UPLOAD_PATH;
const uploadPathSec = process.env.UPLOAD_PATH;

const storage = multer.diskStorage({
  destination: uploadPathSec,
  filename: (req, file, cb) => {
    cb(null, randomString() + '_' + file.originalname);
  },
});

const folderUpload = multer({ storage: storage }).array("uploads[]", 12);

const recursiveMsg = async function (fileArrayMsg) {
  // console.log(uploadPath);
  // console.log("process.cwd()",process.cwd());
  try {
    const fileList = Array.isArray(fileArrayMsg) ? fileArrayMsg : [fileArrayMsg];
    // console.log(fileArrayMsg);
    for (const file of fileList) {
      if (!file || typeof file.filename !== 'string') {
        // Skip invalid files
        // console.log('Skipping invalid file:', file);
        // console.log('File filename:', file.filename);
        continue;
      }

      // Check if the file.filename property is defined before passing it to the path.extname() function
      if (!file.filename) {
        console.log("file.fileName is not present");
        continue;
      }



      const extFile = path.extname(file.filename);
      if (extFile === ".msg") {
        const data = await fs.readFile(
          path.join(process.cwd(), "uploads", file.filename)
        );
        const testMsg = new MsgReader(data);
        const testMsgInfo = testMsg.getFileData();

        if (testMsgInfo.attachments.length > 0) {
          for (const [index, att] of testMsgInfo.attachments.entries()) {
            if (att.fileName !== undefined) {
              const msgAttachExt = path.extname(att.fileName);
              const fileName = randomString() + "_" + att.fileName;

              if (msgAttachExt === ".msg") {
                await fs.writeFile(
                  path.join(process.cwd(), "uploads" ,fileName),
                  testMsg.getAttachment(att).content
                );

                const extMsg = path.extname(
                  path.join(process.cwd(), "uploads" ,fileName)
                );

                if (extMsg === ".msg") {
                  fileList.push({
                    filename: fileName,
                    lastParsed: fileName,
                    isMessageLast: true,
                  });
                }
              } else if (att.extension !== ".msg") {
                // console.log("att.extension !== .msg")
                if (index === testMsgInfo.attachments.length - 1) {
                  const containsMsg = fileList.find((ele) => {
                    return ele.lastParsed !== undefined && ele.lastParsed !== null;
                  });

                  if (!containsMsg) {
                    fileList.forEach((element) => {
                      element.isMessageLast = true;
                    });
                  }
                }
              }
            } else {
              const process = spawnAsync("python", [
                "D:\\Parexel\\python_scripts\\nested_msg.py",
                file.filename,
              ]);

              process.stdout.on("data", async (data) => {
                if (data) {
                  const body = Buffer.from(data);
                  const json = decoder.write(body);

                  for (const filedata of json.split("\n")) {
                    const extension = path.extname(
                      filedata.replace(/(\r\n|\n|\r)/gm, "")
                    );

                    if (extension === ".msg" && extension !== "") {
                      fileList.push({
                        filename: filedata.replace(/(\r\n|\n|\r)/gm, ""),
                        lastParsed: filedata.replace(/(\r\n|\n|\r)/gm, ""),
                        isMessageLast: true,
                      });
                    }
                  }
                }
              });

              process.stderr.on("data", (err) => {
                console.error(err);
              });
            }
          }
        }
      }
    }
    return fileList;
  } catch (err) {
    console.error('Error processing file:', err);
  }
};


const saveFile = function (req, res) {
  console.log("req.files",req.files);

  folderUpload(req, res, function (err) {

    if (err) {

      console.log(err);

      return res.status(422).send("an Error occured");

    }

    var arrayTemp = [];
    var promises = [];

    // var arryLength = req.files.length

    req.files.forEach(function (file) {

      var promiseformsg = new Promise((resolve, reject) => {

        recursiveMsg([file], function (end) {

          // console.log("end ============ ===  "+JSON.stringify(end));

          end.forEach(function (element) {

            // console.log(element);

            if (element.isMessageLast == true) {
              console.log("element");
              return resolve(end);
            }
          });
        });
      });
      var promisefornormal = new Promise((resolve, reject) => {

        return resolve([file]);

      });
      if (path.extname(file.filename) == ".msg") {
        promises.push(promiseformsg);
      } else {
        promises.push(promisefornormal);
      }
    });
    Promise.all(promises).then((values) => {

      // console.log("values ======= " + JSON.stringify(values));

      if (values !== null) {

        res.send(values);

      }

    });

  });

};

module.exports = {
  saveFile,
  recursiveMsg,
  folderUpload
};
