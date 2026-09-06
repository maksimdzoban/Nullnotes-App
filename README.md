# 🌌 Nullnotes

> **Modern, local-first block-based notes application with BYOK AI & seamless cloud sync.**  
> *An open-source, privacy-first Notion & Obsidian alternative.*

---

## ⚡ Key Highlights

- 📝 **Block-Based Rich Editor**: Clean Notion-style block editor powered by `@blocknote/react`` (headings, lists, code blocks, tables, formatting, checklists).
- 🔒 **Local-First & Offline Ready**: All notes are stored instantly on your device via **IndexedDB (Dexie.js)** and available offline without internet access.
- 🤗 **BYOK AI (Bring Your Own Key)**: Smart AI features (Summarization, Auto-tagging) powered by OpenRouter API, including 100% free models (`openrouter/free`). API keys are kept strictly on your local device.
- 🔩 *Cloud Sync & Outbox Pattern**: Self-hostable lightweight Node/Hono server with LibSQL/SQLite database. Automatic synchronization with conflict-free merging.
- �1 **Cross-Platform**: Web, Desktop, and Native Android App (via Capacitor).
- 🍷 *Organization**: Nested folders, tag filters, search, favorites, archive, and markdown export/import.

> [!NOTE]
> **MVP / Experimental Notice**: This project is in active development (MVP stage). Features, APIs, and schema structures are continuously improving.

---

## 🚀 Quick Start

### 1. Prerequisites
- [Node.js](https://nodejs.org/) (v20+ recommended)
- [npm](https://www.npmjs.com/)

---

### 2. Frontend Client (Web / Mobile UI)

```bash
# 1. Install client dependencies
npm install

# 2. Run local development server
npm run dev
```
Open [http://localhost:5173](http://localhost:5173) in your browser.

---

### 3. Sync Server (Backend)

The backend is a self-hostable synchronization server.

```bash
# 1. Navigate to server directory
cd server

# 2. Install backend dependencies
npm install

# 3. Setup environment variables (optional)
cp .env.example .env

# 4. Start sync server
npm run dev
```
The server will start at [http://localhost:3001](http://localhost:3001).

---

### 4. Build Android APK

```bash
# 1. Build web application
npm run build

# 2. Add and sync native Android project
npx cap add android
npx cap sync android

# 3. Open in Android Studio or compile via Gradle
cd android
./gradlew assembleDebug
```
Pre-compiled APKs are also generated automatically via GitHub Actions in the Releases/Artifacts section.

---

## 🧧 Tech Stack

- **Frontend**: React 19, TypeScript, Tailwind CSS v4, Lucide Icons, Zustand.
- **Editor`*: BlockNote (ProseMirror / TipTap foundation).
- **Client Database**: IndexedDB with Dexie.js.
- **Backend**: Hono, Node.js, LibSQL (SQLite), JWT, Bcrypt.
- **Mobile**: Capacitor 8 (Android).
- **AI Engine**: OpenRouter API client (BYOK).

---

## 📜 License

This project is licensed under the [MIT License](LICENSE) - see the LICENSE file for details.
