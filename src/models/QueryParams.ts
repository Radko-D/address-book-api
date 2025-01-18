export interface QueryParams {
  mostUsedTags?: boolean
  sameFirstNameDiffLastName?: boolean
  sameLastNameDiffFirstName?: boolean
  firstName?: string
  lastName?: string
  page: number
  limit: number
}
