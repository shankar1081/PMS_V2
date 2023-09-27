const mongoose = require('mongoose');
var Schema = mongoose.Schema;
const servicesUomSchema = mongoose.Schema({
  servicesName: { type: String },
  uom: { type: String },
  sourceLanguage: { type: String },
  targetLanguage: { type: String },
  quantityRate: { type: String },
  voSlab:{type:String},
  createdOn: { type: String },
  createdBy: { type: Schema.Types.ObjectId, ref: 'User' },
	//createdName:{type:String}
},
  { collection: 'servicesUom' });


const collectionName = 'servicesUom';
const servicesUom = mongoose.model('servicesUom', servicesUomSchema, collectionName);
module.exports = servicesUom;