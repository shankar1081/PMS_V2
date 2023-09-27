var mongoose = require('mongoose');
var Schema = mongoose.Schema;

const serviceSchema = mongoose.Schema({
    description: { type: String },
    qty: { type: String },
    amount: { type: String }

});
var wiproFileDetailsSchema = new Schema({
    invoiceNumber: {type: String},
    invoiceDate: {type: String},
    poNumber: {type: String},
    type:{type: String},
    billLine1: { type: String },
    // billLine2: { type: String },
    // billLine3: { type: String },
    // billLine4: { type: String },
    // billLine5: { type: String },
    shipLine1: { type: String },
    // shipLine2: { type: String },
    // shipLine3: { type: String },
    // shipLine4: { type: String },
    // shipLine5: { type: String },
    vendorLine1: { type: String },
    // vendorLine2: { type: String },
    // vendorLine3: { type: String },
    // vendorLine4: { type: String },
    // vendorLine5: { type: String },
    currency: {type: String},
    tax :{type: String},
    total :{type: String},
    amountInWords :{type: String},
    discount: {type:String},
    subTotal: {type:String},
    taxRegnNo: {type: String},
    vendorIban: {type: String},
    vendorBicc: {type: String},
    eoe:{type:String},
    bankName:{type:String},
    pid:{type: String},
    fid:{type:String},
    source:{type:String},
    target:{type: String},
    fileStatus:{type: String},
    fileDetails: [serviceSchema]

});
module.exports = mongoose.model('wiproFileDetails', wiproFileDetailsSchema);

