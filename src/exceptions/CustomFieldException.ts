import { HttpException, HttpStatus } from '@nestjs/common';

export class CustomFieldNotFoundException extends HttpException {
  constructor(fieldId: string) {
    super(`Custom field with ID ${fieldId} not found`, HttpStatus.NOT_FOUND);
  }
}

export class UnauthorizedCustomFieldAccessException extends HttpException {
  constructor() {
    super('You are not authorized to access this custom field', HttpStatus.FORBIDDEN);
  }
}

export class CustomFieldOperationException extends HttpException {
  constructor(message: string) {
    super(message, HttpStatus.BAD_REQUEST);
  }
}
