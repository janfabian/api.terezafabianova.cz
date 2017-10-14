const qencode = require("q-encoding");
const utf8 = require("utf8");
const MIME = (string) => "=?UTF-8?Q?" + qencode.encode(utf8.encode(string)) + "?=";

const config = {
  targetAddress: "info@terezafabianova.cz",
  fromAddress: MIME("Nová zpráva") + " <mailer@terezafabianova.cz>",
  defaultSubject: "Zpráva od {{name}} na terezafabianova.cz",
  defaultMessage: "Jméno: {{name}}\nEmail: {{email}}\n================\n{{message}}",
  reply: {
    fromAddress: MIME("Tereza Fabiánová") + " <kontakt@terezafabianova.cz>",
    defaultSubject: "Děkuji za Vaši zprávu",
    defaultMessage: "Vaše zpráva byla úspěšně odeslána, ozvu se Vám. Tereza Fabiánová"
  }
};

module.exports = config;
