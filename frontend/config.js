// Separater Frontend-Auftrag: Nur diese Adresse muss zum Backend passen.
// Für lokale Session-Cookies auf beiden Servern denselben Hostnamen verwenden.
window.LERNRAUM_API ??= `http://${location.hostname || 'localhost'}:8080/api`;
