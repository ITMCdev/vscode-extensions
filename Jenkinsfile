@Library('my-jenkins-shared') _

def modules = [:]
pipeline {
  agent {
    label 'master' // test-1
  }

  stages {
    stage('Info') {
      steps {
        echo "NVM lies in ${NVM_DIR}"

        script {
          telegramSend(message: 'Hello World', chatId: 608276470)
        }

        nvm.runSh """
          node --version;
          npm --version;
          """, '14'
      }
    }

    stage('Publish extensions') {
      steps {
        script {
          withCredentials([
            string(credentialsId: 'vscode_marketplace_token', variable: 'VSCE_TOKEN'),
          ]) {
            npm.runSh '''
            npm install -g vsce;
            bash ./publish.sh
            ''', '14'
          }
        }
      }
    }
  }
  post {
    // https://www.jenkins.io/doc/pipeline/tour/post/
    // https://plugins.jenkins.io/telegram-notifications/
    failure {
      script {
        telegram.sendStatusFail('jk_pipeline_report_to_telegram_token', 'jk_pipeline_report_to_telegram_chatId')
      }
    }
    success {
      script {
        telegram.sendStatusOk('jk_pipeline_report_to_telegram_token', 'jk_pipeline_report_to_telegram_chatId')
      }
    }
  }
}
