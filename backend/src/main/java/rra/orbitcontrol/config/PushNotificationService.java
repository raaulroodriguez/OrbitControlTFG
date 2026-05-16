package rra.orbitcontrol.config;

import com.google.firebase.messaging.*;

import rra.orbitcontrol.models.enums.RolNombre;
import rra.orbitcontrol.services.DispositivoTokenService;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Service;
import java.util.List;

@Service
public class PushNotificationService {
    
    private static final Logger log = LoggerFactory.getLogger(PushNotificationService.class);

    private final DispositivoTokenService dispositivoTokenService;

    public PushNotificationService(DispositivoTokenService dispositivoTokenService) {
        this.dispositivoTokenService = dispositivoTokenService;
    }

    public void enviar(List<String> tokens, String titulo, String cuerpo, String url) {
        if (tokens.isEmpty()) return;

        for (String token : tokens) {
            try {
                Message msg = Message.builder()
                    .putData("title", titulo)
                    .putData("body", cuerpo)
                    .putData("url", url)
                    .setToken(token)
                    .build();

                FirebaseMessaging.getInstance().send(msg);

                log.info("Push enviado a token: {}...", token.substring(0, 20));
            } catch (FirebaseMessagingException e) {
                if (e.getMessagingErrorCode() == MessagingErrorCode.UNREGISTERED) {
                    log.warn("Token inválido, eliminando: {}", token.substring(0, 20));
                    dispositivoTokenService.eliminarToken(token);
                } else {
                    log.error("Error enviando push: {}", e.getMessage());
                }
            }
        }
    }

    public void enviarARol(RolNombre rol, String titulo, String cuerpo, String url) {
        List<String> tokens = dispositivoTokenService.getTokenPorRol(rol);
        enviar(tokens, titulo, cuerpo, url);
    }

    public void enviarARoles(List<RolNombre> roles, String titulo, String cuerpo, String url) {
        roles.forEach(rol -> enviarARol(rol, titulo, cuerpo, url));
    }
}
