const decamelize = require('decamelize');
const baseSanitizeHtml = require('sanitize-html');
const sanitizeHtml = (text) => {
    return baseSanitizeHtml(text, {
        allowedTags: baseSanitizeHtml.defaults.allowedTags.concat(['font','h2', 'h1']),
        allowedAttributes: { a: [ 'href', 'name', 'target' ], font: ['color'] }
    })
}


const mixedJoin = (source, skipHead = false) => {
    let arr = '';
    if (!source.length) return arr;
    let safeSource = source;
    if (skipHead) {
        safeSource = source.slice(1);
    }
    safeSource.map((item) => {
        if (typeof item === 'string'){
            arr = arr.concat(`"${item}", `)
        } else {
            arr = arr.concat(`${item}, `)
        }
    });
    return arr.slice(0, arr.length -2);
};

const getCleanBody = (body, schema) => {
    let isValid = true;
    const cleanBody = {};
    // functions for getting safe values
    const validate = (value, field) => {
        if (value === undefined) {
            if (field.fieldName === schema.primaryKey) { // implicitly an insert
                cleanBody[field.fieldName] = null;
            } else if (field.allowNull) {
                cleanBody[field.fieldName] = null;
                body[field.fieldName] = null;
            } else {
                isValid = false;
                cleanBody[field.fieldName] = null;
                return false; // stop checking
            }
        } else if (value === null) {
            if (field.fieldName === schema.primaryKey) { // implicitly an insert
                cleanBody[field.fieldName] = null;
            } else if (field.allowNull) {
                cleanBody[field.fieldName] = null;
                body[field.fieldName] = null;
                return false; // stop checking
            } else {
                isValid = false;
                cleanBody[field.fieldName] = null;
                return false; // stop checking
            }
        }
        return isValid;
    };
    const cleanNumber = (field, numberType) => {
        const value = body[field.fieldName];
        if (validate(value, field)) {
            const parsedNum = (numberType === 'float') ? parseFloat(value) : parseInt(value);
            if (value == parsedNum) { // intentional coercion
                cleanBody[field.fieldName] = parsedNum;
            }
        }
    };
    const cleanDate = (field) => {
        const value = body[field.fieldName];
        if (validate(value, field)) {
            if (cleanBody[field.fieldName]  === null) return; // don't process empty date
            try {
                const dateObj = new Date(value);
                cleanBody[field.fieldName] = dateObj.toISOString().slice(0, 10);
            } catch (err) {
                isValid = false;
            }
        }
    };
    const stringMask = /[^\w\d\s-,.:;()&@]+/g;
    const cleanString = (field) => {
        const value = body[field.fieldName];
        if (validate(value, field)) {
            if (typeof value !== 'string') {
                if (value === null || value === undefined) {
                    cleanBody[field.fieldName] = null; // allow null if not required field
                } else {
                    isValid = false;
                }
            } else {
                let noBadChars = value.replace(stringMask, '');
                // also prepare quote marks for mySQL storage
                cleanBody[field.fieldName] = noBadChars.replace(/"/g, '\\"');
            }
        }
    };

    const cleanHtml = (field) => {
        const value = body[field.fieldName];
        if (value == null) {
            cleanBody[field.fieldName] = '';
            return true;
        }
        if (validate(value, field)) {
            if (typeof value !== 'string') {
                isValid = false;
            } else {
                // strip out unsafe HTML tags, then replace quotes with html codes to save to MySQL
                cleanBody[field.fieldName] = sanitizeHtml(value).replace(/"/g, '&quot;');
            }
        }
    };

    const cleanBoolean = (field) => {
        const value = body[field.fieldName];
        if (validate(value, field)) {
            if (value === true || (value.toUpper && value.toUpper() === 'Y') || (value.toUpper && value.toUpper() === 'TRUE')) {
                cleanBody[field.fieldName] = 'Y';
            } else {
                cleanBody[field.fieldName] = 'N';
            }
        }
    };

    const cleanArray = (field, type) => {
        const value = body[field.fieldName];
        if (validate(value, field)) {
            if (typeof value !== 'object' && !value.length) {
                isValid = false; // not actually an array
            } else {
                const arr = [];
                try {
                    value.map((item) => {
                        if (typeof item === 'string' && type === 'string') {
                            arr.push(item);
                        }
                        if (typeof item === 'number' && type === 'int' && item === parseInt(item)) {
                            arr.push(item);
                        }
                        if (typeof item === 'object' && type === 'object'){
                            arr.push(item);
                        }
                    });
                } catch (err) {
                    isValid = false;
                }
                cleanBody[field.fieldName] = arr;
            }
        }
    };

    for (let field of schema.fields) {
        if (!isValid) break;
        switch (field.type) {
            case 'int':
                cleanNumber(field, 'int');
                break;
            case 'float':
                cleanNumber(field, 'float');
                break;
            case 'date':
                cleanDate(field);
                break;
            case 'string':
                cleanString(field);
                break;
            case 'html':
                cleanHtml(field);
                break;
            case 'boolean':
                cleanBoolean(field);
                break;
            case 'int-array':
                cleanArray(field, 'int');
                break;
            case 'string-array':
                cleanArray(field, 'string');
                break;
            case 'object-array':
                cleanArray(field, 'object');
                break;
        }
    }
    // get keys as mySQL compatible column names
    let keys = Object.keys(cleanBody);
    keys = keys.map((key) => decamelize(key));
    const values = Object.values(cleanBody);
    const setters = [];
    for (let i = 0; i < keys.length; i++) {
        if (typeof values[i] === 'string') {
            setters.push(`${keys[i]} = "${values[i]}"`);
        } else {
            setters.push(`${keys[i]} = ${values[i]}`);
        }

    }
    const insertValues = `( ${keys.slice(1).join(', ')} ) VALUES (${mixedJoin(values, true)})`;

    return {
        isEdit: !!cleanBody[schema.primaryKey],
        setters,
        insertValues,
        isValid,
        cleanBody
    }
};

const classScheduleSchema = {
    primaryKey: 'scheduleId',
    fields: [
        {fieldName: 'scheduleId', type: 'int', allowNull: false },
        {fieldName: 'programId', type: 'int', allowNull: false },
        {fieldName: 'seasonId', type: 'int', allowNull: false },
        {fieldName: 'dayId', type: 'int', allowNull: false },
        {fieldName: 'duration', type: 'int', allowNull: true },
        {fieldName: 'minAge', type: 'int', allowNull: true },
        {fieldName: 'maxAge', type: 'int', allowNull: true },
        {fieldName: 'startDate', type: 'date', allowNull: true },
        {fieldName: 'endDate', type: 'date', allowNull: true },
        {fieldName: 'startTime', type: 'string', allowNull: false },
        {fieldName: 'endTime', type: 'string', allowNull: false }
    ]
};

const seasonSchema = {
    primaryKey: 'seasonId',
    fields: [
        {fieldName: 'seasonId', type: 'int', allowNull: false },
        {fieldName: 'name', type: 'string', allowNull: false },
        {fieldName: 'year', type: 'int', allowNull: false },
        {fieldName: 'startDate', type: 'date', allowNull: false },
        {fieldName: 'endDate', type: 'date', allowNull: false },
        {fieldName: 'isActive', type: 'string', allowNull: false }
    ]
};

const programSchema = {
    primaryKey: 'programId',
    fields: [
        {fieldName: 'programId', type: 'int', allowNull: false },
        {fieldName: 'programName', type: 'string', allowNull: false },
        {fieldName: 'locationId', type: 'int', allowNull: false },
        {fieldName: 'registrationMethod', type: 'string', allowNull: true },
        {fieldName: 'colorId', type: 'int', allowNull: true },
        {fieldName: 'feeId', type: 'int', allowNull: false },
        {fieldName: 'isActive', type: 'string', allowNull: true },
        {fieldName: 'programDescription', type: 'html', allowNull: true }
    ]
};
const feeSchema = {
    primaryKey: 'feeId',
    fields: [
        {fieldName: 'feeId', type: 'int', allowNull: false },
        {fieldName: 'feeValue', type: 'int', allowNull: false },
        {fieldName: 'feePeriod', type: 'string', allowNull: false },
        {fieldName: 'feeName', type: 'string', allowNull: false },
        {fieldName: 'registrationLink', type: 'string', allowNull: true }
    ]
}

const memberSchema = {
    primaryKey: 'memberId',
    fields: [
        {fieldName: 'memberId', type: 'int', allowNull: false },
        {fieldName: 'firstName', type: 'string', allowNull: false },
        {fieldName: 'middleName', type: 'string', allowNull: true },
        {fieldName: 'lastName', type: 'string', allowNull: false },
        {fieldName: 'yearOfBirth', type: 'int', allowNull: true },
        {fieldName: 'competeGender', type: 'string', allowNull: true },
        {fieldName: 'isActive', type: 'string', allowNull: false },
        {fieldName: 'isAthlete', type: 'string', allowNull: false },
        {fieldName: 'membershipStart', type: 'date', allowNull: true },
        {fieldName: 'streetAddress', type: 'string', allowNull: true },
        {fieldName: 'city', type: 'string', allowNull: true },
        {fieldName: 'provinceId', type: 'int', allowNull: true },
        {fieldName: 'postalCode', type: 'string', allowNull: true },
        {fieldName: 'email', type: 'string', allowNull: true },
        {fieldName: 'cellPhone', type: 'string', allowNull: true },
        {fieldName: 'homePhone', type: 'string', allowNull: true },
        {fieldName: 'license', type: 'string', allowNull: true },
        {fieldName: 'loyaltyDiscount', type: 'string', allowNull: true }
    ]
};
const userSchema = {
    primaryKey: 'userId',
    fields: [
        {fieldName: 'userId', type: 'int', allowNull: false },
        {fieldName: 'email', type: 'string', allowNull: false },
        {fieldName: 'isAdmin', type: 'string', allowNull: false },
        {fieldName: 'googleId', type: 'string', allowNull: true },
        {fieldName: 'fbId', type: 'string', allowNull: true },
        {fieldName: 'twitterId', type: 'string', allowNull: true },
        {fieldName: 'fileAdmin', type: 'string', allowNull: true },
        {fieldName: 'eventAdmin', type: 'string', allowNull: true },
        {fieldName: 'displayName', type: 'string', allowNull: true }
    ]
};


const enrollmentSchema = {
    primaryKey: 'enrollId',
    fields: [
        {fieldName: 'enrollId', type: 'int', allowNull: false },
        {fieldName: 'memberId', type: 'int', allowNull: false },
        {fieldName: 'programId', type: 'int', allowNull: false },
        {fieldName: 'seasonId', type: 'int', allowNull: false },
        // {fieldName: 'scheduleIds', type: 'int-array', allowNull: false },
        {fieldName: 'userId', type: 'int', allowNull: false },
        // {fieldName: 'feeValue', type: 'float', allowNull: true },
    ]
};

const fitnessProfileSchema = {
    primaryKey: 'athleteId',
    fields: [
        {fieldName: 'athleteId', type: 'int', allowNull: false },
        {fieldName: 'firstName', type: 'string', allowNull: false },
        {fieldName: 'lastName', type: 'string', allowNull: false },
        {fieldName: 'memberId', type: 'int', allowNull: true },
        {fieldName: 'yearOfBirth', type: 'int', allowNull: false },
        {fieldName: 'competeGender', type: 'string', allowNull: false },
        {fieldName: 'typeIds', type: 'int-array', allowNull: false }
    ]
};
const exerciseLogSchema = {
    primaryKey: 'exerciseEventId',
    fields: [
        {fieldName: 'exerciseEventId', type: 'int', allowNull: false },
        {fieldName: 'exerciseId', type: 'int', allowNull: false },
        {fieldName: 'athleteId', type: 'int', allowNull: false},
        {fieldName: 'userLoggedId', type: 'int', allowNull: false},
        {fieldName: 'exerciseQuantity', type: 'int', allowNull: false }
        ]
};

const exerciseSchema = {
    primaryKey: 'exerciseId',
    fields: [
        {fieldName: 'exerciseId', type: 'int', allowNull: false },
        {fieldName: 'ownerGroupId', type: 'int', allowNull: false },
        {fieldName: 'name', type: 'string', allowNull: false },
        {fieldName: 'description', type: 'html', allowNull: true},
        {fieldName: 'fileId', type: 'int', allowNull: true},
        {fieldName: 'measurementUnit', type: 'string', allowNull: false },
        {fieldName: 'measurementUnitQuantity', type: 'int', allowNull: false },
        {fieldName: 'iconType', type: 'string', allowNull: false },
        {fieldName: 'iconName', type: 'string', allowNull: false },
        {fieldName: 'balanceValue', type: 'int', allowNull: false },
        {fieldName: 'flexibilityValue', type: 'int', allowNull: false },
        {fieldName: 'powerValue', type: 'int', allowNull: false },
        {fieldName: 'enduranceValue', type: 'int', allowNull: false },
        {fieldName: 'footSpeedValue', type: 'int', allowNull: false },
        {fieldName: 'handSpeedValue', type: 'int', allowNull: false },
    ]
};
const fitnessGroupSchema = {
    primaryKey: 'groupId',
    fields: [
        {fieldName: 'groupId', type: 'int', allowNull: false },
        {fieldName: 'name', type: 'string', allowNull: false },
        {fieldName: 'description', type: 'string', allowNull: true },
        {fieldName: 'isClosed', type: 'boolean', allowNull: true },
        {fieldName: 'athleteTypeIds', type: 'int-array', allowNull: true },
        {fieldName: 'ageCategoryIds', type: 'int-array', allowNull: true }
    ]
};

const pageSchema = {
    primaryKey: 'pageId',
    fields: [
        {fieldName: 'pageId', type: 'int', allowNull: false },
        {fieldName: 'pageName', type: 'string', allowNull: false },
        {fieldName: 'title', type: 'string', allowNull: false },
        {fieldName: 'htmlContent', type: 'html', allowNull: false }
    ]
};

const menuSchema = {
    primaryKey: 'menuId',
    fields: [
        {fieldName: 'menuId', type: 'int', allowNull: false },
        {fieldName: 'title', type: 'string', allowNull: false },
        {fieldName: 'altTitle', type: 'string', allowNull: true },
        {fieldName: 'link', type: 'html', allowNull: false },
        {fieldName: 'parentMenuId', type: 'int', allowNull: false },
        {fieldName: 'orderNumber', type: 'int', allowNull: false }
    ]
};

const bannerSchema = {
    primaryKey: 'statusId',
    fields: [
        {fieldName: 'statusId', type: 'int', allowNull: false },
        {fieldName: 'appName', type: 'string', allowNull: false },
        {fieldName: 'bannerText', type: 'string', allowNull: false },
        {fieldName: 'bannerLink', type: 'html', allowNull: false },
        {fieldName: 'bannerActive', type: 'string', allowNull: false }
    ]
};

const tipSchema = {
    primaryKey: 'tipId',
    fields: [
        {fieldName: 'tipId', type: 'int', allowNull: false },
        {fieldName: 'tipName', type: 'string', allowNull: false },
        {fieldName: 'enTitle', type: 'string', allowNull: false },
        {fieldName: 'frTitle', type: 'string', allowNull: true },
        {fieldName: 'enText', type: 'html', allowNull: false },
        {fieldName: 'frText', type: 'html', allowNull: true }
    ]
};

const questionSchema = {
    primaryKey: 'questionId',
    fields: [
        {fieldName: 'questionId', type: 'int', allowNull: false },
        {fieldName: 'questionGroup', type: 'string', allowNull: false },
        {fieldName: 'enText', type: 'string', allowNull: false },
        {fieldName: 'frText', type: 'string', allowNull: true },
        {fieldName: 'answerGroupId', type: 'int', allowNull: false },
        {fieldName: 'parentQuestionId', type: 'int', allowNull: true },
        {fieldName: 'allowed_invalid', type: 'int', allowNull: true },
        {fieldName: 'expectedAnswer', type: 'int', allowNull: true }
    ]
};

const paymentSchema = {
    primaryKey: 'paymentId',
    fields: [
        {fieldName: 'paymentId', type: 'int', allowNull: false },
        {fieldName: 'toId', type: 'int', allowNull: false },
        {fieldName: 'fromId', type: 'int', allowNull: false },
        {fieldName: 'invoiceId', type: 'int', allowNull: true },
        {fieldName: 'amount', type: 'float', allowNull: false },
        {fieldName: 'paymentMethod', type: 'string', allowNull: true },
        {fieldName: 'toType', type: 'string', allowNull: true },
        {fieldName: 'fromType', type: 'string', allowNull: true }
    ]
};

const invoiceSchema = {
    primaryKey: 'invoiceId',
    fields: [
        {fieldName: 'invoiceId', type: 'int', allowNull: false },
        {fieldName: 'fromId', type: 'int', allowNull: false },
        {fieldName: 'fromType', type: 'string', allowNull: false },
        {fieldName: 'toId', type: 'int', allowNull: false },
        {fieldName: 'toType', type: 'string', allowNull: false },
        {fieldName: 'lineItems', type: 'object-array', allowNull: false },
        {fieldName: 'dueDate', type: 'date', allowNull: true }
    ]
};

const companySchema = {
    primaryKey: 'companyId',
    fields: [
        {fieldName: 'companyId', type: 'int', allowNull: false },
        {fieldName: 'companyName', type: 'string', allowNull: false },
        {fieldName: 'streetAddress', type: 'string', allowNull: true },
        {fieldName: 'city', type: 'string', allowNull: true },
        {fieldName: 'postalCode', type: 'string', allowNull: true },
        {fieldName: 'provinceId', type: 'number', allowNull: true },
        {fieldName: 'email', type: 'string', allowNull: true },
        {fieldName: 'companyType', type: 'string', allowNull: true }
    ]
};

module.exports = {
    getCleanBody,
    classScheduleSchema,
    seasonSchema,
    programSchema,
    feeSchema,
    memberSchema,
    userSchema,
    enrollmentSchema,
    fitnessProfileSchema,
    exerciseLogSchema,
    exerciseSchema,
    fitnessGroupSchema,
    pageSchema,
    menuSchema,
    bannerSchema,
    tipSchema,
    questionSchema,
    paymentSchema,
    invoiceSchema,
    companySchema
};
