# Use Ubuntu base with Java pre-installed
FROM ubuntu:22.04

# Install Java 17 and Maven
RUN apt-get update && \
    apt-get install -y openjdk-17-jdk maven && \
    apt-get clean && \
    rm -rf /var/lib/apt/lists/*

WORKDIR /app

# Copy project files
COPY backend/pom.xml .
COPY backend/src ./src

# Build application
RUN mvn clean package -DskipTests

# Expose port
EXPOSE 8080

# Run application
CMD ["java", "-jar", "target/attendance-1.0.0.jar"]
