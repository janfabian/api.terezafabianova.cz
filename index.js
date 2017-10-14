const aws = require("aws-sdk");
const reCAPTCHA = require("recaptcha2");
const mark = require("markup-js");
const config = require("./config");

const qencode = require("q-encoding");
const utf8 = require("utf8");
const MIME = (string) => "=?UTF-8?Q?" + qencode.encode(utf8.encode(string)) + "?=";

const ses = new aws.SES({
  region: "eu-west-1"
});

const recaptcha = new reCAPTCHA({
  siteKey: process.env.RECAPTCHA_SITEKEY,
  secretKey: process.env.RECAPTCHA_SECRETKEY
});

const sendEmail = (req, callback) => {
  const formEmail = {
    Destination: {
      ToAddresses: [
        config.targetAddress
      ]
    },
    Message: {
      Body: {
        Text: {
          Data: mark.up(config.defaultMessage, req.body),
          Charset: "UTF-8"
        }
      },
      Subject: {
        Data: mark.up(config.defaultSubject, req.body),
        Charset: "UTF-8"
      }
    },
    Source: config.fromAddress,
    ReplyToAddresses: [
        MIME(req.body.name) + "<" + req.body.email + ">"
    ]
  };
  const replyEmail = {
    Destination: {
      ToAddresses: [
        req.body.email
      ]
    },
    Message: {
      Body: {
        Text: {
          Data: config.reply.defaultMessage,
          Charset: "UTF-8"
        }
      },
      Subject: {
        Data: config.reply.defaultSubject,
        Charset: "UTF-8"
      }
    },
    Source: config.reply.fromAddress
  };
  ses.sendEmail(formEmail, (err, data) => {
    if (err) {
      callback(null, {
        headers: {
          "Access-Control-Allow-Origin": "*"
        },
        statusCode: "400",
        body: JSON.stringify({error: `The email could not be sent ${err}`})
      });
    } else {
      ses.sendEmail(replyEmail, (err, data) => {
        if (err) {
          callback(null, {
            headers: {
              "Access-Control-Allow-Origin": "*"
            },
            statusCode: "400",
            body: JSON.stringify({error: `The email could not be sent ${err}`})
          });
        } else {
          callback(null, {
            headers: {
              "Access-Control-Allow-Origin": "*"
            },
            body: JSON.stringify({text: "The email was successfully sent"})
          });
        }
      });
    }
  });
}

exports.handler = (event, context, callback) => {
    const req = {
      body: JSON.parse(event.body)
    };
    recaptcha.validateRequest(req).
      then(() => sendEmail(req, callback)).
      catch((errorCodes) =>
        callback(null, {
          headers: {
            "Access-Control-Allow-Origin": "*"
          },
          statusCode: "400",
          body: JSON.stringify(recaptcha.translateErrors(errorCodes))
        })
      );
};
