# Anslagstavla API

Detta är ett enkelt backend-API byggt med **Node.js**, **Express** och **PostgreSQL** som simulerar en Bulletin.  
Användare kan registrera sig, skapa kanaler, prenumerera på dem, posta meddelanden och läsa meddelanden från andra.

## Video Presentation

▶[Se presentation på YouTube](YT LINK)

---

## Kom igång

### Installation

1. **Kloning & Navigering**
   ```bash
    git clone https://github.com/SebBersan/sql-bulletin-exam.git
    cd sql-bulletin-exam
   ```

2. **Installera beroenden**
   ```bash
    npm install
   ```

3. **Editera .env-fil**
   Editera följande i `.env` filen:
   ```env
    DB_USER=xxxx
    DB_HOST=xxxx
    DB_PASSWORD=xxxx
    DB_DATABASE=xxxx
    DB_PORT=5000
   ```

4. **Starta servern med nodemon**
   ```bash
   nodemon main.mjs
   ```

> Servern körs på `http://localhost:5000` som standard.

---

## API-dokumentation

Alla exempel använder JSON som in- och utdataformat.

---

### POST `/users`

**Beskrivning**: Skapar en ny användare.

Exempel:
![POST /users](https://i.gyazo.com/9e78d88f88f0a630d4da6cd3cf07addd.png)

---

### POST `/channels`

**Beskrivning**: Skapar en ny kanal.

Exempel:
![POST /channels](https://i.gyazo.com/18161c0c02b5fc49879707b5375a2d53.png)

---

### POST `/subscriptions`

**Beskrivning**: Prenumererar på en kanal för en användare.

Exempel:
![POST /subscriptions](https://i.gyazo.com/2ee9033a73d495da669753fbc6826308.png)

---

### POST `/messages`

**Beskrivning**: Skapar ett nytt meddelande i en kanal.

Exempel:
![POST /messages](https://i.gyazo.com/dc0eba51f66d5acc33b381a1df682844.png)

---

### GET `/channels/:id/messages`

**Beskrivning**: Hämtar alla meddelanden i en viss kanal (`id` = channel_id).

Exempel:
![GET /channels/:id/messages](https://i.gyazo.com/9fa5c2e2784f7119d2cb7b2e139b9c23.png)

---

### GET `/users/:id/channels`

**Beskrivning**: Hämtar alla kanaler gällande en viss användare.

Exempel:
![GET /users/:id/channels](https://i.gyazo.com/17bedf2339b79c2b0a29184b8244bf7c.png)

---
