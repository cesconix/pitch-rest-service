#!/usr/bin/env node

const chalk = require('chalk')
const program = require('commander')
const request = require('superagent')

program
  .arguments('<file>')
  .option('-t, --token <accessToken>')
  .action((accessToken) => {
    request
      .post('http://localhost:8081/api/auth/fblogin')
      .send({ accessToken })
      .end((err, res) => {
        if (err) {
          console.log(chalk.red(JSON.stringify(err)))
          return
        }
        console.log(chalk.yellow(JSON.stringify(res.body)))
      })
  })
  .parse(process.argv)
