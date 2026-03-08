# Use Java 21
FROM eclipse-temurin:21-jdk

# Working directory
WORKDIR /app

# Copy jar file
COPY target/*.jar app.jar

# Run application
ENTRYPOINT ["java","-jar","app.jar"]