

var mongoose = require('mongoose');
var Schema = mongoose.Schema;
// var bcrypt = require('bcrypt-nodejs');
// const config = require('../config/database');

const UserSchema = mongoose.Schema({
	name: { type: String },
	designation: { type: String, required: true },
	department: { type: String, required: true },
	email: { type: String, required: true },
	empId: { type: String, required: true },
	mobileNo: { type: Number, required: true },
	password: { type: String, required: true },
	createdOn: { type: String },
	reportingManager: { type: String },
	level: { type: String },
	status: { type: String },
	doj: { type: String },
	Vertical:{type:String},
	rejoined: { type: String }
});


// UserSchema.pre('save', function (next) {
// 	var user = this;
// 	bcrypt.hash(user.password, null, null, function (err, hash) {
// 		if (err) return next(err);
// 		user.password = hash;
// 		next();
// 	});
// });

// UserSchema.methods.comparePassword = function (password) {
// 	return bcrypt.compareSync(password, this.password);
// }



const User = module.exports = mongoose.model('User', UserSchema);
