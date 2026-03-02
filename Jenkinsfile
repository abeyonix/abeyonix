pipeline {
    agent any

    environment {
        DEPLOY_PATH = "/var/www/projects/abeyonix"
        COMPOSE_FILE = "docker-compose.yml"
    }

    stages {

        stage('Checkout') {
            steps {
                checkout scm
            }
        }

        stage('Build Images') {
            steps {
                sh """
                    cd ${DEPLOY_PATH}
                    docker compose build --no-cache
                """
            }
        }

        stage('Stop Old Containers') {
            steps {
                sh """
                    cd ${DEPLOY_PATH}
                    docker compose down
                """
            }
        }

        stage('Start New Containers') {
            steps {
                sh """
                    cd ${DEPLOY_PATH}
                    docker compose up -d
                """
            }
        }

        stage('Cleanup') {
            steps {
                sh 'docker image prune -f'
            }
        }
    }

    post {
        success {
            echo 'Deployment Successful.'
        }
        failure {
            echo 'Deployment Failed.'
        }
    }
}