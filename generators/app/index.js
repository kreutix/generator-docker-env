'use strict';
const Generator = require('yeoman-generator');
const chalk = require('chalk');
const yosay = require('yosay');
const uuid = require('uuid/v4');


module.exports = class extends Generator {
  prompting() {
    // Have Yeoman greet the user.
    this.log(
      yosay(`Welcome to the luminous ${chalk.red('generator-docker-env')} generator!`)
    );

    const prompts = [
      {
        type: 'input',
        name: 'name',
        message: 'Project name:',
      },
      {
        type: 'input',
        name: 'hostname',
        message: 'Hostname:',
      }
    ];
    
    return this.prompt(prompts).then(props => {
      // To access props later use this.props.someAnswer;
      this.props = props;
    });
  }

  writing() { let self = this;
    let config = {
      hostname: self.props.hostname,
      has: {
        php: true,
        mysql: true,
      },
      mysql: {
        user: 'app',
        pass: uuid(),
        database: self.props.name,
        root_pass: uuid(),
      }
    }
    let productionSet = [
      ['copyTpl', 'docker-compose.production.yml', 'docker-compose.yml'],
      ['copyTpl', 'etc/environment.yml', '.env'],
    ]
    if (config.has.php) {
      productionSet.push(['copy', 'docker/php/php-apache-7.3.production', 'docker/php/Dockerfile'])
      productionSet.push(['copy', 'docker/php/conf/production.ini', 'docker/php/conf/php.ini'])
    }
    if (config.has.mysql) {
      productionSet.push(['copy', 'docker/mysql/MySQL-5.7.Dockerfile', 'docker/mysql/Dockerfile'])
      productionSet.push(['copy', 'docker/mysql/conf/*', 'docker/mysql/conf'])
    }
    productionSet.forEach(files => {
      let [mode, from, to] = files
      if (from && to) {
        if (mode == 'copyTpl') {
          self.fs.copyTpl(
            self.templatePath(from),
            self.destinationPath(to),
            config,
          )  
        } else {
          self.fs.copy(
            self.templatePath(from),
            self.destinationPath(to)
          )
        }
      }
    })
  }
};
