package com.lojajogos.config;

import com.lojajogos.entity.Jogo;
import com.lojajogos.repository.JogoRepository;
import org.springframework.boot.CommandLineRunner;
import org.springframework.boot.web.client.RestTemplateBuilder;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.web.client.RestTemplate;
import org.springframework.web.servlet.config.annotation.CorsRegistry;
import org.springframework.web.servlet.config.annotation.WebMvcConfigurer;

import java.math.BigDecimal;
import java.time.Duration;
import java.util.List;
import java.util.Locale;
import java.util.Set;
import java.util.stream.Collectors;

@Configuration
public class AppConfig {

    @Bean
    public WebMvcConfigurer corsConfigurer() {
        return new WebMvcConfigurer() {
            @Override
            public void addCorsMappings(CorsRegistry registry) {
                registry.addMapping("/**")
                        .allowedOrigins(
                                "http://localhost:3000",
                                "http://127.0.0.1:3000",
                                "http://localhost:5173",
                                "http://127.0.0.1:5173"
                        )
                        .allowedMethods("GET", "POST", "PUT", "DELETE", "OPTIONS")
                        .allowedHeaders("*");
            }
        };
    }

    @Bean
    public RestTemplate restTemplate(RestTemplateBuilder builder) {
        return builder
                .setConnectTimeout(Duration.ofSeconds(2))
                .setReadTimeout(Duration.ofSeconds(2))
                .build();
    }

    @Bean
    public CommandLineRunner carregarJogos(JogoRepository jogoRepository) {
        return args -> {
            List<Jogo> jogos = List.of(
                    jogo("Halo Infinite", "Acao", "Xbox Series", "199.90"),
                    jogo("Forza Horizon 5", "Corrida", "Xbox Series", "249.90"),
                    jogo("Gears 5", "Acao", "Xbox One", "149.90"),
                    jogo("Starfield", "RPG", "Xbox Series", "299.90"),
                    jogo("Sea of Thieves", "Aventura", "Xbox One", "129.90"),
                    jogo("Microsoft Flight Simulator", "Simulacao", "Xbox Series", "239.90"),
                    jogo("Hi-Fi Rush", "Ritmo", "Xbox Series", "119.90"),
                    jogo("Ori and the Will of the Wisps", "Aventura", "Xbox One", "89.90"),
                    jogo("Grounded", "Sobrevivencia", "Xbox Series", "159.90"),
                    jogo("Fable Anniversary", "RPG", "Xbox One", "79.90"),
                    jogo("State of Decay 2", "Sobrevivencia", "Xbox One", "99.90"),
                    jogo("Psychonauts 2", "Plataforma", "Xbox Series", "139.90"),
                    jogo("Age of Empires IV", "Estrategia", "Xbox Series", "179.90"),
                    jogo("Redfall", "Tiro", "Xbox Series", "169.90"),
                    jogo("Forza Motorsport", "Corrida", "Xbox Series", "279.90"),
                    jogo("Halo: The Master Chief Collection", "Tiro", "Xbox One", "169.90"),
                    jogo("Quantum Break", "Acao", "Xbox One", "89.90"),
                    jogo("Sunset Overdrive", "Acao", "Xbox One", "69.90"),
                    jogo("Pentiment", "Narrativo", "Xbox Series", "74.90"),
                    jogo("As Dusk Falls", "Narrativo", "Xbox Series", "99.90"),
                    jogo("God of War Ragnarok", "Acao", "PlayStation 5", "299.90"),
                    jogo("Marvel's Spider-Man 2", "Acao", "PlayStation 5", "349.90"),
                    jogo("The Last of Us Part I", "Aventura", "PlayStation 5", "299.90"),
                    jogo("Horizon Forbidden West", "RPG", "PlayStation 5", "249.90"),
                    jogo("Gran Turismo 7", "Corrida", "PlayStation 5", "259.90"),
                    jogo("Ghost of Tsushima Director's Cut", "Aventura", "PlayStation 5", "249.90"),
                    jogo("Ratchet & Clank: Rift Apart", "Plataforma", "PlayStation 5", "199.90"),
                    jogo("Demon's Souls", "RPG", "PlayStation 5", "229.90"),
                    jogo("Returnal", "Tiro", "PlayStation 5", "219.90"),
                    jogo("Final Fantasy XVI", "RPG", "PlayStation 5", "299.90"),
                    jogo("Uncharted: Legacy of Thieves Collection", "Aventura", "PlayStation 5", "189.90"),
                    jogo("Bloodborne", "RPG", "PlayStation 4", "99.90"),
                    jogo("The Last of Us Part II", "Aventura", "PlayStation 4", "149.90"),
                    jogo("God of War", "Acao", "PlayStation 4", "119.90"),
                    jogo("Marvel's Spider-Man: Miles Morales", "Acao", "PlayStation 5", "179.90"),
                    jogo("Sackboy: A Big Adventure", "Plataforma", "PlayStation 5", "169.90"),
                    jogo("Days Gone", "Sobrevivencia", "PlayStation 4", "109.90"),
                    jogo("Until Dawn", "Terror", "PlayStation 4", "89.90"),
                    jogo("Detroit: Become Human", "Narrativo", "PlayStation 4", "79.90"),
                    jogo("Death Stranding Director's Cut", "Aventura", "PlayStation 5", "199.90"),
                    jogo("Console Xbox One", "Console", "Xbox One", "1899.90"),
                    jogo("Console Xbox Series S", "Console", "Xbox Series", "2799.90"),
                    jogo("Console PlayStation 4", "Console", "PlayStation 4", "2199.90"),
                    jogo("Console PlayStation 5", "Console", "PlayStation 5", "3999.90")
            );

            Set<String> nomesExistentes = jogoRepository.findAll().stream()
                    .map(jogo -> jogo.getNome().toLowerCase(Locale.ROOT))
                    .collect(Collectors.toSet());

            List<Jogo> jogosNovos = jogos.stream()
                    .filter(jogo -> !nomesExistentes.contains(jogo.getNome().toLowerCase(Locale.ROOT)))
                    .toList();

            jogoRepository.saveAll(jogosNovos);
        };
    }

    private Jogo jogo(String nome, String categoria, String plataforma, String preco) {
        return Jogo.builder()
                .nome(nome)
                .categoria(categoria)
                .plataforma(plataforma)
                .preco(new BigDecimal(preco))
                .build();
    }
}
