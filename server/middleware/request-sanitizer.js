const decamelize = require('decamelize');
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
}

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
            } else {
                isValid = false;
                cleanBody[field.fieldName] = null;
                return false; // stop checking
            }
        } else if (value === null) {
            if (field.allowNull) {
                cleanBody[field.fieldName] = null;
                return false; // stop checking
            } else {
                isValid = false;
                cleanBody[field.fieldName] = null;
                return false; // stop checking
            }
        }
        return isValid;
    }
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
    const cleanString = (field) => {
        const value = body[field.fieldName];
        if (validate(value, field)) {
            if (typeof value !== 'string') {
                isValid = false;
            } else {
                cleanBody[field.fieldName] =value.replace(/[^\w\d\s-,:;()&@]+/g, '');
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

const programSchema = {
    primaryKey: 'programId',
    fields: [
        {fieldName: 'programId', type: 'int', allowNull: false },
        {fieldName: 'programName', type: 'string', allowNull: false },
        {fieldName: 'locationId', type: 'int', allowNull: false },
        {fieldName: 'registrationMethod', type: 'string', allowNull: true },
        {fieldName: 'colorId', type: 'int', allowNull: true },
        {fieldName: 'feeId', type: 'int', allowNull: false },
        {fieldName: 'isActive', type: 'string', allowNull: true }
        // , {fieldName: 'programDescription', type: 'string', allowNull: true }
    ]
};
module.exports = {
    getCleanBody,
    classScheduleSchema,
    programSchema
};
