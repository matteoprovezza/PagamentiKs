package com.pagamenti.ks.service;

import com.pagamenti.ks.model.Atleta;
import com.pagamenti.ks.model.Pagamento;
import org.springframework.stereotype.Service;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.Year;
import java.time.ZoneId;
import java.util.*;
import java.util.stream.Collectors;

@Service
public class ReportService {

    private final AtletaService atletaService;
    private final PagamentoService pagamentoService;

    public ReportService(AtletaService atletaService, PagamentoService pagamentoService) {
        this.atletaService = atletaService;
        this.pagamentoService = pagamentoService;
    }

    public Map<String, Object> getDashboardStats() {
        Map<String, Object> stats = new HashMap<>();
        
        List<Atleta> allAthletes = atletaService.findAll();
        List<Atleta> activeAthletes = atletaService.findActiveAthletes();
        List<Pagamento> recentPayments = pagamentoService.findRecentPayments(30);
        
        stats.put("totalAthletes", allAthletes.size());
        stats.put("activeAthletes", activeAthletes.size());
        stats.put("inactiveAthletes", allAthletes.size() - activeAthletes.size());
        stats.put("recentPayments", recentPayments.size());
        
        Double totalRecentPayments = recentPayments.stream()
                .mapToDouble(Pagamento::getImporto)
                .sum();
        stats.put("totalRecentPayments", totalRecentPayments);
        
        List<Atleta> expiringCertificates = atletaService.findAthletesWithExpiringCertificate(30);
        stats.put("expiringCertificates", expiringCertificates.size());
        
        return stats;
    }

    public Map<String, Double> getMonthlyRevenue(int year) {
        Map<String, Double> monthlyRevenue = new HashMap<>();
        
        for (int month = 1; month <= 12; month++) {
            LocalDate startDate = LocalDate.of(year, month, 1);
            LocalDate endDate = startDate.withDayOfMonth(startDate.lengthOfMonth());
            
            Double monthlyTotal = pagamentoService.findByDateRange(startDate, endDate).stream()
                    .mapToDouble(p -> p.getImporto() != null ? p.getImporto() : 0.0)
                    .sum();
            monthlyRevenue.put(getMonthName(month), monthlyTotal);
        }
        
        return monthlyRevenue;
    }

    public Map<String, Object> getAthleteStats() {
        Map<String, Object> stats = new HashMap<>();
        
        List<Atleta> allAthletes = atletaService.findAll();
        long totalAthletes = allAthletes.size();
        
        Map<String, Long> registrationByYear = allAthletes.stream()
                .filter(atleta -> atleta.getDataIscrizione() != null)
                .collect(Collectors.groupingBy(
                        atleta -> String.valueOf(atleta.getDataIscrizione().getYear()),
                        Collectors.counting()
                ));
        
        Map<Boolean, Long> activeInactiveStats = allAthletes.stream()
                .collect(Collectors.groupingBy(
                        Atleta::isAttivo,
                        Collectors.counting()
                ));
        
        stats.put("totalAthletes", totalAthletes);
        stats.put("registrationByYear", registrationByYear);
        stats.put("activeAthletes", activeInactiveStats.getOrDefault(true, 0L));
        stats.put("inactiveAthletes", activeInactiveStats.getOrDefault(false, 0L));
        
        return stats;
    }

    public List<Map<String, Object>> getTopPayingAthletes(int limit) {
        List<Atleta> athletes = atletaService.findAll();
        
        return athletes.stream()
                .map(atleta -> {
                    Map<String, Object> athleteData = new HashMap<>();
                    athleteData.put("atleta", atleta);
                    athleteData.put("totalPaid", pagamentoService.getTotalPaymentsByAtleta(atleta.getId()));
                    return athleteData;
                })
                .sorted((a, b) -> Double.compare((Double) b.get("totalPaid"), (Double) a.get("totalPaid")))
                .limit(limit)
                .collect(Collectors.toList());
    }

    public Map<String, Object> getPaymentMethodStats() {
        List<Pagamento> allPayments = pagamentoService.findAll();
        
        Map<String, Long> paymentMethodCounts = allPayments.stream()
                .filter(pagamento -> pagamento.getMetodoPagamento() != null)
                .collect(Collectors.groupingBy(
                        Pagamento::getMetodoPagamento,
                        Collectors.counting()
                ));
        
        Map<String, Double> paymentMethodTotals = allPayments.stream()
                .filter(pagamento -> pagamento.getMetodoPagamento() != null)
                .collect(Collectors.groupingBy(
                        Pagamento::getMetodoPagamento,
                        Collectors.mapping(
                                Pagamento::getImporto,
                                Collectors.summingDouble(Double::doubleValue)
                        )
                ));
        
        Map<String, Object> stats = new HashMap<>();
        stats.put("counts", paymentMethodCounts);
        stats.put("totals", paymentMethodTotals);
        
        return stats;
    }

    private String getMonthName(int month) {
        String[] months = {"Gennaio", "Febbraio", "Marzo", "Aprile", "Maggio", "Giugno",
                          "Luglio", "Agosto", "Settembre", "Ottobre", "Novembre", "Dicembre"};
        return months[month - 1];
    }
}
