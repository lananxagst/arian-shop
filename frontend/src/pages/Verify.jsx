import { useContext, useEffect, useState } from 'react'
import { ShopContext } from '../context/ShopContext'
import { useSearchParams } from 'react-router-dom'
import axios from 'axios'
import { toast } from 'react-toastify'

// Import icons
import { FaCheckCircle, FaTimesCircle, FaSpinner, FaShoppingCart, FaListAlt } from 'react-icons/fa'

const Verify = () => {
    const { navigate, token, setCartItems, backend_url } = useContext(ShopContext)
    const [searchParams] = useSearchParams()

    const success = searchParams.get("success")
    const orderId = searchParams.get("orderId")
    
    // Add states for UI
    const [verificationStatus, setVerificationStatus] = useState('loading') // loading, success, error
    const [orderDetails, setOrderDetails] = useState(null)
    const [errorMessage, setErrorMessage] = useState('')

    useEffect(() => {
        const verifyPayment = async () => {
            try {
                if (!token) {
                    setVerificationStatus('error')
                    setErrorMessage('Authentication required. Please log in to verify your payment.')
                    setTimeout(() => navigate('/login', { state: { returnTo: '/orders' } }), 3000)
                    return
                }
                
                // Show loading state for at least 1.5 seconds for better UX
                const loadingTimer = setTimeout(() => {}, 1500)
                
                const response = await axios.post(
                    backend_url + "/api/order/verifyStripe", 
                    { success, orderId }, 
                    { headers: { token } }
                )
                
                clearTimeout(loadingTimer)
                
                if (response.data.success) {
                    setCartItems({})
                    setVerificationStatus('success')
                    setOrderDetails(response.data.order || { id: orderId })
                    
                    // Navigate after showing success message
                    setTimeout(() => navigate('/orders'), 2000)
                } else {
                    setVerificationStatus('error')
                    setErrorMessage(response.data.message || 'Payment verification failed')
                    
                    // Navigate after showing error message
                    setTimeout(() => navigate('/cart'), 2000)
                }
            } catch (error) {
                console.log(error)
                setVerificationStatus('error')
                setErrorMessage(error.message || 'An error occurred during payment verification')
                toast.error(error.message)
                
                // Navigate after showing error message
                setTimeout(() => navigate('/cart'), 2000)
            }
        }

        verifyPayment()
    }, [token, backend_url, success, orderId, navigate, setCartItems])

    return (
        <div className="min-h-screen bg-primary flex items-center justify-center p-4">
            <div className="bg-white rounded-xl shadow-lg p-8 max-w-md w-full">
                <div className="flex flex-col items-center text-center">
                    {verificationStatus === 'loading' && (
                        <>
                            <div className="animate-spin text-secondary text-5xl mb-6">
                                <FaSpinner />
                            </div>
                            <h2 className="text-2xl font-bold text-gray-800 mb-2">Verifying Payment</h2>
                            <p className="text-gray-600 mb-6">Please wait while we confirm your payment...</p>
                            <div className="w-full bg-gray-200 rounded-full h-2.5">
                                <div className="bg-secondary h-2.5 rounded-full animate-pulse" style={{ width: '70%' }}></div>
                            </div>
                        </>
                    )}
                    
                    {verificationStatus === 'success' && (
                        <>
                            <div className="text-green-500 text-6xl mb-6">
                                <FaCheckCircle />
                            </div>
                            <h2 className="text-2xl font-bold text-gray-800 mb-2">Payment Successful!</h2>
                            <p className="text-gray-600 mb-6">Your order has been confirmed and is being processed.</p>
                            {orderDetails && orderDetails.id && (
                                <p className="text-sm text-gray-500 mb-6">Order ID: {orderDetails.id}</p>
                            )}
                            <div className="flex space-x-4">
                                <button 
                                    onClick={() => navigate('/orders')} 
                                    className="flex items-center px-4 py-2 bg-secondary text-white rounded-lg hover:bg-tertiary transition-colors"
                                >
                                    <FaListAlt className="mr-2" /> View Orders
                                </button>
                            </div>
                        </>
                    )}
                    
                    {verificationStatus === 'error' && (
                        <>
                            <div className="text-red-500 text-6xl mb-6">
                                <FaTimesCircle />
                            </div>
                            <h2 className="text-2xl font-bold text-gray-800 mb-2">Payment Verification Failed</h2>
                            <p className="text-gray-600 mb-6">{errorMessage || 'There was an issue verifying your payment.'}</p>
                            <div className="flex space-x-4">
                                <button 
                                    onClick={() => navigate('/cart')} 
                                    className="flex items-center px-4 py-2 bg-secondary text-white rounded-lg hover:bg-tertiary transition-colors"
                                >
                                    <FaShoppingCart className="mr-2" /> Return to Cart
                                </button>
                            </div>
                        </>
                    )}
                </div>
            </div>
        </div>
    )
}

export default Verify