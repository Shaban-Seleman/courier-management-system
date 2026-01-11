# Stage 1: Build
FROM eclipse-temurin:17-jdk-jammy as builder
WORKDIR /app
COPY pom.xml .
COPY src ./src
RUN mvn clean package -DskipTests

# Stage 2: Runtime
FROM eclipse-temurin:17-jdk-jammy
WORKDIR /app
COPY --from=builder /app/target/order-service-0.0.1-SNAPSHOT.jar app.jar
ENV JAVA_OPTS="-Xms512m -Xmx1024m -XX:+UseG1GC"
EXPOSE 8080
ENTRYPOINT ["java", "-jar", "app.jar"]
