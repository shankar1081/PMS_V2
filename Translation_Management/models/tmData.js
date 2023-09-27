const mongoose = require("mongoose");
var Schema = mongoose.Schema;
let tmSchema = mongoose.Schema({
  sourceLanguage: { type: String },
  targetLanguage: { type: String },
  clientId: { type: String },
  domain: { type: String },
  index: { type: String, unique: true },
  data: {
    type: mongoose.Schema.Types.Mixed
  },
  createdBy: { type: Schema.Types.ObjectId, ref: "User" },
  createdOn: { type: Date },
});

var collectionName = "TMData";
var Tmdata = mongoose.model("Tmdata", tmSchema, collectionName);
module.exports = Tmdata;
