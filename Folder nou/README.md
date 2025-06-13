# Sistem Verificare Camioane

Un sistem complet pentru verificarea camioanelor și echipamentelor cu portal pentru companii și șoferi.

## Funcționalități

### Portal Companii
- ✅ Înregistrare și verificare companii
- ✅ Creare sesiuni de verificare
- ✅ Generare link-uri pentru șoferi
- ✅ Coduri QR pentru acces mobil
- ✅ Monitorizare răspunsuri în timp real
- ✅ Generare rapoarte PDF

### Portal Șoferi
- ✅ Acces prin link/QR code
- ✅ Verificare pas cu pas (4 etape)
- ✅ Upload fotografii echipamente
- ✅ Semnătură digitală
- ✅ Validare sesiuni și expirare

### Caracteristici Tehnice
- ✅ Next.js 14 cu App Router
- ✅ TypeScript pentru siguranță tipuri
- ✅ Tailwind CSS pentru styling
- ✅ shadcn/ui componente
- ✅ Responsive design
- ✅ LocalStorage pentru persistență date

## Instalare

1. Clonați repository-ul
2. Instalați dependențele:
\`\`\`bash
npm install
\`\`\`

3. Rulați aplicația în modul dezvoltare:
\`\`\`bash
npm run dev
\`\`\`

4. Deschideți [http://localhost:3000](http://localhost:3000) în browser

## Utilizare

### Pentru Companii
1. Accesați `/` pentru portal companii
2. Înregistrați compania cu licența de transport
3. Creați sesiuni de verificare
4. Distribuiți link-urile către șoferi
5. Monitorizați răspunsurile în timp real

### Pentru Șoferi
1. Accesați link-ul primit de la companie
2. Introduceți ID-ul sesiunii (dacă necesar)
3. Completați informațiile personale
4. Adăugați detaliile camionului
5. Verificați echipamentele (cu fotografii)
6. Semnați digital pentru finalizare

## Structura Proiectului

\`\`\`
app/
├── page.tsx              # Portal companii
├── driver-portal/
│   └── page.tsx          # Portal șoferi
├── layout.tsx            # Layout principal
└── globals.css           # Stiluri globale

components/ui/            # Componente shadcn/ui
├── button.tsx
├── card.tsx
├── input.tsx
└── ...

\`\`\`

## Dezvoltare Viitoare

- [ ] Integrare Google Drive pentru salvare
- [ ] Notificări SMS/Email
- [ ] Dashboard analytics
- [ ] API backend
- [ ] Aplicație mobilă
- [ ] Comparație automată imagini

## Licență

Acest proiect este dezvoltat pentru verificarea camioanelor și echipamentelor de transport.
