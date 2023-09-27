var mongoose = require('mongoose');
var Schema = mongoose.Schema;
const taskSchema = mongoose.Schema({
    serviceType: { type: String,required:true },
    assignedOn:  { type: String,required:true },
    assignedBy: { type: String,required:true },
    status:  { type: String,required:true },
    partnerId: { type: String,required:true },
    notes:  { type: String,required:true },
    wordCount:  { type: String,required:true },
    taskTAT:  { type: String,required:true },
    closedOn: { type: String,required:true },
    closedBy: { type: String,required:true },
    isAccepted: { type: Boolean,required:true },
    processedFile: { type: String,required:true },
    translatedFile: { type: String,required:true },
    reviewedFile: { type: String,required:true },
    isReviewPending: { type: String,required:true },
    isReviewError: { type: String,required:true },
    isReviewAccepted: { type: String,required:true },
    message:{ type: String,required:true },
    isCancelled : {type:Boolean},
    wordCount:{type:Number},
	assignedName:{type:String}
})
const fileSchema = mongoose.Schema({
    fileId: { type: String,required:true },
    fileName: { type: String,required:true },
    filePath: { type: String ,required:true},
    fileType: { type: String ,required:true},
    fileStatus: { type: String },
    closedOn:{type:String},
	tcName:{type:String},
    template:{type:String},
    assignedTo: { type: String },
    assignedDate: { type: Date },
    tasks : [taskSchema],
    assignedBy: { type: String },
    fileInstruction:{type:String},
    wordCount:{type:Number},
    finalSubFile:{type:String},
    error: { type: String },
    translator:{type:Object},
    dtp:{type:Object},
    reviewer:{type:Object},
    completedFile: { type: String },
    currentPhase:{type: String},
	signatureFile : {type:String}
});
var ProjectSchema = new Schema({
    projectName: { type: String, required: true,unique:true },
	projectType:{type:String,required:true},
    projectStatus: { type: String, required: true },
    tat: { type: String, required: true },
    projectFile: { type: String },
    finalFile: { type: String },
    notes: { type: String },
	sourceLanguage: { type: String, required: true },
    targetLanguage: { type: String, required: true },
    createdOn: { type: String, required: true },
    folderFiles: [fileSchema],
    priority:{type:String},
    completedFiles: { type: Number },
	tnotes:{type:String},
    country: { type: String, required: true },
    poNumber: { type: String },
	cDate:{type:Date,default:Date.now()},
    userId: {
        type: mongoose.Schema.Types.ObjectId,
      
    },
	closedOn:{type:String},
    userName: { type: String, required: true }
});
let Project = mongoose.model('ClientProject', ProjectSchema);
module.exports = Project

