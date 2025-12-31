# Use a base image with Java 17
FROM eclipse-temurin:17-jdk-jammy

# Set the working directory inside the container
WORKDIR /app

# Copy the Maven wrapper files
COPY mvnw .
COPY .mvn .mvn

# Copy the pom.xml file
COPY pom.xml .

# Copy the source code
COPY src src

# Build the application
RUN ./mvnw clean package -DskipTests

# Expose the port your app runs on
EXPOSE 8080

# Command to run the application
ENTRYPOINT ["java", "-jar", "target/cms-atleti-backend-0.0.1-SNAPSHOT.jar"]
