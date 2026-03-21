pipeline {
    agent any

    stages {
        stage('Clean Project') {
            steps {
                echo '--- Cleaning the project ---'
                bat 'kubectl delete secret xaiht-certs --ignore-not-found=true'
                bat 'kubectl delete -f kubernetes-deployment.yaml --ignore-not-found=true'
                bat 'pause 10'
                bat 'kubectl delete -f kubernetes-deployment.yaml --ignore-not-found=true'
                bat 'pause 10'
                bat 'docker image rm -f angelakimichellle/xaiht:latest 2>nul || exit 0'
                bat 'pause 10'
                bat 'docker image rm -f angelakimichellle/xaiht:latest 2>nul || exit 0'
            }
        }

        stage('Deploy to Kubernetes') {
            steps {
                echo '--- Deploying to Kubernetes ---'
                bat 'kubectl create secret generic xaiht-certs --from-file=key.pem="C:\\Users\\angel\\certs\\localhost-key.pem" --from-file=cert.pem="C:\\Users\\angel\\certs\\localhost.pem"'
                bat 'kubectl apply -f kubernetes-deployment.yaml'
            }
        }
    }

    post {
        always {
            echo 'Pipeline finished.'
        }
        success {
            echo 'Project successfully deployed!'
        }
        failure {
            echo 'Pipeline failed. Please check the console output.'
        }
    }
}