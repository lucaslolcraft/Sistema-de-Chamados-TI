// src/main/java/com/example/Chamados/security/UserDetailServiceImpl.java
package com.example.Chamados.security;

import com.example.Chamados.model.Usuario;
import com.example.Chamados.repository.UsuarioRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.core.userdetails.UserDetailsService;
import org.springframework.security.core.userdetails.UsernameNotFoundException;
import org.springframework.stereotype.Service;

@Service
public class UserDetailServiceImpl implements UserDetailsService {

    @Autowired
    private UsuarioRepository usuarioRepository;

    @Override
    public UserDetails loadUserByUsername(String email) throws UsernameNotFoundException {
        // Buscamos o usuário pelo email (que é o "username" no seu sistema)
    	Usuario usuario = usuarioRepository.findByEmail(email)
    	        .orElseThrow(() -> new UsernameNotFoundException("Usuário não encontrado com o email: " + email));

        return usuario;
    }
}