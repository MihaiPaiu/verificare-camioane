import { Alert, AlertDescription } from "@/components/ui/alert"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { ExternalLink, Settings, Key, Shield } from "lucide-react"

export function GoogleDriveSetup() {
  return (
    <Card className="max-w-4xl mx-auto">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Settings className="h-5 w-5" />
          Configurare Google Drive API
        </CardTitle>
        <CardDescription>Urmați acești pași pentru a activa salvarea în Google Drive</CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        <Alert>
          <Shield className="h-4 w-4" />
          <AlertDescription>
            <strong>Important:</strong> Această configurare este necesară doar o singură dată pentru a activa
            funcționalitatea Google Drive.
          </AlertDescription>
        </Alert>

        <div className="space-y-4">
          <div className="flex items-start gap-3">
            <div className="bg-blue-100 text-blue-800 rounded-full w-6 h-6 flex items-center justify-center text-sm font-bold">
              1
            </div>
            <div>
              <h3 className="font-semibold">Accesați Google Cloud Console</h3>
              <p className="text-sm text-gray-600 mb-2">Mergeți la Google Cloud Console pentru a crea un proiect nou</p>
              <Button variant="outline" size="sm" asChild>
                <a href="https://console.cloud.google.com/" target="_blank" rel="noopener noreferrer">
                  <ExternalLink className="h-4 w-4 mr-2" />
                  Deschide Console
                </a>
              </Button>
            </div>
          </div>

          <div className="flex items-start gap-3">
            <div className="bg-blue-100 text-blue-800 rounded-full w-6 h-6 flex items-center justify-center text-sm font-bold">
              2
            </div>
            <div>
              <h3 className="font-semibold">Activați Google Drive API</h3>
              <p className="text-sm text-gray-600">
                În secțiunea "APIs & Services" → "Library", căutați și activați "Google Drive API"
              </p>
            </div>
          </div>

          <div className="flex items-start gap-3">
            <div className="bg-blue-100 text-blue-800 rounded-full w-6 h-6 flex items-center justify-center text-sm font-bold">
              3
            </div>
            <div>
              <h3 className="font-semibold">Creați credențiale</h3>
              <p className="text-sm text-gray-600 mb-2">
                Generați API Key și OAuth 2.0 Client ID în secțiunea "Credentials"
              </p>
              <div className="bg-gray-50 p-3 rounded border text-sm font-mono">
                <div>NEXT_PUBLIC_GOOGLE_API_KEY=your_api_key_here</div>
                <div>NEXT_PUBLIC_GOOGLE_CLIENT_ID=your_client_id_here</div>
              </div>
            </div>
          </div>

          <div className="flex items-start gap-3">
            <div className="bg-blue-100 text-blue-800 rounded-full w-6 h-6 flex items-center justify-center text-sm font-bold">
              4
            </div>
            <div>
              <h3 className="font-semibold">Configurați OAuth Consent Screen</h3>
              <p className="text-sm text-gray-600">
                Adăugați scope-ul:{" "}
                <code className="bg-gray-100 px-1 rounded">https://www.googleapis.com/auth/drive.file</code>
              </p>
            </div>
          </div>
        </div>

        <Alert className="border-green-200 bg-green-50">
          <Key className="h-4 w-4 text-green-600" />
          <AlertDescription className="text-green-800">
            <strong>Funcționalități disponibile după configurare:</strong>
            <ul className="list-disc list-inside mt-2 space-y-1">
              <li>Salvare automată în Google Drive</li>
              <li>Link partajabil generat automat</li>
              <li>Fișier HTML cu toate imaginile incluse</li>
              <li>Acces permanent la rapoarte</li>
            </ul>
          </AlertDescription>
        </Alert>
      </CardContent>
    </Card>
  )
}
