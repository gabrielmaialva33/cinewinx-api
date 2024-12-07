import { FieldDefinition, MovieData } from '#interfaces/movie_types'

let currentField: keyof MovieData | null = null
let multilineBuffer: string[] = []

export const fieldDefinitions: FieldDefinition[] = [
  {
    field: 'title',
    labels: ['📺', 'Título:'],
    regex: [
      /^.*?(?:📺|Título:)\s*(.*?)(?:\s*[-—:]?\s*#(\d{4})y?)?$/i, // with optional year
    ],
    process: (match, data) => {
      data.title = match[1].trim()
      if (match[2]) {
        data.release_date = match[2]
      }
    },
  },
  {
    field: 'country_of_origin',
    labels: ['País de Origem:', '📍 País de Origem:', 'Pais de Origem:'],
    regex: [/^.*?Pa[íi]s de Origem:\s*(.*)/i],
    process: (match, data) => {
      const countries = match[1]
        .split('|')
        .map((c) => c.trim())
        .filter(Boolean)

      data.country_of_origin = []
      data.flags_of_origin = []

      countries.forEach((country) => {
        const flagRegex = /(\p{Emoji_Presentation}+)/u
        const flagMatch = country.match(flagRegex)
        if (flagMatch) {
          data.flags_of_origin.push(flagMatch[1])
        }

        let countryName = country.replace(flagRegex, '').trim()
        if (countryName.startsWith('#')) {
          countryName = countryName.substring(1)
        }
        if (countryName) {
          data.country_of_origin.push(countryName)
        }
      })
    },
  },
  {
    field: 'directors',
    labels: ['Direção:', 'Diretor:', '👑 Direção:', '👑 Direção/Roteiro:'],
    regex: [/^.*?(?:Direção|Diretor|Direção\/Roteiro):\s*(.*)/i],
    process: (match, data) => {
      const names = match[1]
        .split('#')
        .filter(Boolean)
        .map((d) => d.trim())
      if (match[0].includes('Direção/Roteiro')) {
        data.directors = data.directors.concat(names)
        data.writers = data.writers.concat(names)
      } else {
        data.directors = data.directors.concat(names)
      }
    },
  },
  {
    field: 'writers',
    labels: ['Roteiro:', 'Roteirista:', 'Roteiristas:', '✏️ Roteirista:', '✏️ Roteiristas:'],
    regex: [/^.*?(?:Roteiro|Roteirista|Roteiristas):\s*(.*)/i],
    process: (match, data) => {
      const writers = match[1]
        .split('#')
        .filter(Boolean)
        .map((w) => w.trim())
      data.writers = data.writers.concat(writers)
    },
  },
  {
    field: 'cast',
    labels: ['Elenco:', '✨ Elenco:'],
    regex: [/^.*?Elenco:\s*(.*)/i],
    process: (match, data) => {
      data.cast = match[1]
        .split('#')
        .filter(Boolean)
        .map((c) => c.trim())
    },
  },
  {
    field: 'languages',
    labels: ['Idioma:', 'Idiomas:', '📣 Idiomas:', '💬 Idiomas:'],
    regex: [/^.*?(?:Idiomas?|Idioma):\s*(.*)/i],
    process: (match, data) => {
      const languages = match[1]
        .split('|')
        .map((l) => l.trim())
        .filter(Boolean)

      data.languages = []
      data.flags_of_language = []

      languages.forEach((language) => {
        const flagRegex = /(\p{Emoji_Presentation}+)/u
        const flagMatch = language.match(flagRegex)
        if (flagMatch) {
          data.flags_of_language.push(flagMatch[1])
        }
        let languageName = language.replace(flagRegex, '').replace(/#\w+/g, '').trim()
        if (languageName) {
          data.languages.push(languageName)
        }
      })
    },
  },
  {
    field: 'subtitles',
    labels: ['Legenda:', 'Legendado:', '💬 Legendado:'],
    regex: [/^.*?(?:Legenda|Legendado):\s*(.*)/i],
    process: (match, data) => {
      const subtitles = match[1]
        .split('|')
        .map((s) => s.trim())
        .filter(Boolean)

      data.subtitles = []
      data.flags_of_subtitles = []

      subtitles.forEach((subtitle) => {
        // extract flags (emojis)
        const flagRegex = /(\p{Emoji_Presentation}+)/u
        const flagMatch = subtitle.match(flagRegex)
        if (flagMatch) {
          data.flags_of_subtitles.push(flagMatch[1])
        }
        // remove flags and hashtags from subtitle name
        let subtitleLanguage = subtitle.replace(flagRegex, '').replace(/#\w+/g, '').trim()
        if (subtitleLanguage) {
          data.subtitles.push(subtitleLanguage)
        }
      })
    },
  },
  {
    field: 'genres',
    labels: ['Gênero:', 'Gêneros:', '🎭 Gêneros:'],
    regex: [/^.*?(?:Gêneros?|Gênero):\s*(.*)/i],
    process: (match, data) => {
      data.genres = match[1]
        .split('#')
        .filter(Boolean)
        .map((g) => g.trim())
    },
  },
  {
    field: 'synopsis',
    labels: ['Sinopse', '🗣 Sinopse:', '🗣 Sinopse'],
    regex: [/^.*?(?:Sinopse|🗣 Sinopse)[:：]?\s*(.*)/i],
    isMultiline: true,
    process: (match, _data) => {
      if (match[1] && match[1].trim() !== '') {
        // Remover conteúdo indesejado com regex
        const cleanedContent = match[1]
          .trim()
          .replace(/📢❕❕❕❕❕❕✉️ ➖➖➖🌟Clique Aqui🌟➖➖➖ 🪆 ❕❕❕❕❕❕❕❕🆕/g, '')
          .trim()
        multilineBuffer.push(cleanedContent)
      }
    },
  },
  {
    field: 'curiosities',
    labels: ['Curiosidades:', '💡 Curiosidades:'],
    regex: [/^.*?Curiosidades[:：]?\s*(.*)/i],
    isMultiline: true,
    process: (match, _data) => {
      if (match[1] && match[1].trim() !== '') {
        multilineBuffer.push(match[1].trim())
      }
    },
  },
]

export default function parseMessageContent(content: string): MovieData {
  const lines = content.split('\n').map((line) => line.trim())

  const dataInfo: MovieData = {
    title: null,
    release_date: null,
    country_of_origin: [],
    flags_of_origin: [],
    directors: [],
    writers: [],
    cast: [],
    languages: [],
    flags_of_language: [],
    subtitles: [],
    flags_of_subtitles: [],
    genres: [],
    tags: [],
    synopsis: null,
    curiosities: null,
  }

  const endOfFieldMarkers = [
    '▶',
    '▶️',
    'Para outros conteúdos',
    '💡 Curiosidades:',
    '🥇 Prêmios:',
    '🥈 Prêmios:',
    'Prêmios:',
    'Clique Para Entrar',
    '🚨 Para outros conteúdos',
    '📣 Idiomas:',
    '💬 Legendado:',
    '📣',
    '💬',
    '#',
    '✨ Elenco:',
    '📢',
  ]

  // check if the line starts with any of the labels, ignoring prefixes
  function lineStartsWithLabel(line: string, labels: string[]): boolean {
    return labels.some((label) => {
      const regex = new RegExp(`^.*?${label.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}`)
      return regex.test(line)
    })
  }

  for (let i = 0; i < lines.length; i++) {
    let line = lines[i]

    // ignore empty lines
    if (line === '') continue

    // collect multiline field
    if (currentField) {
      // check if the line starts with any of the labels
      let isNewField = false
      for (const fieldDef of fieldDefinitions) {
        if (lineStartsWithLabel(line, fieldDef.labels)) {
          isNewField = true
          break
        }
      }
      const isEndOfField = endOfFieldMarkers.some((marker) => lineStartsWithLabel(line, [marker]))
      if (isNewField || isEndOfField) {
        dataInfo[currentField] = multilineBuffer.join(' ').trim() as any
        currentField = null
        multilineBuffer = []
        // reprocess this line in the next loop
        i--
        continue
      } else {
        // add line to buffer
        multilineBuffer.push(line)
        continue
      }
    }

    // check if the line is a tag
    if (line.startsWith('#')) {
      const tags = line
        .split('#')
        .filter(Boolean)
        .map((t) => t.trim())
      dataInfo.tags = dataInfo.tags.concat(tags)
      continue
    }

    // check if the line starts with any of the labels
    let matched = false
    for (const fieldDef of fieldDefinitions) {
      for (const regex of fieldDef.regex) {
        const match = line.match(regex)
        if (match) {
          fieldDef.process(match, dataInfo)
          matched = true
          if (fieldDef.isMultiline) {
            currentField = fieldDef.field
            multilineBuffer = []
            if (match[1] && match[1].trim() !== '') {
              multilineBuffer.push(match[1].trim())
            }
          }
          break
        }
      }
      if (matched) break
    }
  }

  // finish any pending multiline field
  if (currentField) {
    dataInfo[currentField] = multilineBuffer.join(' ').trim() as any
  }

  return dataInfo
}
