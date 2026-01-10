package com.pagamenti.ks.model;

import com.fasterxml.jackson.annotation.JsonBackReference;
import com.pagamenti.ks.model.enums.TipoPagamento;
import io.swagger.v3.oas.annotations.media.Schema;
import jakarta.persistence.*;
import java.time.LocalDate;

@Entity
@Table(name = "pagamenti")
@Schema(description = "Payment entity representing a payment made by an athlete")
public class Pagamento {
    
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Schema(description = "Unique identifier of the payment", example = "1")
    private Long id;
    
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "atleta_id")
    @JsonBackReference
    @Schema(description = "Athlete who made the payment")
    private Atleta atleta;
    
    @Column(nullable = false)
    @Schema(description = "Payment amount", example = "50.00")
    private Double importo;
    
    @Column(name = "data_pagamento", columnDefinition = "DATE DEFAULT CURRENT_DATE", nullable = false)
    @Schema(description = "Payment date", example = "2024-12-28")
    private LocalDate dataPagamento = LocalDate.now();
    
    @Enumerated(EnumType.STRING)
    @Column(name = "tipo_pagamento", nullable = false)
    @Schema(description = "Payment type and method", example = "CONTANTI")
    private TipoPagamento tipoPagamento;

    // Constructors
    public Pagamento() {}

    // Getters and Setters
    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public Double getImporto() {
        return importo;
    }

    public void setImporto(Double importo) {
        this.importo = importo;
    }

    public LocalDate getData() {
        return data;
    }

    public void setData(LocalDate data) {
        this.data = data;
    }

    public String getMetodoPagamento() {
        return metodoPagamento;
    }

    public void setMetodoPagamento(String metodoPagamento) {
        this.metodoPagamento = metodoPagamento;
    }

    public TipoPagamento getTipoPagamento() {
        return tipoPagamento;
    }

    public void setTipoPagamento(TipoPagamento tipoPagamento) {
        this.tipoPagamento = tipoPagamento;
    }

    public Atleta getAtleta() {
        return atleta;
    }

    public void setAtleta(Atleta atleta) {
        this.atleta = atleta;
    }
}
