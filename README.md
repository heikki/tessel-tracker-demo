# Tessel tracker

1. `heroku create && git push heroku master`
2. Set correct `APN` & `URL` to index.js
3. Connect gprs module to port A and gps to port C
4. `tessel run index.js`
5. Wait for continuous blue light (tessel is sending gps data then)
