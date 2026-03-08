# Use an official Java runtime as a parent image (Ubuntu-based)
FROM openjdk:21-jdk-bullseye

# Set the working directory inside the container
WORKDIR /app

# Install Maven (now it will work since we're using an Ubuntu-based image)
RUN apt-get update && apt-get install -y maven

# Copy the source code to the container (this includes the pom.xml, src, etc.)
COPY . /app

# Build the project using Maven (this will generate the .jar file in the target folder)
RUN mvn clean package -DskipTests

# Specify the command to run the .jar file
CMD ["java", "-jar", "target/BrainConnect-0.0.1-SNAPSHOT.jar"]
