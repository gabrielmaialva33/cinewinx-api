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

export interface FieldDefinition {
  field: keyof MovieData
  labels: string[]
  regex: RegExp[]
  isMultiline?: boolean
  process: (match: RegExpMatchArray, data: MovieData) => void
}
