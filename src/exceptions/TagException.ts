import { HttpException, HttpStatus } from '@nestjs/common'

export class TagNotFoundException extends HttpException {
  constructor(tagId: string) {
    super(`Tag with ID ${tagId} not found`, HttpStatus.NOT_FOUND)
  }
}

export class UnauthorizedTagAccessException extends HttpException {
  constructor() {
    super('You are not authorized to access this tag', HttpStatus.FORBIDDEN)
  }
}

export class TagOperationException extends HttpException {
  constructor(message: string) {
    super(message, HttpStatus.BAD_REQUEST)
  }
}