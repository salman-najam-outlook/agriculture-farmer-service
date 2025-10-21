'use strict';
require('dotenv').config();
const { copyFile } = require('fs');
var gulp = require('gulp')
  , shell = require('gulp-shell');

  const util = require('util');
  const exec = util.promisify(require('child_process').exec);

var path = {
  sequelize: 'sequelize'
};

gulp.task('migrate', shell.task([
  path.sequelize + ' --url "' + process.env.DBURI + '" db:migrate'
]));

gulp.task('migration:create', shell.task([
  path.sequelize + ' --url "' + process.env.DBURI  + '" migration:create --name unnamed'
]));

gulp.task('migrate', shell.task([
  path.sequelize + ' --url "' + process.env.DBURI + '" db:migrate'
]));

gulp.task('migrate:undo', shell.task([
  path.sequelize + ' --url "' + process.env.DBURI + '" db:migrate:undo'
]));

gulp.task('migrate:undo:all', shell.task([
  path.sequelize + ' --url "' + process.env.DBURI + '" db:migrate:undo:all'
]));

gulp.task('seed:create', shell.task([
  path.sequelize + ' --url "' + process.env.DBURI  + '" seed:create --name unnamed'
]));

gulp.task('seed', shell.task([
  path.sequelize + ' --url "' + process.env.DBURI  + '" db:seed:all'
]));

gulp.task('seedsome', function() {
  let seedFile = process.argv[4]
  console.log(seedFile)
  console.log( `${path.sequelize} --url "${process.env.DBURI}" db:seed --seed ${seedFile}`)
  shell.task([`${path.sequelize} --url "${process.env.DBURI}" db:seed --seed ${seedFile}`])
  
});

async function seedsome(cb) {
  // body omitted
  let seedFile = []
  seedFile = process.argv[4]
  seedFile = seedFile.split(',')
  console.log(seedFile)
  console.log( `${path.sequelize} db:seed --seed ${seedFile}`)
  for(let i =0; i<seedFile.length ; i++) {

    let test = await exec(`${path.sequelize} db:seed --seed ${seedFile[i]}`)
    console.log(test)
  }

}

exports.seedsome = seedsome
