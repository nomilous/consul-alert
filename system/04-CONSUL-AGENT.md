# System Setup (Consul Agent)

Run one on each monitored host (not cluster servers)


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

## Repeat steps to hijack nagios plugins]

[hijack-plugins-from-nagios](https://github.com/nomilous/consul-alert/blob/master/system/03-CONSUL-SYSTEM-CHECKS.md#hijack-plugins-from-nagios)

## Copy SSL certs to host.

* This refers to the certs created in `/root/CONSUL_ROOT_CA` in 02-SETUP-CONSUL-CLUSTER
* copy `example.com.cert` and `example.com.key` to `/etc/consul.d/ssh` on agent machine 


## Create config

```bash
mkdir -p /etc/consul.d/{agent,ssl}
vi /etc/consul.d/agent/00-config.json
```

* copy from `etc/consul.d/agent/00-config.json`
* adjust encryt to the same as set on the cluster servers
* adjust bind_addr to this servers address
* adjust references to the cert file locations
* adjust start_join to include all (or most) of the consul cluster servers

Repeat for `10-system-checks.json`


## Create user and runtime dir

```bash
adduser consul --disabled-password
mkdir /var/consul
chown consul:consul /var/consul
```

## Create consul startup script

```bash
vi /etc/init/consul-agent.conf
```

* copy from `etc/init/consul-agent.conf`


## Start the agent

```bash
start consul-agent


tail -f /var/log/syslog
```

