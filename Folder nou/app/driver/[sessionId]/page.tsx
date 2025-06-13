"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { useParams } from "next/navigation"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Checkbox } from "@/components/ui/checkbox"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Badge } from "@/components/ui/badge"
import {
  User,
  Truck,
  Package,
  Camera,
  Upload,
  PenTool,
  Phone,
  BadgeIcon as IdCard,
  CheckCircle,
  AlertTriangle,
  Clock,
  Building2,
  Send,
} from "lucide-react"

interface VerificationSession {
  id: string
  companyId: string
  companyName: string
  sessionName: string
  description: string
  expiresAt: string
  status: "active" | "expired" | "completed"
}

interface DriverData {
  name: string
  phone: string
  idNumber: string
  signature?: string
  truckPlate: string
  truckModel: string
}

interface EquipmentItem {
  id: string
  name: string
  quantity: number
  comments: string
  photo?: string
  checked: boolean
}

export default function DriverPortal() {
  const params = useParams()
  const sessionId = params.sessionId as string

  const [session, setSession] = useState<VerificationSession | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [activeStep, setActiveStep] = useState(1)
  const [isSubmitting, setIsSubmitting] = useState(false)

  const [driverData, setDriverData] = useState<DriverData>({
    name: "",
    phone: "",
    idNumber: "",
    signature: undefined,
    truckPlate: "",
    truckModel: "",
  })

  const [equipmentItems, setEquipmentItems] = useState<EquipmentItem[]>([
    { id: "1", name: "Trusa de prim ajutor", quantity: 1, comments: "", checked: false },
    { id: "2", name: "Extinctor", quantity: 1, comments: "", checked: false },
    { id: "3", name: "Triunghi reflectorizant", quantity: 2, comments: "", checked: false },
    { id: "4", name: "Vestă reflectorizantă", quantity: 1, comments: "", checked: false },
    { id: "5", name: "Lanternă", quantity: 1, comments: "", checked: false },
    { id: "6", name: "Cabluri pornire", quantity: 1, comments: "", checked: false },
    { id: "7", name: "Roată de rezervă", quantity: 1, comments: "", checked: false },
    { id: "8", name: "Cheie roată", quantity: 1, comments: "", checked: false },
    { id: "9", name: "Cric", quantity: 1, comments: "", checked: false },
    { id: "10", name: "Kit reparații anvelope", quantity: 1, comments: "", checked: false },
  ])

  // Load session data
  useEffect(() => {
    const loadSession = () => {
      try {
        const savedSessions = localStorage.getItem("verificationSessions")
        if (savedSessions) {
          const sessions = JSON.parse(savedSessions)
          const currentSession = sessions.find((s: VerificationSession) => s.id === sessionId)

          if (currentSession) {
            // Check if session is expired
            const now = new Date()
            const expires = new Date(currentSession.expiresAt)

            if (now > expires) {
              setError("Această sesiune de verificare a expirat.")
            } else {
              setSession(currentSession)
            }
          } else {
            setError("Sesiunea de verificare nu a fost găsită.")
          }
        } else {
          setError("Sesiunea de verificare nu a fost găsită.")
        }
      } catch (err) {
        setError("Eroare la încărcarea sesiunii.")
      } finally {
        setLoading(false)
      }
    }

    if (sessionId) {
      loadSession()
    }
  }, [sessionId])

  const handleImageUpload = (event: React.ChangeEvent<HTMLInputElement>, type: string, itemId?: string) => {
    const file = event.target.files?.[0]
    if (file) {
      const reader = new FileReader()
      reader.onload = (e) => {
        const imageUrl = e.target?.result as string

        if (type === "signature") {
          setDriverData((prev) => ({ ...prev, signature: imageUrl }))
        } else if (type === "equipment" && itemId) {
          setEquipmentItems((items) => items.map((item) => (item.id === itemId ? { ...item, photo: imageUrl } : item)))
        }
      }
      reader.readAsDataURL(file)
    }
  }

  const updateEquipmentItem = (id: string, field: keyof EquipmentItem, value: any) => {
    setEquipmentItems((items) => items.map((item) => (item.id === id ? { ...item, [field]: value } : item)))
  }

  const getCompletionStats = () => {
    const completed = equipmentItems.filter((item) => item.checked).length
    const total = equipmentItems.length
    return { completed, total, percentage: Math.round((completed / total) * 100) }
  }

  const canProceedToStep = (step: number) => {
    switch (step) {
      case 2:
        return driverData.name && driverData.phone && driverData.truckPlate
      case 3:
        return true // Equipment step is always accessible
      case 4:
        return driverData.signature // Signature is required for final step
      default:
        return true
    }
  }

  const submitVerification = async () => {
    if (!session) return

    setIsSubmitting(true)

    try {
      // Simulate API call
      await new Promise((resolve) => setTimeout(resolve, 2000))

      const response = {
        id: Date.now().toString(),
        sessionId: session.id,
        driverName: driverData.name,
        phone: driverData.phone,
        idNumber: driverData.idNumber,
        signature: driverData.signature,
        truckPlate: driverData.truckPlate,
        completedAt: new Date().toISOString(),
        equipmentChecked: equipmentItems.filter((item) => item.checked).length,
        totalEquipment: equipmentItems.length,
        status: "completed" as const,
        equipmentDetails: equipmentItems,
      }

      // Save response
      const savedResponses = localStorage.getItem("driverResponses")
      const responses = savedResponses ? JSON.parse(savedResponses) : []
      responses.push(response)
      localStorage.setItem("driverResponses", JSON.stringify(responses))

      // Update session response count
      const savedSessions = localStorage.getItem("verificationSessions")
      if (savedSessions) {
        const sessions = JSON.parse(savedSessions)
        const updatedSessions = sessions.map((s: VerificationSession) =>
          s.id === session.id ? { ...s, responses: (s.responses || 0) + 1 } : s,
        )
        localStorage.setItem("verificationSessions", JSON.stringify(updatedSessions))
      }

      alert("Verificarea a fost trimisă cu succes! Mulțumim pentru completare.")
    } catch (error) {
      alert("Eroare la trimiterea verificării. Încercați din nou.")
    } finally {
      setIsSubmitting(false)
    }
  }

  const stats = getCompletionStats()

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p>Se încarcă sesiunea de verificare...</p>
        </div>
      </div>
    )
  }

  if (error || !session) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
        <Card className="max-w-md w-full">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-red-600">
              <AlertTriangle className="h-5 w-5" />
              Sesiune Indisponibilă
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-gray-600 mb-4">{error}</p>
            <p className="text-sm text-gray-500">
              Contactați compania pentru un link nou de verificare sau verificați dacă link-ul este corect.
            </p>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50 p-4">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <div className="bg-white rounded-lg p-6 shadow-sm">
            <div className="flex items-center gap-3 mb-4">
              <div className="p-3 bg-blue-600 rounded-lg">
                <Truck className="h-8 w-8 text-white" />
              </div>
              <div>
                <h1 className="text-2xl font-bold text-gray-900">Verificare Camion - Portal Șofer</h1>
                <p className="text-gray-600">{session.sessionName}</p>
              </div>
            </div>

            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <div className="flex items-center gap-2">
                  <Building2 className="h-4 w-4 text-gray-500" />
                  <span className="text-sm font-medium">{session.companyName}</span>
                </div>
                <div className="flex items-center gap-2">
                  <Clock className="h-4 w-4 text-gray-500" />
                  <span className="text-sm text-gray-600">
                    Expiră: {new Date(session.expiresAt).toLocaleDateString("ro-RO")}
                  </span>
                </div>
              </div>
              <Badge variant="default">Sesiune Activă</Badge>
            </div>

            {session.description && (
              <div className="mt-4 p-3 bg-blue-50 rounded-lg">
                <p className="text-sm text-blue-800">{session.description}</p>
              </div>
            )}
          </div>
        </div>

        {/* Progress Steps */}
        <div className="mb-8">
          <div className="flex items-center justify-between bg-white rounded-lg p-4 shadow-sm">
            {[
              { step: 1, label: "Informații Personale", icon: User },
              { step: 2, label: "Detalii Camion", icon: Truck },
              { step: 3, label: "Verificare Echipamente", icon: Package },
              { step: 4, label: "Semnătură și Finalizare", icon: PenTool },
            ].map(({ step, label, icon: Icon }) => (
              <div key={step} className="flex items-center">
                <div
                  className={`flex items-center justify-center w-10 h-10 rounded-full ${
                    activeStep >= step ? "bg-blue-600 text-white" : "bg-gray-200 text-gray-500"
                  }`}
                >
                  {activeStep > step ? <CheckCircle className="h-5 w-5" /> : <Icon className="h-5 w-5" />}
                </div>
                <div className="ml-3">
                  <div className={`text-sm font-medium ${activeStep >= step ? "text-blue-600" : "text-gray-500"}`}>
                    {label}
                  </div>
                </div>
                {step < 4 && <div className="w-8 h-px bg-gray-300 mx-4" />}
              </div>
            ))}
          </div>
        </div>

        {/* Step Content */}
        {activeStep === 1 && (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <User className="h-5 w-5" />
                Informații Personale
              </CardTitle>
              <CardDescription>Completați informațiile dvs. personale</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="driverName">Numele complet *</Label>
                  <Input
                    id="driverName"
                    value={driverData.name}
                    onChange={(e) => setDriverData((prev) => ({ ...prev, name: e.target.value }))}
                    placeholder="Nume și prenume"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="driverPhone">Telefon *</Label>
                  <div className="relative">
                    <Phone className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                    <Input
                      id="driverPhone"
                      type="tel"
                      value={driverData.phone}
                      onChange={(e) => setDriverData((prev) => ({ ...prev, phone: e.target.value }))}
                      placeholder="+40 xxx xxx xxx"
                      className="pl-10"
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="driverIdNumber">Număr CI/Pașaport</Label>
                  <div className="relative">
                    <IdCard className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                    <Input
                      id="driverIdNumber"
                      value={driverData.idNumber}
                      onChange={(e) => setDriverData((prev) => ({ ...prev, idNumber: e.target.value }))}
                      placeholder="Seria și numărul"
                      className="pl-10"
                    />
                  </div>
                </div>
              </div>

              <div className="flex justify-end">
                <Button
                  onClick={() => setActiveStep(2)}
                  disabled={!canProceedToStep(2)}
                  className="bg-blue-600 hover:bg-blue-700"
                >
                  Continuă la Detalii Camion
                </Button>
              </div>
            </CardContent>
          </Card>
        )}

        {activeStep === 2 && (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Truck className="h-5 w-5" />
                Detalii Camion
              </CardTitle>
              <CardDescription>Informații despre camionul pe care îl conduceți</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="truckPlate">Numărul de înmatriculare *</Label>
                  <Input
                    id="truckPlate"
                    value={driverData.truckPlate}
                    onChange={(e) => setDriverData((prev) => ({ ...prev, truckPlate: e.target.value.toUpperCase() }))}
                    placeholder="B 123 ABC"
                    className="uppercase"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="truckModel">Model camion</Label>
                  <Input
                    id="truckModel"
                    value={driverData.truckModel}
                    onChange={(e) => setDriverData((prev) => ({ ...prev, truckModel: e.target.value }))}
                    placeholder="ex: Volvo FH16, Scania R450"
                  />
                </div>
              </div>

              <div className="flex justify-between">
                <Button variant="outline" onClick={() => setActiveStep(1)}>
                  Înapoi
                </Button>
                <Button onClick={() => setActiveStep(3)} className="bg-blue-600 hover:bg-blue-700">
                  Continuă la Echipamente
                </Button>
              </div>
            </CardContent>
          </Card>
        )}

        {activeStep === 3 && (
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle className="flex items-center gap-2">
                    <Package className="h-5 w-5" />
                    Verificare Echipamente
                  </CardTitle>
                  <CardDescription>Verificați prezența și starea echipamentelor obligatorii</CardDescription>
                </div>
                <Badge variant="secondary">
                  {stats.completed}/{stats.total} verificate ({stats.percentage}%)
                </Badge>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              {equipmentItems.map((item) => (
                <div key={item.id} className="border rounded-lg p-4 space-y-3">
                  <div className="flex items-center space-x-3">
                    <Checkbox
                      checked={item.checked}
                      onCheckedChange={(checked) => updateEquipmentItem(item.id, "checked", checked as boolean)}
                    />
                    <div className="flex-1">
                      <Label className={`${item.checked ? "line-through text-gray-500" : ""}`}>{item.name}</Label>
                      <div className="text-sm text-gray-600">Cantitate necesară: {item.quantity}</div>
                    </div>
                    {item.checked ? (
                      <CheckCircle className="h-5 w-5 text-green-600" />
                    ) : (
                      <AlertTriangle className="h-5 w-5 text-amber-500" />
                    )}
                  </div>

                  <div className="ml-6 space-y-3">
                    <div>
                      <Label htmlFor={`comments-${item.id}`} className="text-sm">
                        Observații (opțional)
                      </Label>
                      <Textarea
                        id={`comments-${item.id}`}
                        value={item.comments}
                        onChange={(e) => updateEquipmentItem(item.id, "comments", e.target.value)}
                        placeholder="Starea echipamentului, observații..."
                        rows={2}
                        className="mt-1"
                      />
                    </div>

                    <div>
                      <Label className="text-sm">Fotografie (opțional)</Label>
                      <div className="mt-1">
                        {item.photo ? (
                          <div className="relative">
                            <img
                              src={item.photo || "/placeholder.svg"}
                              alt={`Fotografie ${item.name}`}
                              className="w-full max-w-xs h-32 object-cover rounded border"
                            />
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => {
                                const input = document.createElement("input")
                                input.type = "file"
                                input.accept = "image/*"
                                input.onchange = (e) => handleImageUpload(e as any, "equipment", item.id)
                                input.click()
                              }}
                              className="mt-2"
                            >
                              <Camera className="h-4 w-4 mr-2" />
                              Schimbă fotografia
                            </Button>
                          </div>
                        ) : (
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => {
                              const input = document.createElement("input")
                              input.type = "file"
                              input.accept = "image/*"
                              input.onchange = (e) => handleImageUpload(e as any, "equipment", item.id)
                              input.click()
                            }}
                          >
                            <Upload className="h-4 w-4 mr-2" />
                            Încarcă fotografie
                          </Button>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              ))}

              <div className="flex justify-between">
                <Button variant="outline" onClick={() => setActiveStep(2)}>
                  Înapoi
                </Button>
                <Button onClick={() => setActiveStep(4)} className="bg-blue-600 hover:bg-blue-700">
                  Continuă la Semnătură
                </Button>
              </div>
            </CardContent>
          </Card>
        )}

        {activeStep === 4 && (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <PenTool className="h-5 w-5" />
                Semnătură și Finalizare
              </CardTitle>
              <CardDescription>Semnați pentru a confirma verificarea</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-4">
                <Label>Semnătura dvs. *</Label>
                <div className="border-2 border-dashed border-gray-300 rounded-lg p-4">
                  {driverData.signature ? (
                    <div className="relative">
                      <img
                        src={driverData.signature || "/placeholder.svg"}
                        alt="Semnătura dvs."
                        className="w-full max-w-md h-32 object-contain bg-white border rounded mx-auto"
                      />
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => {
                          const input = document.createElement("input")
                          input.type = "file"
                          input.accept = "image/*"
                          input.onchange = (e) => handleImageUpload(e as any, "signature")
                          input.click()
                        }}
                        className="mt-2 mx-auto block"
                      >
                        <PenTool className="h-4 w-4 mr-2" />
                        Schimbă semnătura
                      </Button>
                    </div>
                  ) : (
                    <div className="text-center">
                      <PenTool className="h-12 w-12 text-gray-400 mx-auto mb-2" />
                      <p className="text-sm text-gray-600 mb-3">Încărcați o imagine cu semnătura dvs.</p>
                      <Button
                        variant="outline"
                        onClick={() => {
                          const input = document.createElement("input")
                          input.type = "file"
                          input.accept = "image/*"
                          input.onchange = (e) => handleImageUpload(e as any, "signature")
                          input.click()
                        }}
                      >
                        <Upload className="h-4 w-4 mr-2" />
                        Încarcă semnătura
                      </Button>
                    </div>
                  )}
                </div>
              </div>

              {/* Summary */}
              <div className="bg-gray-50 rounded-lg p-4">
                <h3 className="font-semibold mb-3">Rezumat Verificare</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                  <div>
                    <div className="flex justify-between">
                      <span>Șofer:</span>
                      <span className="font-medium">{driverData.name}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Camion:</span>
                      <span className="font-medium">{driverData.truckPlate}</span>
                    </div>
                  </div>
                  <div>
                    <div className="flex justify-between">
                      <span>Echipamente verificate:</span>
                      <span className="font-medium">
                        {stats.completed}/{stats.total}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span>Progres:</span>
                      <span className="font-medium">{stats.percentage}%</span>
                    </div>
                  </div>
                </div>
              </div>

              <Alert className="border-blue-200 bg-blue-50">
                <CheckCircle className="h-4 w-4 text-blue-600" />
                <AlertDescription className="text-blue-800">
                  Prin semnare confirmați că informațiile furnizate sunt corecte și că ați verificat echipamentele
                  indicate.
                </AlertDescription>
              </Alert>

              <div className="flex justify-between">
                <Button variant="outline" onClick={() => setActiveStep(3)}>
                  Înapoi
                </Button>
                <Button
                  onClick={submitVerification}
                  disabled={!driverData.signature || isSubmitting}
                  className="bg-green-600 hover:bg-green-700"
                >
                  {isSubmitting ? (
                    <>
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                      Se trimite...
                    </>
                  ) : (
                    <>
                      <Send className="h-4 w-4 mr-2" />
                      Trimite Verificarea
                    </>
                  )}
                </Button>
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  )
}
