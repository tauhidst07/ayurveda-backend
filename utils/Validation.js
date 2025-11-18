import validator from "validator";

function validateSignUpData(req) {
  const { FullName, emailId, password } = req.body;

  if (!FullName) {
    throw new Error("Name field should not be empty");
  } else if (!validator.isEmail(emailId)) {
    throw new Error("Invalid email id");
  }
    else if(!validator.isStrongPassword(password)){
        throw new Error("Password is not strong");
    
    }
  }


export default validateSignUpData;
  

  

  
