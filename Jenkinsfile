@Library('my-jenkins-shared') _

def modules = [:]
pipeline {
  agent {
    label 'master' // test-1
  }

  environment {
    NVM_DIR = "${HOME}/.nvm"
  }

  stages {
    stage('Info') {
      steps {
        echo "NVM lies in ${NVM_DIR}"

        script {
          telegramSend(message: 'Hello World', chatId: 608276470)
        }

        sh """
          set -ex;
          . ~/.bashrc;

          node --version;
          npm --version;
          """
      }
    }

    stage('Publish extensions') {
      steps {
        script {
          withCredentials([
            string(credentialsId: 'vscode_marketplace_token', variable: 'VSCE_TOKEN'),
          ]) {
            sh """
            . ~/.bashrc > /dev/null;
            set -ex;
            npm install -g vsce;
            bash ./publish.sh
            """
          }
        }
      }
    }
  }
  post {
    // https://www.jenkins.io/doc/pipeline/tour/post/
    // https://plugins.jenkins.io/telegram-notifications/
    failure {
      // withCredentials([
      //   string(credentialsId: 'jk_pipeline_report_to_email', variable: 'TO_EMAIL')
      // ]) {
      //   mail to: "${TO_EMAIL}",
      //       subject: "Failed Pipeline: ${currentBuild.fullDisplayName}",
      //       body: "Something is wrong with ${env.BUILD_URL}"
      // }

      withCredentials([
        string(credentialsId: 'jk_pipeline_report_to_telegram_token', variable: 'TL_TOKEN'),
        string(credentialsId: 'jk_pipeline_report_to_telegram_chatId', variable: 'TL_CHAT_ID')
      ]) {
        telegram.sendStatusFail(TL_TOKEN, TL_CHAT_ID)
      }
    }
    success {
      script {
        // withCredentials([
        //   string(credentialsId: 'jk_pipeline_report_to_email', variable: 'TO_EMAIL')
        // ]) {
        //   mail to: "${TO_EMAIL}",
        //       subject: "Failed Pipeline: ${currentBuild.fullDisplayName}",
        //       body: "Build finished with success: ${env.BUILD_URL}"
        // }

        withCredentials([
          string(credentialsId: 'jk_pipeline_report_to_telegram_token', variable: 'TL_TOKEN'),
          string(credentialsId: 'jk_pipeline_report_to_telegram_chatId', variable: 'TL_CHAT_ID')
        ]) {
          telegram.sendStatusOK(TL_TOKEN, TL_CHAT_ID)
        }
      }
    }
  }
}
