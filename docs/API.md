# REST-Schnittstellenvertrag – Lernraum, Version 1

**Zielvertrag für das Ausgangsprojekt:** Das Frontend erwartet diese Schnittstelle. Die Endpunkte sind im mitgelieferten leeren Backend noch nicht implementiert und werden im Unterricht entwickelt. Es gibt anfangs keine Benutzerkonten oder Beispieldaten.

Dieser Vertrag wird vom Frontend verwendet und ist vom Backend umzusetzen. Die lesbare Beschreibung und [openapi.yaml](openapi.yaml) beschreiben dieselbe API. Beispiele zeigen Beispiel-IDs; IDs niemals fest im Frontend verdrahten. Die Antworten liefern die tatsächlich vergebenen IDs.

## Gemeinsame Regeln

- Basis: `http://localhost:8080/api`; JSON in UTF-8.
- Alle Fach-/Themen-/Aufgaben-/Tag-Daten und das Dashboard beziehen sich auf den angemeldeten Benutzer. `ownerId` und `userId` sind keine Eingabefelder. Die Benutzer-ID kommt aus der serverseitigen Session.
- Schreibende Anfragen (`POST`, `PUT`, `DELETE`) benötigen **`X-Requested-With: Lernraum`**, auch Login, Registrierung und Logout. JSON-Bodies benötigen `Content-Type: application/json`.
- Anmeldung/Registrierung setzen das HttpOnly-Cookie `JSESSIONID`; der Browser verwendet bei jedem API-Aufruf `credentials: "include"`. Der Header oben ist kein Authentifizierungsnachweis. Er erzwingt zusammen mit der beschränkten CORS-Freigabe, dass fremde Websites keine einfachen Formular-Schreibzugriffe durchführen können.
- Vom Backend freizugebende Browser-Ursprünge: `http://localhost:5500` und `http://127.0.0.1:5500`. Auf beiden Servern denselben Hostnamen verwenden. CORS-Preflights werden vor der Session-Prüfung beantwortet.
- `GET`/`PUT` liefern 200, erfolgreiches Anlegen 201, erfolgreiches Löschen/Logout 204 ohne Body. Es wird kein `Location`-Header versprochen.
- Listen sind JSON-Arrays, auch wenn sie leer sind: `[]`. Kein Paging in Version 1.
- `PUT` sendet den vollständigen veränderbaren Zustand. Es gibt kein PATCH. Unbekannte JSON-Felder werden abgewiesen. Bei Antworten dürfen Clientprogramme zusätzliche Felder ignorieren.
- IDs sind positive ganze Zahlen. `null` ist nur für ausdrücklich optionale Felder erlaubt. Zahlen mit Nachkommastellen sind für IDs und `dailyMinutes` ungültig.
- Pflichttexte dürfen nicht leer sein oder nur aus Leerzeichen bestehen. Äußere Leerzeichen werden bei Namen und Freitexten entfernt. Längengrenzen gelten schon vor diesem Entfernen.
- Datumsformat: `YYYY-MM-DD`, ohne Uhrzeit/Zeitzone. Ungültige Kalendertage sind Fehler. Der Server verwendet für „heute“ seine lokale Zeitzone. Ein bereits vergangener Termin ist zulässig.
- Eine unbekannte **oder fremde** ID liefert 404. So wird nicht verraten, ob jemand anderes diesen Datensatz besitzt. Ungültige Beziehungen zwischen eigenen Daten liefern 400.
- Fehler innerhalb einer schreibenden Service-Transaktion hinterlassen keine teilweise geänderten Datensätze.

## Fehlerformat

Bei fachlichen API-Fehlern:

```json
{
  "status": 400,
  "message": "Bitte die Eingaben prüfen.",
  "errors": { "name": "must not be blank" }
}
```

`message` ist für die Anzeige geeignet. `errors` ordnet Bean-Validation-Fehler den Feldnamen zu; die Standardtexte können englisch sein. Ohne Feldfehler ist es `{}`. Clients sollen auf `status` reagieren und Texte nicht als feste Programmlogik verwenden. Technische Fehler vor dem Controller, etwa CORS-Abweisungen, müssen nicht dieses JSON-Format verwenden.

| Status | Bedeutung |
| --- | --- |
| 400 | JSON, Feldwert, Enum, Datum oder fachliche Beziehung ungültig |
| 401 | Zugangsdaten falsch, Session fehlt oder ist abgelaufen |
| 403 | Schreibzugriffs-Header fehlt/ist falsch; auch nicht erlaubte CORS-Anfragen |
| 404 | Benötigter Eintrag ist nicht vorhanden oder gehört einem anderen Benutzer |
| 409 | Benutzer-/Tag-Name bereits vergeben oder Eintrag noch in Verwendung |

Leere bzw. falsche Anfragen werden zuerst an der Session-Grenze geprüft; ohne Anmeldung kann daher 401 erscheinen, bevor Felder validiert werden. Login/Register/Logout sind öffentlich, benötigen bei Schreibzugriffen aber weiterhin den Header.

## Anmeldung und Profil

| Methode | Pfad | Body | Erfolg |
| --- | --- | --- | --- |
| POST | `/auth/register` | RegisterRequest | 201 UserView und neue Session |
| POST | `/auth/login` | LoginRequest | 200 UserView und neue Session |
| POST | `/auth/logout` | keiner | 204; auch ohne bestehende Session |
| GET | `/auth/me` | keiner | 200 UserView |
| PUT | `/profile` | ProfileRequest | 200 aktualisierte UserView |

Registrierung:

```json
{ "username": "samira", "password": "Lernen123!", "displayName": "Samira" }
```

`username`: 3–40 Zeichen, ausschließlich ASCII-Buchstaben, Ziffern, Punkt, Unterstrich und Bindestrich. Speicherung kleingeschrieben, dadurch eindeutiger Vergleich ohne Groß-/Kleinschreibung. Beim Registrieren keine äußeren Leerzeichen zulässig. `password`: 8–128 Zeichen, keine Veränderung durch trim/strip. `displayName`: 1–80 Zeichen, nicht nur Whitespace. Doppelte Benutzernamen ergeben 409. Ein Profil mit leerem Lernziel und 30 Minuten entsteht automatisch. Benutzer und Profil werden atomar angelegt.

Login:

```json
{ "username": "samira", "password": "Lernen123!" }
```

Login akzeptiert 1–40 Zeichen für den Namen (nicht nur Whitespace), ignoriert dessen Groß-/Kleinschreibung und äußere Leerzeichen. Passwort: 1–128 Zeichen, exakt verglichen. Ungültige Zugangsdaten ergeben 401 mit derselben Nachricht für unbekannten Namen und falsches Passwort. Ein erfolgreicher Login ersetzt eine eventuell bestehende Session. Session-Timeout: 30 Minuten Inaktivität; ein Serverneustart beendet Sessions.

UserView:

```json
{
  "id": 1,
  "username": "samira",
  "profile": {
    "id": 1,
    "userId": 1,
    "displayName": "Samira",
    "learningGoal": "Mein eigenes Backend verstehen.",
    "dailyMinutes": 45
  }
}
```

Die Profil-ID muss nicht mit der Benutzer-ID übereinstimmen. Passwort und Passwort-Hash sind niemals Bestandteil einer API-Antwort.

ProfileRequest:

```json
{ "displayName": "Samira", "learningGoal": "SQL-JOINs verstehen.", "dailyMinutes": 45 }
```

Alle drei Felder erforderlich. Anzeigename wie oben; Lernziel 0–500 Zeichen, leer erlaubt; tägliches Ziel ganze Zahl von 5 bis 480. Die Angaben sind persönliche Planung und kein Zeitmesssystem.

## Fächer

| Methode | Pfad | Body / Query | Erfolg |
| --- | --- | --- | --- |
| GET | `/subjects` | – | 200 SubjectView[] |
| POST | `/subjects` | SubjectRequest | 201 SubjectView |
| PUT | `/subjects/{id}` | SubjectRequest | 200 SubjectView |
| DELETE | `/subjects/{id}` | – | 204 |

SubjectRequest:

```json
{ "name": "Java & OOP", "description": "Klassen und Objekte verstehen.", "color": "#6d5ce7" }
```

`name`: Pflicht, maximal 80; `description`: erforderlich, 0–1000 Zeichen; `color`: erforderlich, `#` plus genau sechs hexadezimale Ziffern. Gleichnamige Fächer sind zulässig, IDs unterscheiden sie.

SubjectView hat zusätzlich `id` und enthält keine `ownerId`:

```json
{ "id": 3, "name": "Java & OOP", "description": "Klassen und Objekte verstehen.", "color": "#6d5ce7" }
```

Liste nach Name aufsteigend (Datenbanksortierung). Löschen bei vorhandenen Themen ergibt 409. Es gibt keinen impliziten Löschlauf über ein ganzes Fach.

## Themen und Unterthemen

| Methode | Pfad | Body / Query | Erfolg |
| --- | --- | --- | --- |
| GET | `/topics` | optional `subjectId` | 200 TopicView[] |
| POST | `/topics` | TopicRequest | 201 TopicView |
| PUT | `/topics/{id}` | TopicRequest | 200 TopicView |
| DELETE | `/topics/{id}` | – | 204 |

TopicRequest:

```json
{ "subjectId": 3, "parentId": null, "name": "Lambdas & Streams", "notes": "Zuerst mit Schleifen arbeiten." }
```

Für ein Unterthema wird `parentId` mit der ID eines anderen Themas belegt. `subjectId` ist Pflicht und positiv; `parentId` ist eine positive ID oder `null` (weggelassen entspricht ebenfalls `null`). `name`: Pflicht, maximal 100 Zeichen; `notes`: erforderlich, 0–4000 Zeichen.

TopicView ergänzt `id`:

```json
{ "id": 8, "subjectId": 3, "parentId": 7, "name": "Lambda-Ausdrücke", "notes": "Parameter -> Ergebnis" }
```

- Der Endpunkt liefert eine **flache Liste**, keinen verschachtelten JSON-Baum. Das Frontend verknüpft `parentId` selbst.
- Hauptthema: `parentId: null`. Mehrere Hierarchieebenen sind erlaubt.
- Eltern- und Unterthema müssen im selben Fach liegen. Das Backend verhindert direkte und indirekte Zyklen.
- Das Fach eines bestehenden Themas bleibt unverändert. Ein PUT mit einer anderen `subjectId` liefert 400; Elternteil, Name und Notizen dürfen geändert werden.
- Ohne Filter: Themen aller eigenen Fächer, Fächer nach Namen und innerhalb eines Fachs Themen nach Namen sortiert. Mit `subjectId`: nur dieses Fach; ein fremdes oder unbekanntes Fach liefert 404.
- Ein Thema mit Aufgaben oder Unterthemen kann nicht gelöscht werden: 409.

## Aufgaben / Todos

| Methode | Pfad | Body / Query | Erfolg |
| --- | --- | --- | --- |
| GET | `/tasks` | siehe Filter unten | 200 TaskView[] |
| GET | `/tasks/{id}` | – | 200 TaskView |
| POST | `/tasks` | TaskRequest | 201 TaskView |
| PUT | `/tasks/{id}` | TaskRequest | 200 TaskView |
| DELETE | `/tasks/{id}` | – | 204 |

TaskRequest:

```json
{
  "topicId": 8,
  "title": "Eine Schleife als Lambda formulieren",
  "description": "Zuerst for, danach forEach vergleichen.",
  "status": "TODO",
  "priority": "NORMAL",
  "dueDate": "2026-12-01",
  "tagIds": [2, 4]
}
```

| Feld | Regel |
| --- | --- |
| `topicId` | erforderlich, positive ID eines eigenen Themas |
| `title` | erforderlich, nicht leer, maximal 140 Zeichen |
| `description` | erforderlich, 0–4000 Zeichen |
| `status` | erforderlich: `TODO`, `IN_PROGRESS`, `DONE` |
| `priority` | erforderlich: `LOW`, `NORMAL`, `HIGH` |
| `dueDate` | Datum oder `null`; weggelassen entspricht `null` |
| `tagIds` | erforderlich, Array aus 0–20 unterschiedlichen positiven IDs eigener Tags |

**`tagIds` ersetzt bei PUT immer die vollständige Zuordnung.** `[]` entfernt alle Zuordnungen. Doppelte IDs ergeben 400; ein fremder oder unbekannter Tag ergibt 404. Eine fehlerhafte Änderung verändert auch Titel/Status der Aufgabe nicht. Eine Aufgabe darf in ein anderes eigenes Thema verschoben werden.

TaskView entspricht dem Request plus `id` und der vom Backend abgeleiteten `subjectId`. Tag-IDs sind aufsteigend sortiert:

```json
{
  "id": 12,
  "topicId": 8,
  "subjectId": 3,
  "title": "Eine Schleife als Lambda formulieren",
  "description": "Zuerst for, danach forEach vergleichen.",
  "status": "TODO",
  "priority": "NORMAL",
  "dueDate": "2026-12-01",
  "tagIds": [2, 4]
}
```

Die Fach-ID wird im Aufgaben-Request nicht akzeptiert. Sie folgt bereits eindeutig aus dem Thema und wird nur für die Antwort ergänzt.

### Aufgaben filtern

`GET /tasks?subjectId=3&topicId=8&status=TODO&tagId=2&q=lambda`

Alle Filter sind optional und werden mit **UND** verbunden. `subjectId`, `topicId`, `tagId` prüfen eigene Ressourcen. `topicId` meint exakt dieses Thema, einschließlich seiner Aufgaben, aber **ohne automatische Einbeziehung von Unterthemen**. `status` wie oben. `q` sucht als Teilstring in Titel und Beschreibung ohne Groß-/Kleinschreibung; äußere Leerzeichen werden ignoriert. Ein leerer Suchtext filtert nicht.

Sortierung nach Fälligkeitsdatum aufsteigend, Aufgaben ohne Termin zuletzt, danach ID aufsteigend. Eine leere Ergebnismenge ist 200 mit `[]`.

Beim Löschen verschwinden die Aufgabe und ihre `task_tag`-Zeilen. Die Schlagwörter selbst bleiben bestehen.

## Schlagwörter

| Methode | Pfad | Body / Query | Erfolg |
| --- | --- | --- | --- |
| GET | `/tags` | – | 200 TagView[] |
| POST | `/tags` | TagRequest | 201 TagView |
| PUT | `/tags/{id}` | TagRequest | 200 TagView |
| DELETE | `/tags/{id}` | – | 204 |

TagRequest: `{ "name": "Praxis" }`; Pflichttext, maximal 30 Zeichen. Äußere Leerzeichen werden entfernt, Speicherung kleingeschrieben. Pro Benutzer eindeutig; Duplikat ergibt 409. Umlaute sind erlaubt.

TagView: `{ "id": 2, "name": "praxis" }`; Liste nach Namen sortiert.

Tags sind persönlich und können Aufgaben aus mehreren eigenen Fächern verbinden. Beim Löschen eines Tags verschwinden nur dieser Tag und seine Zuordnungen. Die Aufgaben bleiben erhalten. Umbenennen erhält die ID und alle Zuordnungen.

## Dashboard

`GET /dashboard` → 200 DashboardView:

```json
{
  "displayName": "Samira",
  "learningGoal": "Mein eigenes Backend verstehen.",
  "dailyMinutes": 45,
  "subjectCount": 3,
  "totalTasks": 8,
  "openTasks": 5,
  "doneTasks": 3,
  "overdueTasks": 1,
  "dueTodayTasks": 1,
  "progressPercent": 38,
  "subjects": [
    { "id": 3, "name": "Java & OOP", "color": "#6d5ce7", "total": 4, "done": 2, "percent": 50 }
  ],
  "upcomingTasks": []
}
```

`subjects` enthält im echten Ergebnis **alle** eigenen Fächer mit ihren Fortschrittswerten; das Beispiel zeigt nur ein Element. `upcomingTasks` enthält höchstens sechs vollständige TaskViews der offenen, datierten Aufgaben, sortiert wie `/tasks`, einschließlich überfälliger Aufgaben. Ohne passende Aufgaben ist es leer.

- „offen“: Status `TODO` oder `IN_PROGRESS`.
- „erledigt“: Status `DONE`.
- „überfällig“: offen und Termin vor heute.
- „heute fällig“: offen und Termin gleich heute.
- Prozent: `round(100.0 * erledigt / gesamt)`; bei 0 Aufgaben gilt 0.
- Das Profil liefert Lernziel/Minuten, nicht gemessene Lernzeit.
- Neues Konto: alle Zähler 0, `subjects: []`, `upcomingTasks: []`.

## Einen kompletten Ablauf per curl ausprobieren

```bash
# Nach Implementierung: neues Konto anlegen und direkt anmelden:
curl -i -c /tmp/lernraum-cookies.txt http://localhost:8080/api/auth/register \
  -H 'Content-Type: application/json' -H 'X-Requested-With: Lernraum' \
  -d '{"username":"samira","password":"Lernen123!","displayName":"Samira"}'

curl -b /tmp/lernraum-cookies.txt http://localhost:8080/api/subjects

curl -i -b /tmp/lernraum-cookies.txt http://localhost:8080/api/subjects \
  -H 'Content-Type: application/json' -H 'X-Requested-With: Lernraum' \
  -d '{"name":"SQL-Werkstatt","description":"JOINs verstehen","color":"#138a78"}'

curl -i -b /tmp/lernraum-cookies.txt -X POST http://localhost:8080/api/auth/logout \
  -H 'X-Requested-With: Lernraum'
```