const mongoose = require('mongoose')
const ObjectId = mongoose.Schema.Types.ObjectId


const studentSchema = new mongoose.Schema({
    
    userId: {
        type: ObjectId,
        ref: "user",  // ref to userModel 
        required: true,
        trim: true
    },
    name : {
        type : String,
        required : true,
        trim : true
    },
    
    subject : {
        type : String,
        enum : ['Math', 'Physics', 'Chemistry', 'Hindi', 'English', 'Sanskrit','Sociology', 'Psychology' ],
        required : true,
        trim : true
    },
    marks : {
        type : Number,
        required : true,
        trim : true
    },
    isDeleted: {
        type: Boolean,
        default: false
    }
    
}, {timestamps: true})


module.exports = mongoose.model('student', studentSchema); // students