# Tessel tracker

1. `heroku create`
2. `git push heroku master`
3. Set correct `APN` & `URL` to index.js
4. Connect gprs module to port A and gps to port C
5. `tessel run index.js`
6. Wait for continuous blue light (tessel is sending gps data then)
