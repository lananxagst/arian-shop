import { useContext, useEffect } from 'react'
import { ShopContext } from '../context/ShopContext'
import { useSearchParams } from 'react-router-dom'
import axios from 'axios'
import { toast } from 'react-toastify'

const Verify = () => {

    const {navigate, token, setCartItems, backend_url} = useContext(ShopContext)
    const [searchParams] = useSearchParams()

    const success = searchParams.get("success")
    const orderId = searchParams.get("orderId")

    useEffect(() => {
        const verifyPayment = async () => {
            try {
                if(!token){
                    return null
                }
                const response = await axios.post(backend_url + "/api/order/verifyStripe", {success, orderId}, {headers: {token}})
                if(response.data.success){
                    setCartItems({})
                    navigate('/orders')
                }else{
                    navigate('/cart')
                }
            } catch (error) {
                console.log(error)
                toast.error(error.message)
            }
        }

        verifyPayment()
    }, [token, backend_url, success, orderId, navigate, setCartItems])

  return (
    <div>Verify</div>
  )
}

export default Verify