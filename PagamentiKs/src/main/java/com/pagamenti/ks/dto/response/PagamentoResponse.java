package com.pagamenti.ks.dto.response;

import com.pagamenti.ks.model.enums.TipoPagamento;
import io.swagger.v3.oas.annotations.media.Schema;

import java.time.LocalDate;

@Schema(description = "Payment response DTO with athlete information")
public class PagamentoResponse {
    
    @Schema(description = "Unique identifier of the payment", example = "1")
    private Long id;
    
    @Schema(description = "Payment amount", example = "50.00")
    private Double importo;
    
    @Schema(description = "Payment date", example = "2024-12-28")
    private LocalDate data;
    
    @Schema(description = "Payment type", example = "CONTANTI")
    private TipoPagamento tipoPagamento;
    
    @Schema(description = "Payment method", example = "Contanti")
    private String metodoPagamento;
    
    @Schema(description = "Athlete information")
    private AthleteInfo atleta;

    public static class AthleteInfo {
        @Schema(description = "Athlete ID", example = "1")
        private Long id;
        
        @Schema(description = "Athlete first name", example = "Mario")
        private String nome;
        
        @Schema(description = "Athlete last name", example = "Rossi")
        private String cognome;

        public AthleteInfo() {}

        public AthleteInfo(Long id, String nome, String cognome) {
            this.id = id;
            this.nome = nome;
            this.cognome = cognome;
        }

        public Long getId() { return id; }
        public void setId(Long id) { this.id = id; }

        public String getNome() { return nome; }
        public void setNome(String nome) { this.nome = nome; }

        public String getCognome() { return cognome; }
        public void setCognome(String cognome) { this.cognome = cognome; }
    }

    public PagamentoResponse() {}

    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }

    public Double getImporto() { return importo; }
    public void setImporto(Double importo) { this.importo = importo; }

    public LocalDate getData() { return data; }
    public void setData(LocalDate data) { this.data = data; }

    public TipoPagamento getTipoPagamento() { return tipoPagamento; }
    public void setTipoPagamento(TipoPagamento tipoPagamento) { this.tipoPagamento = tipoPagamento; }

    public String getMetodoPagamento() { return metodoPagamento; }
    public void setMetodoPagamento(String metodoPagamento) { this.metodoPagamento = metodoPagamento; }

    public AthleteInfo getAtleta() { return atleta; }
    public void setAtleta(AthleteInfo atleta) { this.atleta = atleta; }
}
