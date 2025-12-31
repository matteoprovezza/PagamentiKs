package com.pagamenti.ks.controller;

import com.pagamenti.ks.model.Atleta;
import com.pagamenti.ks.service.AtletaService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.Parameter;
import io.swagger.v3.oas.annotations.responses.ApiResponse;
import io.swagger.v3.oas.annotations.responses.ApiResponses;
import io.swagger.v3.oas.annotations.tags.Tag;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/v1/atleti")
@Tag(name = "Athletes", description = "Athletes management API")
public class AtletaController {

    private final AtletaService atletaService;

    public AtletaController(AtletaService atletaService) {
        this.atletaService = atletaService;
    }

    @GetMapping({"", "/all"})
    @Operation(summary = "Get all athletes or search by name", 
               description = "Retrieve all athletes or search by name/surname")
    @ApiResponses(value = {
        @ApiResponse(responseCode = "200", description = "Successfully retrieved athletes"),
        @ApiResponse(responseCode = "400", description = "Invalid search parameter")
    })
    public ResponseEntity<List<Atleta>> getAll(
            @Parameter(description = "Search term for name or surname", required = false)
            @RequestParam(required = false) String search) {
        if (search == null || search.isEmpty()) {
            return ResponseEntity.ok(atletaService.findAll());
        } else {
            return ResponseEntity.ok(atletaService.search(search));
        }
    }

    @GetMapping("/{id}")
    @Operation(summary = "Get athlete by ID")
    public ResponseEntity<Atleta> getOne(@PathVariable Long id) {
        return atletaService.findById(id)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }

    @GetMapping("/active")
    @Operation(summary = "Get all active athletes")
    public ResponseEntity<List<Atleta>> getActiveAthletes() {
        return ResponseEntity.ok(atletaService.findActiveAthletes());
    }

    @GetMapping("/expiring-certificates")
    @Operation(summary = "Get athletes with certificates expiring in next X days")
    public ResponseEntity<List<Atleta>> getAthletesWithExpiringCertificates(
            @RequestParam(defaultValue = "30") int days) {
        return ResponseEntity.ok(atletaService.findAthletesWithExpiringCertificate(days));
    }

    @PostMapping({"", "/create"})
    @Operation(summary = "Create a new athlete")
    public ResponseEntity<Atleta> create(@RequestBody Atleta atleta) {
        Atleta savedAtleta = atletaService.save(atleta);
        return ResponseEntity.ok(savedAtleta);
    }

    @PutMapping("/{id}")
    @Operation(summary = "Update an existing athlete")
    public ResponseEntity<Atleta> update(@PathVariable Long id, @RequestBody Atleta atleta) {
        try {
            Atleta updatedAtleta = atletaService.update(id, atleta);
            return ResponseEntity.ok(updatedAtleta);
        } catch (RuntimeException e) {
            return ResponseEntity.notFound().build();
        }
    }

    @PutMapping("/{id}/disable")
    @Operation(summary = "Disable an athlete")
    public ResponseEntity<Atleta> disableAtleta(@PathVariable Long id) {
        try {
            Atleta disabledAtleta = atletaService.disableAtleta(id);
            return ResponseEntity.ok(disabledAtleta);
        } catch (RuntimeException e) {
            return ResponseEntity.notFound().build();
        }
    }

    @PutMapping("/{id}/enable")
    @Operation(summary = "Enable an athlete")
    public ResponseEntity<Atleta> enableAtleta(@PathVariable Long id) {
        try {
            Atleta enabledAtleta = atletaService.enableAtleta(id);
            return ResponseEntity.ok(enabledAtleta);
        } catch (RuntimeException e) {
            return ResponseEntity.notFound().build();
        }
    }

    @DeleteMapping("/{id}")
    @Operation(summary = "Delete an athlete")
    public ResponseEntity<Void> delete(@PathVariable Long id) {
        atletaService.deleteById(id);
        return ResponseEntity.noContent().build();
    }
}