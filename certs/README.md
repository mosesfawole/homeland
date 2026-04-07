Place your Supabase CA certificate here.

Recommended filename: prod-ca-2021.crt

After downloading from Supabase Dashboard -> Settings -> Database -> SSL Configuration,
set PG_SSL_CERT_PATH in .env.local to:

PG_SSL_CERT_PATH=certs/prod-ca-2021.crt
