package com.pagamenti.ks;

import org.junit.jupiter.api.Test;
import java.sql.Connection;
import java.sql.DriverManager;
import java.sql.SQLException;
import static org.junit.jupiter.api.Assertions.*;

public class DatabaseConnectionTest {

    private static final String DB_URL = "jdbc:postgresql://localhost:5432/pagamenti_db";
    private static final String DB_USER = "user";
    private static final String DB_PASSWORD = "password";

    @Test
    public void testDatabaseConnection() {
        try (Connection connection = DriverManager.getConnection(DB_URL, DB_USER, DB_PASSWORD)) {
            assertTrue(connection.isValid(5));
            var metaData = connection.getMetaData();
            System.out.println("\n=== Database Connection Test ===");
            System.out.println("Connected to: " + metaData.getDatabaseProductName() + " " + metaData.getDatabaseProductVersion());
            System.out.println("URL: " + metaData.getURL());
            System.out.println("Username: " + metaData.getUserName());
            System.out.println("Connection test successful!\n");
        } catch (SQLException e) {
            System.err.println("\n=== Database Connection Error ===");
            System.err.println("URL: " + DB_URL);
            System.err.println("Error: " + e.getMessage());
            System.err.println("SQL State: " + e.getSQLState());
            System.err.println("Error Code: " + e.getErrorCode());
            System.err.println("================================\n");
            fail("Database connection failed: " + e.getMessage());
        }
    }
}
