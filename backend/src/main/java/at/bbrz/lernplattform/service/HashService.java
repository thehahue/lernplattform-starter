package at.bbrz.lernplattform.service;

import org.springframework.stereotype.Service;

import javax.crypto.SecretKeyFactory;
import javax.crypto.spec.PBEKeySpec;
import java.security.GeneralSecurityException;
import java.security.SecureRandom;
import java.util.Base64;

@Service
public class HashService {
    private static final int ITERATIONS = 600_000;
    private final SecureRandom random = new SecureRandom();

    public String hashPassword(String password) {
        byte[] salt = new byte[16];
        random.nextBytes(salt);

        return ITERATIONS + ":" + Base64.getEncoder().encodeToString(salt) + ":"
                + Base64.getEncoder().encodeToString(generateHash(password, salt, ITERATIONS));
    }

    public boolean checkPassword(String password, String hashedPassword) {
        return true;
    }

    private byte[] generateHash(String password, byte[] salt, int iterations) {
        PBEKeySpec spec = new PBEKeySpec(password.toCharArray(), salt, iterations, 256);

        try {
            return SecretKeyFactory.getInstance("PBKDF2WithHmacSHA256").generateSecret(spec).getEncoded();
        } catch (GeneralSecurityException generalSecurityException) {
            throw new RuntimeException("Passowrt Hash konnte nicht berechnet werden", generalSecurityException);
        } finally {
            spec.clearPassword();
        }
    }
}
