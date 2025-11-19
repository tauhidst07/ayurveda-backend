import * as zod from "zod" 

const herbsValidationSchema = zod.object({
    name:zod.string(), 
    benefits:zod.string()
})

// blog section schema
const sectionValidationSchema = zod.object({
    heading:zod.string(),  
    paragraphs:zod.array(zod.string()).optional(), 
    list:zod.array(zod.string()).optional(), 
    herbs:zod.array(herbsValidationSchema).optional()
    
}); 

// blog content schema 
const contentValidationSchema = zod.object({
    intro:zod.string(), 
    sections:zod.array(sectionValidationSchema), 
    tips:zod.array(zod.string()).optional(), 
    conclusion:zod.string().optional()
})

// main blog schema
const blogValidationSchema = zod.object({
    title:zod.string(), 
    subtitle:zod.string().optional(), 
    category:zod.string(), 
    image:zod.string(), 
    author:zod.string(), 
    content:contentValidationSchema
}); 


export default blogValidationSchema;