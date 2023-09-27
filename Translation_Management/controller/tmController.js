const iconv = require("iconv-lite");
const csv = require("csv-parser");
const multer = require("multer");
const { Client } = require("@elastic/elasticsearch");
const client = new Client({ node: "http://localhost:9200" });
const stream = require("stream");
const { Readable } = require("stream");
const { promisify } = require("util");
const TM = require("../models/tmData");
const storage = multer.memoryStorage();
const upload = multer({ storage }).single("file");

//Create Index in elastic search and dcoment in mongodb
async function createIndex(req, res) {
  upload(req, res, async function (err) {
    if (err) {
      return res.status(400).json({ error: "Error uploading file." });
    }

    try {
      const newTM = new TM({
        clientId: req.body.clientId,
        sourceLanguage: req.body.sourceLanguage,
        targetLanguage: req.body.targetLanguage,
        domain: req.body.domain,
        index:
          `${req.body.sourceLanguage}_${req.body.targetLanguage}_${req.body.clientId}_${req.body.domain}`.toLowerCase(),
        createdOn: new Date().toISOString().slice(0, 10),
      });

      const savedTM = await TM.create(newTM);

      const indexName = newTM.index;

      // Create the index in Elasticsearch
      await client.indices.create({
        index: indexName,
      });

      const fileData = req.file;
      if (!fileData || fileData.mimetype !== "text/csv") {
        deleteTM(savedTM._id); // Delete the TM document from MongoDB if file format is invalid
        return res.status(400).json({
          error: "Invalid file format. Only CSV files are supported.",
        });
      }

      const dataArray = [];
      const encodedFile = Buffer.from(fileData.buffer, "binary");
      const decodedFile = iconv
        .decode(encodedFile, "iso88591")
        .replace("ï»¿", "");

      const readable = new stream.Readable();
      readable.push(decodedFile);
      readable.push(null);

      const pipeline = promisify(stream.pipeline);

      const bulkBody = [];
      let batchSize = 0;

      await pipeline(
        readable,
        csv({ separator: "," }),
        new stream.Writable({
          objectMode: true,
          write: async (data, _, callback) => {
            try {
              const action = { index: { _index: newTM.index } };
              const document = {
                source: data.Source,
                target: data.Target,
                domain: newTM.domain,
                clientId: newTM.clientId,
                timestamp: new Date(),
              };
              bulkBody.push(action, document);
              batchSize++;
              if (batchSize >= 1000) {
                await client.bulk({ body: bulkBody });
                bulkBody.length = 0;
                batchSize = 0;
              }
              dataArray.push(data);
              callback(); // Invoke the callback to indicate the write operation is complete
            } catch (err) {
              callback(err); // Pass the error to the callback
            }
          },
        })
      ).catch((err) => {
        console.error(err);
        deleteTM(savedTM._id); // Delete the TM document from MongoDB if an error occurs during processing
        return res
          .status(500)
          .json({ error: "An error occurred during file processing." });
      });

      if (bulkBody.length > 0) {
        await client.bulk({ body: bulkBody });
      }

      return res.json({ resp: dataArray });
    } catch (err) {
      console.error(err);
      if (err.code === 11000) {
        return res.status(400).json({
          error:
            "TM for this Language pair and Client Id already exists. Try creating for another language.",
        });
      } else {
        return res
          .status(500)
          .json({ error: "An error occurred during index creation." });
      }
    }
  });
}
//Delete TM record in mongodb if storage in not success
async function deleteTM(tmId) {
  try {
    await TM.findByIdAndRemove(tmId);
    console.log(`TM document with ID '${tmId}' deleted from MongoDB.`);
  } catch (err) {
    console.error(`Error deleting TM document with ID '${tmId}' from MongoDB.`);
  }
}

//Get all indexes from mongodb

async function getAllIndexes(req, res) {
  try {
    const documents = await TM.find({})
      .sort({ createdOn: -1 }) // Sort by descending createdAt
      .limit(50); // Limit to the latest 50 documents

    return res.json({ results: documents });
  } catch (error) {
    return res.status(500).json({ error: "Failed to retrieve documents" });
  }
}

async function searchIndex(index, data) {
  try {
    const datas = await client.search({
      index,
      body: {
        query: {
          match: {
            source: data,
          },
        },
      },
    });
    console.log(datas);
    const hits = datas.hits.hits;
    const results = [];

    if (hits.length === 0) {
      return { results: [] };
    }

    hits.forEach((hit) => {
      const source = hit._source.source;
      const target = hit._source.target;
      const diff = getSentenceDiff(source, data);
      const id = hit._id;
      let matchPercentage;

      if (diff === 0) {
        matchPercentage = "100%";
      } else if (diff === 1) {
        matchPercentage = "99-95%";
      } else if (diff === 2) {
        matchPercentage = "90-95%";
      } else if (diff === 3) {
        matchPercentage = "85-90%";
      } else {
        matchPercentage = "Less than 85%";
      }

      if (diff === 0) {
        results.unshift({
          id,
          source,
          target,
          matchPercentage,
        });
      } else {
        results.push({
          id,
          source,
          target,
          matchPercentage,
        });
      }
    });

    return { results };
  } catch (err) {
    console.error(err);
    throw new Error("An error occurred during the search.");
  }
}
//get the difference between words
function getSentenceDiff(sent1, sent2) {
  let sentArr1 = sent1.split(" ");
  let sentArr2 = sent2.split(" ");
  let referenceSentence =
    sentArr1.length > sentArr2.length ? sentArr1 : sentArr2;
  let diffCount = 0;

  for (let i = 0; i < referenceSentence.length; i++) {
    if (sentArr1[i] !== undefined && sentArr2[i] !== undefined) {
      if (sentArr1[i] !== sentArr2[i]) {
        diffCount++;
      }
    } else {
      diffCount++;
    }
  }
  return diffCount;
}
//Search Index........................
async function searchIndexResults(req, res) {
  try {
    const index = req.body.index;
    const query = req.body.query;

    // Call the search function with the provided index and query
    const searchResults = await searchIndex(index, query);

    // Handle and return search results
    return res.status(200).json({ results: searchResults });
  } catch (error) {
    console.error("Error occurred during search:", error);
    return res.status(500).json({ error: "Error occurred during search" });
  }
}

// Function to update documents in bulk with an exact match
const storage1 = multer.memoryStorage();
const upload1 = multer({ storage1 }).array("files", 5); // Allow up to 5 files to be uploaded

async function updateIndex(req, res) {
  upload1(req, res, async function (err) {
    if (err instanceof multer.MulterError) {
      // A Multer error occurred during file upload
      return res.status(400).json({ error: "Error uploading file." });
    } else if (err) {
      // An unknown error occurred during file upload
      return res.status(500).json({ error: "Error uploading file." });
    }

    try {
      const index = req.body.index;
      const existingDocuments = new Map();
      let documents = [];
      let isCSV = false;

      // Parse the input data based on its format (JSON or CSV)
      if (req.files && req.files.length > 0) {
        // CSV files were uploaded
        isCSV = true;
        for (const file of req.files) {
          const csvData = file.buffer.toString(); // Assuming the CSV file is sent as a buffer
          const parsedDocuments = await parseCSVData(csvData);
          documents = documents.concat(parsedDocuments);
        }
      } else {
        // JSON documents were provided in the request body
        try {
          documents = JSON.parse(req.body.documents);
        } catch (error) {
          throw new Error("Invalid input format");
        }
      }

      if (Array.isArray(documents)) {
        let updateCount = 0;
        let createCount = 0;

        for (const doc of documents) {
          let Source, Target;

          if (isCSV) {
            // For CSV data, the fields might have different names
            Source = doc.Source;
            Target = doc.Target;
          } else {
            Source = doc.source;
            Target = doc.target;
          }

          // Call searchIndex function for each document
          const searchResults = await searchIndex(index, Source);
          const datas = searchResults.results;
          const exactMatchDocument = datas.find(
            (hit) => hit.source === Source && hit.matchPercentage === "100%"
          );
          if (exactMatchDocument) {
            // Update existing document with 100% match
            const docId = exactMatchDocument.id;
            await client.update({
              index,
              id: docId,
              body: {
                doc: { Target },
              },
            });
            updateCount++;
          } else {
            // Create new document
            await client.index({
              index,
              body: isCSV ? { source: Source, target: Target } : doc,
            });
            createCount++;
          }
        }

        const responseMessage = `Bulk update or creation completed. ${updateCount} documents updated, ${createCount} documents created`;
        console.log(responseMessage);
        res.status(200).json({ message: responseMessage });
      } else {
        throw new Error("Invalid input format");
      }
    } catch (error) {
      console.error("Error updating or creating documents:", error);
      res.status(500).json({ error: "Error updating or creating documents" });
    }
  });
}

// Function to parse CSV data
function parseCSVData(csvData) {
  return new Promise((resolve, reject) => {
    const results = [];
    const stream = Readable.from(csvData); // Create a readable stream from the CSV data

    stream
      .pipe(csv())
      .on("data", (data) => {
        results.push(data);
      })
      .on("end", () => {
        resolve(results);
      })
      .on("error", (error) => {
        reject(error);
      });
  });
}

//get all Documents

async function retrieveDocuments(req, res) {
  try {
    const index = req.query.index;
    const datas = await client.search({
      index,
      body: {
        query: {
          match_all: {}, // Match all documents
        },
      },
      size: 10000, // Set the maximum number of documents to retrieve
    });

    if (!datas.hits) {
      console.log("No hits found");
      res.status(200).json({ documents: [] });
      return;
    }
    // Extract and return the hits from the response
    const hits = datas.hits.hits.map((hit) => {
      return {
        id: hit._id,
        ...hit._source, 
      };
    });
    res.status(200).json({ documents: datas });
  } catch (error) {
    res.status(500).json({ error: "Error retrieving documents" });
  }
}
//Delete Document from index

async function deleteDocument(req, res) {
  try {
    const indexName = req.body.indexName;
    const documentId = req.body.documentId;

    const existsResponse = await client.exists({
      index: indexName,
      id: documentId,
    });
    console.log(existsResponse)
    if (!existsResponse) {
      return res.json({ error: "Document not found" });
    }

    const deleteResponse = await client.delete({
      index: indexName,
      id: documentId,
    });
    console.log(deleteResponse)
    if (deleteResponse) {
      return res.json({ message: "Document deleted successfully" });
    } else {
      return res.json({ error: "Failed to delete the document" });
    }
  } catch (error) {
    console.error('Error deleting document:', error);
    res.status(500).json({ error: "Error deleting document" });
  }
}


module.exports = {
  searchIndexResults,
  retrieveDocuments,
  getAllIndexes,
  createIndex,
  updateIndex,
  deleteDocument,
};
