# Lernraum – Ausgangsprojekt für den Unterricht

Ihr entwickelt ein Backend mit **Java 21, Spring Boot 4.1.2, Spring Data JDBC und H2**. Das Frontend ist fertig und wird als Arbeit eines anderen Teams übernommen. Eure Aufgabe ist, die vorgegebene REST-Schnittstelle passend zum ER-Modell umzusetzen.

## Was ist vorbereitet?

```text
lernplattform-starter/
  backend/
    pom.xml                        Abhängigkeiten und Java 21
    mvnw, mvnw.cmd, .mvn/          Maven Wrapper
    start.sh                       Starthelfer für Linux/macOS
    src/main/java/at/bbrz/lernplattform/
      LernplattformApplication.java
    src/main/resources/
      application.yml             H2 und Server-Grundkonfiguration
  frontend/                       fertige Oberfläche, eigenständig gestartet
    index.html, styles.css, app.js
    api.js                        alle REST-Aufrufe
    config.js                     Backend-Adresse
    start.sh
  docs/
    ER-MODELL.md                   Datenmodell und fachliche Regeln
    lernraum-er.drawio             bearbeitbares Diagramm
    lernraum-er.png                Diagramm als Bild
    API.md                        REST-Schnittstellenbeschreibung
    openapi.yaml                  maschinenlesbarer API-Vertrag
    requests.http                 Beispielanfragen zum Ausprobieren
```

Das Java-Backend enthält nur die Startklasse. Controller, Services, Repositories, Entities, DTOs, Anmeldung, CORS-Konfiguration, Datenbankschema und Beispieldaten werden im Unterricht entwickelt. Es gibt keine Musterlösung oder vorbereiteten Benutzerkonten in diesem Projekt.

Die benötigten Abhängigkeiten sind bereits eingetragen: Web MVC, Spring Data JDBC, Validation, H2, H2-Konsole und Web-MVC-Testunterstützung. Spring Security und JPA sind nicht enthalten.

## Backend starten

Voraussetzung: JDK 21. Beim ersten Build benötigt der Maven Wrapper Internetzugriff zum Laden der Werkzeuge und Abhängigkeiten.

Aus diesem Projektordner:

```bash
./backend/start.sh
```

Alternativ:

```bash
cd backend
./mvnw spring-boot:run
```

Unter Windows im Backend-Verzeichnis `mvnw.cmd spring-boot:run` ausführen. In der IDE `backend/pom.xml` als Maven-Projekt öffnen und JDK 21 einstellen; anschließend kann auch die Main-Klasse direkt gestartet werden. Arbeitsverzeichnis dabei auf `backend/` setzen.

Backend: **http://localhost:8080**. Der Server startet, stellt aber anfangs noch keine eigenen Endpunkte bereit. Daher sind 404-Antworten auf `/`, `/api/auth/me` und andere `/api/...`-Pfade erwartbar.

H2-Konsole: **http://localhost:8080/h2-console**.

| Einstellung | Wert |
| --- | --- |
| JDBC-URL | `jdbc:h2:file:./data/lernraum` |
| Benutzer | `sa` |
| Passwort | leer |

Die Datenbank startet ohne Fachtabellen. Erst im Unterricht erstellt ihr `src/main/resources/schema.sql`. Später gespeicherte Daten liegen im Backend-Verzeichnis unter `data/` und bleiben bei einem Neustart erhalten. Das ist eine eigene Datenbank dieses Ausgangsprojekts.

## Frontend starten

In einem zweiten Terminal aus diesem Projektordner:

```bash
./frontend/start.sh
```

Alternativ mit Python 3:

```bash
python3 -m http.server 5500 --bind 127.0.0.1 --directory frontend
```

Unter Windows gegebenenfalls `py` statt `python3` verwenden. Anschließend **http://localhost:5500** öffnen. HTML nicht per Doppelklick als `file://` öffnen.

Die Oberfläche erscheint bereits; Anmeldung und Datenverwaltung funktionieren erst, wenn ihr die zugehörigen API-Endpunkte implementiert habt. Fehlermeldungen und 404 im Netzwerk-Tab sind am Anfang normal. Die vollständige angemeldete Oberfläche lädt mehrere Endpunkte gemeinsam und setzt deren Implementierung voraus. Einzelne fertige Endpunkte könnt ihr vorher mit einem HTTP-Client prüfen.

Der Button „Demo ausprobieren“ im gelieferten Frontend erwartet später einen von euch angelegten Benutzer `demo` mit dem Passwort `Lernen123!`; dieses Konto wird hier nicht automatisch erstellt. Für eigene Konten ist der Ablauf „Konto erstellen“ vorgesehen.

Die API-Adresse steht in `frontend/config.js`: standardmäßig Port 8080 auf demselben Hostnamen wie das Frontend. Verwendet auf beiden Seiten entweder `localhost` oder `127.0.0.1`, damit die späteren Session-Cookies zusammenpassen.

Startet Referenzprojekt und Ausgangsprojekt nicht gleichzeitig auf denselben Ports. Bei Bedarf lässt sich der Backend-Port mit `PORT=8081 ./backend/start.sh` ändern; dann auch die Adresse in `frontend/config.js` anpassen.

## Eure Vorgaben

1. [ER-Modell](docs/ER-MODELL.md) gemeinsam lesen und das [draw.io-Diagramm](docs/lernraum-er.drawio) öffnen.
2. [REST-API-Beschreibung](docs/API.md) als verbindlichen Vertrag verwenden. [openapi.yaml](docs/openapi.yaml) beschreibt dieselbe Schnittstelle für API-Werkzeuge.
3. Datenbanktabellen und Backend Schritt für Schritt entwickeln. Die Geschäftsregeln im ER-Modell und API-Vertrag gelten für eure Implementierung.
4. Endpunkte zunächst mit [requests.http](docs/requests.http) oder curl überprüfen. Beispiel-IDs durch die IDs aus euren Antworten ersetzen.
5. Anschließend das Frontend verbinden. Für den Unterricht sind besonders `config.js` und `api.js` relevant; HTML/CSS/DOM müssen nicht neu entwickelt werden.

Empfohlene Baureihenfolge: Tabellen planen → Benutzer/Profil und Anmeldung → Fächer → Themen → Aufgaben → Schlagwörter und n:m → Dashboard. Arbeitet jeweils einen kleinen Ablauf bis zur Datenbank und zurück durch.

Da Frontend und Backend unterschiedliche Ports verwenden, müsst ihr im Backend später CORS für `http://localhost:5500` und `http://127.0.0.1:5500` einschließlich Cookies und der im Vertrag genannten Header erlauben. Diese Konfiguration ist bewusst noch Teil eurer Arbeit.

## Bauen

```bash
cd backend
./mvnw verify
```

Das Basisprojekt ist kompilierbar und startbar. Anwendungstests ergänzt ihr während der Implementierung. Das fertige JAR entsteht unter `backend/target/lernplattform-starter-0.0.1-SNAPSHOT.jar`.
