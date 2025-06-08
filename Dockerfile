# 1. Basis-Image mit Java 21 (passend zu deiner Java-Version)
FROM eclipse-temurin:21-jre-jammy

# 2. Arbeitsverzeichnis im Container
WORKDIR /app

# 3. Kopiere die Jar-Datei in das Arbeitsverzeichnis
COPY target/easykitchen-0.0.1-SNAPSHOT.jar app.jar

# 4. Container beim Start mit der Jar ausführen
ENTRYPOINT ["java", "-jar", "app.jar"]

# 5. Exponiere den Port, auf dem die Anwendung läuft (optional, falls benötigt)
EXPOSE 8080