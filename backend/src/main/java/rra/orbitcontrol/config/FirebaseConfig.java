package rra.orbitcontrol.config;

import com.google.auth.oauth2.GoogleCredentials;
import com.google.firebase.FirebaseApp;
import com.google.firebase.FirebaseOptions;
import org.springframework.context.annotation.Configuration;
import jakarta.annotation.PostConstruct;
import java.io.ByteArrayInputStream;
import java.io.InputStream;
import java.util.Base64;

@Configuration
public class FirebaseConfig {

    @PostConstruct
    public void initFirebase() throws Exception {
        if (FirebaseApp.getApps().isEmpty()) {
            InputStream serviceAccount = resolveCredentials();

            if (serviceAccount == null) {
                System.out.println("[FirebaseConfig] Credenciales no encontradas — Firebase desactivado.");
                return;
            }

            FirebaseOptions options = FirebaseOptions.builder()
                    .setCredentials(GoogleCredentials.fromStream(serviceAccount))
                    .build();

            FirebaseApp.initializeApp(options);
            System.out.println("[FirebaseConfig] Firebase inicializado correctamente.");
        }
    }

    /**
     * Prioridad:
     * 1. Variable de entorno FIREBASE_SERVICE_ACCOUNT (JSON en Base64)
     * 2. Fichero firebase-service-account.json en resources (solo local)
     */
    private InputStream resolveCredentials() {
        String envJson = System.getenv("FIREBASE_SERVICE_ACCOUNT");
        if (envJson != null && !envJson.isBlank()) {
            System.out.println("[FirebaseConfig] Usando credenciales desde variable de entorno.");
            byte[] decoded = Base64.getDecoder().decode(envJson.trim());
            return new ByteArrayInputStream(decoded);
        }

        InputStream file = getClass().getResourceAsStream("/firebase-service-account.json");
        if (file != null) {
            System.out.println("[FirebaseConfig] Usando credenciales desde fichero local.");
        }
        return file;
    }
}
