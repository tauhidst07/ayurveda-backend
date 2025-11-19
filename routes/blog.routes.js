import express from "express";
import blogValidationSchema from "../validation/Blog.validation.js";
import Blog from "../models/Blog.js";


const blogRouter = express.Router();

blogRouter.post("/create", async (req, res) => {
    const validateResponse = blogValidationSchema.safeParse(req.body);
    if (!validateResponse.success) {
       return res.status(403).json({
            message: "invalid input", 
            err:validateResponse.error
        })
    }

    console.log("validated: ", validateResponse);
    try {
        const blog = await Blog.create({
            ...validateResponse.data,
        }); 
        res.status(200).json({
        message: "blog submitted for review", 
        blog
    })
    }
    catch (err) {
       res.status(500).json({
        message:"something went wrong! please try again", 
        err
       })
    }

})


export default blogRouter;