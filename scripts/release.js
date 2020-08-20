const { run } = require('./utils')

main()

async function main() {
  run(`yarn run build`)
  run(`git add .`)
  try {
    run(`git commit`)
  } catch (error) {
    console.log(error)
  }
  run(`lerna publish`)
  run('yarn run clean')
}
