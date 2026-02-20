// src/main/java/com/example/Chamados/dto/AuthRequestDTO.java
package com.example.Chamados.dto;

public class AuthRequestDTO {
    private String email;
    private String password;
    // getters e setters
    public String getEmail() { return email; }
    public void setEmail(String email) { this.email = email; }
    public String getPassword() { return password; }
    public void setPassword(String password) { this.password = password; }
}