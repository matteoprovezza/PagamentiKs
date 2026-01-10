package com.pagamenti.ks.model;

import com.fasterxml.jackson.annotation.JsonInclude;
import com.fasterxml.jackson.annotation.JsonManagedReference;
import com.fasterxml.jackson.annotation.JsonProperty;
import io.swagger.v3.oas.annotations.media.Schema;
import jakarta.persistence.*;
import java.time.LocalDate;
import java.util.List;

@Entity
@Table(name = "atleti")
@Schema(description = "Athlete entity representing a sports athlete")
@JsonInclude(JsonInclude.Include.ALWAYS)
public class Atleta {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Schema(description = "Unique identifier of the athlete", example = "1")
    private Long id;
    
    @Schema(description = "First name of the athlete", example = "Mario")
    private String nome;
    
    @Schema(description = "Last name of the athlete", example = "Rossi")
    private String cognome;
    
    @Schema(description = "Codice Fiscale of the athlete")
    @Column(nullable = true)
    private String cf;
    
    @Column(nullable = true)
    private LocalDate dataNascita;
    
    @Column(nullable = true)
    private String indirizzo;
    
    @Column(nullable = true)
    private String telefono;
    
    @Column(nullable = true)
    private String email;
    
    @Column(name = "data_iscrizione", nullable = true)
    @Schema(description = "Data di iscrizione dell'atleta")
    private LocalDate dataIscrizione;
    
    @Column(name = "data_scadenza_certificato", nullable = true)
    @Schema(description = "Data di scadenza del certificato medico")
    private LocalDate dataScadenzaCertificato;
    
    @Column(name = "scadenza_tesseramento_asc", nullable = true)
    @Schema(description = "Scadenza tesseramento ASC", example = "2024-12-31")
    @JsonProperty("scadenzaTesseramentoAsc")
    private LocalDate scadenzaTesseramentoAsc;
    
    @Column(nullable = true)
    private String note;
    
    @Column(nullable = false)
    private Boolean attivo = true;
    
    @Column(nullable = true)
    private LocalDate disableDate;
    
    @OneToMany(mappedBy = "atleta", cascade = CascadeType.ALL, orphanRemoval = true)
    @JsonManagedReference
    private List<Pagamento> pagamenti;

    // Constructors
    public Atleta() {}

    // Getters and Setters
    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public String getNome() {
        return nome;
    }

    public void setNome(String nome) {
        this.nome = nome;
    }

    public String getCognome() {
        return cognome;
    }

    public void setCognome(String cognome) {
        this.cognome = cognome;
    }

    public String getCf() {
        return cf;
    }

    public void setCf(String cf) {
        this.cf = cf;
    }

    public LocalDate getDataNascita() {
        return dataNascita;
    }

    public void setDataNascita(LocalDate dataNascita) {
        this.dataNascita = dataNascita;
    }

    public String getIndirizzo() {
        return indirizzo;
    }

    public void setIndirizzo(String indirizzo) {
        this.indirizzo = indirizzo;
    }

    public String getTelefono() {
        return telefono;
    }

    public void setTelefono(String telefono) {
        this.telefono = telefono;
    }

    public String getEmail() {
        return email;
    }

    public void setEmail(String email) {
        this.email = email;
    }

    public LocalDate getDataIscrizione() {
        return dataIscrizione;
    }

    public void setDataIscrizione(LocalDate dataIscrizione) {
        this.dataIscrizione = dataIscrizione;
    }

    public LocalDate getDataScadenzaCertificato() {
        return dataScadenzaCertificato;
    }

    public void setDataScadenzaCertificato(LocalDate dataScadenzaCertificato) {
        this.dataScadenzaCertificato = dataScadenzaCertificato;
    }

    public LocalDate getScadenzaTesseramentoAsc() {
        return scadenzaTesseramentoAsc;
    }

    public void setScadenzaTesseramentoAsc(LocalDate scadenzaTesseramentoAsc) {
        this.scadenzaTesseramentoAsc = scadenzaTesseramentoAsc;
    }

    public String getNote() {
        return note;
    }

    public void setNote(String note) {
        this.note = note;
    }

    public Boolean isAttivo() {
        return attivo;
    }

    public void setAttivo(Boolean attivo) {
        this.attivo = attivo;
    }

    public LocalDate getDisableDate() {
        return disableDate;
    }

    public void setDisableDate(LocalDate disableDate) {
        this.disableDate = disableDate;
    }

    public List<Pagamento> getPagamenti() {
        return pagamenti;
    }

    public void setPagamenti(List<Pagamento> pagamenti) {
        this.pagamenti = pagamenti;
    }
}
