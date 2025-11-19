import mongoose  from "mongoose"; 


const HerbSchema = new mongoose.Schema({
  name: { type: String, required: true },
  benefits: { type: String, required: true }
}); 

const SectionSchema = new mongoose.Schema({
    heading:{
        type:String, 
        required:true
    }, 
    paragraphs:[{type:String}], 
    list:[{type:String}], 
    herbs:[HerbSchema]
})

const ContentSchema = new mongoose.Schema({
    intro:{
        type:String, 
        required:true
    }, 
    sections:[SectionSchema], 
    tips:[{type:String}], 
    conclusion:{
        type:String
    }
})

const BlogSchema =new mongoose.Schema({
    title:{
        type:String, 
        required:true
    }, 
    subtitle:{
        type:String, 
    }, 
    category:{
        type:String, 
        required:true
    }, 
    image:{
        type:String, 
        required:true
    },  
    content:ContentSchema,
    status:{
        type:String, 
        enum: ["pending", "published", "rejected"], 
        default:"pending" //doctor submits -> pending for admin review
    },
    publishedAt: { type: Date, default: null },
    rejectedReason: { type: String, default: null }
},{timestamps:true});


export default mongoose.model('Blog',BlogSchema);