import express from 'express'
import { google } from 'googleapis'
import bodyParser from 'body-parser'
import { sendMail } from './sendEmail.js'
const app = express()

const PORT = process.env.PORT || 3000

app.use(express.static('public'))
app.use(bodyParser.json())

const auth = new google.auth.GoogleAuth({
    keyFile: 'key.json',
    scopes: 'https://www.googleapis.com/auth/spreadsheets'
})

const client = await auth.getClient()
const googleSheets = google.sheets({
    version: 'v4',
    auth: client
})

const spreadsheetId = '1NTJIL8QmomkOHhliPKVD2NBSlWVsftRHyxKV87hy1BM'

app.post('/register', (req, res) => {
    const sheetName = 'Main'
    const range = `${sheetName}!A:G`
    const details = req.body
    const data = [
        [Date.now(), details.name, details.phone, details.email, details.game, details.date, details.time]
    ]

    const convertToISOTime = time => {
        let [hours, minutes] = time.split(':')
        let now = new Date()
        // let targetDate = new Date(now.getFullYear(), now.getMonth(), now.getDate(), hours, minutes)
        let targetDate = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate(), hours - 5, minutes - 30))
        // let isoTime = targetDate.toLocaleString('en-US', { timeZone: 'Asia/Kolkata' })
        return new Date(targetDate)
    }

    const delay = (convertToISOTime(details.time) - Date.now()) - 600000
    console.log(convertToISOTime(details.time), Date.now())
    console.log('delay', delay)

    setTimeout(() => {
        sendMail('Your booking for gaming room will be available in 10 minutes. Please be available at SB 120.\n\nPlease Note : The booking will be cancelled and no refund will be issued if not present.', details.email)
    }, delay)

    const request = {
        auth,
        spreadsheetId,
        range,
        valueInputOption: 'RAW',
        resource: {
            values: data
        },
        insertDataOption: 'INSERT_ROWS'
    }

    googleSheets.spreadsheets.values.append(request, (err, response) => {
        if (err) {
            console.error(err)
            return res.sendStatus(500)
        }
        res.json(response)
    })
})

app.listen(PORT, () => console.log(`listening on PORT: ${PORT}`))