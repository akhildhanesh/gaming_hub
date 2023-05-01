'use strict'

import * as AWS from 'aws-sdk'
import dotenv from 'dotenv'
dotenv.config()

AWS.default.config.update({
    region: 'ap-south-1',
    apiVersion: 'latest',
    credentials: {
        accessKeyId: process.env.AWS_ACCESS_KEY,
        secretAccessKey: process.env.AWS_SECRET_KEY
    }
})

let sendMail = (message, email) => {
    let params = {
        Destination: {
            ToAddresses: [
                email,
            ]
        },
        Message: {
            Body: {
                Text: {
                    Charset: "UTF-8",
                    Data: `${message}`
                }
            },
            Subject: {
                Charset: 'UTF-8',
                Data: 'Reminder'
            }
        },
        Source: 'GAME <no-reply@idp-pay.tech>',
        ReplyToAddresses: [
            'no-reply@idp-pay.tech',
        ],
    };

    let sendPromise = new AWS.default.SES({ apiVersion: '2010-12-01' }).sendEmail(params).promise()

    return sendPromise
}

export {
    sendMail
}