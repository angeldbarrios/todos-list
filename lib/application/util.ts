import Joi from 'joi';

export function validation(schema: Joi.ObjectSchema<any>, data: any) {
  return function (target: any, propertyKey: string, descriptor: PropertyDescriptor) {
    const original = descriptor.value;
    descriptor.value = function(...args: any[]) {
      const { error, value } =  schema.validate(data);
      
      if(error) { 
        const badDataError = new Error('Bad data');
        badDataError.name = 'BAD_DATA';
        throw badDataError;
      }

      return original.apply(this, args);
    }
  }; 
}