// src/main/java/com/example/Chamados/dto/AuthResponseDTO.java
package com.example.Chamados.dto;

public class AuthResponseDTO {
    private String token;
    public AuthResponseDTO(String token) { this.token = token; }
    // getter e setter
    public String getToken() { return token; }
    public void setToken(String token) { this.token = token; }
}