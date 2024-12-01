import { Api } from 'telegram'
import { BigNumber } from 'big-integer'

export type MovieData = {
  title: string | null
  release_date: string | null
  country_of_origin: string[]
  flags_of_origin: string[]
  directors: string[]
  writers: string[]
  cast: string[]
  languages: string[]
  flags_of_language: string[]
  subtitles: string[]
  flags_of_subtitles: string[]
  genres: string[]
  tags: string[]
  synopsis: string | null
  curiosities: string | null
}

export type Post = {
  image_url: string
  video_url: string
  grouped_id: BigNumber | string | undefined
  message_id: number
  date: number
  author: string | undefined
  reactions: Array<{ reaction: any; count: number }>
  original_content: string
  parsed_content: MovieData
  document: Api.Document
}

export interface FieldDefinition {
  field: keyof MovieData
  labels: string[]
  regex: RegExp[]
  isMultiline?: boolean
  process: (match: RegExpMatchArray, data: MovieData) => void
}
