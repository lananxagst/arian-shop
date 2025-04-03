# PowerShell script to set Vercel environment variables
# Run this script from your backend directory

# MongoDB
vercel env add MONGO_URI production
# Cloudinary
vercel env add CLDN_NAME production
vercel env add CLDN_API_KEY production
vercel env add CLDN_API_SECRET production
# JWT
vercel env add JWT_SECRET production
# Admin
vercel env add ADMIN_EMAIL production
vercel env add ADMIN_PASS production
# Email
vercel env add EMAIL_SENDER production
vercel env add EMAIL_PASS production
# Frontend URL (update this after frontend deployment)
vercel env add FRONTEND_URL production
# Node environment
vercel env add NODE_ENV production

# After setting all variables, redeploy
Write-Host "After setting all environment variables, run: vercel --prod"
