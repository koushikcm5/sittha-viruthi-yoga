#!/bin/bash
mvn clean package -DskipTests
java -jar target/attendance-1.0.0.jar
