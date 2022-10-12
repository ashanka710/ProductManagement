const isvalidEmail = /^\s*[a-zA-Z0-9]+([\.\-\_\+][a-zA-Z0-9]+)*@[a-zA-Z]+([\.\-\_][a-zA-Z]+)*(\.[a-zA-Z]{2,3})+\s*$/

const checkPassword = /^(?=.*\d)(?=.*[!@#$%^&*])(?=.*[a-z])(?=.*[A-Z]).{8,15}$/;

function validateObjectId(id) {
    var bool = false;
    if (id.length == 24) bool = /[a-f]+/.test(id);
    return bool;
}

const stringChecking = function (data) {
    if (typeof data !== 'string' || data === undefined || data === null) {
        return false;
    } else if (typeof data === 'string' && data.trim().length === 0) {
        return false;
    } else {
        return true;
    }
}

const addressValid = (value) => {
    let streetRegex = /^[#.0-9a-zA-Z\s,-]+$/;
    if (streetRegex.test(value)) return true;
  };
  
  const mobileRegex = (value) => {
    let phoneRegex =
      /^(?:(?:\+|0{0,2})91(\s*|[\-])?|[0]?)?([6789]\d{2}([ -]?)\d{3}([ -]?)\d{4})$/;
    if (phoneRegex.test(value)) return true;
  };
  
  const mailRegex = (value) => {
    let mailRegex = /^\w+([\.-]?\w+)@\w+([\.-]?\w+)(\.\w{2,3})+$/;
    if (mailRegex.test(value)) return true;
  };
  
  const passwordRegex = (value) => {
    let passwordRegex =
      /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,15}$/;
    if (passwordRegex.test(value)) return true;
  };
  
  const pinValid = (value) => {
    let pinregex = /^\d{6}$/;
    if (pinregex.test(value)) return true;
  }
  
  const imageValid = (value) => {
    let imageRegex = /(\/*\.(?:png|gif|webp|jpeg|jpg))/;
    if (imageRegex.test(value)) return true;
  }
  
  const isValidSizes = (size) => {
    const validSize = size.split(",").map((x) => x.trim());
    let givenSizes = ["S", "XS", "M", "X", "L", "XXL", "XL"];
    for (let i = 0; i < validSize.length; i++) {
      if (!givenSizes.includes(validSize[i])) {
        return false;
      }
    }
    return true;
  }
  
  const alphaNumericValid = (value) => {
    let alphaRegex = /^[a-zA-Z0-9-_ ]+$/;
    if (alphaRegex.test(value)) return true; // /^[- a-zA-Z'\.,][^/]{1,150}/ allows every things
  }
  
  const isValidremoveProduct = function (value) {
    return [0, 1].indexOf(value) !== -1;
  }

const nameRegex = (value) => {
    let nameRegex = /^[A-Za-z\s]{1,}[\.]{0,1}[A-Za-z\s]{0,}$/;
    if (nameRegex.test(value)) return true;
  };


module.exports = { 
    isvalidEmail, 
    checkPassword, 
    validateObjectId, 
    stringChecking, 
    addressValid, 
    nameRegex,
    addressValid,
    mailRegex,
    mobileRegex,
    passwordRegex,
    pinValid,
    imageValid,
    isValidSizes,
    alphaNumericValid,
    isValidremoveProduct 
}