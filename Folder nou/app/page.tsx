"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Badge } from "@/components/ui/badge"
import { Alert, AlertDescription } from "@/components/ui/alert"
import {
  Building2,
  Link,
  Shield,
  Users,
  CheckCircle,
  AlertTriangle,
  Copy,
  ExternalLink,
  Plus,
  Eye,
  Download,
} from "lucide-react"

interface Company {
  id: string
  name: string
  email: string
  phone: string
  address: string
  licenseNumber: string
  verified: boolean
  createdAt: string
}

interface VerificationSession {
  id: string
  companyId: string
  companyName: string
  sessionName: string
  description: string
  expiresAt: string
  createdAt: string
  status: "active" | "expired" | "completed"
  driverLink: string
  qrCode: string
  responses: number
  maxResponses?: number
}

interface DriverResponse {
  id: string
  sessionId: string
  driverName: string
  phone: string
  idNumber: string
  signature?: string
  truckPlate: string
  completedAt: string
  equipmentChecked: number
  totalEquipment: number
  status: "completed" | "in-progress"
  equipmentDetails?: any[]
}

export default function CompanyDashboard() {
  const [activeTab, setActiveTab] = useState<"register" | "sessions" | "responses">("register")
  const [currentCompany, setCurrentCompany] = useState<Company | null>(null)
  const [sessions, setSessions] = useState<VerificationSession[]>([])
  const [responses, setResponses] = useState<DriverResponse[]>([])

  // Company registration form
  const [companyForm, setCompanyForm] = useState({
    name: "",
    email: "",
    phone: "",
    address: "",
    licenseNumber: "",
  })

  // Session creation form
  const [sessionForm, setSessionForm] = useState({
    sessionName: "",
    description: "",
    expiresIn: "7", // days
    maxResponses: "",
  })

  const [isCreatingSession, setIsCreatingSession] = useState(false)
  const [notification, setNotification] = useState<{ type: "success" | "error"; message: string } | null>(null)

  // Load company data from localStorage
  useEffect(() => {
    const savedCompany = localStorage.getItem("verifiedCompany")
    if (savedCompany) {
      setCurrentCompany(JSON.parse(savedCompany))
      loadCompanySessions(JSON.parse(savedCompany).id)
    }

    const savedSessions = localStorage.getItem("verificationSessions")
    if (savedSessions) {
      setSessions(JSON.parse(savedSessions))
    }

    const savedResponses = localStorage.getItem("driverResponses")
    if (savedResponses) {
      setResponses(JSON.parse(savedResponses))
    }
  }, [])

  const loadCompanySessions = (companyId: string) => {
    const savedSessions = localStorage.getItem("verificationSessions")
    if (savedSessions) {
      const allSessions = JSON.parse(savedSessions)
      const companySessions = allSessions.filter((s: VerificationSession) => s.companyId === companyId)
      setSessions(companySessions)
    }
  }

  // Register/verify company
  const registerCompany = async () => {
    if (!companyForm.name || !companyForm.email || !companyForm.licenseNumber) {
      setNotification({ type: "error", message: "Completați toate câmpurile obligatorii" })
      return
    }

    const newCompany: Company = {
      id: Date.now().toString(),
      ...companyForm,
      verified: true,
      createdAt: new Date().toISOString(),
    }

    setCurrentCompany(newCompany)
    localStorage.setItem("verifiedCompany", JSON.stringify(newCompany))

    setNotification({ type: "success", message: "Compania a fost înregistrată și verificată cu succes!" })
    setActiveTab("sessions")
  }

  // Create verification session
  const createSession = () => {
    if (!currentCompany || !sessionForm.sessionName) {
      setNotification({ type: "error", message: "Completați numele sesiunii" })
      return
    }

    setIsCreatingSession(true)

    const sessionId = Date.now().toString()
    const expiresAt = new Date()
    expiresAt.setDate(expiresAt.getDate() + Number.parseInt(sessionForm.expiresIn))

    const driverLink = `${window.location.origin}/driver-portal?session=${sessionId}`
    const qrCode = `https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=${encodeURIComponent(driverLink)}`

    const newSession: VerificationSession = {
      id: sessionId,
      companyId: currentCompany.id,
      companyName: currentCompany.name,
      sessionName: sessionForm.sessionName,
      description: sessionForm.description,
      expiresAt: expiresAt.toISOString(),
      createdAt: new Date().toISOString(),
      status: "active",
      driverLink,
      qrCode,
      responses: 0,
      maxResponses: sessionForm.maxResponses ? Number.parseInt(sessionForm.maxResponses) : undefined,
    }

    const updatedSessions = [...sessions, newSession]
    setSessions(updatedSessions)
    localStorage.setItem("verificationSessions", JSON.stringify(updatedSessions))

    setSessionForm({ sessionName: "", description: "", expiresIn: "7", maxResponses: "" })
    setIsCreatingSession(false)
    setNotification({ type: "success", message: "Sesiunea a fost creată cu succes!" })
  }

  // Copy link to clipboard
  const copyLink = async (sessionId: string) => {
    const link = `${window.location.origin}/driver-portal?session=${sessionId}`
    try {
      await navigator.clipboard.writeText(link)
      setNotification({ type: "success", message: "Link-ul a fost copiat în clipboard!" })
    } catch (error) {
      setNotification({ type: "error", message: "Nu s-a putut copia link-ul" })
    }
  }

  // Get session status
  const getSessionStatus = (session: VerificationSession) => {
    const now = new Date()
    const expires = new Date(session.expiresAt)

    if (now > expires) return "expired"
    if (session.maxResponses && session.responses >= session.maxResponses) return "completed"
    return "active"
  }

  // Generate PDF report for response
  const generateResponsePDF = (response: DriverResponse) => {
    const session = sessions.find((s) => s.id === response.sessionId)
    if (!session) return

    const htmlContent = `
<!DOCTYPE html>
<html lang="ro">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Raport Verificare - ${response.driverName}</title>
    <style>
        body { font-family: Arial, sans-serif; margin: 20px; line-height: 1.6; }
        .header { text-align: center; border-bottom: 2px solid #333; padding-bottom: 20px; margin-bottom: 30px; }
        .section { margin-bottom: 30px; }
        .section h2 { color: #333; border-bottom: 1px solid #ccc; padding-bottom: 10px; }
        .info-item { display: flex; justify-content: space-between; padding: 5px 0; border-bottom: 1px dotted #ccc; }
        .signature { max-width: 200px; max-height: 100px; object-fit: contain; border: 1px solid #ddd; }
        .status-completed { color: green; font-weight: bold; }
        .status-pending { color: orange; font-weight: bold; }
    </style>
</head>
<body>
    <div class="header">
        <h1>RAPORT VERIFICARE CAMION</h1>
        <p><strong>Compania:</strong> ${session.companyName}</p>
        <p><strong>Sesiunea:</strong> ${session.sessionName}</p>
        <p>Generat la: ${new Date().toLocaleString("ro-RO")}</p>
    </div>

    <div class="section">
        <h2>👤 INFORMAȚII ȘOFER</h2>
        <div class="info-item"><span>Nume complet:</span><strong>${response.driverName}</strong></div>
        <div class="info-item"><span>Telefon:</span><span>${response.phone}</span></div>
        <div class="info-item"><span>CI/Pașaport:</span><span>${response.idNumber}</span></div>
        <div class="info-item"><span>Camion:</span><span>${response.truckPlate}</span></div>
        <div class="info-item"><span>Data completării:</span><span>${new Date(response.completedAt).toLocaleString("ro-RO")}</span></div>
        ${response.signature ? `<div style="margin-top: 20px;"><strong>Semnătura:</strong><br><img src="${response.signature}" alt="Semnătura șoferului" class="signature"></div>` : ""}
    </div>

    <div class="section">
        <h2>📦 ECHIPAMENTE VERIFICATE</h2>
        <p><strong>Status:</strong> ${response.equipmentChecked}/${response.totalEquipment} echipamente verificate (${Math.round((response.equipmentChecked / response.totalEquipment) * 100)}%)</p>
        <p class="${response.equipmentChecked === response.totalEquipment ? "status-completed" : "status-pending"}">
            ${response.equipmentChecked === response.totalEquipment ? "✓ Toate echipamentele au fost verificate" : "⚠ Verificare incompletă"}
        </p>
    </div>

    <div class="section" style="text-align: center; margin-top: 50px;">
        <p style="font-size: 12px; color: #666;">
            Acest raport a fost generat automat de Sistemul de Verificare Camioane<br>
            Generat la: ${new Date().toLocaleString("ro-RO")}
        </p>
    </div>
</body>
</html>
    `

    const blob = new Blob([htmlContent], { type: "text/html" })
    const url = URL.createObjectURL(blob)
    const a = document.createElement("a")
    a.href = url
    a.download = `Raport_${response.driverName}_${response.truckPlate}_${new Date().toISOString().split("T")[0]}.html`
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)
    URL.revokeObjectURL(url)
  }

  // Load actual responses from localStorage
  useEffect(() => {
    const savedResponses = localStorage.getItem("driverResponses")
    if (savedResponses) {
      const allResponses = JSON.parse(savedResponses)
      if (currentCompany) {
        const companyResponses = allResponses.filter((r: DriverResponse) => {
          const session = sessions.find((s) => s.id === r.sessionId)
          return session && session.companyId === currentCompany.id
        })
        setResponses(companyResponses)
      }
    }
  }, [currentCompany, sessions])

  return (
    <div className="min-h-screen bg-gray-50 p-4">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center gap-3 mb-4">
            <div className="p-3 bg-blue-600 rounded-lg">
              <Building2 className="h-8 w-8 text-white" />
            </div>
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Portal Companii - Verificare Camioane</h1>
              <p className="text-gray-600">Creați sesiuni de verificare pentru șoferi</p>
            </div>
          </div>

          {currentCompany && (
            <div className="bg-white rounded-lg p-4 shadow-sm">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <Badge variant="default" className="bg-green-600">
                    <Shield className="h-3 w-3 mr-1" />
                    Verificat
                  </Badge>
                  <span className="font-semibold">{currentCompany.name}</span>
                  <span className="text-gray-500">•</span>
                  <span className="text-sm text-gray-600">{currentCompany.email}</span>
                </div>
                <div className="text-sm text-gray-500">ID: {currentCompany.licenseNumber}</div>
              </div>
            </div>
          )}

          {notification && (
            <Alert
              className={`mt-4 ${notification.type === "success" ? "border-green-200 bg-green-50" : "border-red-200 bg-red-50"}`}
            >
              {notification.type === "success" ? (
                <CheckCircle className="h-4 w-4 text-green-600" />
              ) : (
                <AlertTriangle className="h-4 w-4 text-red-600" />
              )}
              <AlertDescription className={notification.type === "success" ? "text-green-800" : "text-red-800"}>
                {notification.message}
              </AlertDescription>
            </Alert>
          )}
        </div>

        {/* Navigation */}
        <div className="flex gap-1 mb-6 bg-white rounded-lg p-1 shadow-sm">
          {[
            { id: "register", label: "Înregistrare Companie", icon: Building2, disabled: !!currentCompany },
            { id: "sessions", label: "Sesiuni Verificare", icon: Link, disabled: !currentCompany },
            { id: "responses", label: "Răspunsuri Șoferi", icon: Users, disabled: !currentCompany },
          ].map(({ id, label, icon: Icon, disabled }) => (
            <button
              key={id}
              onClick={() => !disabled && setActiveTab(id as any)}
              disabled={disabled}
              className={`flex items-center justify-center gap-2 py-3 px-4 rounded-md transition-all ${
                activeTab === id
                  ? "bg-blue-600 text-white shadow-sm"
                  : disabled
                    ? "text-gray-400 cursor-not-allowed"
                    : "text-gray-600 hover:bg-gray-50"
              }`}
            >
              <Icon className="h-4 w-4" />
              <span className="font-medium">{label}</span>
            </button>
          ))}
        </div>

        {/* Company Registration */}
        {activeTab === "register" && !currentCompany && (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Building2 className="h-5 w-5" />
                Înregistrare și Verificare Companie
              </CardTitle>
              <CardDescription>
                Înregistrați-vă compania pentru a putea crea sesiuni de verificare pentru șoferi
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="companyName">Numele companiei *</Label>
                    <Input
                      id="companyName"
                      value={companyForm.name}
                      onChange={(e) => setCompanyForm((prev) => ({ ...prev, name: e.target.value }))}
                      placeholder="SC Transport SRL"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="companyEmail">Email companie *</Label>
                    <Input
                      id="companyEmail"
                      type="email"
                      value={companyForm.email}
                      onChange={(e) => setCompanyForm((prev) => ({ ...prev, email: e.target.value }))}
                      placeholder="contact@transport.ro"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="companyPhone">Telefon</Label>
                    <Input
                      id="companyPhone"
                      type="tel"
                      value={companyForm.phone}
                      onChange={(e) => setCompanyForm((prev) => ({ ...prev, phone: e.target.value }))}
                      placeholder="+40 xxx xxx xxx"
                    />
                  </div>
                </div>

                <div className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="companyAddress">Adresa</Label>
                    <Textarea
                      id="companyAddress"
                      value={companyForm.address}
                      onChange={(e) => setCompanyForm((prev) => ({ ...prev, address: e.target.value }))}
                      placeholder="Strada, numărul, orașul, județul"
                      rows={3}
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="licenseNumber">Număr licență transport *</Label>
                    <Input
                      id="licenseNumber"
                      value={companyForm.licenseNumber}
                      onChange={(e) => setCompanyForm((prev) => ({ ...prev, licenseNumber: e.target.value }))}
                      placeholder="ex: RO123456789"
                    />
                  </div>
                </div>
              </div>

              <Alert className="border-blue-200 bg-blue-50">
                <Shield className="h-4 w-4 text-blue-600" />
                <AlertDescription className="text-blue-800">
                  <strong>Proces de verificare:</strong> După înregistrare, compania va fi verificată automat. În
                  aplicația reală, acest proces ar include validarea documentelor și licențelor.
                </AlertDescription>
              </Alert>

              <div className="flex justify-end">
                <Button onClick={registerCompany} className="bg-blue-600 hover:bg-blue-700">
                  <Shield className="h-4 w-4 mr-2" />
                  Înregistrează și Verifică Compania
                </Button>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Sessions Management */}
        {activeTab === "sessions" && currentCompany && (
          <div className="space-y-6">
            {/* Create New Session */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Plus className="h-5 w-5" />
                  Creează Sesiune Nouă de Verificare
                </CardTitle>
                <CardDescription>Generați un link pentru șoferi să completeze verificarea</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="sessionName">Numele sesiunii *</Label>
                    <Input
                      id="sessionName"
                      value={sessionForm.sessionName}
                      onChange={(e) => setSessionForm((prev) => ({ ...prev, sessionName: e.target.value }))}
                      placeholder="ex: Verificare Săptămânală Decembrie"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="expiresIn">Expiră în (zile)</Label>
                    <Input
                      id="expiresIn"
                      type="number"
                      min="1"
                      max="30"
                      value={sessionForm.expiresIn}
                      onChange={(e) => setSessionForm((prev) => ({ ...prev, expiresIn: e.target.value }))}
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="description">Descriere (opțional)</Label>
                    <Textarea
                      id="description"
                      value={sessionForm.description}
                      onChange={(e) => setSessionForm((prev) => ({ ...prev, description: e.target.value }))}
                      placeholder="Instrucțiuni suplimentare pentru șoferi..."
                      rows={2}
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="maxResponses">Număr maxim răspunsuri (opțional)</Label>
                    <Input
                      id="maxResponses"
                      type="number"
                      min="1"
                      value={sessionForm.maxResponses}
                      onChange={(e) => setSessionForm((prev) => ({ ...prev, maxResponses: e.target.value }))}
                      placeholder="ex: 50"
                    />
                  </div>
                </div>

                <div className="flex justify-end">
                  <Button
                    onClick={createSession}
                    disabled={isCreatingSession}
                    className="bg-green-600 hover:bg-green-700"
                  >
                    <Plus className="h-4 w-4 mr-2" />
                    {isCreatingSession ? "Se creează..." : "Creează Sesiunea"}
                  </Button>
                </div>
              </CardContent>
            </Card>

            {/* Active Sessions */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Link className="h-5 w-5" />
                  Sesiuni Active ({sessions.length})
                </CardTitle>
                <CardDescription>Gestionați sesiunile de verificare create</CardDescription>
              </CardHeader>
              <CardContent>
                {sessions.length === 0 ? (
                  <div className="text-center py-8 text-gray-500">
                    <Link className="h-12 w-12 mx-auto mb-4 text-gray-300" />
                    <p>Nu aveți sesiuni create încă</p>
                    <p className="text-sm">Creați prima sesiune pentru a genera link-uri pentru șoferi</p>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {sessions.map((session) => {
                      const status = getSessionStatus(session)
                      return (
                        <div key={session.id} className="border rounded-lg p-4 space-y-4">
                          <div className="flex items-center justify-between">
                            <div>
                              <h3 className="font-semibold text-lg">{session.sessionName}</h3>
                              <p className="text-sm text-gray-600">{session.description}</p>
                            </div>
                            <div className="flex items-center gap-2">
                              <Badge
                                variant={
                                  status === "active" ? "default" : status === "expired" ? "destructive" : "secondary"
                                }
                              >
                                {status === "active" ? "Activă" : status === "expired" ? "Expirată" : "Completată"}
                              </Badge>
                              <Badge variant="outline">{session.responses} răspunsuri</Badge>
                            </div>
                          </div>

                          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div className="space-y-2">
                              <Label className="text-sm font-medium">Link pentru șoferi:</Label>
                              <div className="flex gap-2">
                                <Input
                                  value={`${window.location.origin}/driver-portal?session=${session.id}`}
                                  readOnly
                                  className="font-mono text-sm"
                                />
                                <Button size="sm" variant="outline" onClick={() => copyLink(session.id)}>
                                  <Copy className="h-4 w-4" />
                                </Button>
                                <Button
                                  size="sm"
                                  variant="outline"
                                  onClick={() =>
                                    window.open(
                                      `${window.location.origin}/driver-portal?session=${session.id}`,
                                      "_blank",
                                    )
                                  }
                                >
                                  <ExternalLink className="h-4 w-4" />
                                </Button>
                              </div>
                            </div>

                            <div className="space-y-2">
                              <Label className="text-sm font-medium">Cod QR:</Label>
                              <div className="flex items-center gap-3">
                                <img
                                  src={session.qrCode || "/placeholder.svg"}
                                  alt="QR Code"
                                  className="w-16 h-16 border rounded"
                                />
                                <div className="text-sm text-gray-600">
                                  <div>Expiră: {new Date(session.expiresAt).toLocaleDateString("ro-RO")}</div>
                                  <div>Creat: {new Date(session.createdAt).toLocaleDateString("ro-RO")}</div>
                                </div>
                              </div>
                            </div>
                          </div>
                        </div>
                      )
                    })}
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        )}

        {/* Driver Responses */}
        {activeTab === "responses" && currentCompany && (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Users className="h-5 w-5" />
                Răspunsuri Șoferi ({responses.length})
              </CardTitle>
              <CardDescription>Vizualizați răspunsurile completate de șoferi</CardDescription>
            </CardHeader>
            <CardContent>
              {responses.length === 0 ? (
                <div className="text-center py-8 text-gray-500">
                  <Users className="h-12 w-12 mx-auto mb-4 text-gray-300" />
                  <p>Nu există răspunsuri încă</p>
                  <p className="text-sm">Răspunsurile șoferilor vor apărea aici după completare</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {responses.map((response) => (
                    <div key={response.id} className="border rounded-lg p-4">
                      <div className="flex items-center justify-between mb-3">
                        <div>
                          <h3 className="font-semibold">{response.driverName}</h3>
                          <p className="text-sm text-gray-600">Camion: {response.truckPlate}</p>
                        </div>
                        <div className="flex items-center gap-2">
                          <Badge variant={response.status === "completed" ? "default" : "secondary"}>
                            {response.status === "completed" ? "Completat" : "În progres"}
                          </Badge>
                          <Badge variant="outline">
                            {response.equipmentChecked}/{response.totalEquipment} echipamente
                          </Badge>
                        </div>
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
                        <div>
                          <span className="text-gray-600">Telefon:</span>
                          <div className="font-medium">{response.phone}</div>
                        </div>
                        <div>
                          <span className="text-gray-600">CI/Pașaport:</span>
                          <div className="font-medium">{response.idNumber}</div>
                        </div>
                        <div>
                          <span className="text-gray-600">Completat la:</span>
                          <div className="font-medium">{new Date(response.completedAt).toLocaleString("ro-RO")}</div>
                        </div>
                      </div>

                      <div className="flex justify-end mt-3 gap-2">
                        <Button size="sm" variant="outline" onClick={() => generateResponsePDF(response)}>
                          <Download className="h-4 w-4 mr-2" />
                          Descarcă PDF
                        </Button>
                        <Button size="sm" variant="outline">
                          <Eye className="h-4 w-4 mr-2" />
                          Vezi Detalii Complete
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  )
}
