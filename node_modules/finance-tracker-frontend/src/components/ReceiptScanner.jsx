import React, { useState, useRef } from 'react'
import { Camera, Upload, X, Loader, CheckCircle, AlertCircle } from 'lucide-react'
import axios from 'axios'
import toast from 'react-hot-toast'

export default function ReceiptScanner({ onReceiptProcessed, onClose }) {
  const [isProcessing, setIsProcessing] = useState(false)
  const [processedData, setProcessedData] = useState(null)
  const [selectedFile, setSelectedFile] = useState(null)
  const [previewUrl, setPreviewUrl] = useState(null)
  const fileInputRef = useRef(null)
  const cameraInputRef = useRef(null)

  const handleFileSelect = (event) => {
    const file = event.target.files[0]
    if (file) {
      if (file.size > 10 * 1024 * 1024) { // 10MB limit
        toast.error('File size must be less than 10MB')
        return
      }

      if (!file.type.startsWith('image/')) {
        toast.error('Please select an image file')
        return
      }

      setSelectedFile(file)
      const url = URL.createObjectURL(file)
      setPreviewUrl(url)
    }
  }

  const processReceipt = async () => {
    if (!selectedFile) {
      toast.error('Please select an image first')
      return
    }

    setIsProcessing(true)
    
    try {
      const formData = new FormData()
      formData.append('receipt', selectedFile)

      const response = await axios.post('/api/ai/scan-receipt', formData, {
        headers: {
          'Content-Type': 'multipart/form-data'
        }
      })

      setProcessedData(response.data.receiptData)
      toast.success('Receipt processed successfully!')
    } catch (error) {
      console.error('Receipt processing error:', error)
      const message = error.response?.data?.error || 'Failed to process receipt'
      toast.error(message)
    } finally {
      setIsProcessing(false)
    }
  }

  const handleUseData = () => {
    if (processedData && onReceiptProcessed) {
      onReceiptProcessed({
        amount: processedData.total,
        description: processedData.merchant,
        category: processedData.category,
        date: processedData.date,
        type: 'expense',
        receiptUrl: processedData.imageUrl,
        items: processedData.items
      })
      onClose()
    }
  }

  const resetScanner = () => {
    setSelectedFile(null)
    setPreviewUrl(null)
    setProcessedData(null)
    if (fileInputRef.current) fileInputRef.current.value = ''
    if (cameraInputRef.current) cameraInputRef.current.value = ''
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-100">
          <div className="flex items-center space-x-3">
            <div className="p-2 bg-blue-100 rounded-lg">
              <Camera className="h-5 w-5 text-blue-600" />
            </div>
            <div>
              <h2 className="text-xl font-semibold text-gray-900">AI Receipt Scanner</h2>
              <p className="text-sm text-gray-500">Upload or capture a receipt to extract transaction details</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 text-gray-400 hover:text-gray-600 transition-colors"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        <div className="p-6 space-y-6">
          {/* Upload Options */}
          {!selectedFile && (
            <div className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* Camera Capture */}
                <button
                  onClick={() => cameraInputRef.current?.click()}
                  className="flex flex-col items-center justify-center p-8 border-2 border-dashed border-gray-300 rounded-lg hover:border-blue-400 hover:bg-blue-50 transition-colors"
                >
                  <Camera className="h-8 w-8 text-gray-400 mb-3" />
                  <span className="text-sm font-medium text-gray-700">Take Photo</span>
                  <span className="text-xs text-gray-500 mt-1">Use your camera</span>
                </button>

                {/* File Upload */}
                <button
                  onClick={() => fileInputRef.current?.click()}
                  className="flex flex-col items-center justify-center p-8 border-2 border-dashed border-gray-300 rounded-lg hover:border-blue-400 hover:bg-blue-50 transition-colors"
                >
                  <Upload className="h-8 w-8 text-gray-400 mb-3" />
                  <span className="text-sm font-medium text-gray-700">Upload Image</span>
                  <span className="text-xs text-gray-500 mt-1">Choose from gallery</span>
                </button>
              </div>

              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                onChange={handleFileSelect}
                className="hidden"
              />
              <input
                ref={cameraInputRef}
                type="file"
                accept="image/*"
                capture="environment"
                onChange={handleFileSelect}
                className="hidden"
              />

              <div className="text-center">
                <p className="text-xs text-gray-500">
                  Supported formats: JPG, PNG, HEIC • Max size: 10MB
                </p>
              </div>
            </div>
          )}

          {/* Image Preview */}
          {previewUrl && !processedData && (
            <div className="space-y-4">
              <div className="relative">
                <img
                  src={previewUrl}
                  alt="Receipt preview"
                  className="w-full max-h-64 object-contain rounded-lg border border-gray-200"
                />
                <button
                  onClick={resetScanner}
                  className="absolute top-2 right-2 p-1 bg-white rounded-full shadow-md hover:bg-gray-50"
                >
                  <X className="h-4 w-4 text-gray-600" />
                </button>
              </div>

              <div className="flex space-x-3">
                <button
                  onClick={resetScanner}
                  className="flex-1 px-4 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors font-medium"
                >
                  Choose Different Image
                </button>
                <button
                  onClick={processReceipt}
                  disabled={isProcessing}
                  className="flex-1 px-4 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center"
                >
                  {isProcessing ? (
                    <>
                      <Loader className="h-4 w-4 mr-2 animate-spin" />
                      Processing...
                    </>
                  ) : (
                    'Process Receipt'
                  )}
                </button>
              </div>
            </div>
          )}

          {/* Processing Results */}
          {processedData && (
            <div className="space-y-6">
              {/* Success Header */}
              <div className="flex items-center space-x-3 p-4 bg-green-50 rounded-lg">
                <CheckCircle className="h-6 w-6 text-green-600" />
                <div>
                  <h3 className="font-medium text-green-800">Receipt Processed Successfully!</h3>
                  <p className="text-sm text-green-600">
                    Confidence: {Math.round((processedData.confidence || 0.5) * 100)}%
                  </p>
                </div>
              </div>

              {/* Extracted Data */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-3">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Merchant
                    </label>
                    <div className="p-3 bg-gray-50 rounded-lg">
                      <span className="text-gray-900">{processedData.merchant}</span>
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Total Amount
                    </label>
                    <div className="p-3 bg-gray-50 rounded-lg">
                      <span className="text-gray-900 font-semibold">
                        {processedData.currency} {processedData.total?.toFixed(2) || '0.00'}
                      </span>
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Date
                    </label>
                    <div className="p-3 bg-gray-50 rounded-lg">
                      <span className="text-gray-900">{processedData.date}</span>
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Suggested Category
                    </label>
                    <div className="p-3 bg-blue-50 rounded-lg">
                      <span className="text-blue-800 font-medium">{processedData.category}</span>
                    </div>
                  </div>
                </div>

                {/* Items List */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Items ({processedData.items?.length || 0})
                  </label>
                  <div className="max-h-48 overflow-y-auto bg-gray-50 rounded-lg p-3">
                    {processedData.items && processedData.items.length > 0 ? (
                      <div className="space-y-2">
                        {processedData.items.map((item, index) => (
                          <div key={index} className="flex justify-between items-center text-sm">
                            <span className="text-gray-700">
                              {item.quantity}x {item.name}
                            </span>
                            <span className="font-medium text-gray-900">
                              ${item.price?.toFixed(2) || '0.00'}
                            </span>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <p className="text-gray-500 text-sm">No items detected</p>
                    )}
                  </div>
                </div>
              </div>

              {/* Additional Info */}
              {(processedData.paymentMethod || processedData.taxAmount) && (
                <div className="grid grid-cols-2 gap-4">
                  {processedData.paymentMethod && (
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Payment Method
                      </label>
                      <div className="p-3 bg-gray-50 rounded-lg">
                        <span className="text-gray-900">{processedData.paymentMethod}</span>
                      </div>
                    </div>
                  )}
                  {processedData.taxAmount && (
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Tax Amount
                      </label>
                      <div className="p-3 bg-gray-50 rounded-lg">
                        <span className="text-gray-900">${processedData.taxAmount.toFixed(2)}</span>
                      </div>
                    </div>
                  )}
                </div>
              )}

              {/* Low Confidence Warning */}
              {processedData.confidence < 0.7 && (
                <div className="flex items-start space-x-3 p-4 bg-yellow-50 rounded-lg">
                  <AlertCircle className="h-5 w-5 text-yellow-600 mt-0.5" />
                  <div>
                    <h4 className="font-medium text-yellow-800">Low Confidence Detection</h4>
                    <p className="text-sm text-yellow-700">
                      Please review the extracted data carefully before using it.
                    </p>
                  </div>
                </div>
              )}

              {/* Action Buttons */}
              <div className="flex space-x-3">
                <button
                  onClick={resetScanner}
                  className="flex-1 px-4 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors font-medium"
                >
                  Scan Another
                </button>
                <button
                  onClick={handleUseData}
                  className="flex-1 px-4 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium"
                >
                  Use This Data
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}