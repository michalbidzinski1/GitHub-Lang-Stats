`GET REQUEST ON http://20.93.237.129:3000/{username}`

E.G `GET REQUEST ON` http://20.93.237.129:3000/michalbidzinski1
```
{"languages":{"JavaScript":"55.4%","HTML":"6.9%","CSS":"4.7%","Dockerfile":"0.8%","SCSS":"4.9%","Java":"10.3%","Python":"17.0%","Shell":"0.0%"},"repositories":["Docker_Kubernetes_Labs","Frontend-HTTP-MQTT-Project","frontend-prj","GitHub-Lang-Stats","JavaProjects","Keycloak-auth-react","Kubernetes-React-Nginx","michalbidzinski1","project-python-testing","Python-mock-testing","React-Meetup-Project","React-Redux-Project","StrokePrediction","Travelling-Salesman-Problem"]}
```
```
E.G get request on user which does not exsists
http://20.93.237.129:3000/qweqwahsd
output: There is no user with such name!
```
```
E.G get request on user with empty repositories
http://20.93.237.129:3000/xasdas
output: This user has empty repositories!
```
