FROM maven:3.6.1-jdk-11
COPY pom.xml ./pom.xml
COPY src ./src
RUN mvn package

FROM openjdk:11.0.3-stretch
ARG VERSION
COPY --from=0 ./target/diabetips-api-$VERSION.jar ./diabetips-api.jar
CMD ["java", "-jar", "diabetips-api.jar"]
