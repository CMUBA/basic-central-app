"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import { useLoadScript, GoogleMap, Marker } from "@react-google-maps/api"
import { useFormStatus } from "react-dom"

// Chiang Mai coordinates
const CHIANG_MAI = { lat: 18.7883, lng: 98.9853 }
const libraries: ("places")[] = ["places"]
const MAX_IMAGE_SIZE = 5 * 1024 * 1024 // 5MB
const MAX_UPLOAD_SIZE = 1024 * 1024 // 1MB

// Function to compress image
async function compressImage(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const img = new Image()
    img.onload = () => {
      const canvas = document.createElement('canvas')
      let width = img.width
      let height = img.height
      
      // Calculate new dimensions while maintaining aspect ratio
      if (width > height) {
        if (width > 1024) {
          height = Math.round((height * 1024) / width)
          width = 1024
        }
      } else {
        if (height > 1024) {
          width = Math.round((width * 1024) / height)
          height = 1024
        }
      }

      canvas.width = width
      canvas.height = height
      
      const ctx = canvas.getContext('2d')
      if (!ctx) {
        reject(new Error('Failed to get canvas context'))
        return
      }
      
      ctx.drawImage(img, 0, 0, width, height)
      resolve(canvas.toDataURL('image/jpeg', 0.7)) // Compress with 0.7 quality
    }
    img.onerror = () => reject(new Error('Failed to load image'))
    img.src = URL.createObjectURL(file)
  })
}

function SubmitButton() {
  const { pending } = useFormStatus()
  return (
    <Button type="submit" disabled={pending}>
      {pending ? "Registering..." : "Register"}
    </Button>
  )
}

export default function NewMerchantForm({
  onSubmit
}: {
  onSubmit: (formData: FormData) => Promise<void>
}) {
  const [location, setLocation] = useState(CHIANG_MAI)
  const [address, setAddress] = useState("")
  const [images, setImages] = useState<string[]>([])
  const [geocoder, setGeocoder] = useState<google.maps.Geocoder | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [isProcessing, setIsProcessing] = useState(false)

  const { isLoaded } = useLoadScript({
    googleMapsApiKey: process.env.NEXT_PUBLIC_GOOGLE_MAPS_KEY as string,
    libraries,
  })

  useEffect(() => {
    if (isLoaded) {
      setGeocoder(new google.maps.Geocoder())
    }
  }, [isLoaded])

  const handleMapClick = async (e: google.maps.MapMouseEvent) => {
    if (!e.latLng || !geocoder) return
    
    const lat = e.latLng.lat()
    const lng = e.latLng.lng()
    setLocation({ lat, lng })

    try {
      const response = await geocoder.geocode({ location: { lat, lng } })
      if (response.results[0]) {
        setAddress(response.results[0].formatted_address)
      }
    } catch (error) {
      console.error("Geocoding error:", error)
    }
  }

  const handleAddressChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const newAddress = e.target.value
    setAddress(newAddress)

    if (!geocoder || !newAddress) return

    try {
      const response = await geocoder.geocode({ address: newAddress })
      if (response.results[0]?.geometry?.location) {
        const lat = response.results[0].geometry.location.lat()
        const lng = response.results[0].geometry.location.lng()
        setLocation({ lat, lng })
      }
    } catch (error) {
      console.error("Geocoding error:", error)
    }
  }

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files) return
    
    // Check file sizes
    const oversizedFiles = Array.from(e.target.files).filter(file => file.size > MAX_IMAGE_SIZE)
    if (oversizedFiles.length > 0) {
      setError(`Some images are too large (max ${MAX_IMAGE_SIZE / 1024 / 1024}MB): ${oversizedFiles.map(f => f.name).join(", ")}`)
      e.target.value = "" // Clear the input
      return
    }

    setIsProcessing(true)
    setError(null)
    
    try {
      // Compress and convert files to base64
      const compressedImages = await Promise.all(
        Array.from(e.target.files).map(compressImage)
      )
      
      // Check compressed sizes
      const tooLarge = compressedImages.some(dataUrl => {
        const base64Length = dataUrl.split(',')[1].length
        const sizeInBytes = base64Length * 0.75 // Convert base64 length to bytes
        return sizeInBytes > MAX_UPLOAD_SIZE
      })
      
      if (tooLarge) {
        setError("Images are still too large after compression. Please try smaller images.")
        e.target.value = ""
        return
      }

      setImages([...images, ...compressedImages])
    } catch (error) {
      console.error("Error processing images:", error)
      setError("Failed to process images. Please try again.")
      e.target.value = "" // Clear the input
    } finally {
      setIsProcessing(false)
    }
  }

  async function handleSubmit(formData: FormData) {
    try {
      setError(null)
      if (images.length < 3) {
        setError("Please upload at least 3 images")
        return
      }
      await onSubmit(formData)
    } catch (err) {
      setError(err instanceof Error ? err.message : "An error occurred while registering")
      console.error("Registration error:", err)
    }
  }

  return (
    <form action={handleSubmit}>
      <Card>
        <CardHeader>
          <CardTitle>Register as a Merchant</CardTitle>
          <CardDescription>
            Please provide your business information to start issuing coupons.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {error && (
            <div className="rounded-md bg-red-50 p-4 text-sm text-red-500">
              {error}
            </div>
          )}
          <div className="space-y-2">
            <Label htmlFor="businessName">Business Name</Label>
            <Input id="businessName" name="businessName" required />
          </div>

          <div className="space-y-2">
            <Label htmlFor="description">Business Description</Label>
            <Textarea id="description" name="description" required />
          </div>

          <div className="space-y-2">
            <Label htmlFor="address">Address</Label>
            <Input 
              id="address" 
              name="address" 
              value={address}
              onChange={handleAddressChange}
              required 
            />
          </div>

          <div className="space-y-2">
            <Label>Location</Label>
            {isLoaded ? (
              <div className="h-[300px] w-full rounded-md border">
                <GoogleMap
                  zoom={13}
                  center={location}
                  mapContainerClassName="w-full h-full rounded-md"
                  onClick={handleMapClick}
                >
                  <Marker position={location} />
                </GoogleMap>
              </div>
            ) : (
              <div>Loading map...</div>
            )}
            <input
              type="hidden"
              name="location"
              value={JSON.stringify(location)}
            />
          </div>

          <div className="space-y-2">
            <Label>Business Images (at least 3, max 5MB each)</Label>
            <Input
              type="file"
              accept="image/*"
              multiple
              onChange={handleImageUpload}
              required
              disabled={isProcessing}
            />
            {isProcessing && (
              <div className="text-sm text-muted-foreground">
                Processing images...
              </div>
            )}
            <div className="grid grid-cols-3 gap-2">
              {images.map((url) => (
                <div key={url} className="relative aspect-square">
                  <img
                    src={url}
                    alt="Business location view"
                    className="absolute inset-0 h-full w-full rounded-md object-cover"
                  />
                </div>
              ))}
            </div>
            {images.map((url) => (
              <input
                key={url}
                type="hidden"
                name="images"
                value={url}
              />
            ))}
          </div>
        </CardContent>
        <CardFooter>
          <SubmitButton />
        </CardFooter>
      </Card>
    </form>
  )
} 