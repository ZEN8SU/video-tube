import mongoose ,{Schema}from 'mongoose'
import mongooseAggregatePaginate from 'mongoose-aggregate-paginate-v2'; // npm , for using aggregate fn. 
const videoSchema = new Schema({
videoFile :{
  type : String, // cloudinary url
  required : true
},
thumbnail :{
  type : String, 
  required : true
},
title :{
  type : String, 
  required : true
},
description :{
  type : String, 
  required : true
},
duration :{
  type : Number, 
  required : true
},
views:{
  type : Number,
  default : 0
},
isPublished :{
  type : Boolean, 
  required : true
},
owner :{
  type : Schema.Types.ObjectId,
  ref :"User"
}


},{
  timestamps:true
})

// use .plugin premade middleware 
videoSchema.plugin(mongooseAggregatePaginate)

export const Video = mongoose.model('Video',videoSchema);