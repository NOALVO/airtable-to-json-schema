function airtableToJsonSchema(airtableSchema, {
  includeOriginals = false
} = {}) {
  return airtableSchema.reduce((schema, field) => {
    const property = {
      title: field.name,
    };

    if (includeOriginals) property.airtable = field;
  
    switch(field.type) {
      case 'foreignKey':
        property.type = 'array';
        break;
      case 'text':
      case 'multilineText':
      case 'richText':
        property.type = 'string';
        break;
      case 'date':
        property.type = 'string';
        property.format = field.typeOptions.isDateTime ? 'date-time' : 'date';
        break;
      case 'number':
        property.type = 'number';
        break;
      case 'select':
      case 'multiSelect':
        property.type = 'string';
        property.enum = Object.values(field.typeOptions.choices).map(c => c.name);
        break;
      case 'formula':
      case 'rollup':
      case 'multipleAttachment':
      case 'lookup':
        break;
    }

    if (property.type) {
      schema.properties[field.id] = property;
    }
    return schema;
  }, { properties: {} });
}

function objectToAirtableFields(typedObject, jsonSchema, {
  cleanUndefineds = true,
} = {}) {
  return Object
    .keys(jsonSchema.properties)
    .reduce((fields, key) => {
      const property = jsonSchema.properties[key];

      if (cleanUndefineds && !typedObject[key]) return fields;
      
      fields[property.title] = typedObject[key];
      return fields;
    }, {});
}

module.exports = { airtableToJsonSchema, objectToAirtableFields };
