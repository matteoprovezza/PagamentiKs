package com.pagamenti.ks.controller;

import com.pagamenti.ks.service.ReportService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.HashMap;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/v1/reports")
@Tag(name = "Reports", description = "Reports and analytics API")
public class ReportController {

    private final ReportService reportService;

    public ReportController(ReportService reportService) {
        this.reportService = reportService;
    }

    @GetMapping("/dashboard")
    @Operation(summary = "Get dashboard statistics")
    public ResponseEntity<Map<String, Object>> getDashboardStats() {
        Map<String, Object> stats = reportService.getDashboardStats();
        return ResponseEntity.ok(stats);
    }

    @GetMapping("/monthly-revenue/{year}")
    @Operation(summary = "Get monthly revenue for a specific year")
    public ResponseEntity<Map<String, Double>> getMonthlyRevenue(@PathVariable int year) {
        Map<String, Double> monthlyRevenue = reportService.getMonthlyRevenue(year);
        return ResponseEntity.ok(monthlyRevenue);
    }

    @GetMapping("/athletes/stats")
    @Operation(summary = "Get athlete statistics")
    public ResponseEntity<Map<String, Object>> getAthleteStats() {
        Map<String, Object> stats = reportService.getAthleteStats();
        return ResponseEntity.ok(stats);
    }

    @GetMapping("/athletes/top-payers")
    @Operation(summary = "Get top paying athletes")
    public ResponseEntity<Map<String, Object>> getTopPayingAthletes(
            @RequestParam(defaultValue = "10") int limit) {
        List<Map<String, Object>> topPayers = reportService.getTopPayingAthletes(limit);
        Map<String, Object> result = new HashMap<>();
        result.put("topPayers", topPayers);
        return ResponseEntity.ok(result);
    }

    @GetMapping("/payments/method-stats")
    @Operation(summary = "Get payment method statistics")
    public ResponseEntity<Map<String, Object>> getPaymentMethodStats() {
        Map<String, Object> stats = reportService.getPaymentMethodStats();
        return ResponseEntity.ok(stats);
    }
}
