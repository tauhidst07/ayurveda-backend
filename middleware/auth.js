const jwt = require("jsonwebtoken");
const User = require("../models/user");

const userAuth = async(req,res,next)=>{
    
     try{
      if (req.method === "OPTIONS") {
      return res.sendStatus(200);
    }
       
        const{token} = req.cookies;
      if (!token) {
   return res.status(401).send("Please login");
}

      const decodeData = await jwt.verify(token, process.env.JWT_SECRET_KEY);
      const{_id} = decodeData; 
     
      const user = await User.findById(_id);
            if (!user) {
            return res.status(404).send("User doesn't exist");}
        
  req.user = user;
   next();
    }catch(err){
    return res.status(400).send("ERROR: " + err.message);
    }
    
} 

  export default userAuth;
   
