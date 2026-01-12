# Stage 1: Build
FROM maven:3.9.6-eclipse-temurin-17 as builder
WORKDIR /app
COPY pom.xml .
COPY src ./src
RUN mvn clean package -DskipTests

# Stage 2: Runtime
FROM eclipse-temurin:17-jdk-jammy
WORKDIR /app
COPY --from=builder /app/target/auth-service-0.0.1-SNAPSHOT.jar app.jar
ENV JAVA_OPTS="-Xms512m -Xmx1024m -XX:+UseG1GC"
EXPOSE 8081
ENTRYPOINT ["java", "-jar", "app.jar"]
