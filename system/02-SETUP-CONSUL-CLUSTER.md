# System Setup (Consul Cluster)

3 x ubuntu 14:04, 2 Gig RAM (1 Gig probably ok)

All instructions should be applied to all 3 hosts unless otherwise specified.

__These instructions are distilled from here:__

* [How to Configure Consul in a Production Environment on Ubuntu 14.04](https://www.digitalocean.com/community/tutorials/how-to-configure-consul-in-a-production-environment-on-ubuntu-14-04)
* [How To Secure Consul with TLS Encryption on Ubuntu 14.04](https://www.digitalocean.com/community/tutorials/how-to-secure-consul-with-tls-encryption-on-ubuntu-14-04)

## Create the "daemon" user

```bash
# as root
adduser consul --disabled-password
```

## Create consul config and runtime directories

```bash
# as root
mkdir /var/consul
chown consul:consul /var/consul
mkdir -p /etc/consul.d/{bootstrap,server,ssl}
```


## Install consul

[GET LATEST DOWNLOAD CONSUL](https://www.consul.io/downloads.html)
__because consul download (wget) instruction below may be out of date__

```bash
# as root
apt-get update
apt-get install unzip
cd /usr/local/bin
wget https://releases.hashicorp.com/consul/0.6.4/consul_0.6.4_linux_amd64.zip
unzip *.zip
rm *.zip
```

The above should have resulted in `/usr/local/bin/consul`, make sure

```bash
consul
```

## Create a key to encrypt consul gossip traffic

__place this key where appropriate in all `/etc/consul.d/` files

```bash
consul keygen
# NirDFEGakdudsnQdZ7422A==
```

## Create root CA and certify wildcard SSL key to encrypt and certify rpc connections

__Do this only on one server__

__Keep the resulting CONSUL_ROOT_CA directory safe__

### Create SSL structure

```bash
# as root

mkdir /root/CONSUL_ROOT_CA
chmod 0700 /root/CONSUL_ROOT_CA
cd /root/CONSUL_ROOT_CA
echo "000a" > serial # starting n for certificate cerial numbers
touch certindex      # stores index of signed certificates
```

### Create self signed root certificate

```bash
cd /root/CONSUL_ROOT_CA
openssl req -x509 -newkey rsa:2048 -days 999999 -nodes -out ca.cert

# Country Name (2 letter code) [AU]:ZA
# State or Province Name (full name) [Some-State]:Western Cape
# Locality Name (eg, city) []:Cape Town
# Organization Name (eg, company) [Internet Widgits Pty Ltd]:objective
# Organizational Unit Name (eg, section) []:
# Common Name (e.g. server FQDN or YOUR name) []:ROOT_CA
# Email Address []:
#
```

### Create CA signing configuration

```bash
cd /root/CONSUL_ROOT_CA
vi myca.conf
```
```
[ ca ]
default_ca = myca

[ myca ]
unique_subject = no
new_certs_dir = .
certificate = ca.cert
database = certindex
private_key = privkey.pem
serial = serial
default_days = 3650
default_md = sha1
policy = myca_policy
x509_extensions = myca_extensions

[ myca_policy ]
commonName = supplied
stateOrProvinceName = supplied
countryName = supplied
emailAddress = optional
organizationName = supplied
organizationalUnitName = optional

[ myca_extensions ]
basicConstraints = CA:false
subjectKeyIdentifier = hash
authorityKeyIdentifier = keyid:always
keyUsage = digitalSignature,keyEncipherment
extendedKeyUsage = serverAuth,clientAuth
```


### Create SSL key and wildcard signing request

__note the wildcard where prompted for Common Name (e.g. server FQDN or YOUR name)__

```
cd /root/CONSUL_ROOT_CA
openssl req -newkey rsa:1024 -nodes -out example.com.csr -keyout example.com.key

# Country Name (2 letter code) [AU]:ZA
# State or Province Name (full name) [Some-State]:Western Cape
# Locality Name (eg, city) []:Cape Town
# Organization Name (eg, company) [Internet Widgits Pty Ltd]:objective
# Organizational Unit Name (eg, section) []:
# Common Name (e.g. server FQDN or YOUR name) []:*.example.com
# Email Address []:
#
# Please enter the following 'extra' attributes
# to be sent with your certificate request
# A challenge password []:
# An optional company name []:
```

### Certify the key using the CA

```
cd /root/CONSUL_ROOT_CA
openssl ca -batch -config myca.conf -notext -in example.com.csr -out example.com.cert

# Using configuration from myca.conf
# Check that the request matches the signature
# Signature ok
# The Subject's Distinguished Name is as follows
# countryName           :PRINTABLE:'ZA'
# stateOrProvinceName   :ASN.1 12:'Western Cape'
# localityName          :ASN.1 12:'Cape Town'
# organizationName      :ASN.1 12:'objective'
# commonName            :ASN.1 12:'*.example.com'
# Certificate is to be certified until Apr  6 13:41:33 2026 GMT (3650 days)
#
# Write out database with 1 new entries
# Data Base Updated


```

### Signing request is no longer needed

```bash
cd /root/CONSUL_ROOT_CA
rm example.com.csr
```

## Copy SSL ca.cert and key and cert to all conul servers in the cluster

* It needs the ca.cert because it verifies each RPC connection as having been signed by said CA before allowing participation

__THESE FILES NEED TO BE COPIED TO ALL CLUSTER SERVERS__

```bash
cd /root/CONSUL_ROOT_CA
cp example.com.key example.com.cert ca.cert /etc/consul.d/ssl/
```

## Create Bootstrap Config

The bootstrap will be used shortly to start the cluster and can be used later should the cluster go down.

```bash
vi /etc/consul.d/bootstrap/00-config.json
```

* copy from './etc/consul.d/bootstrap/00-config.json'
* remember to change __datacenter, bind_addr, encrypt, ca_file, cert_file, key_file__ to fit.



## Create Server Config

The config runs on all 3 hosts once bootstrapped.


```bash
vi /etc/consul.d/server/00-config.json
```

* copy from './etc/consul.d/server/00-config.json'
* remember to change __datacenter, bind_addr, encrypt, ca_file, cert_file, key_file__ to fit.
* each __start_join__ should point to the other two servers


## Create upstart script

```bash
vi /etc/init/consul
```
* copy from `./etc/init/consul.conf`



## Bootstrap

### On one server.

```bash
su consul
consul agent -config-dir /etc/consul.d/bootstrap
```

### On the other two

```
start consul
```

### On the first one again

```
# CTRL-C to stop the boostrap
exit # back to root
start consul




tail -f /var/log/syslog
```


