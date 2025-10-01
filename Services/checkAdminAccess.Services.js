
async function checkAdminAccess(access, check ){
  try {
    //check if access has value ALL or check
    
    const accessArr = Array.isArray(access) ? access : [access];
    validAccess = ['ALL',check]
    for (let i = 0; i < accessArr.length; i++) {
      if (validAccess.includes(accessArr[i])) {
        return true
      }
    }
    return false
  } catch (error) {
    console.log(error);
    return false
  }
}

module.exports = checkAdminAccess;


// async function getAdminDetails(id) {}