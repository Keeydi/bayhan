import axios from 'axios'
import * as dotenv from 'dotenv'
import { fileURLToPath } from 'url'
import { dirname, join } from 'path'

const __filename = fileURLToPath(import.meta.url)
const __dirname = dirname(__filename)

dotenv.config({ path: join(__dirname, '.env') })

async function testSMS() {
    console.log('='.repeat(60))
    console.log('🎉 TESTING WITH YOUR APPROVED SENDER ID')
    console.log('='.repeat(60))
    
    const phone = '639947143705'
    const apiToken = process.env.PHILSMS_API_KEY
    
    // Replace with your actual approved sender ID name
    const approvedSenderId = 'YOUR_SENDER_ID_HERE' // <-- PUT YOUR SENDER ID HERE!
    
    if (!apiToken) {
        console.error('❌ PHILSMS_API_KEY not found')
        return
    }
    
    console.log('✓ API Key: Found')
    console.log('✓ Phone: ' + phone)
    console.log('✓ Sender ID: ' + approvedSenderId)
    console.log('='.repeat(60))
    
    const baseUrl = 'https://app.philsms.com/api/v3/sms/send'
    
    console.log('\n📤 Sending "HI POGI" to ' + phone + '...')
    
    try {
        const response = await axios.post(
            baseUrl,
            {
                recipient: phone,
                sender_id: approvedSenderId,
                type: 'plain',
                message: 'HI POGI'
            },
            {
                headers: {
                    Authorization: `Bearer ${apiToken}`,
                    Accept: 'application/json',
                    'Content-Type': 'application/json'
                }
            }
        )
        
        console.log('\n🎉 SUCCESS! SMS SENT!')
        console.log('✅ Response:', JSON.stringify(response.data, null, 2))
        console.log('\n📱 Check your phone for "HI POGI"!')
        console.log('\n🚀 SMS is working! All wireless features are now active!')
        
    } catch (error: any) {
        console.log('\n❌ Failed to send SMS')
        
        if (error.response) {
            console.log('Status:', error.response.status)
            console.log('Error:', JSON.stringify(error.response.data, null, 2))
        } else {
            console.log('Error:', error.message)
        }
    }
    
    console.log('\n' + '='.repeat(60))
}

testSMS()
