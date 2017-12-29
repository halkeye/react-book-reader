pipeline {
  agent {
    docker {
      image 'node:9'
    }
  }

  options {
    timeout(time: 10, unit: 'MINUTES')
      ansiColor('xterm')
  }

  stages {
    stage('Install') {
      steps {
        sh 'npm install'
      }
    }

    stage('Test') {
      environment {
        CC_TEST_REPORTER_ID = credentials('github-halkeye-react-book-reader')
      }
      steps {
        sh """
          export GIT_BRANCH=${BRANCH_NAME}
          wget -O cc-test-reporter https://codeclimate.com/downloads/test-reporter/test-reporter-latest-linux-amd64
          chmod +x cc-test-reporter
          ./cc-test-reporter before-build
          npm run test
          ./cc-test-reporter after-build -r $CC_TEST_REPORTER_ID --debug || true;
        """
      }
    }

    stage('Build') {
      steps {
        sh 'npm run build:prod'
      }
    }

    stage('Deploy') {
      when {
        branch 'master'
      }
      environment {
        SURGE = credentials('halkeye-surge')
      }
      steps {
        sh 'SURGE_LOGIN=$SURGE_USR SURGE_TOKEN=$SURGE_PSW npx surge -p dist -d reader.saltystories.ca'
      }
    }
  }
}
