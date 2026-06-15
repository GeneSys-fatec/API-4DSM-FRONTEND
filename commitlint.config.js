export default {
  parserPreset: {
    parserOpts: {
      headerPattern: /^(\w+)\[(.*)\]:\s+(.*)$/,
      headerCorrespondence: ['type', 'scope', 'subject']
    }
  },
  
  defaultIgnores: true,
  ignores: [
    (commit) => commit.includes("Merge"),
    // Commit legado do branch docs (anterior à criação das regras de commit)
    (commit) => commit.includes("docs: adiciona guia de configuração do frontend"),
  ],
  
  rules: {
    'type-enum': [
      2, 
      'always', 
      ['feat', 'fix', 'docs', 'style', 'refactor', 'test', 'chore', 'perf', 'ci', 'cd']
    ],
    'type-empty': [2, 'never'],
    
    'scope-empty': [2, 'never'],
    
    'subject-empty': [2, 'never'],
  }
};