const isvalidEmail = /^\s*[a-zA-Z0-9]+([\.\-\_\+][a-zA-Z0-9]+)*@[a-zA-Z]+([\.\-\_][a-zA-Z]+)*(\.[a-zA-Z]{2,3})+\s*$/

const checkPassword = /^(?=.*\d)(?=.*[!@#$%^&*])(?=.*[a-z])(?=.*[A-Z]).{8,15}$/;


function validateObjectId(id) {
    var bool = false;
    if (id.length == 24) bool = /^(?=[a-f\d]{24}$)(\d+[a-f]|[a-f]+\d)/.test(id);
    return bool;
}
const stringChecking = function(data) {
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

const installmentsRegex = /^[+]?((\d+(\\d*)?)|(\\d+))$/

const numRegex = /^[+]?([0-9]+(?:[\.][0-9]*)?|\.[0-9]+)$/

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

const imageValid = (img) => {
    const reg = /image\/png|image\/jpeg|image\/jpg/;
    return reg.test(img);
};

const isValidSizes = (size) => {
    const givenSizes = ["S", "XS", "M", "X", "L", "XXL", "XL"];
    for (let i = 0; i < size.length; i++) {
        if (!givenSizes.includes(size[i])) {
            return false;
        }
    }
    return true;
}

const alphaNumericValid = (value) => {
    if (!value) return false
    let alphaRegex = /^[a-zA-Z0-9-_ ]+$/;
    if (alphaRegex.test(value)) return true
}

const isValidremoveProduct = function(value) {
    return ['0', '1'].indexOf(value) !== -1;
}

const nameRegex = (value) => {
    if (!value) return false
    value = value.toLowerCase()
    if (value == "true" || value == "false") return false
    let nameRegex = /^[A-Za-z\s]{1,}[\.]{0,1}[A-Za-z\s]{0,}$/;
    if (nameRegex.test(value)) return true;
};


module.exports = {
    isvalidEmail,
    checkPassword,
    validateObjectId,
    stringChecking,
    installmentsRegex,
    numRegex,
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