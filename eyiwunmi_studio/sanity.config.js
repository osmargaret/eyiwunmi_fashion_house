import {defineConfig} from 'sanity'
import {structureTool} from 'sanity/structure'
import {schemaTypes} from './schemaTypes'

export default defineConfig({
  name: 'default',
  title: 'Eyiwunmi Studio',

  projectId: 'placeholder', // To be configured by user
  dataset: 'production',

  plugins: [structureTool()],

  schema: {
    types: schemaTypes,
  },
})
