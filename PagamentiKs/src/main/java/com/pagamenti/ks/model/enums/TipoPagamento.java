package com.pagamenti.ks.model.enums;

public enum TipoPagamento {
    BONIFICO,
    CONTANTI;

    public static TipoPagamento fromValue(String value) {
        if (value == null) return null;
        try {
            return TipoPagamento.valueOf(value.toUpperCase());
        } catch (IllegalArgumentException e) {
            return null;
        }
    }
}
