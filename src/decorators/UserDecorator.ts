// decorators/user.decorator.ts
import { createParamDecorator, ExecutionContext } from '@nestjs/common'

interface JwtPayload {
  id: string
  email: string
}

export const UserFromRequest = createParamDecorator((data: keyof JwtPayload | undefined, ctx: ExecutionContext) => {
  const request = ctx.switchToHttp().getRequest()
  const user = request.user as JwtPayload

  return data ? user?.[data] : user
})
