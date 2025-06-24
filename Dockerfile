# 1. Base image with Java 21 version
FROM eclipse-temurin:21-jre-jammy

# 2. Set working directory inside the container
WORKDIR /app

# 3. Copy the built JAR file into the working directory
COPY target/easykitchen-0.0.1-SNAPSHOT.jar app.jar

# 4. Run the JAR file when the container starts
ENTRYPOINT ["java", "-jar", "app.jar"]

# 5. Expose the port the application runs on
EXPOSE 8080